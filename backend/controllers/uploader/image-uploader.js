const busboy = require('busboy');
const nanoid = import('nanoid');
const fs = require('fs');
const path = require('path');

const commonImgFormats = new Set(['.png', '.jpg', '.jpeg', '.webp']);

/**
 * Image uploader
 * @param {*} busboy_config Config object for Busboy
 * @param {{
 * dest_path: string,
 * fields: {field: string, max: number}[],
 * allowed_formats?: Set,
 * img_processor?: {processing_pipeline: () => sharp.Sharp, output_format: string}
 * }} options Uploader specific options
 * @returns A middleware function
 */
module.exports = function (busboy_config, options) {
    // Extract the options
    const {
        dest_path,
        fields,
        allowed_formats = commonImgFormats,
        img_processor
    } = options;

    /* Return the middleware function */
    return function (req, res, next) {
        req.images = {};

        // Event tracker
        const moveNext = new Proxy(Object.seal({
            currentlyWriting: 0, bbEnded: false,
        }), {
            get(obj, prop) {
                return obj[prop];
            },
            set(obj, prop, value) {
                obj[prop] = value;
                // Move to the next handler only when there are not write streams active 
                // and busboy has fired its 'close' event   
                if (obj.bbEnded && obj.currentlyWriting <= 0) next();
            }
        });

        /* Config busboy */
        const bb = busboy({
            limits: { fileSize: 625000 }, // files must be max 5MB (625000 Bytes)
            ...busboy_config, // overwrite previous configs
            headers: req.headers // do not overwrite
        });

        /* Process the request */
        // Parse abd append fields to the req body
        bb.on('field', (field_name, val) => req.body[field_name] = val);
        // Save files
        bb.on('file', async (field_name, file, info) => {
            /* Check incoming file requirements */
            // Check if the file format is allowed
            const fileExtension = path.extname(info.filename);
            if (!allowed_formats.has(fileExtension)) return file.resume(); // ignore
            // Check if the field is in the 'fields' list and
            // if the max file read for that field is already reached
            const field = fields.find((el) => el.field == field_name);
            if (!field || field.max <= 0) return file.resume(); // ignore

            /* Define filename and saving destination */
            const fileName = (await nanoid).nanoid() + img_processor.output_format; // random name
            const fileSavePath = path.join(dest_path, fileName);

            /* Process and save the file on the disk */
            const wStream = fs.createWriteStream(fileSavePath);
            wStream.on('pipe', () => ++moveNext.currentlyWriting);
            wStream.on('finish', () => --moveNext.currentlyWriting);
            try {
                if (img_processor) {
                    file.pipe(img_processor.processing_pipeline()) // processing
                        .pipe(wStream); // save the output on the disk
                } else file.pipe(wStream); // save the file on the disk
                req.images[field_name] = {
                    uploaded: true,
                    file_name: fileName,
                    file_path: fileSavePath,
                };
            } catch (e) {
                fs.unlink(fileSavePath); // remove the file from the disk
                req.images[field_name] = { uploaded: false };
            }

            --field.max; // reduce the max file counter of the field
            file.resume(); // get the next file
        });
        bb.on('close', () => moveNext.bbEnded = true);

        /* Trigger the processing of the request */
        req.pipe(bb);
    };
};

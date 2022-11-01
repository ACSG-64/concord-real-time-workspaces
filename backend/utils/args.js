const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

/**
 * Access parameters passed from the command line
 */
module.exports = yargs(hideBin(process.argv)).argv;

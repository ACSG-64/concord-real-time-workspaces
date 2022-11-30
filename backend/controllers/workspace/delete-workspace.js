// const { body } = require('express-validator');
const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const { User, Membership, Workspace } = require('../../models/index');

async function controller(req,res){
    // Get the needed fields from the body
    const { password: raw_pswd} = req.body;
    //Grab the workspace Id from the request params
    const {workspaceId} = req.params;
    // Extract the User uuid from the cookie
    const { uuid } = jwt.decode(req.cookies['concord_auth']);

    try {
        // Get the password of the user
        const { password } = await User.findByPk(uuid, { attributes: ['password'] });

        // Verify if the password entered is the correct one in the DB
        if (!(await argon2.verify(password, raw_pswd))) {
            return res.status(403).send('Incorrect password');
        }     

    } catch (e) {
        return res.status(500).send('An error has occurred, please try again');
    }
    let role;
    try {
        //Grab the role of the user
        role = await Membership.findOne({
            where: {
                userId: uuid,
                workspaceId: workspaceId,
            },
            attributes: ['role'],
        });
    } catch (e) {
        return res.status(500).send('An error has occurred, please try again');
    }   
    
    try {
        //if the role isn't null
        if (role != null){
            //if the role of the user is owner, delete.
            if(role.role == 'owner'){
                await Workspace.destroy({
                    where: {
                        id: workspaceId
                    }
                });
            }else {
                return res.status(401).send('You are not the owner of this Workspace.');
            }
        }else {
            return res.status(401).send('You are not the owner of this Workspace.');
        }
        return res.status(200).send('Workspace Sucessfully deleted.');
    } catch (error) {
        return res.status(500).send('An error has occurred, please try again'); 
    }
}

const validators = [];

module.exports = {
    validators,
    controller,
};

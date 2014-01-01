exports.initialize = function(req, user) { //used for initializing the authStatus session object on login or new user creation

    req.session.authStatus = {
                                    loggedIn: true,
                                    admin: false,
                                    name: user.name, //its useful to have their name for display in navbar
                                    id: user.id,  
                                 }
    if(user.admin){ //If the user is an admin, update their authStatus to reflect this
    	req.session.authStatus.admin = true;
    }
};
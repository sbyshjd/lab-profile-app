const passport = require('passport');
const User     = require('../models/User');

passport.serializeUser((loggedInUser, callback)=> {
    callback(null,loggedInUser._id)
});

passport.deserializeUser((userIdfromSession,callback)=> {
    User.findById(userIdfromSession)
        .then(user => {
            callback(null,user)
        })
        .catch(err => callback(err))
})
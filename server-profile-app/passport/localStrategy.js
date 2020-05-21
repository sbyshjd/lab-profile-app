const passport      = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User          = require('../models/User');
const bcrypt        = require('bcrypt');

passport.use(
    new LocalStrategy((username,password,callback)=> {
        User.findOne({username})
        .then(foundUser => {
            if(!foundUser) {
                callback(null,false,{message:'Incorrect Username'});
                return;
            }
            if(!bcrypt.compareSync(password,foundUser.password)) {
                callback(null,false,{message:'Incorrect Password'});
                return;
            }
            callback(null,foundUser)
        })
        .catch(err=>callback(err))
})
);

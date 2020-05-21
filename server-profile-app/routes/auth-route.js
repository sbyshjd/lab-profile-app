const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcrypt');
const User     = require('../models/User');
const passport = require('passport');

const checkLogIn = require('../passport/security-role').checkLogIn;
const uploader   = require('../config/cloudinary');


//POST method to sign up the user => create a user in database
router.post('/signup',(req,res,next)=> {
    const {username,password,campus,course,image} = req.body;
    //check the username and password is filled in.
    if(!username || !password) {
        res.status(400).json({message:'Please provide username and password'});
        return;
    }
    //check if the username is already in use => we want the username to be unique.
    User.findOne({username},(err,foundUser)=> {
        if(err) {
            res.status(500).json({message:'Username check went bad!'});
            return;
        }
        if(foundUser) {
            res.status(400).json({message:'Username is already token. Please choose another one!'});
            return;
        }
    // hash the password by bcrypt.   
        const salt = bcrypt.genSaltSync(10);
        const hashPass = bcrypt.hashSync(password,salt);

        User.create({username,password:hashPass,campus,course,image})
            .then(user => {
                res.status(200).json(user)
                return;
            })
            .catch(err => {
                res.status(400).json({message:'Creating new user went wrong.'});
                return;
            })
    })
})

//POST method to login the user => use the set-up passport middleware and its method(authenticate).
router.post('/login',(req,res,next) => {
    passport.authenticate('local',(err,user,info) => {
        if(err) {
            return next(err);
        }
        if(!user) {
            return res.status(401).json({error:'user not authenticated'})
        }
        req.logIn(user,(err)=> {
            if(err) {return next(err)};
            return res.status(200).json(user);
        })
    })(req,res,next)
})

//GET method to logout the user => use the passport middleware 
router.get('/logout',(req,res,next)=> {
    req.logout();
    res.status(200).json({message:'User logged out successfully'})
});

//GET method to check if user is logged in already.
router.get('/isLoggedIn',(req,res,next) => {
    if(req.isAuthenticated()) {
        req.status(200).json(req.user);
        return;
    }
    res.status(403).json({message:'please authenticate.'})
})

//POST method to update the user's profile.
router.post('/edit',checkLogIn,(req,res,next)=> {
    const {username,campus,course} = req.body;
    User.updateOne({_id:req.user.id},{username,campus,course})
        .then(status => {
            res.status(200).json(status)
        })
        .catch(err=> {
            res.status(500).json({message:'an error has occur!'})
        })
})

//POST method to upload the user's profile-image
router.post('/upload', checkLogIn,uploader.single('photo'),(req,res,next)=> {
    if(!req.file) {
        next(new Error('No file uploaded!'));
        return;
    }
    User.updateOne({_id:req.user.id},{image:req.file.url})
        .then(status => {
            res.status(200).json(status)
        })
        .catch(err => {
            res.status(500).json({err})
        })
})

module.exports = router;
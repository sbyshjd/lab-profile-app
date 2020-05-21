
checkLogIn = (req,res,next) => {
    if(req.isAuthenticated()) {
       return next();
    } 
    res.status(403).json({message:'need to authenticate.'})

}

exports.checkLogIn = checkLogIn;
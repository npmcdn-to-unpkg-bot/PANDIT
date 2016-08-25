var LocalStrategy   = require('passport-local').Strategy;
var User            = require('../models/user');

module.exports = function(passport) {
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });


    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
    
    //local strategy
    passport.use('local-signup', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req, email, password, done) {

            User.findOne({ 'local.email' :  email }, function(err, user) {
                if (err){
                    return done(err);
                }
                if (user) {
                    return done(null, false,req.flash('error','The email is already taken.'));
                    
                } else {
    
                    var newUser = new User();
    
                    newUser.local.email     =   email;
                    newUser.local.password  =   newUser.generateHash(password);
    
                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }
            });    
    }));
    
    
    // local strategy login
    passport.use('local-login', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { 
        User.findOne({ 'local.email' :  email }, function(err, user) {

            if (err)
                return done(err);

            if (!user)
                return done(null, false, req.flash('error', 'No user found.')); 

            if (!user.validPassword(password))
                return done(null, false, req.flash('error', 'Wrong password.'));

            return done(null, user, req.flash('success', 'Welcome back! '+user.local.email));
        });
    }));
    
    //facebook strategy
    
};

const sessionUser = require('../models/session.model') 
// const CryptoJS = require("crypto-js");

module.exports = (req, res, next) => {
    if (req.session) {

      // Retrieve user from database
      sessionUser.findOne({sessionID: req.session.userid}, function(err, getSession){

        if(req.session.userid === getSession.sessionID){

          next()

        }else{

          req.json({result: "user not validated"})

        }

      })
    }   
  }; 
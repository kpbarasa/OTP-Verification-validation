const sessionUser = require('../models/session.model') 
// const CryptoJS = require("crypto-js");

module.exports = (req, res, next) => {
    if (req.session.sessionID === "undefined") {

      return res.json({SessionStatus:"exprired"})

    } 
    else{
      
      const usserSession = req.session
      
      const setSession = (getSession, sessId, userId, secret,  token) => {
        if(token != ""){
          session = getSession
          session.sessionID=sessId
          session.userId=userId
          session.token=token
          session.secret=secret
          getSession.save(function(err){
            console.log(getSession)
            console.log("Temp Authentication Session set");
          });
        }
        else{
          session = getSession
          session.sessionID="temp#"+sessId
          session.userId=userId
          session.secret=secret.base32
          getSession.save(function(err){
            console.log(getSession)
            console.log("Temp Authentication Session set");
          });
        }
      }

      const saveSessionDb = (dateGet) => {
        // 1. Retrieve user from database
        sessionUser.findOne({sessionID: req.session.userId}, function(err, getSession){
   
          // 5. up date database
          sessionUser.findById(getSession._id)
          .then(updtSession => { 

            updtSession.session_start = date;

            updtSession.session_end = date+1;
    
            updtSession.save()
            
            console.log("Session db updated")

          })
                
        })
    
      }

      // 2. Create user session 
      setSession(usserSession, usserSession.sessionID, usserSession.userId, usserSession.secret, usserSession.token)

      // 3. Create user in the database
      saveSessionDb(Date().getHours())

      next();
      
    }
  }; 

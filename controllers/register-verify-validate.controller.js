
const express = require('express');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const app = express();
var QRCode = require('qrcode');
const path = require('path');
const uuid = require("uuid");
const speakeasy = require("speakeasy");
var nodemailer = require('nodemailer');
// include node fs module
var fs = require('fs');

// a variable to save a session
var session;

const sessionUser = require('../models/session.model') 
 
 const register = async(req, res) => {

    const id = uuid.v4();
    
  // =========================================================================================================
  // After successfull login 
  // =========================================================================================================
    
   if(req.session.page_views){
    res.send("Wellcome");
   } 
   else {
      try {
    
        // 1. Create temporary secret until it it verified
        const temp_secret = speakeasy.generateSecret();
        var qrCodes ;

        // 2. Create user session 
        setSession(req.session, "temp#"+id, id, temp_secret)

        if(req.session){

          var token = speakeasy.totp({
            secret: temp_secret.base32,
            encoding: 'base32',
            time: 1453667708 // specified in seconds
          });
    
          // 3. Create user in the database
          saveSessionDb(id, id, temp_secret, token, "authenticating")

          // 5. create qr code
          const run = async () => {
            const qrUrl = await getQRCode(temp_secret)
  
            sendEmail("kpbarasa@gmail.com", "authentication", temp_secret.base32, qrUrl)

            // write('<img src="' + qrUrl + '">');
             
            // appendFile function with filename, content and callback function
            fs.appendFile('img-qr.html', '<img src="' + qrUrl + '"  height="400px%" width="400px" />', function (err) {
              if (err) throw err;
              console.log('File is created successfully.');
            });
            
             res.sendFile(path.join(__dirname+'/assets/js/main.js'))
  
            res.json({ "id":id, "secret": temp_secret.base32, "token": token,"qrcode":qrUrl, "description": "Temp Session info saved" })
    
          } 
          run()

        }
      } 
      catch(error) {
        console.log(error);
        res.status(500).json({ message: 'Error generating secret key'})
      }
    }
    
  }
  
  const verify = (req, res) => {
      
    session=req.session;
    console.log(session);
     console.log(req.body);
      const u_token = req.body.token;
      const userId = req.body.userId;
  
      try {
        // Retrieve user from database
        sessionUser.findOne({sessionID: userId}, function(err, getSession){
  
            const verified = speakeasy.totp.verify({
              
              secret: getSession.token,
              encoding: 'base32', 
              token: u_token,
  
            });
            
            if (verified) {
              
              // Update user data
              sessionUser.findById(getSession._id)
              .then(updateSession => {
  
                updateSession.token = getSession.token,
                updateSession.session_user = getSession._id
                updateSession.save()
                .then(() =>  sendEmail("kpbarasa@gmail.com", "authentication", temp_secret.base32, qrUrl))
  
              })
  
            } else {
  
              res.json({ verified: false})
  
            }
  
        })
      } catch(error) {
  
        console.error(error);
  
        res.status(500).json({ message: 'Error retrieving user'})
  
      };
  }
  
  const validate = (req, res) => {
    console.log(req.body.userId);
    const u_token = req.body.token;
    const userId = req.body.userId;
  
    try {
      
      // 1. Retrieve user from database
      sessionUser.findOne({sessionID : "fbaae7cd-76a5-4586-9969-486af62d4c16" }, function (err, getSession) {
        if (err){
            console.log(err)
        }
        else{
             // 2. Create temporary secret until it it verified
        const temp_secret = speakeasy.generateSecret();

        const id = uuid.v4();

          // 3. Returns true if the token matches
          const tokenValidates = speakeasy.totp.verify({
            secret: getSession.secret,
            encoding: 'base32', 
            token: u_token,
            window: 1
          });

          // 4. Validate token 
          if (tokenValidates) {
              
              setSession(req.session, id, userId, temp_secret, u_token)
 
              // 5. up date database
              sessionUser.findById(getSession._id)
              .then(updtSession => { 
                updtSession.user_name = req.body.user_name;
                updtSession.user_fname = req.body.user_fname;
                updtSession.user_mname = req.body.user_mname
        
                updtSession.save()

                console.log("Session db updated")

              })
        

              // 6. Log in
              res.json({ validated: true , descrption: "login successfull wellcome"})
            
          } else {

            res.json({ validated: false})

          }
        }
      })

    } catch(error) {
      console.error(error);
      res.status(500).json({ message: 'Error retrieving user'})
    };
  }

  const getQRCode = async (secret) => {
    return await QRCode.toDataURL(secret.otpauth_url)
  }

  const sendEmail = (UserEmaillAddress, emailType, token, qrCode) => {
  
    var subject = ""
    var EmailText = ""
    console.log(qrCode)
  
    if(emailType === "authentication"){
      subject = 'Reset password link'
      EmailText = `
      Confirm User
      <br/> /n
      User Tittle
      Click here http://localhost:5000/api/users/link/temp to confirm
      `
      contentHtml=`
      <small>${Date()}</small>

      <small>Verify your new Amazon account</small>
      
      <p>To verify your email address, please use the following One Time Password (OTP):</p>

      <h4>Secret: ${token}</h4>

      <h5>Scan qr code now </h5>

      <div>${qrCode}</div>

      <small> <b> Do not share this OTP with anyone. Amazon takes your account security very seriously. Amazon Customer Service will never ask you to disclose or verify your Amazon password, OTP, credit card, or banking account number. If you receive a suspicious email with a link to update your account information, do not click on the link—instead, report the email to Amazon for investigation. </b> </small>

      `
    }
  
    
    var transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: 'kpbarasa@gmail.com',
        pass: 'gvvmuddzawrgeprg',
        clientId: "1027490353182-or0ta0i4qtbjq9vles195u86sg9i4m2k.apps.googleusercontent.com",
        clientSecret: "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",
        refreshToken: "1//04M6QbGYH-4bKCgYIARAAGAQSNwF-L9IrrHELqT_WhZBcBsEKXFP7xgxTutrVEYQhkh391WrxHQAUjYGjDX1LfkA58Wh7WV1o-DA"
      }
    });
  
    var mailOptions = {
      from: 'kpbarasa@gmail.com',
      to:  UserEmaillAddress,
      subject: subject,
      text: EmailText,
      html: contentHtml
    }; 
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        
        console.log(error);
  
      } 
      else {  
  
        console.log('Email sent to : ' + UserEmaillAddress);
  
      }
    });
  
  }

  const setSession = (getSession, sessId, userId, secret,  token) => {
    today = new Date();
    if(token){
      session = getSession
      session.sessionID=sessId
      session.userId=userId
      session.token=token
      session.sessionStart=today.getHours()
      session.sessionEnd=today.getHours()
      session.secret=secret.base32
      getSession.save(function(err){
        console.log(getSession)
        console.log("Temp Authentication Session set");
      });
    }
    else{
      session = getSession
      session.sessionID="temp#"+sessId
      session.userId=userId
      session.sessionStart=today.getHours()
      session.sessionEnd=today.getHours()
      session.secret=secret.base32
      getSession.save(function(err){
        console.log(getSession)
        console.log("Temp Authentication Session set");
      });
    }
  }

  const saveSessionDb = (sessId, userId, sesSecret, sessToken, status) => {
    
    // 3. Create user in the database
    var currentdate = new Date()
    const sessionID = sessId;
    const session_user = userId;
    const session_start = currentdate; 
    const session_end = '2021-11-15T15:01:07.669+00:00';
    const token = sessToken
    const secret = sesSecret.base32
    const session_status = status 
    
    // 4. Constructor for new session object 
    const newUserSession = new sessionUser({
        sessionID,
        session_user,
        session_start,
        session_end, 
        token,
        secret,
        session_status
    }); 
    
    console.log("Authentication session saved to db")
    newUserSession.save()

  }


module.exports = {validate, verify, register }
const express = require('express')  

const router = express.Router() 

const athenticateSession = require("../middleware/aurhenticator.middleware");  
const athenticateSessionStatus = require("../middleware/check-session-statuss.middleware");  

const {validate, verify, register} = require('../controllers/register-verify-validate.controller') 
 
router.post("/login/register", register)
  
router.post("/login/verify", verify)
  
router.post("/login/validate", validate)

module.exports = router
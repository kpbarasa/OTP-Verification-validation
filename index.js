const express = require('express') 
const app = express() 
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
var MongoDBSession = require('connect-mongodb-session')(sessions)
const bodyParser = require('body-parser');

// Help connect to MongoDB database 
const mongoose = require('mongoose');
const { log } = require('console');

require('dotenv').config();

// Set Port 
const port = process.env.PORT || 5000;

// parse form data
app.use(express.urlencoded({extended: false}))

// Parse Json 
app.use(express.json()) 

// Connection String to express atlas and Environment variable.
const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { 
  
    useNewUrlParser: true, useUnifiedTopology: true 

  },err => { 
    if(err){
        console.log('Error un able Connected to MongoDB!!!')
    }
    else{
        console.log('Connected to MongoDB!!!')
    }
    }
)

const connection = mongoose.connection;

connection.once('open', () => {

  console.log("MongoDB database connection established successfully"); 

})



app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

// parsing the incoming data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//serving public file
app.use(express.static(__dirname));

// cookie parser middleware
app.use(cookieParser());


const store = new MongoDBSession({
  uri:uri,
  collection: "usersessions",
})

// Session Setup
app.use(sessions({
  
  // It holds the secret key for session
  secret: 'Your_Secret_Key',

  // Forces the session to be saved
  // back to the session store
  resave: true,

  // Forces a session that is "uninitialized"
  // to be saved to the store
  saveUninitialized: true,

  cookie: {

      // Session expires after 1 min of inactivity.
      expires: 60000
      // expires: 1000 * 60 * 60 * 24
  },
  // store: store
}))


// Routes 
const account_routes = require('./routes/account-routes') 

app.use("/api", account_routes)

// Port 
app.listen(port) 
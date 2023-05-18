const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    // Change to your email address 
    user: 'your-email-address@gmail.com',
    // Change to your email password 
    pass: 'your-password'
  }
});

const firebase = require("firebase-admin");
const credentials = require("./key2.json");
firebase.initializeApp({
  credential: firebase.credential.cert(credentials),
  // Change to your database URL 
  databaseURL: 'your-firebaseio-url'
});
const firestoreDb = firebase.firestore();
const realtimeDb = firebase.database();

const config = {
  db: {
    // Change to your database host 
    host: "localhost",
    // Change to your database name 
    user: "root",
    // Change to your database password 
    password: "",
    // Change to your database name 
    database: "smart_energy_monitoring",
  },
  transporter,
  firebase,
  firestoreDb,
  realtimeDb
};

module.exports = config;
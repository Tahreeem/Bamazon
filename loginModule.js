var mysql = require("mysql");
var inquirer = require("inquirer");
require('dotenv').config();
var moment = require('moment');
var sun = require('sun-time');
var geoip = require('geoip-lite');
const publicIp = require('public-ip');
var os = require('os');

const serviceAccount = require("./ServiceAccountKey.json");
const admin = require('firebase-admin');
var firebase = require('firebase');

var allModules = require('./allModules.js');


//_______________________________________________________________________

var connection = mysql.createConnection({
    host: process.env.SQL_HOST,
    port: process.env.SQL_PORT,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASS,
    database: "bamazon_db"
});


var questions =
    [
        { //question 0
            name: "login",
            type: "rawlist",
            //message: "How would you like to use our services today?\n",
            choices: [
                'Log in to an existing account',
                'Sign up for a new account',
                new inquirer.Separator(),
                'Continue as a Guest'
            ]
        },
        { //question 1
            name: "loginAccount",
            type: "input",
            message: "Please enter the email address or phone number associated with your account\n",
        },
        { //question 2
            name: "loginAccount",
            type: "input",
            message: "Please enter the email address or phone number associated with your account\n",
        }
    ];







function loginFlow() {

    return new Promise(resolve => {

        console.log("\n");

        allModules.askQuestions(questions[0])   //question name: "login"
            .then(function (loginChoice) {


                if (loginChoice.login != 'Continue as a Guest') {

                    initializeFirebase();

                    if (loginChoice.login == 'Log in to an existing account') {

                        allModules.askQuestions(questions[1])   //question name: "loginAccount"
                            .then(function (accountEmailOrPhoneNum) {
                                accountEmailOrPhoneNum = accountEmailOrPhoneNum.loginAccount;

                                if (validateEmail(accountEmailOrPhoneNum)) {

                                    admin.auth().getUserByEmail(accountEmailOrPhoneNum)
                                        .then(function (userRecord) {
                                            // See the UserRecord reference doc for the contents of userRecord.
                                            console.log("Successfully fetched user data:", userRecord.toJSON());

                                            var user = admin.auth().currentUser;
                                            if (user) {
                                                console.log("User is signed in.");
                                                resolve(admin.auth().currentUser);
                                            } else {
                                                console.log("No user is signed in");
                                                resolve("FALSE");
                                            }
                                        })
                                        .catch(function (error) {
                                            console.log("Error fetching user data:", error);
                                        });

                                }
                                else if (validatePhoneNum(accountEmailOrPhoneNum)) {

                                    admin.auth().getUserByPhoneNumber(accountEmailOrPhoneNum)
                                        .then(function (userRecord) {
                                            // See the UserRecord reference doc for the contents of userRecord.
                                            console.log("Successfully fetched user data:", userRecord.toJSON());
                                        })
                                        .catch(function (error) {
                                            console.log("Error fetching user data:", error);
                                        });

                                }
                                else {
                                    console.log("You have entered an invalid email address or phone number");
                                }

                                // resolve(loginChoice);
                            });







                    }
                    else if (loginChoice.login == 'Sign up for an account') { }


                }
                else { }





                console.log(loginChoice.login != 'Continue as a Guest');
                //resolve(loginChoice);
            });
    });
}


function initializeFirebase() {

    var databaseURL = process.env.FIREBASE_DB_URL;

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: databaseURL
    });

    firebase.initializeApp({
        apiKey: process.env.FIREBASE_API_KEY,
        databaseURL: databaseURL
    });

}

function validateEmail(inputText) {
    var mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (inputText.match(mailFormat)) return true;
    else return false;
}

function validatePhoneNum(inputText) {
    var phoneNumFormat = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    if (inputText.match(phoneNumFormat)) return true;
    else return false;
}

module.exports = {
    loginFlow: loginFlow
}; 
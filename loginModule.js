var inquirer = require("inquirer");
require('dotenv').config();

const serviceAccount = require("./ServiceAccountKey.json");
const admin = require('firebase-admin');
var firebase = require('firebase');


//_______________________________________________________________________

var questions =
    [
        { //question 0
            name: "login",
            type: "list",
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
            message: "Please enter the email address or phone number associated with your account\nExpected phone number format example: +14155552671\n\n",
            validate: validateLoginAccount
        },
        { //question 2
            name: "password",
            type: "password",
            mask: '*',
            message: "Please enter the password for your account\n",
            validate: function (value) {
                if (value.length >= 6) { return true; }
                else return "The password must be at least 6 characters"
            }
        },
        { //question 3
            name: "emailSignUp",
            type: "email",
            message: "Please enter the email address for your account\n",
            validate: function (value) {
                if (validateEmail(value)) return emailExistence(value, emailExistsSignUp, accountExistsNotSignUp);
                else return "Please enter a valid email address";
            }
        },
        { //question 4
            name: "phoneNumber?",
            type: "confirm",
            message: "Would you like to add a phone number to associate with your account?\n"
        },
        { //question 5
            name: "phoneNumberSignUp",
            type: "input",
            message: "Please enter the phone number\nExpected phone number format example: +14155552671\n\n",
            validate: function (value) {
                if (validatePhoneNum(value)) return phoneExistence(value, phoneExistsSignUp, accountExistsNotSignUp);
                else return "Please enter a valid phone number";
            },
            when: function (answers) {
                return answers['phoneNumber?'];
            }
        },
        { //question 6
            name: "retypePassword",
            type: "password",
            mask: '*',
            message: "Please re-enter your password to confirm\n",
            validate: function (value) {
                if (value.length >= 6) { return true; }
                else return "The password must be at least 6 characters"
            }
        },
    ];

var user = "";



initializeFirebase();
function loginFlow() {

    console.log("\n");

    return askQuestions(questions[0])   //question name: "login"
        .then(function (loginChoice) {

            if (loginChoice.login == 'Log in to an existing account') {
                return accountSignIn();
            }
            else if (loginChoice.login == 'Sign up for a new account') {
                return signUp();
            }
            else if (loginChoice.login == 'Continue as a Guest') {
                console.log("\n\n");
            }

        });



    // This code below can be used to manually create users for debugging
    /*
        admin.auth().createUser({
            uid: "some-uid",
            email: "user@example.com",
            phoneNumber: "+1(647)518-0050"
        }).then(function (userRecord) {
            console.log("Successfully created new user:", userRecord.uid);
        }).catch(function (error) {
            console.log("Error creating new user:", error);
        });
    */



    // This code below can be used if the custom token method was wanted for creating or authenticating users
    /*
    admin.auth().createCustomToken(uid)
        .then((customToken) => {
            customToken = customToken;
            console.log(customToken);


            firebase.auth().signInWithCustomToken(String(customToken))
                .catch(function (error) {
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    console.log("errorMessage: " + errorMessage);
                }).then(() => {
                    var user = admin.auth().currentUser;
                    if (user) {
                        console.log("User is signed in.");
                    } else {
                        console.log("No user is signed in");
                    }
                });

        });
    */

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

function askQuestions(whichQuestions) {

    return new Promise(resolve => {
        inquirer
            .prompt(whichQuestions)
            .then(function (answers) {
                resolve(answers);
            });
    });

}




function validateEmail(inputText) {
    var mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (inputText.match(mailFormat)) return true;
    else return false;
}

function validatePhoneNum(inputText) {
    var phoneNumFormat = /^\+[1-9]\d{1,14}$/;
    if (inputText.match(phoneNumFormat)) return true;
    else return false;
}

function validateLoginAccount(loginAccount) {

    if (validateEmail(loginAccount)) {
        return emailExistence(loginAccount, emailExists, emailExistsNot);
    }
    else if (validatePhoneNum(loginAccount)) {
        return phoneExistence(loginAccount, emailExists, phoneExistsNot);
    }
    else return "Please enter a valid email address or phone number";
}




function accountSignIn() {

    return askQuestions([questions[1], questions[2]])   //question names: "loginAccount", "password"
        .then((answers) => {

            password = answers["password"];

            return firebase.auth().signInWithEmailAndPassword(String(user.email), password)
                .then((userRecord) => {
                    //if (userRecord) console.log("User is signed in.\n" + JSON.stringify(userRecord)); //for debugging
                    console.log("You are now signed in!\n\n\n");
                })
                .catch(function (error) {  //this block handles incorrect password entries
                    //console.log(error.message); //for debugging; 
                    console.log("No match found for that account and password combination\n");
                    return accountSignIn();
                    //ENTER SOMETHING FOR TOO MANY WRONG PASSWORD INPUTS; PERHAPS LOCKOUT
                });

        });

}



function signUp() {

    return askQuestions([questions[3], questions[4], questions[5]])   //question names: "emailSignUp", "phoneNumber?", "phoneNumberSignUp","loginAccount"
        .then(answers => {

            return passwordSignUp().then(password => {
                return admin.auth().createUser({
                    //uid: "some-uid",
                    email: answers["emailSignUp"],
                    phoneNumber: answers["phoneNumberSignUp"],
                    password: password
                })
                    .then(function (userRecord) {
                        console.log("\n\nSuccessfully created new user:\n");
                        console.log("Email: " + userRecord.email);
                        userRecord.phoneNumber ? console.log("Phone Number: " + userRecord.phoneNumber) : null;
                        console.log("\n\n");
                    })
                    .catch(function (error) {
                        //errors already handled at validations step for answers to questions
                        //console.log("Error creating new user:", error.message); //for debugging
                        return loginFlow(); //MIGHT HAVE TO CHANGE WHICH FUNCTION TO CALL
                    });
            })

        });
}

function passwordSignUp() {
    return new Promise(resolve => {
        askQuestions([questions[2], questions[6]])   //question names: "password", "retypePassword"
            .then((answers) => {
                if (answers["password"] == answers["retypePassword"]) { resolve(answers["password"]); }
                else {
                    console.log("Those two passwords didn't match...");
                    resolve(passwordSignUp());
                }
            });
    });
}




function emailExistence(loginAccount, cb1, cb2) { //cb is short for callback

    return admin.auth().getUserByEmail(loginAccount)
        .then(cb1)
        .catch(cb2); //this block handles non-existing email inputs

}

function phoneExistence(loginAccount, cb1, cb2) { //cb is short for callback

    return admin.auth().getUserByPhoneNumber(loginAccount)
        .then(cb1)
        .catch(cb2); //this block handles non-existing phone number inputs

}




function emailExists(userRecord) {
    user = userRecord; //only purpose of this to have the user object available globally, just in case it's needed
    //console.log("user:\n" + JSON.stringify(user)); //for debugging
    return true;
}

function emailExistsNot(error) {
    //console.log("Error fetching user data:", error); //for debugging
    return "There is no account associated with that email address\n";
}

function phoneExistsNot(error) {
    //console.log("Error fetching user data:", error); //for debugging
    return "There is no account associated with that phone number\n";
}




function emailExistsSignUp() {
    return "There is already an account associated with that email address\n";
}

function phoneExistsSignUp() {
    return "There is already an account associated with that phone number\n";
}

function accountExistsNotSignUp(error) {
    return true;
}

//_______________________________________________________________________

module.exports = {
    loginFlow
}; 
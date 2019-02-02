
var allModules = require('./allModules.js');
var loginModules = require('./loginModule.js');
const admin = require('firebase-admin');
var firebase = require('firebase');


//_______________________________________________________________________

allModules.connection.connect(function (error) {
    if (error) throw error;


    loginModules.loginFlow().then((what) => {
        console.log("something");
    });

    //console.log(allModules.validateEmail("someuser@hotmail.com")+"   meow");
    //console.log(allModules.phoneNumber("647---518-0050")+"   MEOW");


    // const serviceAccount = require("./ServiceAccountKey.json");

    // admin.initializeApp({
    //     credential: allModules.admin.credential.cert(serviceAccount),
    //     databaseURL: "https://b-5e698.firebaseio.com",
    //     apiKey: "AIzaSyAZaJboA-tQULORvyhO_-kl7c_yhDZsmRo"
    // });

    // firebase.initializeApp({
    //     //serviceAccount: "project-779766135115.json",
    //     apiKey: "AIzaSyAZaJboA-tQULORvyhO_-kl7c_yhDZsmRo",
    //     databaseURL: "https://b-5e698.firebaseio.com"
    // });

    //const uid = "purrr-uid";

















    // admin.auth().createUser({
    //     email: "user@example.com",
    //     emailVerified: false,
    //     phoneNumber: "+11234567890",
    //     password: "secretPassword",
    //     displayName: "John Doe",
    //     photoURL: "http://www.example.com/12345678/photo.png",
    //     disabled: false
    //   })



    // var customToken;
    // allModules.admin.auth().createCustomToken(uid)
    //     .then((customToken) => {
    //         customToken = customToken;
    //         console.log(customToken);


    //         allModules.firebase.auth().signInWithCustomToken(String(customToken))
    //          .catch(function (error) {
    //             // Handle Errors here.
    //             var errorCode = error.code;
    //             var errorMessage = error.message;
    //             console.log("errorMessage: " + errorMessage);
    //             // ...
    //         }).then(() => {

                // var user = admin.auth().currentUser;

                // if (user) {
                //     console.log("User is signed in.");
                // } else {
                //     console.log("No user is signed in");
                // }
        //     });


        // })
        // .catch((error) => {
        //     console.log(error);
        // });











    /* allModules.greetings()
        .then(function () {

            console.log("Welcome to Bamazon Marketplace!");
            console.log("We have a unique selection of products for you to consider buying...\n\n");

            allModules.printAllProducts()
                .then(function () {

                    allModules.questionZeroHandling()
                        .then(function (resultZero) {

                            allModules.questionOneHandling(resultZero)
                                .then(allModules.disconnect);
                        });
                    
                });
        });*/
        
});



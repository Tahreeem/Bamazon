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


//_______________________________________________________________________

var connection = mysql.createConnection({
    host: process.env.SQL_HOST,
    port: process.env.SQL_PORT,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASS,
    database: "bamazon_db"
});


var questions =
    [{ //question 0
        name: "productID",
        type: "input",
        message: "Please enter a product ID",
        validate: validateNumber
    },
    { //question 1
        name: "quantity",
        type: "input",
        message: "What is the quantity of the product you would like to buy?",
        validate: validateNumber
    },
    { //question 2
        name: "managerChoice",
        type: "rawlist",
        message: "Please select what you would like to do...",
        choices: [
            'View Products for Sale',
            'View Low Inventory',
            new inquirer.Separator(),
            'Add to Inventory',
            'Add New Product'
        ]
    },
    { //question 3
        name: "insertProductName",
        type: "input",
        message: "Please enter the name of the product you would like added to the inventory\n"

    },
    { //question 4
        name: "insertDepartmentName",
        type: "input",
        message: "Please enter the name of the department this product falls under\n"
    },
    { //question 5
        name: "insertPrice",
        type: "input",
        message: "Please enter the price for this product\n",
        validate: validateNumber
    },
    { //question 6
        name: "insertStockQuantity",
        type: "input",
        message: "Please enter the quantity to add for this product\n",
        validate: validateNumber
    },
    { //question 7
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
    { //question 8
        name: "loginAccount",
        type: "input",
        message: "Please enter the email address or phone number associated with your account\n",
    },
    { //question 9
        name: "loginAccount",
        type: "input",
        message: "Please enter the email address or phone number associated with your account\n",
    }
    ];


function greetings() {

    return new Promise(resolve => {

        (async function () {
            var geo = geoip.lookup(await publicIp.v4());
            var lat = Number(geo.ll[0]);
            var long = Number(geo.ll[1]);
            return sun(lat, long);
        })()
            .then(function (riseSet) {
                var rise = moment(riseSet.rise, "HH:mm");
                var set = moment(riseSet.set, "HH:mm");
                var currentTime = moment();
                var noon = moment("12:00", "HH:mm");
                var midnight = moment("24:00", "HH:mm");

                var user = os.userInfo().username;

                if (currentTime.isAfter(rise) && currentTime.isBefore(noon)) {
                    console.log("\nGood Morning " + user);
                }
                else if (currentTime.isAfter(noon) && currentTime.isBefore(set)) {
                    console.log("\nGood Afternoon " + user);
                }
                else if (currentTime.isAfter(set) && currentTime.isBefore(midnight)) {
                    console.log("\nGood Evening " + user);
                }
                else console.log("\nGreetings " + user);

                resolve();
            });
    });
}


function validateNumber(value) {
    if (!isNaN(value) && value % 1 == 0 && parseInt(value) >= 0) return true;
    else if (parseInt(value) == 0) {
        console.log("Zero it is...");
    }
    else {
        console.log("\nPlease enter a valid quantity\n");
        return false;
    }
}


function printAllProducts() {

    console.log("Here are all the products:");

    return new Promise(resolve => {

        connection.query(
            "SELECT * FROM bamazon_db.products",
            function (error, results) {
                if (error) throw error;

                if (results.length == 0) {
                    console.log("No products to show ¯\_(ツ)_/¯");
                }
                else {
                    printProduct(results);
                }


                resolve();
            });

    });
}

function printProduct(products) {

    return new Promise(resolve => {

        products.forEach(function (currentProduct) {
            console.log("\nItem ID : " + currentProduct.item_id);
            console.log("Product Name : " + currentProduct.product_name);
            console.log("Department Name : " + currentProduct.department_name);
            console.log("Price : " + currentProduct.price);
            console.log("Stock Quantity : " + currentProduct.stock_quantity);
            console.log("____________________________________");
        });


        resolve();
    });
}


function getProducts(conditions) {

    return new Promise(resolve => {

        var queryString = `SELECT * FROM bamazon_db.products WHERE `;

        queryString += conditions[0];  //first condition must be product ID if it's one of the conditions; it's formatted differently

        for (i = 1; i < conditions.length; i++) {
            queryString += ` AND `;
            queryString += conditions[i];
        }

        connection.query(
            queryString,
            function (error, resultZero) {
                if (error) throw error;

                resolve(resultZero);
            });
    });
}

function updateStock(set, where) {

    return new Promise(resolve => {

        var parameters = [];
        parameters.push(set, where);

        connection.query(
            "UPDATE bamazon_db.products SET ? WHERE ?",
            parameters,
            function (error, results) {
                if (error) throw error;
            }
        );

        resolve();
    });
}

function insertProduct(parameters) {

    return new Promise(resolve => {

        connection.query(
            "INSERT INTO bamazon_db.products SET ?",
            parameters,
            function (error, results) {
                if (error) throw error;

                parameters.item_id = results.insertId;

                console.log("Your product has been added!");
                console.log("Here are its details:");

                resolve(printProduct([parameters]));
            }
        );
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

function questionOneHandling(resultZero) {

    return new Promise(resolve => {

        askQuestions(questions[1])
            .then(function (answerOne) {

                if (answerOne.quantity > resultZero[0].stock_quantity) {
                    console.log(`Insufficient quantity of product available. Only ${resultZero[0].stock_quantity} units available. Please enter a lower number...`);
                    resolve(questionOneHandling(resultZero));
                }
                else {
                    resultZero[0].stock_quantity -= answerOne.quantity;  //updating locally
                    updateStock(  //updating globally or in database
                        { stock_quantity: resultZero[0].stock_quantity },
                        { item_id: resultZero[0].item_id }
                    );
                    console.log(`\nYour purchase is complete! This purchase cost you $${resultZero[0].price * answerOne.quantity}.`);
                    console.log("Here is the updated stock:");
                    resolve(printProduct(resultZero));

                }
            });
    });
} //question name: "quantity"

function questionZeroHandling() {

    return new Promise(resolve => {

        console.log("\n\n");

        askQuestions(questions[0])
            .then(function (answerZero) {

                getProducts([`item_id=` + answerZero.productID])
                    .then(resultZero => {

                        if (resultZero.length == 0) {
                            console.log("Product not found. Please enter an ID that exists...");
                            resolve(questionZeroHandling());
                        }
                        else resolve(resultZero);
                    });
            });
    });
} //question name: "productID"

function caseThreeHandling(resultSix) {

    return new Promise(resolve => {

        askQuestions(questions[6])
            .then(function (answerSix) {

                resultSix[0].stock_quantity += answerSix.quantity;  //updating locally
                updateStock({ stock_quantity: resultSix[0].stock_quantity }, { item_id: resultSix[0].item_id }); //updating globally or in database
                console.log("\nThe inventory has been updated!");
                console.log("Here is the updated stock:");
                resolve(printProduct(resultSix));
            });
    });
}


function disconnect() {
    connection.end();
    process.exit();
}


function loginFlow() {

    return new Promise(resolve => {

        console.log("\n");

        askQuestions(questions[7])
            .then(function (answerSeven) {


                if (answerSeven.login != 'Continue as a Guest') {

                    var databaseURL = process.env.FIREBASE_DB_URL;

                    admin.initializeApp({
                        credential: admin.credential.cert(serviceAccount),
                        databaseURL: databaseURL
                    });

                    firebase.initializeApp({
                        apiKey: process.env.FIREBASE_API_KEY,
                        databaseURL: databaseURL
                    });


                    if (answerSeven.login == 'Log in to an existing account') {

                        askQuestions(questions[8])   //question name: "loginAccount"
                            .then(function (accountEmailOrPhoneNum) {

                                if (validateEmail(accountEmailOrPhoneNum)) {

                                    admin.auth().getUserByEmail(accountEmailOrPhoneNum)
                                        .then(function (userRecord) {
                                            // See the UserRecord reference doc for the contents of userRecord.
                                            console.log("Successfully fetched user data:", userRecord.toJSON());
                                        })
                                        .catch(function (error) {
                                            console.log("Error fetching user data:", error);
                                        });

                                }
                                else if (validatePhoneNum(accountEmailOrPhoneNum)) { }
                                else {
                                    console.log("You have entered an invalid email address or phone number");
                                }

                            });







                    }
                    else if (answerSeven.login == 'Sign up for an account') { }


                }
                else { }





                console.log(answerSeven.login != 'Continue as a Guest');
                resolve(answerSeven);
            });
    });
} //question name: "login"


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
    validateEmail: validateEmail,
    validatePhoneNum: validatePhoneNum,
    loginFlow: loginFlow,
    admin: admin,
    firebase: firebase,
    connection: connection,
    questions: questions,
    greetings: greetings,
    validateNumber: validateNumber,
    printAllProducts: printAllProducts,
    printProduct: printProduct,
    getProducts: getProducts,
    updateStock: updateStock,
    insertProduct: insertProduct,
    askQuestions: askQuestions,
    questionOneHandling: questionOneHandling,
    questionZeroHandling: questionZeroHandling,
    caseThreeHandling: caseThreeHandling,
    disconnect: disconnect
}; 
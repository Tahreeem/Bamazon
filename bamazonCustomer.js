var mysql = require("mysql");
var inquirer = require("inquirer");
require('dotenv').config();

var questions = [{
    name: "productID",
    type: "input",
    message: "What is the ID of the product you would like to buy?",
    validate: ValidateNumber
},
{
    name: "quantity",
    type: "input",
    message: "What is the quantity of the product you would like to buy?",
    validate: ValidateNumber
}]


// create the connection information for the sql database
var connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: "bamazon_db"
});

// connect to the mysql server and sql database
connection.connect(function (error) {
    if (error) throw error;

    printAllItems()
        .then(function () {

            QuestionZeroHandling()
                .then(function (resultZero) {
                    QuestionOneHandling(resultZero);
                });

        });
});


function printAllItems() {

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
                    printItem(results);
                }


                resolve();
            });

    });
}

function printItem(items) {

    return new Promise(resolve => {

        items.forEach(function (currentItem) {
            console.log("\nItem ID : " + currentItem.item_id);
            console.log("Product Name : " + currentItem.product_name);
            console.log("Department Name : " + currentItem.department_name);
            console.log("Price : " + currentItem.price);
            console.log("Stock Quantity : " + currentItem.stock_quantity);
            console.log("____________________________________");
        });


        resolve();
    });
}


function ValidateNumber(value) {
    if (!isNaN(value) && value % 1 == 0 && parseInt(value) > 0) return true;
    else {
        console.log("\nPlease enter a valid number\n");
        return false;
    }
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


function GetProduct(productID) {   //answers to inquirer questions

    return new Promise(resolve => {

        connection.query(
            "SELECT * FROM bamazon_db.products WHERE ?",
            [{
                item_id: productID
            }],
            function (error, resultZero) {
                if (error) throw error;

                resolve(resultZero);
            });
    });
}

function UpdateStock(set, where) {
    var parameters = [];
    parameters.push(set, where);

    connection.query(
        "UPDATE bamazon_db.products SET ? WHERE ?",
        parameters,
        function (error, results) {
            if (error) throw error;
            if (results.affectedRows > 0) {
                connection.end();
            }
        }
    );
}


function QuestionOneHandling(resultZero) {

    return new Promise(resolve => {

        askQuestions(questions[1])
            .then(function (answerOne) {

                if (answerOne.quantity > resultZero[0].stock_quantity) {
                    console.log(`Insufficient quantity of product available. Only ${resultZero[0].stock_quantity} units available. Please enter a lower number...`);
                    QuestionOneHandling(resultZero);
                }
                else {
                    resultZero[0].stock_quantity = resultZero[0].stock_quantity - answerOne.quantity;  //updating locally
                    UpdateStock({ stock_quantity: resultZero[0].stock_quantity }, { item_id: resultZero[0].item_id }); //updating globally or in database
                    console.log("\nHere is the updated stock:");
                    printItem(resultZero);
                }

                resolve();
            });
    });
}

function QuestionZeroHandling() {

    return new Promise(resolve => {

        console.log("\n\n");

        askQuestions(questions[0])
            .then(function (answerZero) {

                GetProduct(answerZero.productID)
                .then(resultZero => {

                if (resultZero.length == 0) {
                    console.log("Product not found. Please enter an ID that exists...");
                    QuestionZeroHandling();
                }
                else resolve(resultZero); 
                });
            });
    });
}


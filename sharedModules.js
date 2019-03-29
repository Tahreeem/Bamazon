var mysql = require("mysql");
var inquirer = require("inquirer");
require('dotenv').config();


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
        message: "Please enter the name of the product you would like added to the inventory"
    },
    { //question 4
        name: "insertDepartmentName",
        type: "input",
        message: "Please enter the name of the department this product falls under"
    },
    { //question 5
        name: "insertPrice",
        type: "input",
        message: "Please enter the price for this product",
        validate: validatePrice
    },
    { //question 6
        name: "insertStockQuantity",
        type: "input",
        message: "Please enter the quantity to add for this product",
        validate: validateNumber
    },
    { //question 7
        name: "customerRepeat",
        type: "confirm",
        message: "Would you like to perform another transaction?"
    },
    { //question 8
        name: "managerRepeat",
        type: "confirm",
        message: "Would you like to do anything else?"
    }
    ];




function validateNumber(value) {
    if (!isNaN(value) && value % 1 == 0 && parseInt(value) >= 0) return true;
    else {
        console.log("\nPlease enter a valid (positive whole) number\n");
    }
}

function validatePrice(value) {
    if (!isNaN(value) && parseInt(value) >= 0) return true;
    else {
        console.log("\nPlease enter a valid (positive) number\n");
    }
}




function printAllProducts() {

    console.log("\nHere are all the products:");

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




function disconnect() {
    connection.end();
    process.exit();
}

//_______________________________________________________________________

module.exports = {
    connection,
    questions,
    printAllProducts,
    printProduct,
    getProducts,
    updateStock,
    insertProduct,
    askQuestions,
    questionZeroHandling,
    disconnect
}; 
var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "something",
    database: "bamazon_db"
});

// connect to the mysql server and sql database
connection.connect(function (err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    start();
});

// function which prompts the user for what action they should take
function start() {
    inquirer
        .prompt({
            name: "productID",
            type: "input",
            message: "What is the ID of the product you would like to buy?",
            validate: (!isNaN(value) && (value % 1 == 0) && parseInt(value) > 0)
        })
        .then(function (answer) {
            // based on their answer, either call the bid or the post functions
            if (answer.postOrBid.toUpperCase() === "POST") {
                postAuction();
            }
            else {
                bidAuction();
            }
        });
}



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
connection.connect(function (error) {
    if (error) throw error;
    else console.log("nothing?");
    // run the start function after the connection is made to prompt the user

    inquirer
        .prompt([{
            name: "itemID",
            type: "input",
            message: "What is the ID of the product you would like to buy?",
            validate: ValidateNumber
        },
        {
            name: "quantity",
            type: "input",
            message: "What is the quantity of the product you would like to buy?",
            validate: ValidateNumber
        }])
        .then(function (answer) {

            connection.query(
                "SELECT * FROM bamazon_db.products WHERE ?",
                [{
                    item_id: answer.itemID
                }],
                function (error, results) {
                    if (error) throw error;

                    if (results.length == 0) {
                        console.log("Product not found, please enter an ID that exists");
                    }
                    else if (answer.quantity > results[0].stock_quantity) {
                        console.log(`Insufficient quantity of product available. Only ${answer.quantity} units available. Please enter a lower number`);
                    }
                    else {
                        UpdateStock({ stock_quantity: results[0].stock_quantity - answer.quantity }, { item_id: answer.itemID });
                        printItem(results);
                    }
                }
            );

        });

    


});



function printItem(item) {
    console.log("Item ID : " + item[0].item_id);
    console.log("Product Name : " + item[0].product_name);
    console.log("Department Name : " + item[0].department_name);
    console.log("Price : " + item[0].price);
    console.log("Stock Quantity : " + item[0].stock_quantity); 
}



function ValidateNumber (value) {
    if (!isNaN(value) && value % 1 == 0 && parseInt(value) > 0) return true;
    else {
        console.log("\nPlease enter a valid number\n");
        return false;
    }
}



function UpdateStock(set, where) {
    var parameters = [];
    parameters.push(set, where);

    connection.query(
        "UPDATE bamazon_db.products SET ? WHERE ?",
        parameters,
        function (error, results) {
            if (error) throw error;
            if (results.affectedRows>0) {
                connection.end();
            }
        }
    );
}
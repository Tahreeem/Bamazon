var sharedModules = require('./sharedModules.js');
var loginModule = require('./loginModule.js');
({ greetings } = require('./greetingsModule.js'));

//_______________________________________________________________________

sharedModules.connection.connect(function (error) {
    if (error) throw error;



    loginModule.questions[0].choices.splice(2, 3);

    greetings()
        .then(loginModule.loginFlow)
        .then(() => {

            console.log("Welcome to Bamazon Manager Portal...\n\n\n");

            managerActions().then(repeatOrEndManager);

        });
});

//_______________________________________________________________________

function managerActions() {

    return sharedModules.askQuestions(sharedModules.questions[2])
        .then(function (answerTwo) {

            switch (answerTwo.managerChoice) {

                case 'View Products for Sale':
                    return sharedModules.printAllProducts();

                case "View Low Inventory":
                    return sharedModules.getProducts([`stock_quantity < 5`])
                        .then((products) => {

                            if (products.length == 0) {
                                return "There are no products with an inventory count of lower than 5...";
                            }
                            else {
                                console.log("\nHere are all the products with an inventory count of lower than 5:");
                                return sharedModules.printProduct(products);
                            }
                        });

                case "Add to Inventory":
                    return sharedModules.questionZeroHandling()
                        .then(inventoryAdder);

                case "Add New Product":

                    return sharedModules.askQuestions([

                        sharedModules.questions[3],
                        sharedModules.questions[4],
                        sharedModules.questions[5],
                        sharedModules.questions[6]

                    ]).then(function (answers) {

                        return sharedModules.insertProduct({
                            product_name: answers.insertProductName,
                            department_name: answers.insertDepartmentName,
                            price: answers.insertPrice,
                            stock_quantity: answers.insertStockQuantity
                        });
                    });
            }
            
        });
}



function inventoryAdder(resultSix) {

    return new Promise(resolve => {

        sharedModules.askQuestions(sharedModules.questions[6])
            .then(function (answerSix) {

                resultSix[0].stock_quantity += Number(answerSix.insertStockQuantity);  //updating locally
                sharedModules.updateStock({ stock_quantity: resultSix[0].stock_quantity }, { item_id: resultSix[0].item_id }); //updating globally or in database
                console.log("\nThe inventory has been updated!");
                console.log("Here is the updated stock:");
                resolve(sharedModules.printProduct(resultSix));
            });
    });
}




function repeatOrEndManager() {

    console.log("\n\n\n");

    return sharedModules.askQuestions(sharedModules.questions[8]).then((answerEight) => {

        if (answerEight.managerRepeat) {
            console.log("\n\n");
            return managerActions().then(repeatOrEndManager);
        }
        else {
            console.log("\n\n\nThanks for stopping by!\nGoodbye for now");
            return sharedModules.disconnect();
        }

    });
}
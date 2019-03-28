var allModules = require('./allModules.js');
var loginModule = require('./loginModule.js');
({ greetings } = require('./greetingsModule.js'));

//_______________________________________________________________________

allModules.connection.connect(function (error) {
    if (error) throw error;



    loginModule.questions[0].choices.splice(2, 3);

    greetings()
        .then(loginModule.loginFlow)
        .then(() => {

            console.log("Welcome to Bamazon Manager Portal...\n\n");

            allModules.askQuestions(allModules.questions[2])
                .then(function (answerTwo) {

                    switch (answerTwo.managerChoice) {

                        case 'View Products for Sale':
                            allModules.printAllProducts()
                                .then(allModules.disconnect);
                            break;


                        case "View Low Inventory":
                            allModules.getProducts([`stock_quantity < 5`])
                                .then((products) => {

                                    if (products.length == 0) {
                                        console.log("There are no products with an inventory count of lower than 5...");
                                    }
                                    else console.log("\nHere are all the products with an inventory count of lower than 5:");

                                    allModules.printProduct(products)
                                        .then(allModules.disconnect);
                                });
                            break;

                        case "Add to Inventory":
                            allModules.questionZeroHandling()
                                .then(allModules.caseThreeHandling)
                                .then(allModules.disconnect);

                            break;

                        case "Add New Product":

                            allModules.askQuestions([

                                allModules.questions[3],
                                allModules.questions[4],
                                allModules.questions[5],
                                allModules.questions[6]

                            ]).then(function (answers) {

                                allModules.insertProduct({
                                    product_name: answers.insertProductName,
                                    department_name: answers.insertDepartmentName,
                                    price: answers.insertPrice,
                                    stock_quantity: answers.insertStockQuantity
                                })
                                    .then(allModules.disconnect);
                            });
                            break;
                    }

                });
        });
});

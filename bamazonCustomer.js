
var sharedModules = require('./sharedModules.js');
({ loginFlow } = require('./loginModule.js'));
({ greetings } = require('./greetingsModule.js'));

//_______________________________________________________________________

sharedModules.connection.connect(function (error) {
    if (error) throw error;



    greetings()
        .then(loginFlow)
        .then((userRecord) => { //in case you want to know the user details or whether it's a guest account

            console.log("Welcome to Bamazon Marketplace!");
            console.log("We have a unique selection of products for you to consider buying...\n\n");

            return sharedModules.printAllProducts()
                .then(questionZeroThenOne)
                .then(sharedModules.disconnect);

        });

});

//_______________________________________________________________________

var transactionCostTotal = 0;

function questionZeroThenOne() {

    return sharedModules.questionZeroHandling()
        .then((resultZero) => {
            return questionOneHandling(resultZero);
        });
}

function questionOneHandling(resultZero) {

    return new Promise(resolve => {

        sharedModules.askQuestions(sharedModules.questions[1])
            .then(function (answerOne) {

                if (answerOne.quantity > resultZero[0].stock_quantity) {
                    console.log(`Insufficient quantity of product available: only ${resultZero[0].stock_quantity} units available. Please enter a lower number...`);
                    resolve(questionOneHandling(resultZero));
                }
                else {

                    resultZero[0].stock_quantity -= answerOne.quantity;  //updating locally
                    sharedModules.updateStock(  //updating globally or in database
                        { stock_quantity: resultZero[0].stock_quantity },
                        { item_id: resultZero[0].item_id }
                    );


                    var transactionCost = resultZero[0].price * answerOne.quantity;
                    transactionCostTotal += transactionCost;
                    console.log(`\nYour purchase is complete! This purchase cost you $${transactionCost}.`);
                    console.log("Here is the updated stock:");
                    sharedModules.printProduct(resultZero);


                    resolve(repeatOrEndCustomer(transactionCostTotal));
                }
            });
    });
} //question name: "quantity"

function repeatOrEndCustomer(transactionCostTotal) {

    console.log("\n\n\n");

    return sharedModules.askQuestions(sharedModules.questions[7])
        .then((answerSeven) => {

            if (answerSeven.customerRepeat) {
                return questionZeroThenOne();
            }
            else {
                console.log(`\n\n\nThe total cost of your transactions today was $${transactionCostTotal}`);
                console.log("Thank you for shopping with Bamazon!");
                return;
            }

        });
}



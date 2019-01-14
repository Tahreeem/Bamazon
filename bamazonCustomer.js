
var allModules = require('./allModules.js');

//_______________________________________________________________________

allModules.connection.connect(function (error) {
    if (error) throw error;


    allModules.greetings()
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
        });
});



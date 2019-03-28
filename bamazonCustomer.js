
var allModules = require('./allModules.js');
({ loginFlow } = require('./loginModule.js'));
({ greetings } = require('./greetingsModule.js'));

//_______________________________________________________________________

allModules.connection.connect(function (error) {
    if (error) throw error;



    greetings().then(() => {

        return loginFlow().then(() => {

            console.log("Welcome to Bamazon Marketplace!");
            console.log("We have a unique selection of products for you to consider buying...\n\n");

            return allModules.printAllProducts().then(() => {

                return allModules.questionZeroHandling()
                    .then(function (resultZero) {

                        return allModules.questionOneHandling(resultZero)
                            .then(allModules.disconnect);
                    });

            });
        });
    });

});



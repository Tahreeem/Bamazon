var moment = require('moment');
var sun = require('sun-time');
var geoip = require('geoip-lite');
const publicIp = require('public-ip');
var os = require('os');


//_______________________________________________________________________

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

//_______________________________________________________________________

module.exports = {
    greetings
}
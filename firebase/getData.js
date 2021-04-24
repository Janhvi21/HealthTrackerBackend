const firebase = require('./firebase_connect');

module.exports = {
    getallUsers: function(req, callback) {
        try {
            var userId = req;
            return firebase.database().ref('/users/').once('value').then((snapshot) => {
                callback(null, snapshot.val())
            });
        } catch (error) {
            callback(null, {
                "statusCode": 500,
                "message": "Some error at the server",
            })
        }
    },
    getUserInfo: function(req, callback) {

        var userId = req;
        return firebase.database().ref('/users/' + userId).once('value').then((snapshot) => {
            callback(null, snapshot.val())
        });
    },
    getUserHealthInfo: function(req, callback) {

        var userId = req;
        return firebase.database().ref('/Health/' + userId).once('value').then((snapshot) => {
            callback(null, snapshot.val())
        });
    },
    getCalorieConsumption: function(req, callback) {

        var userId = req.headers.uid;
        return firebase.database().ref('/UserCalorieConsumption/' + userId).once('value').then((snapshot) => {

            callback(null, snapshot.val())
        });
    }
}
const firebase = require('./firebase_connect');

module.exports = {
    createNewUser: function(req) {
        const bmi = parseFloat(req.body.weight) / ((parseFloat(req.body.height) * 0.01) * (parseFloat(req.body.height) * 0.01));
        const bmr = (10 * parseFloat(req.body.weight)) + (6.25 * (parseFloat(req.body.height))) - (5 * parseInt(req.body.age)) + 5;
        const bodyStatus = this.calculateBodyType(bmi);
        try {
            firebase.database().ref("users/" + req.body.uid).set({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                gender: req.body.gender,
                age: req.body.age,
                height: req.body.height,
                weight: req.body.weight
            });
            firebase.database().ref("Health/" + req.body.uid).set({
                bmi: bmi,
                bmr: bmr,
                bodyStatus: this.calculateBodyType(bmi)
            });
        } catch (error) {

        }
    },
    updateUserInfo: function(req, callback) {
        try {

            var userId = req.headers.uid;
            firebase.database().ref('/users/' + userId).set({
                firstName: req.body.params.user.firstName,
                lastName: req.body.params.user.lastName,
                email: req.body.params.user.email,
                gender: req.body.params.user.gender,
                age: req.body.params.user.age,
                height: req.body.params.user.height,
                weight: req.body.params.user.weight
            });
            return firebase.database().ref('/users/' + userId).once('value').then((snapshot) => {
                callback(null, snapshot.val())
            });
        } catch (error) {
            callback(null, {
                "statusCode": 500,
                "message": "Some error at the server",
            })
        }
    },
    updateUserHealthInfo: function(req, callback) {
        const bmi = parseFloat(req.body.params.user.weight) / ((parseFloat(req.body.params.user.height) * 0.01) * (parseFloat(req.body.params.user.height) * 0.01));
        const bmr = (10 * parseFloat(req.body.params.user.weight)) + (6.25 * (parseFloat(req.body.params.user.height))) - (5 * parseInt(req.body.params.user.age)) + 5;
        const bodyStatus = this.calculateBodyType(bmi);
        try {

            var userId = req.headers.uid;
            firebase.database().ref("/Health/" + userId).set({
                bmi: bmi,
                bmr: bmr,

                bodyStatus: this.calculateBodyType(bmi)
            });
            return firebase.database().ref('/Health/' + userId).once('value').then((snapshot) => {
                callback(null, snapshot.val())
            });
        } catch (error) {
            callback(null, {
                "statusCode": 500,
                "message": "Some error at the server",
            })
        }
    },
    addCalorieConsumption: function(req, callback) {

        try {
            var userId = req.headers.uid;
            let count = 0;
            var date = req.body.params.Date.split('-');
            dt = date[0] + date[1] + date[2].substring(0, 2);
            firebase.database().ref('/UserCalorieConsumption/' + userId + '/' + dt).once('value').then((snapshot) => {

                for (let row in snapshot.val()) {
                    count++;
                }
                firebase.database().ref('/UserCalorieConsumption/' + userId + '/' + dt + '/' + count).set({
                    Category: req.body.params.Category,
                    Date: req.body.params.Date,
                    Details: req.body.params.Details,
                    Calorie: Number(req.body.params.Calorie)
                });
            });
            firebase.database().ref('/UserCalorieConsumption/' + userId + '/' + dt + '/TotalCaloriePerDay').once('value').then((snapshot) => {
                let exp = 0;
                exp = snapshot.val();
                exp = exp + Number(req.body.params.Calorie);
                firebase.database().ref('/UserCalorieConsumption/' + userId + '/' + dt + '/TotalCaloriePerDay').set(exp);

            });
            return firebase.database().ref('/UserCalorieConsumption/' + userId + '/' + dt).once('value').then((snapshot) => {
                callback(null, snapshot.val())
            });
        } catch (error) {
            callback(null, {
                "statusCode": 500,
                "message": "Some error at the server",
            })
        }
    },
    calculateBodyType: function(bmi) {
        if (bmi < 18.5)
            return "UnderWeight";
        if (bmi >= 18.5 && bmi <= 24.9)
            return "Normal";
        if (bmi >= 25 && bmi <= 29.9)
            return "OverWeight";
        if (bmi >= 30)
            return "Obese";

        return "Error";
    }

}
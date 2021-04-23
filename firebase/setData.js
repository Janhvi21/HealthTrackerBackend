const firebase = require('./firebase_connect');

module.exports = {
    createNewUser: function(req) {
        const bmi = parseFloat(req.body.weight) / ((parseFloat(req.body.height) * 0.01) * (parseFloat(req.body.height) * 0.01));
        const bmr = (10 * parseFloat(req.body.weight)) + (6.25 * (parseFloat(req.body.height))) - (5 * parseInt(req.body.age)) + 5;
        const calorie = (66.5 + (13.8 * parseFloat(req.body.weight)) + ((5 * parseFloat(req.body.height)) / (6.8 * parseInt(req.body.age))));
        console.log(bmi + " " + bmr + " " + calorie);
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
                idealCalorieIntake: calorie,
                bodyStatus: "overWeight"
            });
        } catch (error) {

        }
    },


}
const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');
const getFirebase = require("./firebase/getData");
const setFirebase = require("./firebase/setData");
const compression = require('compression');
const jwt = require('jsonwebtoken');

const exjwt = require('express-jwt');


const app = express();
app.use(compression());
const port = 3000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Headers', 'Content-type,Authorization');
    next();
});
const secretKey = 'My super secret key';

const jwtMW = exjwt({
    secret: secretKey,
    algorithms: ['HS256']
});


const admin = require('./firebase-admin/admin');
app.use(cors());


let userRecord = null;

app.listen(port, () => {
    console.log(`API served at http://localhost:${port}`);
});
app.post("/createNewUser/", function(req, res) {
    let token = "";
    admin.auth().createUser({
            email: req.body.email,
            emailVerified: false,
            password: req.body.password,
            displayName: req.body.firstName + req.body.lastName,
            disabled: false,
        }).then((userRecord) => {
            req.body.uid = userRecord.uid;
            setFirebase.createNewUser(req);

            res.send({
                success: true,
                message: 'User Created SuccessFully'
            })

        })
        .catch((error) => {
            res.send({
                success: false,
                statusCode: 500,
                message: error == null || isEmptyObject(error) ? "Some error at the server" : error,
            })
        })

})
app.post("/updateUser/", function(req, res) {
    setFirebase.updateUserInfo(req, function(err, data) {
        res.send(data);
    })
})
app.post("/updateUserHealthInfo/", function(req, res) {
    setFirebase.updateUserHealthInfo(req, function(err, data) {
        res.send(data);
    })
})
app.get("/allUsers", function(req, res) {
    getFirebase.getallUsers(req, function(err, data) {
        res.send(data);
    })
});
app.post("/addCalorieConsumption/", function(req, res) {
    setFirebase.addCalorieConsumption(req, function(err, data) {
        res.send(data);
    })
});

app.get("/getCalorieConsumption/", function(req, res) {
    getFirebase.getCalorieConsumption(req, function(err, data) {
        res.send(data);
    })
});
app.post("/createToken/", function(req, res) {
    let token = jwt.sign({
        uid: req.body.uid,
        username: req.body.username
    }, secretKey, {
        expiresIn: "60s"
    });
    res.send({
        success: true,
        err: null,
        token: token
    });
})
app.get("/verifyToken/", jwtMW, function(req, res) {
    res.send(req.user);
})
app.get("/getUserInfo/", jwtMW, function(req, res) {
    getFirebase.getUserInfo(req.headers.uid, function(err, data) {
        res.send(data);
    })
})
app.get("/getUserHealthInfo/", jwtMW, function(req, res) {
    getFirebase.getUserHealthInfo(req.headers.uid, function(err, data) {
        res.send(data);
    })
})

async function verifyToken(req, res, next) {
    const idToken = req.query.token;
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        if (decodedToken) {
            req.body.uid = decodedToken;
            return next();

        } else {
            return res.status(401).send("You are not authorized| error!");
        }
    } catch (e) {
        return res.status(401).send("You are not authorized | error! " + e);
    }
}

app.use(function(err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).send({
            success: false,
            officialError: err,
            err: 'Username or password is incorrect 2'
        });

    } else {
        next(err);
    }
});

function isEmptyObject(obj) {
    return !Object.keys(obj).length;
}
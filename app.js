var express = require('express');
var app = express();

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/online-library', {useNewUrlParser: true, useUnifiedTopology: true});
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
console.log("We are connected to the DB");
});

app.set('view engine','ejs');

app.use('/assets', express.static('assets'));

var session = require("express-session");

app.use(session({ secret: "Ganesh" }));

var profileController = require('./controller/ProfileController');
var routes = require('./controller/routes');
app.use('/',routes);
app.use("/",profileController);

app.listen(8080);

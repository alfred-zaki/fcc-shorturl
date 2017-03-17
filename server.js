//Free Code Camp Short URL project
var express = require("express");
var MongoClient = require('mongodb').MongoClient;

var app = express();
var MongoURL = process.env.MONGOLAB_URI;

app.enable('trust proxy');

app.get('/http(s)?://:domain*', function(req, res){
    var userURL = req.path.substring(1, req.path.length).toLowerCase();
    console.log(userURL);
    FindAndCreateIfNew(userURL, req, res);
});

app.get('/:shortURLCode', function(req, res){
    var response;
    console.log(req.params.shortURLCode);
    if (!isNaN(parseInt(req.params.shortURLCode))){
        //There should be an entry
        ShortURLRedirect(parseInt(req.params.shortURLCode), req, res);
    }else{
        //No idea what the user just entred
        response = 'I have no idea what did you just entred!!'
        res.send(response);
    }
});

app.get('/', function(req, res){
  res.send('Alfred Zaki FreeCodeCamp Short URL Project');
});

app.listen(8080, function () {
  console.log('Short URL listening on port 8080!');
});

//Start of functions
function GetShortURL(URLCode) {
    MongoClient.connect(MongoURL, function (err, db) {
    if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
        console.log('Connection established to Mongo DB');
        db.collection('URLS').find({_id:URLCode}).toArray(function(err, docs) {
                if (err){
                    console.log("Can't find that on the database");
                    db.close();
                    return "not found";
                }else{
                    console.log("short code entry has been found");
                    db.close();
                    return docs[0].URL;
                }
            });
    }
    });
}

function FindAndCreateIfNew (URL, req, res){
    MongoClient.connect(MongoURL, function (err, db) {
        if (err) {
            console.log('Unable to connect to the mongoDB server. Error:', err);
            res.send('Error connecting to DB, please try agian later');
        } else {
            console.log('Connection established to Mongo DB');
            db.collection('URLS').find({"URL":URL.toLowerCase()}).toArray(function(err, docs) {
                if (err){
                    console.log("Find error !");
                    db.close();
                    console.log('Mongo DB Connection closed');
                    res.send('DB find error, please try agian later');
                }else{
                    console.log("entry(ies) has been found");
                    console.log(docs);
                    db.close();
                    console.log('Mongo DB Connection closed');
                    if (docs.length > 0){
                        var response = 'URL already in database: use ';
                        response = response + req.protocol + '://' + req.get('host');
                        response = response + '/' + docs[0]._id.toString();
                        res.send(response);
                    }else{
                        CreateShortURL(URL, req, res);
                    }
                }
            });
        }
    });
}

function CreateShortURL(URL, req, res){
    MongoClient.connect(MongoURL, function (err, db) {
    if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
        res.send('Error connecting to DB, please try agian later');
    } else {
        console.log('Connection established to Mongo DB');
        var URLKey = Math.floor(Math.random() * 999999) + 100000;
        var InsertErr = true;
        while(InsertErr == true){
            try{
                db.collection('URLS').insertOne({_id: URLKey, "URL":URL.toLowerCase()});
                console.log('Record Created with ID: ' + URLKey);
                InsertErr = false;
                var response = 'URL created: use ';
                        response = response + req.protocol + '://' + req.get('host');
                        response = response + '/' + URLKey;
                        res.send(response);
                res.send(response);
            }
            catch(e){
                console.log('Error inserting record: ');
                console.log(e);
            }
        }
        db.close();
        console.log('Mongo DB Connection closed');
    }
    });
}

function ShortURLRedirect (shortCode, req, res){
    MongoClient.connect(MongoURL, function (err, db) {
        if (err) {
            console.log('Unable to connect to the mongoDB server. Error:', err);
            res.send('Error connecting to DB, please try agian later');
        } else {
            console.log('Connection established to Mongo DB');
            db.collection('URLS').find({'_id':shortCode}).toArray(function(err, docs) {
                if (err){
                    console.log("Find error !");
                    db.close();
                    console.log('Mongo DB Connection closed');
                    res.send('DB find error, please try agian later');
                }else{
                    console.log("entry(ies) has been found");
                    console.log(docs);
                    db.close();
                    console.log('Mongo DB Connection closed');
                    if (docs.length > 0){
                        res.redirect(docs[0].URL.toString());
                    }else{
                        res.send('Invalid code, please check and try agian');
                    }
                }
            });
        }
    });
}

const http = require('https');
const ip_host = '127.0.0.1';
const port = 8080;
var cowsay = require('cowsay');
const fs = require('fs');
var path = require('path');
// const yaml = require('js-yaml');
const os = require("os");


const express = require('express');
const { json } = require('express');
// Constants
const hostname = '0.0.0.0';

var scriptName = path.basename(__filename);
var message = "Hello World! with Cowsay";


/* Get hostname of os in Node.js */
const hostName = os.hostname();

 //+ Math.random()*100;

/* Get DateTime, timezone and offset */
const date = new Date()
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
var offset_minutes = date.getTimezoneOffset();
if (offset_minutes <= 0) {
  var offset = "UTC+" + (offset_minutes/-60).toString();
}
else {
  var offset = "UTC" + (offset_minutes/-60).toString();
}

/* Create server that does nothing */
const server = http.createServer((req, res) => {

                                });

// App
const app = express();
// // Connect to mongodb server
// const MongoClient = require('mongodb').MongoClient;
// /* Your url connection to mongodb container */
// const url = ...;
var MongoClient = require('mongodb').MongoClient;
var url = `mongodb://980ad184142c:27017/`; // se debe cambiiar dependiendo del id del contenedor 


// POST method route
app.post('/', function (req, res) {
      /* Create a document in mongodb and insert it into the database */
      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("bootcamp");
        var myobj = { message: message, scope: scriptName, host: hostName + Math.floor(Math.random()*10), date: date , location: timezone, offset: offset};
        dbo.collection("calls").insertOne(myobj, function(err, res) {
          if (err) throw err;
          console.log(myobj);
          console.log(`Document inserted in database.`);
          db.close();
        });
      });
    res.send('POST 201');
});

// GET method route
app.get('/secret', function (req, res, next) {
    res.send('Never be cruel, never be cowardly. And never eat pears!');
    console.log('This is a console.log message.');
});

/*
Your implementation here 

// GET method route
// Retrieve all documents in collection
// ...
*/
app.get('/all', function (req, res) {
    
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("bootcamp");
      dbo.collection("calls").find().toArray(function(err, docs) { 
        if (err) throw err;
          console.log(docs);
          console.log(`Document in database.`);

          db.close(); 
          res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify(docs));
    res.end();
        });
    });
    
    
});

// GET method route
// Query by hostname
// ...
app.get('/query', function (req, res) {
    
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("bootcamp");
      console.log(req.query.host);
    
      dbo.collection("calls").find( { host: req.query.host}).toArray(function(err, docs) { 
        if (err) throw err;
          console.log(docs);
          console.log(typeof docs);
          console.log(`Document in database.`);
          db.close(); 
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify(docs));
    res.end();
        });
    });
    
});


/* PUT method. Modifying the message based on host. 
If not found, create a new document in the database. (201 Created)
If found, message, date and offset is modified (200 OK) */
// ...
app.put('/update', function (req, res) {
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("bootcamp");
      console.log(req.query.host);
     var new_val = {$set: {host: req.query.host ,message: "Probando put", date: date , location: timezone, offset: offset} };
      dbo.collection("calls").updateMany( { host: req.query.host}, new_val ,function(err, resp) { 
        if (err) throw err;
        if (resp.modifiedCount > 0){
          console.log(resp);
          console.log(`Document modified.`);
          db.close(); 
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/plain');
          res.write(resp.modifiedCount + " document(s) updated");
          res.end("200 ok");
            }
        else{
             var message = "probando crear nuevos"
             var myobj = { message: message, scope: scriptName, host: req.query.host, date: date , location: timezone, offset: offset};
        dbo.collection("calls").insertOne(myobj, function(err, resp) {
          if (err) throw err;
          console.log(myobj);
          console.log(resp);
          console.log(`Document inserted in database.`);
          db.close();
          res.statusCode = 201;
          res.setHeader('Content-Type', 'application/json');
          res.write(JSON.stringify(myobj));  
          res.end("201 Created");
           });
        };         
          
        });
    });
    
});
/* DELETE method. Modifying the message based on hostname. 
If not found, do nothing. (204 No Content)
If found, document deleted (200 OK) */
// ...

app.delete('/delete', function (req, res) {
MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("bootcamp");
      console.log(req.query.host);
      dbo.collection("calls").deleteMany( { host: req.query.host} ,function(err, resp) { 
        if (err) throw err;
        if (resp.deletedCount > 0){
          console.log(resp);
          console.log(`Document Deleted.`);
          db.close(); 
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/plain');
          res.write(resp.deletedCount + " document(s) deleted");
          res.end("200 ok");
            }
        else{
                 
          db.close();
          res.statusCode = 204;
          res.end("204 No Content");
           
        };         
          
        });
    });
});   

app.listen(port, hostname);
console.log(`Running on http://${hostname}:${port}`);
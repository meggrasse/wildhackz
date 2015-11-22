var express = require('express');
var app = express();

app.set('views', './views')
app.set('view engine', 'jade')

// respond with "Hello World!" on the homepage
app.get('/', function (req, res) {
	//res.sendfile(wildhackz + 'wildhackz.html');
  //res.send('Hello World!');
   	res.render('index', { title: 'Hey', message: 'Hello there asdfasdfasd up', message2: "Hi"});

});


app.get('/message', function (req, res) {
	//res.sendfile(wildhackz + 'wildhackz.html');
  //res.send('Hello World!');
   	console.log("Query:")
   	console.log(req.query)
   	console.log(req.query.From)
   	console.log(req.query.Body)
   	//msg = "Hello there. You said:" + req.query.Body
   	//	res.render('message', { body: msg } );

   	msg = req.query.Body
   	res.render('message', { body: "Thanks for sending us your location, food is on the way!" } );
   
});


var fs = require("fs");
var path = "c:\\Temp\\Test.txt";
var data = "Hello from the Node writeFile method!";

fs.writeFile(path, data, function(error) {
     if (error) {
       console.error("write error:  " + error.message);
     } else {
       console.log("Successful Write to " + path);
     }
});


app.get('/user', function (req, res) {
  res.send('Got a POST request');
});


// accept POST request on the homepage
app.post('/', function (req, res) {
  res.send('Got a POST request');
});

// accept PUT request at /user
app.put('/user', function (req, res) {
  res.send('Got a PUT request at /user');
});

// accept DELETE request at /user
app.delete('/user', function (req, res) {
  res.send('Got a DELETE request at /user');
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

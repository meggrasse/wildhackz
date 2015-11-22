var express = require('express');
var app = express();

var dataArray = [];


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

   
   	tfrom = req.query.From  
   

   	//first time recieve a text
   	msg = "Welcome! If you would like a meal, please send us location"
   	var stage = 0;
   	

   	for(var i = 0; i < dataArray.length; i++){
   		element = dataArray[i];

   		console.log(element);

   		if(element[0] == tfrom && element[2] > 0){
   			msg = "Sorry, we only provide one meal per person"
   			stage = 2;
   		}


   		if(element[0] == tfrom && element[2]==0){
   			msg = "Thank you so much! We hope you enjoy your meal"
   			element[2] = 1;
   			stage = 1;
   			element[1]=req.query.Body;

   			console.log(element);
   			tbody = req.query.Body
   			
   		}

   		

   	}

   	if(stage == 0){
   		var arryLine = [tfrom,"",0];
   		dataArray.push(arryLine);

   	}   		

   

  	//if first time user, add row in array for them
  

   	res.render('message', { body: msg } );
   	
   	
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

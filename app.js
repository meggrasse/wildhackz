var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var braintree = require('braintree');
var delivery_quote = "no pending requests - check back later"
var dataArray = [];

var gateway = braintree.connect({
  environment:  braintree.Environment.Sandbox,
  merchantId:   'fmqk85bqzy2m8qmn',
  publicKey:    'vjy9m2njdx29dqb9',
  privateKey:   '085b2474efa0b406e596eb01a6403d45'
});

//add Postmates API
var Postmates = require('postmates');
var postmates = new Postmates('cus_KI5W-plkMcICY-', '9a971592-0f9f-4aec-b531-9db3cc76442a');


app.set('views', './views')
app.set('view engine', 'jade')

app.use(express.static('public'));
app.use(bodyParser.json({limit: '500mb'}));
app.use(bodyParser.urlencoded({ extended: false }));

// respond with "Hello World!" on the homepage
app.get('/', function (req, res) {
  gateway.clientToken.generate({}, function (err, resBT) {
    res.render('index', {
      clientToken: resBT.clientToken,
      amount: delivery_quote,
    });
  });
});

app.post('/process', function (req, res) {
  gateway.transaction.sale({
    amount: req.body.amount,
    paymentMethodNonce: req.body.payment_method_nonce,
  }, function (err, result) {
    if (err) {
      console.log(err);
      res.redirect('/payment-error')
    } else {
      console.log(result);
      res.redirect('/payment-success')
    }

  });
})

app.get('/payment-success', function (req, res) {
  res.render('success');
});

//messaging code
app.get('/message', function (req, res) {
	 //print recieved text to console log
   console.log("Query:")
   console.log(req.query)
   console.log(req.query.From)
   console.log(req.query.Body)
   
   //user's phone number
   tfrom = req.query.From  
   

   //initalize stage to 0
  var stage = 0;
   	
    //look through dataArray
   	for(var i = 0; i < dataArray.length; i++){
   		element = dataArray[i];

   		console.log(element);

      //if user is already past stage 1
   		if(element[0] == tfrom && element[2] > 0){
   			msg = "Sorry, we only provide one meal per person"
   			stage = 2;
   		}

      //if user phone number exists and texting for second time
      //then they are sending their location, store
   		if(element[0] == tfrom && element[2]==0){
   			msg = "Thank you so much! We hope you enjoy your meal"
   			element[2] = 1;
   			stage = 1;
   			element[1]=req.query.Body;
        
        console.log(element[1]);
        //create full a postmates deliever
        var delivery = {
          manifest: "Holiday meal",
          pickup_name: "Wildhacks", //from front end form
          pickup_address: "20 McAllister St, San Francisco, CA", //from front end form
          pickup_phone_number: "555-555-5555", //from front end form
          dropoff_name: req.query.FromCity + "resident", //from Twillio
          dropoff_phone_number: convertPhone(tfrom), //converted phone number
          dropoff_address: element[1]
  
        };

        //calculate quote
        postmates.quote(delivery, function(err, res) {
          delivery_quote = res.body.fee;
          console.log("Delivery quote is: " + res.body.fee); // 799
        });

       postmates.new(delivery, function(err, res) {
        // `res.body`
        console.log(res.body);

      });

   			console.log(element);
   					
   		}

   	}

    //if it is a first time user, set message store their data in the array
    msg = "Welcome! If you would like a meal, please send us location"

   	if(stage == 0){
   		var arryLine = [tfrom,"",0];
   		dataArray.push(arryLine);
   	}   		

    //reply back with the appropriate message
   	res.render('message', { body: msg } );




    //convert Twillio phone number to Postmates format
  
    function convertPhone(tphone){
      var postPhone;
      var tphoneArr = tphone.split('');

      var postPhoneArr = ["X","X","X","-","X","X","X","-","X","X","X","X"];
      postPhoneArr[0] = tphoneArr[2];
      postPhoneArr[1] = tphoneArr[3];
      postPhoneArr[2] = tphoneArr[4];

      postPhoneArr[4] = tphoneArr[5];
      postPhoneArr[5] = tphoneArr[6];
      postPhoneArr[6] = tphoneArr[7];

      postPhoneArr[8] = tphoneArr[8];
      postPhoneArr[9] = tphoneArr[9];
      postPhoneArr[10] = tphoneArr[10];
      postPhoneArr[11] = tphoneArr[11];
  
      postPhone = postPhoneArr.join('');
      console.log(postPhone);
      return postPhone;
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

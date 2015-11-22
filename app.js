//set up APIs and framework
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var braintree = require('braintree');

var gateway = braintree.connect({
  environment:  braintree.Environment.Sandbox,
  merchantId:   'fmqk85bqzy2m8qmn',
  publicKey:    'vjy9m2njdx29dqb9',
  privateKey:   '085b2474efa0b406e596eb01a6403d45'
});

//add Postmates API
var Postmates = require('postmates');
var postmate_customer_id = 'cus_K3wY5touMWVW_k';
var postmates = new Postmates(postmate_customer_id, '340c95fe-16e4-4071-91e8-9d10f75f6cc4');

app.set('views', './views')
app.set('view engine', 'jade')

app.use(express.static('public'));
app.use(bodyParser.json({limit: '500mb'}));
app.use(bodyParser.urlencoded({ extended: false }));

var fs = require('fs');

app.get('/start', function (req, res) {
  res.render('start', {});
});



function topNeed(){

  var newDataArr = maketheDataArr();
  var topPerson = newDataArr.find(item => {
    console.log("PRINT" + item[3]);
    return item[3] == 1
  });
   console.log("TOP PERSON" + topPerson);
   return topPerson

  fs.writeFileSync("data.txt", newDataArr.join('\n'));

}
   


// respond with "Hello World!" on the homepage
app.get('/', function (req, res) {


  var delivery_quote; 
  var topPerson = topNeed();
  if(topPerson){
    foodNeeded = "yes!"
  }else{
     foodNeeded = "no pending requests - check back later"
  }
  
    res.render('index', {  foodNeeded: foodNeeded});

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
      //console.log(result);
      res.redirect('/payment-success')
    }

  });
});

app.get('/loadForm', function (req, res) {

  var inName = req.param.name;
  var inAdd = req.param.pickup_address;
  var inPhone = req.param.phone_number;
  var inDes = req.param.description;
  console.log("loading form mode")

 createDelivery(inName, inAdd, inPhone, inDes, res);

});


app.get('/pay', function (req, res){
    
      gateway.clientToken.generate({}, function (err, resBT) {
        var price = fs.readFileSync("price.txt");
        res.render('pay', {
          clientToken: resBT.clientToken,
          amount: price
      });

    });
});



app.get('/payment-success', function (req, res) {
  res.render('success');

  var newDataArr = maketheDataArr();
  var topPerson = topNeed();
  console.log("Payment success thinks top person is: " + topPerson)
  var indexTopPerson = topPerson[1];
  var userInWholeArr = newDataArr[indexTopPerson];
  userInWholeArr[3] = 2;

  fs.writeFileSync("data.txt", newDataArr.join('\n'));

    
  

});


app.get('/data', function (req, res){
    var newDataArr = maketheDataArr();
    res.render('data', {newDataArr: newDataArr})

});


function maketheDataArr() {
  var fs = require('fs');
  var buf = fs.readFileSync("data.txt", "utf8");

  var bufferString = buf.toString().trim();
  newDataArr = [];
  if (bufferString) {
    newDataArr = bufferString.split('\n').map(line => {
      return line.split(',')
    });
  }
  return newDataArr;

}


//messaging code
app.get('/message', function (req, res) {
   //print recieved text to console log
   //console.log("Query:")
   //console.log(req.query)
  console.log(req.query.From)
  console.log(req.query.Body)
  var userBody = req.query.Body;

  var msg;
  
  var fs = require('fs');

  //var dataArray = [];
  // buf.toString().split("\n").forEach(function(line, index, arr){
  //   //dataArray.push(line.split(","));
  // }

  //sync splits up array into happy
  
  var newDataArr = maketheDataArr();
  var userNumber = newDataArr.length;

  console.log(newDataArr);

  //find the users set of data this is sync
  var userData = newDataArr.find(item => {
    return item[0] === req.query.From
  })

  if(userData){
    var status = userData[2];
    console.log("user status: " + status)
    var loc = userBody
    console.log("user loc: " + loc)
    var id = userData[1];

    processStatus(id, status, loc);

  }else{
    newDataArr.push([req.query.From, userNumber, 1, 0, ""]);
    msg = "Welcome! If you would like a meal, please send us your location in the format (101 Market St., Main St, San Francisco, CA)"
    //console.log(newDataArr);
    //console.log(userNumber);
  }
 
 console.log(newDataArr);

 fs.writeFileSync("data.txt", newDataArr.join('\n'));
 
  res.render('message', { body: msg} );




  function processStatus(id, status, loc) {

    if(status == 1){
      console.log("location passed to proccees: " + loc)
      msg = "Thank you so much! We hope you enjoy your meal";
      var newDataArr = maketheDataArr();
      var userInWholeArr = newDataArr[id];
      userInWholeArr[2] = 2;
      userInWholeArr[3] = 1;
      userInWholeArr[6] = loc;
      fs.writeFileSync("data.txt", newDataArr.join('\n'));


    }else if(status == 2){
      msg = "Sorry only one meal per person";

    }
    
  }

    
});



function createDelivery(n, a, p, d, topRes){
  var dev_id;

  var newDataArr = maketheDataArr();
    var topPerson=topNeed();
    var userInWholeArr = newDataArr[topPerson[1]];

  var init_deliver= {
    manifest: "Holiday meal",
    pickup_name: n, //from front end form
    pickup_address: "2303 Sheridan Rd, Evanston, IL", //from front end form
    pickup_phone_number: "555-555-5555", //from front end form
    dropoff_name: "meal wanted", //from Twillio
    dropoff_phone_number: convertPhone(userInWholeArr[0]), //converted phone numbe
    dropoff_address: userInWholeArr[6]+","+ userInWholeArr[7]+","+userInWholeArr[8]
  }

      console.log("TRYING TO GO HERE: " + userInWholeArr[6]+","+ userInWholeArr[7]+","+userInWholeArr[8])

  //counter++;

  //calculate quote
  postmates.quote(init_deliver, function(err, res) {
    console.log("Delivery quote is: " + res.body.fee);
    console.log("Delivery id is: " + res.body.id);
    dev_id = res.body.id;

    var newDataArr = maketheDataArr();
    var topPerson=topNeed();
    var userInWholeArr = newDataArr[topPerson[1]];
    console.log("THE TOP NEEED" + topPerson)
    userInWholeArr[4] = dev_id;
    userInWholeArr[5] = res.body.fee;
    console.log("HIHIHI" + dev_id)
    fs.writeFileSync("data.txt", newDataArr.join('\n'));


    var delivery = {
      quote_id: dev_id,
      manifest: "Holiday meal",
      pickup_name: "Wildhacks", //from front end form
      pickup_address: "2303 Sheridan Rd, Evanston, IL", //from front end form
      pickup_phone_number: "555-555-5555", //from front end form
      dropoff_name: "meal wanted", //from Twillio
      dropoff_phone_number: convertPhone(userInWholeArr[0]), //converted phone number
      dropoff_address: userInWholeArr[6]+","+ userInWholeArr[7]+","+userInWholeArr[8]
    }

   //make delievery
    postmates.new(delivery, function(err, res) {
     console.log(res.body);
     var price = res.body.fee;

      fs.writeFileSync("price.txt", price);
      topRes.redirect('/pay')


      
    });
  });
}
      

//function checkstatus(delivery)


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
      //console.log(postPhone);
      return postPhone;
}


var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});






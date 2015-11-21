var braintree = require("braintree");

var gateway = braintree.connect({
  environment: braintree.Environment.Sandbox,
  merchantId: "fmqk85bqzy2m8qmn",
  publicKey: "vjy9m2njdx29dqb9",
  privateKey: "085b2474efa0b406e596eb01a6403d45y"
});

app.get("/client_token", function (req, res) {
  gateway.clientToken.generate({}, function (err, response) {
    res.send(response.clientToken);
  });
});

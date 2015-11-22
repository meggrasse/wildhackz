(function(){
Router.route('/items');

Router.route('/message', function () {
  this.render('message.html');
});

if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);

  Template.hello.helpers({
    counter: function counter() {
      return Session.get('counter');
    }
  });

  Template.hello.events({
    'click button': function clickButton() {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
}).call(this);

Router.configure({
  //customize loader
  progressSpinner: false,
  //./loader

  // we use the appBody template to define the layout for the entire app
  layoutTemplate: 'master',

  // the appNotFound template is used for unknown routes and missing lists
  notFoundTemplate: 'appNotFound',

  // show the appLoading template whilst the subscriptions below load their data
  loadingTemplate: 'appLoading',

  // wait on the following subscriptions before rendering the page to ensure
  // the data it's expecting is present
  waitOn: function() {
    return Meteor.subscribe("links");
  },

});


if (Meteor.isClient) {


}
Router.onBeforeAction(function(){
  //Load Google Maps API before proceeding
  GoogleMaps.load({
    key: "AIzaSyAXZxIHbta4A8qAsnHg6rvkFWaZCohnb1I",
    libraries: "geometry,places",
  });

  if(GoogleMaps.loaded()){
    this.next();
  }else{
    this.render("appLoading");
  }
  
})

Router.route('/', function() {
  this.render('home');
});

Router.route('/meet/:_link', function() {
  this.render('Links');
});



if (Meteor.isClient) {
  

  Meteor.startup(function(){
    
    //console.log(Geolocation.error());

    //Set map starting coords
    Session.set("MAP_LAT", 40.69847032728747);
    Session.set("MAP_LON", -73.9514422416687);

    //dynamic map height
    setMapHeight = function(){
      vph = $(window).height();
      $(".map-container").css({"height":vph+"px"});
    }
    
    setMapHeight();

  });

  Template.home.onRendered(function(){
    
    this.autorun(function () {
      if (GoogleMaps.loaded()) {
        $("#inputAddress").geocomplete({
          map: "#addressMap",
          mapOptions:{
            zoom: 3,
            disableDefaultUI: true,
            draggable: false,
          },
          location: new google.maps.LatLng(40.69847032728747, -73.9514422416687),
        }).bind("geocode:result", function(event, result){
          var addressOneCoords = {lat: result.geometry.location.lat(), lng: result.geometry.location.lng()}
          Session.set("ADDRESSONECOORDS", addressOneCoords);
        });
        setMapHeight();
      }
    });

  });

  Template.home.events({

    "submit #addressInputForm": function(e,t){
        e.preventDefault();

        //give user ownership of this link, who cares how the numbers are generated
        var UID = Math.random().toString(36).substring(7);
        Cookie.set('UID', UID);

        //create new link
        Meteor.call("createNewLink", UID, function(error, result){
          if(!error){
            var LID = result;
            //add addressOne coords to Link DB
            Meteor.call("addLinkAddress", LID, 1, Session.get("ADDRESSONECOORDS"),
              function(error, result){
                //Load link page
                Router.go("/meet/"+LID);
            });
          }
        });
    },

  });

  Template.home.helpers({
   
  });

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}

/*
if (Meteor.isClient) {
  
  Meteor.startup(function(){

    Meteor.subscribe("meetingPlaces");
    
    //Load Google Maps API
    GoogleMaps.load({
      key: "AIzaSyAXZxIHbta4A8qAsnHg6rvkFWaZCohnb1I",
      libraries: "geometry,places",
    });

    //Set map starting coords
    Session.set("MAP_LAT", -37.8136);
    Session.set("MAP_LON", 144.9631);

    //dynamic map height
    setMapHeight = function(){
      vph = $(window).height();
      $(".map-container").css({"height":vph+"px"});
    }
    
    setMapHeight();

  });

  Template.links.helpers({

    stepTemplate: function(){
      var LID = Router.current().params._link;
      var getStep = Links.findOne({_id: LID}).step;
      if(getStep == 1){ 
        return "getAddressTwo"; 
      }else if(getStep == 2){ 
        return "meetPoint"; 
      }else{
        return 0;
      }
    },

  });

  Template.getAddressTwo.onRendered(function(){
    this.autorun(function () {
      if (GoogleMaps.loaded()) {
        $("#inputAddress").geocomplete({
          map: "#addressMap",
          mapOptions:{
            zoom: 2
          },
          location: new google.maps.LatLng(Session.get("MAP_LAT"), Session.get("MAP_LON")),
        }).bind("geocode:result", function(event, result){
          //console.log(result.geometry.location.lat());
          var addressTwoCoords = {lat: result.geometry.location.lat(), lng: result.geometry.location.lng()}
          //console.log(addressTwoCoords);
          Session.set("ADDRESSTWOCOORDS", addressTwoCoords);
        });
      }
    });

  });

  Template.getAddressTwo.events({
    "submit #addressInputForm": function(e,t){
        e.preventDefault();
        //add address two to link
        var LID = Router.current().params._link;
        Meteor.call("addLinkAddress", LID, 2, Session.get("ADDRESSTWOCOORDS"),
          function(error, result){
            console.log(LID);
            console.log(error);
            Meteor.call("updateLinkStep", LID, 2);
        });
    },

  });

  Template.getAddressTwo.helpers({
    isCreator: function(){
      var getUID = Cookie.get('UID');
      var LID = Router.current().params._link;
      var getActualOwner = Links.findOne({_id: LID}).ownerUID;
      return (getUID == getActualOwner)?(1):(0);
    },

    meetLink: function(){
      var LID = Router.current().params._link;
      return "/meet/"+LID;
    },

  });


  Template.meetPoint.onRendered(function(){
      //Calculate the midpoint
      var LID = Router.current().params._link;
      
      Meteor.call("calcMidPoint", LID, function(error,r){
        Session.set("MIDPOINT_LAT", r.lat);
        Session.set("MIDPOINT_LNG", r.lng);

        var midPointCoords = {"lat":r.lat, "lng":r.lng};
        //add address to DB
        Meteor.call("addLinkAddress", LID, 3, midPointCoords, function(){

            //Places search
            //create an instance of Google Maps to use Geocoding
            GoogleMaps.initialize()
            GoogleMaps.create({
              name: 'geocodeMap',
              element: document.getElementById('geocodeMap'),
              options: {
                center: new google.maps.LatLng(-37.8136, 144.9631),
                zoom: 8
              }
            });

            var coordsLat = Session.get("MIDPOINT_LAT");
            var coordsLng = Session.get("MIDPOINT_LNG");
            
            var latlng = {lat: coordsLat, lng: coordsLng};

            var geocoder = new google.maps.Geocoder;
            geocoder.geocode({'location': latlng}, function(results, status) {
              if (status === google.maps.GeocoderStatus.OK) {
                console.log(results);
                if (results[1]) {
                  Session.set("MPADDRESS", results[1].formatted_address);
                }else{
                  //coords not found
                }
              }else{
                //geocoder failed, check status
              }
            });

            var midPoint =  new google.maps.LatLng(coordsLat,coordsLng);      
            
            
            getMeetingPlaces = function(){
              var service = new google.maps.places.PlacesService(GoogleMaps.maps.mainMap.instance);
              
              var request = {
                location: midPoint,
                radius: '5000',
                types: ['cafe']
                //rankBy: google.maps.places.RankBy.DISTANCE
              };
              // 'library', 'local_government_office', 'pharmacy', 'city_hall', 'courthouse', 'police', 'post_office', 'electronics_store', 'shopping_mall'
             
              service.nearbySearch(request, callback);
              
              function callback(results, status) {
                var meetingPlaces = [];
                var LID = Router.current().params._link;
                console.log("API STATUS: "+status);
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                  console.log(results);
                  for (var i = 0; i < results.length; i++) {
                    //var place = results[i];
                    //createMarker(results[i]);
                    results[i].lat = results[i].geometry.location.lat();
                    results[i].lng = results[i].geometry.location.lng();

                    //console.log(results[i]);
                    meetingPlaces.push(results[i]);
                    
                    Session.set("MEETING_PLACES", meetingPlaces);
                  }
                  console.log("Meeting places length: "+meetingPlaces.length);
                  if(meetingPlaces.length == 0){
                    console.log("CLIENT CALLED");
                    Meteor.call("addMeetingPlaces", LID, results[i]);
                    //reset meeting places array
                    meetingPlaces = [];
                  }
                }
              }
            }
            
        });
      });
     
  });

  Template.meetPoint.helpers({
    //Convert coordinates from midpoint calculation into human-readable address
    mpAddress: function(){
    
      return Session.get("MPADDRESS");
    },

    meetingPlaces: function(){
      var LID = Router.current().params._link;
      console.log(MeetingPlaces.find({LID: LID}));
      return MeetingPlaces.find({LID: LID});
    },

  });

  Template.map.onRendered(function(){
    this.autorun(function () {
      GoogleMaps.ready('mainMap', function(map){
          var marker = new google.maps.Marker({
          position: map.options.center,
          map: map.instance
        });
      });
    });
  });

  Template.map.helpers({
    mainMapOptions: function(){
      if(GoogleMaps.loaded()){
        return {
          center: new google.maps.LatLng(Session.get("MAP_LAT"), Session.get("MAP_LON")),
          zoom: 8
        };
      }
    }

  });

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
   
   
  });
}

*/
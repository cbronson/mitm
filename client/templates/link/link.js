
if (Meteor.isClient) {
  
  Meteor.startup(function(){
    //init clipboard
    var clipboard = new Clipboard('.btn');
    clipboard.on('success', function(e) {
       Materialize.toast('Copied!', 4000);
      e.clearSelection();
    });

    clipboard.on('error', function(e) {
        Materialize.toast('Sorry, not supported :(', 4000);
    });
        //Convert midpoint to human address *SECOND
    convertCoordsToAddress = function(coords, google){

      //run geocoding function and return human readable address [string]
      var geocoder = new google.maps.Geocoder;
      geocoder.geocode({'location': coords}, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
          if (results[1]) {
             Session.set("MIDPOINT_ADDRESS", results[1].formatted_address);
          }else{
            //coords not found
            console.log("Coords not found");
          }
        }else{
          //geocoder failed, check status
          console.log("Geocoder failed!");
        }
      });
    };

    //Find valid meeting places at midpoint coords *SECOND
    getMeetingPlaces = function(coords, google){
      //run google places search and return list of places [object/array]
      var midPoint =  new google.maps.LatLng(coords.lat,coords.lng); 
      var service = new google.maps.places.PlacesService(GoogleMaps.maps.mainMap.instance);
                  
      var request = {
        location: midPoint,
        //radius: '5000',
        types: ['cafe', 'library', 'city_hall', 'courthouse', 'police', 'post_office', 'electronics_store', 'shopping_mall'],
        rankBy: google.maps.places.RankBy.DISTANCE
      };
     
      service.nearbySearch(request, callback);
      
      function callback(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          mpTrimmed = [];
          for(i = 0; i < 6; i++){
            mpTrimmed[i] = results[i];
          };
          Session.set("MEETING_PLACES", mpTrimmed);
        }
      }
    };

    //find the closest police station to the GPS coords
    //Sets Session.set("CLOSEST_POLICE");
    getClosestPoliceStation = function(coords, google){
      var midPoint =  new google.maps.LatLng(coords.lat,coords.lng); 
      var service = new google.maps.places.PlacesService(GoogleMaps.maps.mainMap.instance);
                  
      var request = {
        location: midPoint,
        //radius: '5000',
        types: ['police', 'fire_station'],
        rankBy: google.maps.places.RankBy.DISTANCE
      };

      service.nearbySearch(request, callback);
      
      function callback(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          Session.set("CLOSEST_POLICE", results[0]);
        }
      }

    };

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

    Session.set("MIDPOINT_ADDRESS", "Loading...");
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
          /*map: "#addressMap",
          mapOptions:{
            zoom: 3,
            disableDefaultUI: true,
            draggable: false,
          },*/
          location: new google.maps.LatLng(40.69847032728747, -73.9514422416687),
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
        
        if(e.target.inputAddress.value === ''){
          //empty address
          Materialize.toast('Please enter an address.', 4000);
        }else{
          //add address two to link
          var LID = Router.current().params._link;
          Meteor.call("addLinkAddress", LID, 2, Session.get("ADDRESSTWOCOORDS"),
            function(error, result){
              console.log(LID);
              console.log(error);
              Meteor.call("updateLinkStep", LID, 2);
          });
        }
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
  
    Session.set("MIDPOINT_COORDS", 0);

    var LID = Router.current().params._link;

    Meteor.call("calcMidPoint", LID, function(error,r){
        var midPointCoords = {"lat":r.lat, "lng":r.lng};
        Session.set("MIDPOINT_COORDS", midPointCoords);
        convertCoordsToAddress(midPointCoords, google);
        getClosestPoliceStation(midPointCoords, google);
        getMeetingPlaces(midPointCoords, google);
    });

  });

  Template.meetPoint.helpers({
    //Convert coordinates from midpoint calculation into human-readable address
    mpAddress: function(){
      return Session.get("MIDPOINT_ADDRESS");
    },
    mpCoords: function(){
      return Session.get("MIDPOINT_COORDS");
    },
    meetingPlaces: function(){
      return Session.get("MEETING_PLACES");;
    },
    policeStation: function(){
      return Session.get("CLOSEST_POLICE");
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





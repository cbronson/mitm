Meteor.methods({

	createNewLink: function(UID){
		var linkId = Links.insert(
		{	
			ownerUID: UID,
			step: 1,
			createdAt: Date.now()
		});
		console.log(linkId);
		return linkId;
	},

	updateLinkStep: function(LID, s){
		Links.update(LID, {
				$set: {step: s}
			});
	},

	addLinkAddress: function(LID, addressNum, addressCoords){
		if(addressNum == 1){
			Links.update(LID, {
				$set: {addressOneCoords: addressCoords}
			});
		}

		if(addressNum == 2){
			Links.update(LID, {
				$set: {addressTwoCoords: addressCoords}
			});
		}

		//midpoint address
		if(addressNum == 3){
			Links.update(LID, {
				$set: {midPointCoords: addressCoords}
			});
		}
	},

	addMeetingPlaces: function(LID, placeObject){
		console.log("MEETING PLACES ADDED");
		MeetingPlaces.insert({
			LID: LID,
			placeName: placeObject.name,
			placeVicinity: placeObject.vicinity,
			placeLat: placeObject.lat,
			placeLng: placeObject.lng
		})
	},

	calcMidPoint: function(LID){	
      var coordsOne = Links.findOne({_id: LID}).addressOneCoords;
      var coordsTwo = Links.findOne({_id: LID}).addressTwoCoords;

      // Converts from degrees to radians.
      radians = function(degrees) {
        return degrees * Math.PI / 180;
      };

      degrees = function(radians){
        return radians * 180 / Math.PI;
      };

      var coordsLat1 = radians(coordsOne.lat);
      var coordsLng1 = radians(coordsOne.lng);

      var coordsLat2 = radians(coordsTwo.lat);
      var coordsLng2 = radians(coordsTwo.lng);


      //find midpoint between coordinates
      var Bx = Math.cos(coordsLat2) * Math.cos(coordsLng2-coordsLng1);
      var By = Math.cos(coordsLat2) * Math.sin(coordsLng2-coordsLng1);
      var mpLat = Math.atan2(Math.sin(coordsLat1) + Math.sin(coordsLat2),
              Math.sqrt( (Math.cos(coordsLat1)+Bx)*(Math.cos(coordsLat1)+Bx) + By*By ) );
      var mpLng = coordsLng1 + Math.atan2(By, Math.cos(coordsLat1) + Bx);
      mpLng = (mpLng+3*Math.PI) % (2*Math.PI) - Math.PI; // normalise to -180..+180°
    
      var mp = {"lat": degrees(mpLat), "lng": degrees(mpLng)};
      return mp;
	},

});

Meteor.startup(function(){

});
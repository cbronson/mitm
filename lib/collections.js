
var Schemas = {};

Links = new Mongo.Collection('links');
MeetingPlaces = new Mongo.Collection('meetingPlaces');
/*
Schemas.Links = new SimpleSchema({
	addressOneCoords: {
		type: Object,
		blackbox: true,
		optional: true,
		validate: false,
	},
	addressTwoCoords: {
		type: Object,
		blackbox: true,
		optional: true,
		validate: false,
	},
	midPointCoords: {
		type: Object,
		blackbox: true,
		optional: true,
		validate: false,
	},
});

Links.attachSchema(Schemas.Links);*/
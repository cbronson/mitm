Meteor.publish('links', function(){
  //publish only link IDs 
  return Links.find({}, {fields: {'_id': 1, 'step': 1, 'ownerUID': 1}});
});

Meteor.publish('meetingPlaces', function(){
  return MeetingPlaces.find({});
});

/*
Meteor.publish('privateLists', function() {
  if (this.userId) {
    return Lists.find({userId: this.userId});
  } else {
    this.ready();
  }
});

Meteor.publish('todos', function(listId) {
  check(listId, String);

  return Todos.find({listId: listId});
});*/

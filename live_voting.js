var currentSessionSel = { currentSession: { $exists: true }};
function getCurrentSession() {
  var s = App.findOne(currentSessionSel);

  return s && s.currentSession;
}

if (Meteor.isClient) {
  Template.main.currentVotingSession = function() {
    return getCurrentSession();
  };

  Template.main.inSession = function() {
    return !!getCurrentSession();
  }

  Template.main.currentVotingSessionName = function() {
    return Template.main.currentVotingSession().title;
  }

  Template.main.events({
    'click #back': function() {
      App.remove(currentSessionSel, function(error) {
          console.log(error);
      });
    }
  });

  Template.selectSession.allSessions = function() {
    return VotingSessions.find();
  };

  Template.selectSession.events({
    'click .btn': function() {
      var currentSession = getCurrentSession();
      if (currentSession) {
          App.update(currentSession._id, { $set: {currentSession: this} });
      } else {
          App.insert({currentSession: this});
      }
    }
  });

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}

function currentVotingSession() {
    var u = Meteor.user();
    if (isTrainer(u)) {
        return VotingSessions.findOne({ trainer_id: u._id});
    } else {
        if (Meteor.loggingIn()) {
            return null;
        } else {
            return VotingSessions.findOne(u.profile.voting_session_id);
        }
    }
}

function traineesInSession(sid) {
    return Meteor.users.find({ 'profile.voting_session_id': sid });
}

Template.userPanel.isTrainer = Template.main.isTrainer = function() {
    return isTrainer(Meteor.user());
};

Template.main.events({
    'click #back': function() {
        var u = Meteor.user();
        if (isTrainer(u)) {
            var votingSession = currentVotingSession();
            console.log(votingSession);
            Meteor.call('endSession', votingSession._id);
        } else {
            Meteor.users.update(Meteor.userId(), { $unset: { 'profile.voting_session_id': null }});
        }
    }
});

Template.selectSessionTrainer.allSessions = function() {
    return VotingSessions.find();
};

Template.selectSessionTrainer.events({
    'click .btn': function() {
        Meteor.call('startSession', this._id);
    }
});


Template.selectSessionTrainee.availableSessions = function() {
    return VotingSessions.find({ trainer_id: { $exists: true } });
};

Template.selectSessionTrainee.events({
    'click .btn': function() {
        console.log('clicked');
        Meteor.users.update(Meteor.userId(), { $set: { 'profile.voting_session_id': this._id }});
    }
});

Template.sessionShowTrainee.trainer = function() {
    return Meteor.users.findOne(currentVotingSession().trainer_id);
};


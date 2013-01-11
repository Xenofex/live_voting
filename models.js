Questions = new Meteor.Collection('questions');
VotingSessions = new Meteor.Collection('voting_sessions');
App = new Meteor.Collection('app');

function _save(doc) {
    if (doc._id) {
        this.update(doc._id, doc);
    } else {
        this.insert(doc);
    }
}

function isTrainer(user) {
    if (user && user.profile) {
        return _.indexOf(user.profile.roles, 'trainer') > -1;
    } else {
        return false;
    }
}

_.each([Questions, VotingSessions, App], function(coll) {
    coll.save = _save;
});

Meteor.methods({
    startSession: function(sid) {
        var u = Meteor.user();
        if (!isTrainer(u)) {
            throw new Meteor.Error(401, 'You must be a trainer to start a session');
        }

        VotingSessions.update(sid, { $set: { trainer_id: u._id } });

    },
    endSession: function(sid) {
        Meteor.users.update({ 'profile.voting_session_id': sid},
            { $unset: { 'profile.voting_session_id': null }}, { multi: true });
        VotingSessions.update(sid, { $unset: { trainer_id: null } });
    }
});



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

function initializeVotes(question) {
    votes = [];
    for (var i = 0; i < question.answers.length; i++) {
        votes[i] = [];
    }

    Questions.update(question._id, { $set: { votes: votes }} );
}

function userHasVotedQuestion(user, question, idx) {
    var votes = question.votes;
    if (!votes) {
        initializeVotes(question);
    }

    return _.indexOf(votes[idx], user._id) >= 0;
}

function userVoteQuestion(user, question, idx) {
    var uid = user._id;
    var qid = question._id;

    var push = {};
    push['votes.' + idx] = uid;
    var pull = {};

    for (var i = 0; i < question.votes.length; i++) {
        if (i != idx) {
            pull['votes.' + i] = uid;
        }
    }

    Questions.update(qid, { $push: push, $pull: pull });
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
    },

    currentUserVote: function(q, idx) {
        if (!userHasVotedQuestion(Meteor.user(), q, idx)) {
            userVoteQuestion(Meteor.user(), q, idx);
        }
    }
});



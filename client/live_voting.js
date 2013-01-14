function currentVotingSession() {
    var u = Meteor.user();
    if (u) {
        if (isTrainer(u)) {
            return VotingSessions.findOne({ trainer_id: u._id});
        } else {
            if (Meteor.loggingIn()) {
                return null;
            } else {
                return VotingSessions.findOne(u.profile.voting_session_id);
            }
        }
    } else {
        return null;
    }
}

function currentQuestion() {
    var session = currentVotingSession();
    var qid = session.current_question_id;
    // Disabled. it's preinitialized now. The update command in the client has
    // to be async.
    // if (!qid) {
    //     qid = _.first(session.question_ids);
    //     VotingSessions.update(session._id, { $set: { current_question_id: qid }});
    // }

    return Questions.findOne(qid);
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


Template.currentQuestionTrainer.events({
    'click #prev': function() {
        var q = currentQuestion();
        var s = currentVotingSession();
        var i = _.indexOf(s.question_ids, s.current_question_id);

        if (i > 0) {
            VotingSessions.update(s._id, { $set: { current_question_id: s.question_ids[i-1] }});
        }

    },

    'click #next': function() {
        var q = currentQuestion();
        var s = currentVotingSession();
        var i = _.indexOf(s.question_ids, s.current_question_id);

        if (i < s.question_ids.length - 1) {
            VotingSessions.update(s._id, { $set: { current_question_id: s.question_ids[i+1] }});
        }
    }
});

Template.currentQuestionTrainee.events({
    'click #answers li': function() {
        var q = currentQuestion();
        var idx = _.indexOf(q.answers, this.toString());

        Meteor.call('currentUserVote', q, idx, function(error, result) {
            // console.log(currentQuestion().votes);
        });
    }
});

Template.questionShow.traineeClass = function() {
    return isTrainer(Meteor.user()) ? "trainer" : "trainee";
};

Template.questionShow.hasVoted = function(answer) {
    var q = currentQuestion();
    var idx = _.indexOf(q.answers, this.toString());

    return userHasVotedQuestion(Meteor.user(), q, idx) ? "selected" : "";
};

Template.questionShow.rendered = function() {
    var chart = d3.select('#questionBarChart');
    var chartWidth = parseFloat(chart.style('width')); 
    var Max = traineesInSession(currentVotingSession()._id).count();
    var data = _.map(currentQuestion().votes, function(e) {
        return e.length;
    });
    var marginTop = 30,
        marginBottom = 30,
        gap = 10;
    var height =  (300 - marginTop - marginBottom + gap) / data.length - gap;
    chart.selectAll('rect').data(data).enter().append("rect")
        .attr('height', height)
        .attr('y', function(d, i) { 
            return marginTop + i * (height + gap); 
        })
        .attr('x', 0)
        .attr('width', function(d) { 
            return d / Max * chartWidth || 0; 
        });

   chart.selectAll("text")
        .data(data)
        .enter().append("text")
        .attr("x", function(d) {
            return d / Max * chartWidth || 0; 
        })
        .attr("y", function(d, i) {
            return marginTop + i * (height + gap); 
        })
        .attr("dx", -8) // padding-right
        .attr("dy", "2em") // vertical-align: middle
        .attr("text-anchor", "end") // text-align: right
        .text(String);

};

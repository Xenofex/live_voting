function seedDB() {
    Accounts.createUser({ 
        username: 'eli', email: 'eli@ekohe.com', 
        password: 'eli2000', 
        profile: {
            name: 'Eli Wang',
            roles: ['admin', 'trainer']
        }
    });
    Accounts.createUser({ 
        username: 'maxime', email: 'maxime@ekohe.com', 
        password: 'maxime2000',
        profile: {
            name: 'Maxime Guilbot',
            roles: ['admin', 'trainer']
        }
    });

    var i, votingSessions = [];
    for (i = 0; i < 2; i++ ) {
        votingSessions[i] = { title: 'Session ' + (i+1), question_ids: [] };
    }
    console.log('votingSessions.count: ' + votingSessions.length);

    for (i = 1; i <= 16; i++ ) {
        var id = Questions.insert({ question: 'Question ' + i, 
            answers: ['Q' + i + ' Answer 1',
            'Q' + i + ' Answer 2',
            'Q' + i + ' Answer 3',
            'Q' + i + ' Answer 4' ]});
        var j = Math.floor( i / 4 );
        if (votingSessions[j]) {
            votingSessions[j].question_ids.push(id);
        }
    }

    console.log('votingSessions.count: ' + votingSessions.length);

    _.each(votingSessions, function(s) {
        var id = VotingSessions.insert(s);
        console.log(' VotingSession inserted: ' + id);
    });

    for (i = 1; i <= 30; i++) {
        Accounts.createUser({
            username: 'trainee_' + i, email: 'trainee' + i + '@ekohe.com', 
            password: 'trainee2000', 
            profile: {
                name: 'Trainee No ' + i
            }
        });
    }

    console.log(' * DB seeded');
}

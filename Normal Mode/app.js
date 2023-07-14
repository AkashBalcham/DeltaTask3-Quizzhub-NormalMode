const express = require('express');
//const connect = require('http2');
const mysql = require('mysql2');
const app = express();

let msg = '';
let user = '';
let user_id;

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '*1Ndr0med1_'
});

connection.connect((err) => {
    if(err) {
        console.log(err);
        console.log('Error with db connection');
    } else {
        console.log('Conneted to db successfully');
        connection.query('USE delta', (err, result) => {
            if(err) {
                console.log(err);
            } else {
                app.listen(3000);
            }
        })
    }
})

app.set('view engine', 'ejs');
app.use(express.static('public/Icons'));
app.use(express.urlencoded({extended: true}));


app.get('/', (req, res) => {
    //console.log(req.query.key1);
    res.render('first', {page: "Intro"});
})

app.get('/sign-up', (req, res) => {
    res.render('signup', {page: "Sign-Up"});
})

app.post('/sign-up', (req, res) => {
    let data = req.body;
    //console.log(data);
    let userName = data.username;
    let pwd = data.password;

    const addUser = 'INSERT INTO users (username, pwd) VALUES (?, ?)';
    connection.query(addUser, [userName, pwd], (err, result) => {
        if(err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    })
})

app.get('/login', (req, res) => {
    res.render('login', {page: "Login", msg: req.query.msg||''});
})


app.post('/login', (req, res) => {
    let data = req.body;
    let cUser = data.username;
    let pwd = data.password;
    let msg = '';
    let user_id;

    /*
    connection.query("SELECT * FROM users", (err, result) => {
        let users = result;
        let userFound = false;
        let quizLst = []
        for(let i=0; i<users.length; i++) {
            if(users[i].username === user) {
                userFound = true;
                if(users[i].pwd === pwd) {
                    msg = 'Login successful';
                    connection.query('SELECT * FROM quiz WHERE author = ?', [user], (err, result) => {
                        let quizLst = result;
                        return res.render('home', { page: "Home", user, quizLst })

                        
                    })
                    
                } else {
                    msg = 'Wrong username or password'
                }
                break;
            }
        }

        if(!userFound) {
            msg = 'User does not exist'
        }
        //console.log(encodeURIComponent(msg));
        //console.log(data, { message: msg });
        res.redirect(`/login?msg=${encodeURIComponent(msg)}`);
        //console.log(msg);
        //res.render('login', { msg });
    })
    */
    connection.query('SELECT * FROM users WHERE username = ?', [cUser], (err, result) => {
        if(err) {
            console.log(err);
            res.redirect('/login');
            return;
        }
        if(result.length === 0) {
            msg = 'User does not exist';
            //console.log(msg, 11);
            res.redirect('/login?msg=' + encodeURIComponent('User does not exist'));
            return;
            //return res.render('/login', {page: "Login", msg})
        }
        const userRecord = result[0];
        user_id = userRecord.user_id;
        if(userRecord.pwd === pwd) {
            user = data.username;
            
            // user = req.session.user.usernam;
            // console.log(req.session.user);
            connection.query('SELECT * FROM quiz WHERE author = ?', [user], (err, result) => {
                if(err) {
                    console.log(err);
                    res.redirect('/login');
                    return;
                }
                const quizLst = result;
                connection.query('SELECT * FROM users WHERE username = ?', [user], (err, result) => {
                    if(err) {
                        console.log(err);
                    } else {
                        user_id = result[0].user_id;
                        connection.query('select * from scores where s_id in (SELECT  max(s_id) from scores group by quiz_id) AND user_id = ?', [user_id], (err, result) => {
                            if(err) {
                                console.log(err);
                            } else {
                                const takenQuizLst = result || [];
                                res.render('home', { page: "Home", user, quizLst, takenQuizLst });
                            }
                        })
                    }
                })
                // res.render('home', { page: "Home", user, quizLst, takenQuizLst});
            });
            //req.session.user = user;
            //res.redirect('/home');


        } else {
            msg = 'Wrong username or password'
            res.redirect('/login?msg=' + encodeURIComponent('Wrong username or password'));
            //return res.render('/login', {page: "Login", msg});
        }
    });
});



app.get('/home', (req, res) => {
    let user_id;
    /*
    let data = req.query;
    let user = data.username;
    let pwd = data.password;

    connection.query("SELECT * FROM users", (err, result) => {
        let users = result;
        let userFound = false;
        let quizLst = [];
        for(let i=0; i<users.length; i++) {
            if(users[i].username === user) {
                userFound = true;
                if(users[i].pwd === pwd) {
                    msg = 'Login successful';
                    console.log(0);
                    connection.query('SELECT * FROM quiz WHERE author = ?', [user], (err, result) => {
                        console.log(1)
                        quizLst = result;
                        console.log(quizLst);
                        res.render('home', { page: "Home", user, quizLst })
                        
                    })
                } else {
                    msg = 'Wrong username or password'
                    break;
                }
                
            }
        }

        // 
        //console.log(encodeURIComponent(msg));
        //console.log(data, { message: msg });
        res.redirect(`/login?msg=${encodeURIComponent(msg)}`);
        //console.log(msg);
        //res.render('login', { msg });
    })
    */
    if(!user) {
        res.redirect('/login');
        return;
    }
    // user = req.session.user;

    connection.query('SELECT * FROM quiz WHERE author = ?', [user], (err, result) => {
        if(err) {
            console.log(err);
            res.redirect('/login');
            return;
        } else {
            const quizLst = result || [];
            connection.query('SELECT * FROM users WHERE username = ?', [user], (err, result) => {
                if(err) {
                    console.log(err);
                } else {
                    user_id = result[0].user_id;
                    connection.query('select * from scores where s_id in (SELECT  max(s_id) from scores group by quiz_id) AND user_id = ?', [user_id], (err, result) => {
                        if(err) {
                            console.log(err);
                        } else {
                            const takenQuizLst = result || [];
                            res.render('home', { page: "Home", user, quizLst, takenQuizLst });
                        }
                    })
                }
            })
            //console.log(quizLst);
            
        }
        
    })
//SELECT * FROM quiz WHERE author = ?

})


//})





// app.get('/home', async (req, res) => {
//     try {
//       const user = req.session.user;
//       if (!user) {
//         res.redirect('/login');
//         return;
//       }
  
//       const quizLst = await new Promise((resolve, reject) => {
//         connection.query('SELECT * FROM quiz WHERE author = ?', [user], (err, result) => {
//           if (err) {
//             reject(err);
//           } else {
//             resolve(result);
//           }
//         });
//       });
  
//       const takenQuizLst = await new Promise((resolve, reject) => {
//         connection.query('SELECT quiz.quiz_name, scores.score, scores.max_questions FROM scores JOIN users ON scores.user_id = users.user_id JOIN quiz ON scores.quiz_id = quiz.quiz_id WHERE users.username = ?', [user], (err, result) => {
//           if (err) {
//             reject(err);
//           } else {
//             resolve(result);
//           }
//         });
//       });
  
//       res.render('home', { page: "Home", user, quizLst, takenQuizLst });
//     } catch (err) {
//       console.error(err);
//       res.redirect('/login');
//     }
//   });
  
  



app.get('/create', (req, res) => {
    res.render('create', { page: 'Create quiz', user });
})

app.post('/create', (req, res) => {
    let data = req.body;
    let name = data.quizName;
    //let author = data.username;
    author = user;
    let userID;
    connection.query('SELECT user_id as id FROM users WHERE username = ?', [author], (err, result) => {
        if(err) {
            console.log(err);
        } else {
            userID = result[0]['id'];
            const insert = 'INSERT INTO quiz (quiz_name, author, user_id) VALUES (?, ?, ?)';
            connection.query(insert, [name, author, userID], (err, result) => {
                if(err) {
                    console.log(err);
                } else {
                    // res.render('questions', { page: "create" });
                    res.redirect('/questions');
                }
            })
        }
    })

    // console.log(name, author, userID);
    
})


app.get('/questions', (req, res) => {
    ques = 'SELECT * FROM questions WHERE questions.quiz_id = (SELECT MAX(quiz_id) FROM quiz)';
    let quesList;
    // console.log(quesList);
    connection.query(ques, (err, result) => {
        if(err) {
            console.log(err);
        } else {
            quesList = result;
            res.render('questions', { quesList , page: "questions", user});
        }
    })

})


app.get('/create-question', (req, res) => {
    res.render('create-question', { page: "add-question", user });
})

app.post('/create-question', (req, res) => {
    let info = req.body;
    let ques = info.question;
    let ans = info.answer;

    let quiz_id;
    connection.query('SELECT MAX(quiz_id) AS i FROM quiz', (err, result) => {
        if(err) {
            console.log(err);
        } else {
            quiz_id = result[0].i;
            const addQ = 'INSERT INTO questions (question, answer, quiz_id) VALUES (?, ?, ?)';
            connection.query(addQ, [ques,ans, quiz_id], (err, result) => {
                if(err) {
                    console.log(err);
                } else {
                    res.redirect('/questions');
                }
            })
        }
        
    })
})


app.delete('/questions/:id', (req, res) => {
    const num = req.params.id;
    const delQ = 'DELETE FROM questions WHERE question_id = ?';
    connection.query(delQ, [num], (err, result) => {
        if(err) {
            console.log(err);
        } else {
            res.json({ redirect: '/questions'});
        }
    })
})

app.delete('/quiz/:quizId', (req, res) => {
    const qId = req.params.quizId;
    const delQ = 'DELETE FROM quiz WHERE quiz_id = ?';
    connection.query(delQ, [qId], (err, result) => {
        if(err) {
            console.log(err);
        } else {
            res.json({redirect: '/home'});
        }
    })
})

app.get('/edit-question/:id', (req, res) => {
    let id = req.params.id;
    let exQuestion;
    let exAnswer;
    connection.query('SELECT * FROM questions WHERE question_id = ?', [id], (err, result) => {
        if(err) {
            console.log(err);
        } else {
            if(result.length > 0) {
                exQuestion = result[0].question;
                exAnswer = result[0].answer;
            }
            res.render('edit-question', { page: "Edit", id, user, exQuestion, exAnswer }); 
        }
    })
})


app.post('/edit-question/:id', (req, res) => {
    let qID = req.params.id;
    let que = req.body['new-question'];
    let ans = req.body['new-answer'];
    const update = 'UPDATE questions SET question = ?, answer = ? WHERE question_id = ?';
    connection.query(update, [que, ans, qID], (err, result) => {
        if(err) {
            console.log(err);
        } else {
            res.redirect('/questions');
            // res.json({ redirect: '/questions' });
        }

    })
})


app.get('/search', (req, res) => {
    const targetUser = req.query.searchUser || '';
    let userLst = [];
    connection.query(`SELECT * FROM users WHERE username like ? AND username <> ?`, [`${targetUser}%`, user], (err, result) => {
        if(err) {
            console.log(err);
        } else {
            userLst = result;
            res.render('search', {page: "Search", user, userLst})
        }
    })
})

app.get('/users/:user', (req, res) => {
    let sUser = req.params.user;
    sQuizLst = [];
    connection.query('SELECT * FROM quiz WHERE author = ?', [sUser], (err, result) => {
        if(err) {
            console.log(err);
        } else {
            sQuizLst = result;
            res.render('user-profile', { page: "UserProfile", user, sUser, sQuizLst});
        }
    })
})

app.get('/edit-quiz/:id', (req, res) => {
    const qId = req.params.id;
    const sel = 'SELECT * FROM questions WHERE quiz_id = ?';
    connection.query(sel, [qId], (err, result) => {
        if(err) {
            console.log(err);
        } else {
            quesList = result;
            res.render('edit-quiz', { page: "questions", user, quesList})
        }
    })

})

// app.delete('/edit-quiz/:id')

/*
app.get('/questions', (req, res) => {
    ques = 'SELECT * FROM questions WHERE questions.quiz_id = (SELECT MAX(quiz_id) FROM quiz)';
    let quesList;
    // console.log(quesList);
    connection.query(ques, (err, result) => {
        if(err) {
            console.log(err);
        } else {
            quesList = result;
            res.render('questions', { quesList , page: "questions", user});
        }
    })

})
*/

app.get('/quizzes/:id', (req, res) => {
    let quizId = req.params.id;
    let qLst = [];
    const quer = 'SELECT * FROM questions WHERE quiz_id = ?';
    connection.query(quer, [quizId], (err, result) => {
        if(err) {
            console.log(err);
        } else {
            qLst = result;
            res.render('take-quiz', {page: "Quiz", user, qLst});
        }
    })
})

app.post('/quiz-score', (req, res) => {
    let que = req.body;
    let quizId;
    let u_id;
    let quizName;
    connection.query('SELECT * FROM users WHERE username = ?', [user], (err, result) => {
        if(err) {
            console.log(err);
        } else {
            u_id = result[0]['user_id'];
            
            for (const reply in req.body) {
                if(reply.startsWith('answer_')) {
                    const [_, question_id, quiz_id] = reply.split('_');
                    quizId = quiz_id;
                    const answer = req.body[reply];
                    const quer = 'INSERT INTO user_answers (answer, user_id, quiz_id, question_id) VALUES (?, ?, ?, ?)';
                    connection.query(quer, [answer, u_id, quiz_id, question_id], (err, result) => {
                        if(err) {
                            console.log(err);
                        }
                    })
                }
            }
            // res.redirect(`/scores?quiz_id=${quizId}&question_id=${question_id}&user_id=${u_id}`);
            res.redirect(`/scores?quiz_id=${quizId}&user_id=${u_id}`);
        }
    })
})

app.get('/scores', (req, res) => {
    let quiz_id = req.query.quiz_id;
    let quiz_name;
    let user_id = req.query.user_id;
    // connection
    connection.query('SELECT * FROM quiz WHERE quiz_id = ?', [quiz_id], (err, result) => {
        if(err) {
            console.log(err);
        } else {
            quiz_name = result[0]['quiz_name'];
            connection.query('SELECT * FROM user_answers u, questions q WHERE u.answer = q.answer AND u.question_id = q.question_id', (err, result) => {        //Include AS correct when i get the number of correct answers
                let corr = 0, maxQ = 0;
                if(err) {   
                    console.log(err);
                } else {
                    // console.log(result, 'corrects');
                    //corr = result[0].correct;
                    corr = result.length;
                    connection.query('SELECT * FROM questions, quiz WHERE questions.quiz_id = quiz.quiz_id AND questions.quiz_id = ?', [quiz_id], (err, result) => {
                        if(err) {
                            console.log(err);
                        } else {
                            
                            maxQ = result.length;
                            // console.log(maxQ, 'maxi');
                            connection.query('INSERT INTO scores (user_id, quiz_id, quiz_name, score, max_questions) VALUES (?, ?, ?, ?, ?)', [user_id, quiz_id, quiz_name, corr, maxQ], (err, result) => {
                                if(err) {
                                    console.log(err);
                                } else {
                                    connection.query('DELETE FROM user_answers', (err, result) => {
                                        if(err) {
                                            console.log(err);
                                        } else {
                                            res.render('score', {page: "result", user, corr, maxQ, quiz_name});
                                        }
                                    })
                                }
                            })
                        }
                    });
                }
            });
        }
    })
    
    
})


app.get('/logout', (req, res) => {
    res.redirect('/login');
})




//Creating the quiz table
//CREATE TABLE IF NOT EXISTS quiz(quiz_id INT PRIMARY KEY AUTO_INCREMENT, quiz_name VARCHAR(50) NOT NULL, author VARCHAR(200) NOT NULL, user_id INT, FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE);

//Creating the questions table
//CREATE TABLE IF NOT EXISTS questions (question_id INT PRIMARY KEY AUTO_INCREMENT, question VARCHAR(1000) NOT NULL, answer VARCHAR(500) NOT NULL, quiz_id INT, FOREIGN KEY (quiz_id) REFERENCES quiz(quiz_id) ON DELETE CASCADE ON UPDATE CASCADE);
//CREATE INDEX ans ON questions(answer)

//Creating scores table
// CREATE TABLE IF NOT EXISTS scores (s_id INT PRIMARY KEY AUTO_INCREMENT, user_id INT, quiz_id INT, quiz_name VARCHAR(200), score INT, max_questions INT, FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE, FOREIGN KEY(quiz_id) REFERENCES quiz(quiz_id) ON UPDATE CASCADE ON DELETE CASCADE);

//Creating the user_answers table
// CREATE TABLE IF NOT EXISTS user_answers (a_id INT PRIMARY KEY AUTO_INCREMENT, answer VARCHAR(200), user_id INT, quiz_id INT, question_id INT, FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE, FOREIGN KEY(quiz_id) REFERENCES quiz(quiz_id) ON DELETE CASCADE ON UPDATE CASCADE, FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE ON UPDATE CASCADE);
// CREATE INDEX u_ans ON user_answers(answer)
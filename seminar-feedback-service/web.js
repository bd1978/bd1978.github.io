// 모듈을 추출합니다.
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var logfmt = require('logfmt');
var mysql = require('mysql');
var methodOverride = require('method-override');

//var fs = require('fs');
//var multipart = require('connect-multiparty');


// 웹 서버를 생성합니다.
var app = express();
app.use(express.static('public'));
app.use(bodyParser());
app.use(cors());
app.use(logfmt.requestLogger());
app.use(methodOverride('_method'));
//var multipartMiddleware = multipart({
//	uploadDir : './tmp'
//});

var router = express.Router();

var db_config = {
	    host: 'us-cdbr-iron-east-01.cleardb.net',
	    user: 'b775a9e499f94a',
	    password: 'db42d6c4',
	    database: 'heroku_7bef066d296683c'
};

var connection;

function handleDisconnect() {
    console.log('1. connecting to db:');
    connection = mysql.createConnection(db_config); // Recreate the connection, since
													// the old one cannot be reused.

    connection.connect(function(err) {              	// The server is either down
        if (err) {                                     // or restarting (takes a while sometimes).
            console.log('2. error when connecting to db:', err);
            setTimeout(handleDisconnect, 1000); // We introduce a delay before attempting to reconnect,
        }                                     	// to avoid a hot loop, and to allow our node script to
    });                                     	// process asynchronous requests in the meantime.
    											// If you're also serving http, display a 503 error.
    connection.on('error', function(err) {
        console.log('3. db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') { 	// Connection to the MySQL server is usually
            handleDisconnect();                      	// lost due to either server restart, or a
        } else {                                      	// connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
        }
    });
}

handleDisconnect();

function addUser(name, password, response, callback, userId) {
	console.log('### Add new user : ' + name);
	var query = 'INSERT INTO user (`name`, `password`) VALUES ("' + name + '", "' + password + '")';
	if(!isNaN(userId) && userId > 0) {
		query = 'INSERT INTO user (`id`, `name`, `password`) VALUES ('+ userId + ', "' + name + '", "' + password + '")';
	}
	
	processQuery(query, response, callback);
}

function checkAdmin(request, response, callback) {
	var adminName = request.param('adminName');
	var adminPassword = request.param('adminPassword');
	console.log('### Check admin : ' + adminName);

	checkUser(adminName, adminPassword, true, response, callback);
}

function checkUser(name, password, adminCheck, response, callback) {
	console.log('### Check user : ' + name);
	var id = -1;
	if(name && password) {
		var query = 'SELECT * from user where  name = "' + name + '"';
		processQuery(query, response, function(rows) {
			console.log(rows);
			if(rows && rows.length > 0) {
				for(var i=0; i<rows.length; i++) {
					var row = rows[i];
					if(password == row.password) {
						if(!adminCheck || row.admin) {
							id = row.id;
						}
						break;
					}
				}
				if(id > 0) {
					console.log('### Valid user ID : ' + id);
				} else {
					console.log('### InValid user credential : ' + name);
				}
				callback(id);
			} else {
				var id = 0;
				console.log('### Name "' + name + '" is not exist!');
				callback(id);
			}
		});
	} else {
		callback(id);
	}
}

function sendError(response, message) {
	console.log(message);
    response.send({
        error: message
    });
}

function processQuery(query, response, successCallback) {
	console.log('### Query : ' + query);
	connection.query(query, function(err, rows, fields) {
		if(err) {
			sendError(response, err);
		} else {
			successCallback(rows);
		}
	});
}

function addSeminar(request, response, writerId, seminarId) {
	console.log('### Add Seminar ###');
	var date = Number(request.param('date'));
	var title = request.param('title');
	var contents = request.param('contents');
	var link = request.param('link');
	
	if(!title) {
		sendError(response, 'Please input title!');
	} else {
		if(!date) {
			date = new Date().getTime();
		}
		
	    var query = 'INSERT INTO seminar (`writer`, `date`, `title`, `contents`, `link`) '
	    	+ 'VALUES( ' + writerId + ', ' + date + ', "' + title + '", "' + contents + '", "' + link + '")';
	    if(!isNaN(seminarId) && seminarId > 0) {
		    query = 'INSERT INTO seminar (`id`, `writer`, `date`, `title`, `contents`, `link`) '
		    	+ 'VALUES('+ seminarId + ', ' + writerId + ', ' + date + ', "' + title + '", "' + contents + '", "' + link + '")';
	    }

		processQuery(query, response, function(rows) {
			var id = rows.insertId;
			if(id > 0) {
    	        response.set({ 'content-type': 'application/json; charset=UTF-8' });
    	        response.send({
    	        	message: 'Seminar added',
    	        	seminarId: id
    	        });
			} else {
				sendError(response, 'Seminar add failed!');
			}
		});
	}
}

function addFeedback(request, response, seminarId, writerId, feedbackId) {
	console.log('### Add Feedback ###');
	var date = Number(request.param('date'));
	var score1 = Number(request.param('score1'));
	var score2 = Number(request.param('score2'));
	var score3 = Number(request.param('score3'));
	var score4 = Number(request.param('score4'));
	var score5 = Number(request.param('score5'));
	var feedback = request.param('feedback');
	
	if(isNaN(score1) || isNaN(score2) || isNaN(score3) || isNaN(score4) || isNaN(score5)) {
		sendError(response, 'Please input all scores!');
	} else {
		if(!date) {
			date = new Date().getTime();
		}

		var sum = score1 + score2 + score3 + score4 + score5;

	    var query = 'INSERT INTO feedback (`seminar_id`, `date`, `writer`, `score1`, `score2`, `score3`,`score4`,`score5`,`sum`,`feedback`) '
	    	+ 'SELECT ' + seminarId + ', ' + date + ', ' + writerId + ', ' + score1 + ', ' + score2 + ', ' + score3 + ', ' + score4 + ', ' + score5 + ', ' + sum + ', "' + feedback + '" '
	    	+ 'from DUAL WHERE NOT EXISTS (SELECT id from feedback where seminar_id=' + seminarId + ' and writer=' + writerId + ')';
	    if(!isNaN(feedbackId) && feedbackId > 0) {
		    query = 'INSERT INTO feedback (`id`, `seminar_id`, `date`, `writer`, `score1`, `score2`, `score3`,`score4`,`score5`,`sum`,`feedback`) '
		    	+ 'SELECT ' + feedbackId + ', ' + seminarId + ', ' + date + ', ' + writerId + ', ' + score1 + ', ' + score2 + ', ' + score3 + ', ' + score4 + ', ' + score5 + ', ' + sum + ', "' + feedback + '" '
		    	+ 'from DUAL WHERE NOT EXISTS (SELECT id from feedback where seminar_id=' + seminarId + ' and writer=' + writerId + ')';
	    }

		processQuery(query, response, function(rows) {
			var id = rows.insertId;
			response.set({ 'content-type': 'application/json; charset=UTF-8' });
			if(id > 0) {
    	        response.send({
    	        	message: 'Feedback added',
    	        	feedbackId: id
    	        });
			} else {
    	        response.send({
    	        	message: 'You can not add one more feedback',
    	        	feedbackId: -1
    	        });
			}
		});
	}
}

router.get('/admin/exist', function (request, response) {
	checkAdmin(request, response, function(adminId) {
		if(adminId > 0) {
			response.set({ 'content-type': 'application/json; charset=UTF-8' });
			response.send({
				'exist': true,
		        'id': adminId
		    });
		} else {
			response.statusCode = 404;
			sendError(response, 'Not found!');
		}
	});
});

router.get('/users/names', function (request, response) {
	var query = 'SELECT name from user';
	
	processQuery(query, response, function(rows) {
		response.set({ 'content-type': 'application/json; charset=UTF-8' });
		response.send(rows);
	});
});

router.get('/users', function (request, response) {
	checkAdmin(request, response, function(adminId) {
		if(adminId > 0) {
			var query = 'SELECT id, name, admin from user';
			
			processQuery(query, response, function(rows) {
				response.set({ 'content-type': 'application/json; charset=UTF-8' });
				response.send(rows);
			});
		} else {
			response.statusCode = 401;
			sendError(response, 'Not authorized!');
		}
	});
});

router.get('/users/:id', function (request, response) {
	checkAdmin(request, response, function(adminId) {
		if(adminId > 0) {
		    var id = Number(request.param('id'));
		
		    if (isNaN(id)) {
		        sendError(response, 'Invalid id!');
		    } else {
				var query = 'SELECT id, name, admin from user where id = ' + id;
				
				processQuery(query, response, function(rows) {
					if(rows && rows.length > 0) {
						response.set({ 'content-type': 'application/json; charset=UTF-8' });
						response.send(rows[0]);
					} else {
						sendError(response, 'ID : ' + id + ' does not exist!');
					}
				});
		    }
		} else {
			response.statusCode = 401;
			sendError(response, 'Not authorized!');
		}
	});
});

router.post('/users', function (request, response) {
	checkAdmin(request, response, function(adminId) {
		if(adminId > 0) {
			var name = request.param('name');
			var password = request.param('password');
			var userId = Number(request.param('userId'));
		
			if(name && password) {
				addUser(name, password, response, function(rows) {
					var id = rows.insertId;
					if(id > 0) {
				        response.set({ 'content-type': 'application/json; charset=UTF-8' });
						response.send({
					        'id': id,
					        'name': name
					    });
					}			
				}, userId);
			} else {
				sendError(response, 'Please input name and password!');
			}
		} else {
			response.statusCode = 401;
			sendError(response, 'Not authorized!');
		}
	});
});

router.delete('/users/:id', function (request, response) {
	checkAdmin(request, response, function(adminId) {
		if(adminId > 0) {
		    var id = Number(request.param('id'));
		
		    if (isNaN(id)) {
		        sendError(response, 'Invalid id!');
		    } else {
				var query = 'DELETE from user where id = ' + id;
				
				processQuery(query, response, function(rows) {
					if(Number(rows.affectedRows) > 0) {
						response.set({ 'content-type': 'application/json; charset=UTF-8' });
						response.send({
							message: 'user deleted',
							userId: id
						});
					} else {
						sendError(response, 'ID : ' + id + ' does not exist!');
					}
				});
		    }
		} else {
			response.statusCode = 401;
			sendError(response, 'Not authorized!');
		}
	});
});

router.get('/seminars', function (request, response) {
	var startTimestamp = Number(request.param('month'));
	var name = request.param('name');
	
	var dateQuery = '';

	if(!isNaN(startTimestamp)) {
		var date = new Date(startTimestamp);
		var nextMonth = date.getMonth() + 1;
		date.setMonth(nextMonth);
		var endTimestamp = date.getTime() - 1000;
		
		dateQuery = 's.date > ' + startTimestamp + ' and s.date < ' + endTimestamp;
	}
	var query = 'SELECT s.id, s.writer, u.name, s.date, s.title, AVG(f.sum) as score FROM seminar as s'
		+ ' INNER JOIN (select id, name from user';
	if(name && name.length > 0) {
		query += ' where name = "' + name + '"';
	}
	query += ') as u on u.id = s.writer LEFT OUTER JOIN feedback as f on s.id = f.seminar_id';
	if(startTimestamp) {
		query += ' where ' + dateQuery;
	}
	query += ' group by s.id order by s.date DESC';
	
	processQuery(query, response, function(rows) {
        response.set({ 'content-type': 'application/json; charset=UTF-8' });
        response.send(rows);
	});
});

router.get('/seminars/:id', function (request, response) {
    var id = Number(request.param('id'));

    if (isNaN(id)) {
        sendError(response, 'Invalid id!');
    } else {
		var query = 'SELECT s.id, s.writer, u.name, s.date, s.title, s.contents, s.link, AVG(f.sum) as score from seminar as s' 
			+ ' INNER JOIN (select id, name from user) as u on u.id = s.writer' 
			+ ' LEFT OUTER JOIN feedback as f on s.id = f.seminar_id'  
			+ ' where s.id = ' + id + ' group by s.id';

		processQuery(query, response, function(rows) {
	        if(rows && rows.length > 0) {
	        	response.set({ 'content-type': 'application/json; charset=UTF-8' });
	        	response.send(rows[0]);
	        } else {
	        	sendError(response, 'Not exist seminar!');
	        }
		});
    }
});

router.post('/seminars', function (request, response) {
	var name = request.param('name');
	var password = request.param('password');
	var seminarId = Number(request.param('seminarId'));
	
	checkUser(name, password, false, response, function(id) {
		if(id == 0) {
			addUser(name, password, response, function(rows) {
				id = rows.insertId;
				addSeminar(request, response, id, seminarId);
			});
		} else if(id > 0) {
			addSeminar(request, response, id, seminarId);
		} else {
			sendError(response, 'Invalid user or password');
		}
	});
});

router.put('/seminars/:id', function (request, response) {
	var name = request.param('name');
	var password = request.param('password');

	checkUser(name, password, false, response, function(userId) {
		if(userId > 0) {
			var id = Number(request.param('id'));
			var date = Number(request.param('date'));
			var title = request.param('title');
			var contents = request.param('contents');
			var link = request.param('link');
			
		    if (isNaN(id)) {
		        sendError(response, 'Invalid id!');
		    } else if(!title) {
				sendError(response, 'Please input title!');
			} else {
				if(!date) {
					date = new Date().getTime();
				}

				var query = 'UPDATE seminar SET `date`=' + date + ', `title`="' + title + '", ' 
					+ '`contents`="' + contents + '", `link`="' + link + '" WHERE id = ' + id;
				
				processQuery(query, response, function(rows) {
					if(rows && Number(rows.affectedRows) > 0) {
						response.set({ 'content-type': 'application/json; charset=UTF-8' });
						response.send({
							message: 'Seminar updated',
							seminarId: id
						});
					} else {
						
					}
				});
			}
		} else {
			sendError(response, 'Invalid user or password');
		}
	});
});

router.delete('/seminars/:id', function (request, response) {
	var name = request.param('name');
	var password = request.param('password');

	checkUser(name, password, false, response, function(userId) {
		if(userId > 0) {
		    var id = Number(request.param('id'));
			
		    if (isNaN(id)) {
		        sendError(response, 'Invalid id!');
		    } else {
			    var query = 'DELETE seminar, feedback from seminar LEFT OUTER JOIN feedback ON seminar.id = feedback.seminar_id'
			    	+ ' where seminar.id = ' + id + ' and (seminar.writer = ' + userId + ' or ' + userId + ' = 1)';
			    
				processQuery(query, response, function(rows) {
					console.log(rows);
					if(Number(rows.affectedRows) > 0) {
						response.set({ 'content-type': 'application/json; charset=UTF-8' });
						response.send({
							message: 'Seminar deleted',
							seminarId: id
						});
					} else {
						response.statusCode = 401;
						sendError(response, 'Writer can delete seminar only!');
					}
				});
		    }
		} else {
			sendError(response, 'Invalid user or password');
		}
	});
});

router.get('/feedbacks', function (request, response) {
    var seminarId = Number(request.param('seminarId'));
    if (isNaN(seminarId)) {
        sendError(response, 'Invalid seminarId!');
    } else {
    	var query = 'SELECT id, seminar_id, date, score1, score2, score3, score4, score5, sum, feedback' 
    		+ ' from feedback where seminar_id = ' + seminarId;
    	
		processQuery(query, response, function(rows) {
	        response.set({ 'content-type': 'application/json; charset=UTF-8' });
	        response.send(rows);
		});
    }
});

router.post('/feedbacks', function (request, response) {
    var seminarId = Number(request.param('seminarId'));
    if (isNaN(seminarId) && seminarId < 0) {
        sendError(response, 'Invalid seminarId!');
    } else {
    	var name = request.param('name');
    	var password = request.param('password');
    	var feedbackId = Number(request.param('feedbackId'));
    	
    	checkUser(name, password, false, response, function(id) {
    		if(id == 0) {
    			addUser(name, password, response, function(rows) {
    				var id = rows.insertId;
    				addFeedback(request, response, seminarId, id, feedbackId);
    			});
    		} else if(id > 0) {
				addFeedback(request, response, seminarId, id, feedbackId);
    		} else {
    			sendError(response, 'Invalid user or password');
    		}
    	});
    }
});

router.delete('/feedbacks/:id', function (request, response) {
	checkAdmin(request, response, function(adminId) {
		if(adminId > 0) {
		    var id = Number(request.param('id'));
		
		    if (isNaN(id)) {
		        sendError(response, 'Invalid id!');
		    } else {
				var query = 'delete from feedback where id = ' + id;
				
				processQuery(query, response, function(rows) {
			        response.set({ 'content-type': 'application/json; charset=UTF-8' });
			        response.send({
			        	message: 'feedback deleted',
			        	feedbackId: id
			        });
				});
		    }
		} else {
			response.statusCode = 401;
			sendError(response, 'Not authorized!');
		}
	});
	
});

/*
router.post('/products/file', multipartMiddleware, function (request, response) {
	var files = request.files;
	if(files) {
		for(var prop in files) {
			var file = files[prop];
			console.log(file);
		    fs.readFile(file.path, function(error,data){
		        var destination = './uploaded/'+ file.name;
		        fs.writeFile(destination,data,function(error){
		            if(error){
		                console.log(error);
		                throw error;
		            }else{
						response.set({ 'content-type': 'application/json; charset=UTF-8' });

				        var resultObj = {
				            result : 'ok',
				            size : file.size,
				            path : file.path,
				            name : file.name,
				            type : file.type
				        }

				        response.send({
				            message: 'File uploaded!',
				            data: resultObj
				        });

				        console.log(file.path + " : Upload completed" );
				    }
		        });
		    });
		}
	} else {
        response.send({
            error: 'File upload failed!'
        });
	}
});
*/

app.use('/api', router);

module.exports = app;

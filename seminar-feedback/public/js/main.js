var backEventListener = null;

var unregister = function() {
    if ( backEventListener !== null ) {
        document.removeEventListener( 'tizenhwkey', backEventListener );
        backEventListener = null;
        window.tizen.application.getCurrentApplication().exit();
    }
}

// Initialize function
var init = function () {
    // register once
    if ( backEventListener !== null ) {
        return;
    }
    
    // TODO:: Do your initialization job
    console.log("init() called");
    
    var backEvent = function(e) {
        if ( e.keyName == "back" ) {
            try {
                if ( $.mobile.urlHistory.activeIndex <= 0 ) {
                    // if first page, terminate app
                    unregister();
                } else {
                    // move previous page
                    $.mobile.urlHistory.activeIndex -= 1;
                    $.mobile.urlHistory.clearForward();
                    window.history.back();
                }
            } catch( ex ) {
                unregister();
            }
        }
    }
    
    // add eventListener for tizenhwkey (Back Button)
    document.addEventListener( 'tizenhwkey', backEvent );
    backEventListener = backEvent;
};

Date.prototype.format = function(f) {
	if (!this.valueOf()) return " ";
	var weekName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
	var d = this;
	return f.replace(/(yyyy|yy|MM|dd|E|hh|mm|ss|a\/p)/gi, function($1) {
		switch ($1) {
			case "yyyy": return d.getFullYear();
			case "yy": return (d.getFullYear() % 1000).zf(2);
			case "MM": return (d.getMonth() + 1).zf(2);
			case "dd": return d.getDate().zf(2);
			case "E": return weekName[d.getDay()];
			case "HH": return d.getHours().zf(2);
			case "hh": return ((h = d.getHours() % 12) ? h : 12).zf(2);
			case "mm": return d.getMinutes().zf(2);
			case "ss": return d.getSeconds().zf(2);
			case "a/p": return d.getHours() < 12 ? "AM" : "PM";
			default: return $1;
		}
	});
};

String.prototype.string = function(len){var s = '', i = 0; while (i++ < len) { s += this; } return s;};
String.prototype.zf = function(len){return "0".string(len - this.length) + this;};
Number.prototype.zf = function(len){return this.toString().zf(len);};

var selectedItem = -1;
var selectedFeedback = -1;
//var baseURL = 'http://localhost/api';
var baseURL = 'http://seminar-feedback-service.herokuapp.com/api';
var queryString = new Array();

function Map(){
    this.map = new Object();
}
 
Map.prototype = {
    put : function(key, value) {        
        this.map[key] = value;
    },
    get : function(key) {
        return this.map[key];
    }
}
function goHome() {
	window.location.href = './index.html';
}

function goAdmin() {
	window.location.href = './admin.html';
}

function changeTotalScore() {
	var score1 = Number($('#addFeedback #score1').val());
	var score2 = Number($('#addFeedback #score2').val());
	var score3 = Number($('#addFeedback #score3').val());
	var score4 = Number($('#addFeedback #score4').val());
	var score5 = Number($('#addFeedback #score5').val());
	var sum = score1 + score2 + score3 + score4 + score5;
	$('#addFeedback #scoreTotal').text(sum);
	
}

function loadSettingPage() {
	var nameVal = $('#admin #name').val();
	var passwordVal = $('#admin #password').val();
	var contentsArea = $('#admin #adminContents');
	
	rest.get(
		baseURL + '/admin/exist', 
		null, 
		{"adminName": nameVal,"adminPassword": passwordVal},
		function(data, xhr) { 
			window.location.href = 'user.html';
		},
		function(data, xhr) { 
			$('#admin #messageArea').text(data.error);
		}
	);
}

function parseQuery() {
	if (window.location.search.split('?').length > 1) {
        var params = window.location.search.split('?')[1].split('&');
        for (var i = 0; i < params.length; i++) {
        	var pair = params[i].split('=');
            var key = pair[0];
            var value = pair[1];
            queryString[key] = value;
        }
        if(queryString["seminarId"]) {
        	selectedItem = queryString["seminarId"];
        }
        if(queryString["feedbackId"]) {
        	selectedFeedback = queryString["feedbackId"];
        }
	}
}

function onItemClicked(event, seminarId) {
	var target = event.target;
	// Add feedback button이 눌린게 아니고, row가 click 되었을때만 처리
	if(target.nodeName.toLowerCase() != 'input') {
		console.log('Item clicked : seminarId=' + seminarId);
		window.location.href = './seminarDetail.html?seminarId=' + seminarId;
	}
}

function loadSeminarDetail() {
	parseQuery();

	rest.get(
		baseURL + '/seminars/' + selectedItem, 
		null, 
		null,
		function(data, xhr) { 
			console.log(JSON.stringify(data));
			
			var writer = Number(data.writer);
			var name = data.name;
			var date = new Date(Number(data.date));
			var dateStr = date.format("yyyy-MM-dd");
			var title = data.title;
			var contents = data.contents;
			var link = data.link;
			var score = Number(data.score).toFixed(2);
			if(isNaN(score)) {
				score = 0;
			}
			
			$('#seminarDetail #seminarIdField').val(selectedItem);
			$('#seminarDetail #writerIdField').val(writer);
			$('#seminarDetail #name').text(name);
			$('#seminarDetail #date').text(dateStr);
			$('#seminarDetail #title').text(title);
			if(contents) {
				$('#seminarDetail #contents').text(contents);
			}
			if(link) {
				$('#seminarDetail #link').text(link);
			}
			$('#seminarDetail #score').text(score);
		},
		function(data, xhr) { 
			alert(JSON.stringify(data));
		}
	);

	rest.get(
		baseURL + '/feedbacks', 
		null, 
		{"seminarId":selectedItem},
		function(data, xhr) { 
			console.log(JSON.stringify(data));
			var tbody = document.getElementById('feedbacksBody');
			tbody.innerHTML = '';
			
			for(var i=0; i<data.length; i++) {
				var item = data[i];
				
				var id = item.id;
				var date = new Date(Number(item.date));
				var dateStr = date.format("yyyy-MM-dd");
				var feedback = item.feedback;
				var score1 = Number(item.score1);
				if(isNaN(score1)) {
					score1 = 0;
				}
				var score2 = Number(item.score2);
				if(isNaN(score2)) {
					score2 = 0;
				}
				var score3 = Number(item.score3);
				if(isNaN(score1)) {
					score1 = 0;
				}
				var score4 = Number(item.score4);
				if(isNaN(score4)) {
					score4 = 0;
				}
				var score5 = Number(item.score5);
				if(isNaN(score5)) {
					score5 = 0;
				}
				var sum = Number(item.sum).toFixed(2);
				if(isNaN(sum)) {
					sum = 0;
				}

				tbody.innerHTML += ('<tr id="' + id + '">'
       				+ '<td style="padding: 3px;" align="center">' + score1 + '</td>'
       				+ '<td style="padding: 3px;" align="center">' + score2 + '</td>'
       				+ '<td style="padding: 3px;" align="center">' + score3 + '</td>'
       				+ '<td style="padding: 3px;" align="center">' + score4 + '</td>'
       				+ '<td style="padding: 3px;" align="center">' + score5 + '</td>'
       				+ '<td style="padding: 3px;" align="center">' + sum + '</td>'
       				+ '<td style="padding: 3px;">' + feedback + '</td>'
       				+ '<td style="padding: 3px;" align="center">'
       				+ '<a href="#deleteFeedback" data-role="button" data-rel="dialog" data-transition="pop">'
       				+ '<input type="button" value="Delete" onClick="selectedFeedback=' + id + '"></a></td>'
				 	+ '</tr>');
			}
		},
		function(data, xhr) { 
			alert(JSON.stringify(data));
		}
	);
}

function getWriterList() {
	rest.get(
		baseURL + '/users/names', 
		null, 
		null,
		function(data, xhr) { 
			console.log(JSON.stringify(data));
			var writerFilter = $('#home #writerFilter');

			writerFilter.innerHTML = '';
			var tags;
			for(var i=0; i<data.length; i++) {
				var item = data[i];
				var name = item.name;
				tags += ('<option value="' + name + '">' + name + '</option>');
			}
			writerFilter.html(tags);
		},
		function(data, xhr) { 
			alert(JSON.stringify(data));
		}
	);
}

function getSeminarList() {
	var writerFilter = $('#home #writerFilter');
	var monthFilter = $('#home #monthFilter');
	
	var data = new Object();
	var writer = writerFilter.val();
	if(writer) {
		data.name = writer;
	}
	var monthStr = monthFilter.val();
	if(monthStr) {
		var month = new Date(monthStr).getTime();
		if(month > 0) {
			data.month = month;
		}
	}
	
	rest.get(
		baseURL + '/seminars', 
		null, 
		data,
		function(data, xhr) { 
			console.log(JSON.stringify(data));
			var tbody = document.getElementById('tbody');
			tbody.innerHTML = '';
			
			for(var i=0; i<data.length; i++) {
				var item = data[i];
				
				var id = item.id;
				var name = item.name;
				var date = new Date(Number(item.date));
				var dateStr = date.format("yyyy-MM-dd");
				var title = item.title;
				var score = Number(item.score).toFixed(2);
				if(isNaN(score)) {
					score = 0;
				}
				
				tbody.innerHTML += ('<tr id="' + id + '" style="cursor:pointer;" onClick="onItemClicked(event, '+ id + ');">'
					+ '<td style="padding: 5px;" align="center">' + dateStr + '</td>'
       				+ '<td style="padding: 5px;" align="center">' + name + '</td>'
       				+ '<td style="padding: 5px;">' + title + '</td>'
       				+ '<td style="padding: 5px;" align="center">' + score + '</td>'
       				+ '<td style="padding: 5px;" align="center">'
       				+ '<a href="./addFeedback.html?seminarId=' + id + '" data-role="button" data-rel="dialog" data-transition="pop">'
       				+ '<input type="button" value="Add feedback" onClick="selectedItem=' + id + ';"></a></td>'
				 	+ '</tr>');
			}
		},
		function(data, xhr) { 
			alert(JSON.stringify(data));
		}
	);
}


function addSeminar() {
	var data = makeSeminarData();
	rest.post(
		baseURL + '/seminars', 
		null, 
		data,
		function(data, xhr) { 
			selectedItem = data.seminarId;
			window.location.href = './seminarDetail.html?seminarId=' + selectedItem;
		},
		function(data, xhr) { 
			alert(JSON.stringify(data));
		}
	);
}

function makeSeminarData() {
	var nameVal = $('#addSeminar #name').val();
	var passwordVal = $('#addSeminar #password').val();
	var dateVal = $('#addSeminar #date').val();
	dateVal = new Date(dateVal).getTime();
	var titleVal = $('#addSeminar #title').val();
	var contentsVal = $('#addSeminar #contents').val();
	var linkVal = $('#addSeminar #link').val();

	var data = {name: nameVal, password: passwordVal, date: dateVal, title: titleVal, contents: contentsVal, link: linkVal};
	return data;
}

function addFeedback(selectedItem, forwardUrl) {
	var data = makeFeedbackData(selectedItem);
	if(!data.name) {
		alert('Name을 입력해 주세요!');
		$('#addFeedback #name').focus();
	} else if(!data.password) {
		alert('Password를 입력해 주세요!');
		$('#addFeedback #password').focus();
	} else if(data.score1==0 || data.score2==0 || data.score3==0 || data.score4==0 || data.score5==0) {
		alert('점수를 입력해 주세요!');
		$('#addFeedback #score1').focus();
	} else {
		rest.post(
			baseURL + '/feedbacks', 
			null,
			data,
			function(data, xhr) { 
				if(data.feedbackId < 0) {
					alert('한 세미나에 하나의 피드백만 등록 가능합니다!');
				}
				window.location.href = forwardUrl;
				window.location.reload(true);
			},
			function(data, xhr) { 
				alert(JSON.stringify(data));
			}
		);
	}
}

function makeFeedbackData(selectedItem) {
	var nameVal = $('#addFeedback #name').val();
	var passwordVal = $('#addFeedback #password').val();
	var score1Val = Number($('#addFeedback #score1').val());
	var score2Val = Number($('#addFeedback #score2').val());
	var score3Val = Number($('#addFeedback #score3').val());
	var score4Val = Number($('#addFeedback #score4').val());
	var score5Val = Number($('#addFeedback #score5').val());
	var feedbackVal = $('#addFeedback #feedback').val();
	
	var data = {seminarId: selectedItem, name: nameVal, password: passwordVal, score1: score1Val, score2: score2Val, score3: score3Val, score4: score4Val, score5: score5Val, feedback: feedbackVal};
	return data;
}

function deleteFeedback() {
	var nameVal = $('#deleteFeedback #name').val();
	var passwordVal = $('#deleteFeedback #password').val();

	if(nameVal && passwordVal) {
		rest.del(
			baseURL + '/feedbacks/' + selectedFeedback, 
			null, 
			{adminName: nameVal, adminPassword: passwordVal}, 
			function(data, xhr) { 
				showErrorMessage($('#deleteFeedback #messageArea'), '');
				window.location.href = './seminarDetail.html?seminarId=' + selectedItem;
			},
			function(data, xhr) { 
				showErrorMessage($('#deleteFeedback #messageArea'), data.error);
			}
		);
	} else {
		showErrorMessage($('#deleteFeedback #messageArea'), 'Please input admin name and password!');
	}
}

function deleteSeminar() {
	var nameVal = $('#deleteSeminar #name').val();
	var passwordVal = $('#deleteSeminar #password').val();
	
	if(nameVal && passwordVal) {
		rest.del(
				baseURL + '/seminars/' + selectedItem, 
				null,
				{name: nameVal, password: passwordVal}, 
				function(data, xhr) { 
					showErrorMessage($('#deleteSeminar #messageArea'), '');
					window.location.href = './index.html?seminarId=-1';
				},
				function(data, xhr) { 
					showErrorMessage($('#deleteSeminar #messageArea'), data.error);
				}
		);
	} else {
		showErrorMessage($('#deleteSeminar #messageArea'), 'Please input name and password!');
	}
}

function showErrorMessage(messageArea, message) {
	messageArea.text(message);
}


$(document).bind( 'pageinit', init );
$(document).unload( unregister );

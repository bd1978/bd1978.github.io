var backEventListener = null;

var unregister = function() {
    if ( backEventListener !== null ) {
        document.removeEventListener( 'tizenhwkey', backEventListener );
        backEventListener = null;
        window.tizen.application.getCurrentApplication().exit();
    }
}

//Initialize function
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
    document.addEventListener('tizenhwkey', backEvent );
    backEventListener = backEvent;
};

// 우체국 우편번호 찾기 open api
function testRest() {
	var key = encodeURIComponent("971439deb58507fee1390786262197");
	var v = encodeURIComponent($('#query').val());
	$.ajax({
		type : "GET",
		beforeSend : function(request) {
			request.setRequestHeader("Accept-Language", "UTF-8");
		},
		url : "http://biz.epost.go.kr/KpostPortal/openapi?regkey="+key+"&target=post&query="+v,
		dataType : "jsonp",
		contentType : "application/x-www-form-urlencoded; charset=UTF-8",
		success : function(data) {
			alert(data);
		},
		error : function(data) {
			alert(data);
		}
	});
}

function testLogin() {
	$.ajax({
		type : "POST",
		url : "http://admin-dev.samsungbizapps.com/api/v1/administrators/login",
		dataType : "json",
		contentType : "application/x-www-form-urlencoded",
		data : {
			username : "infoserv@chollian.net",
			password : "password1!"
		},
		success : function(data) {
			var json = JSON.stringify(data);
			$('#result').html(prettyPrint(data));
		},
		error : function(data) {
			var json = JSON.stringify(data);
			$('#result').html(prettyPrint(data));
		}
	});
}

$(document).bind( 'pageinit', init );
$(document).unload( unregister );

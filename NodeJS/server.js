// 모듈을 추출합니다.
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var fs = require('fs');
var multipart = require('connect-multiparty');

// 변수를 선언합니다.
var items = [{
    name: '우유',
    price: '2000'
}, {
    name: '홍차',
    price: '5000'
}, {
    name: '커피',
    price: '5000'
}];

// 웹 서버를 생성합니다.
var app = express();
app.use(express.static('public'));
app.use(bodyParser());
app.use(cors());
var multipartMiddleware = multipart({
	uploadDir : './tmp'
});

var router = express.Router();

// 라우트합니다.
router.all('/data.html', function (request, response) {
    var output = '';
    output += '<!DOCTYPE html>';
    output += '<html>';
    output += '<head>';
    output += '    <title>Data HTML</title>';
    output += '</head>';
    output += '<body>';
    items.forEach(function (item) {
        output += '<div>';
        output += '    <h1>' + item.name + '</h1>';
        output += '    <h2>' + item.price + '</h2>';
        output += '</div>';
    });
    output += '</body>';
    output += '</html>';
    response.send(output);
});

router.all('/data.json', function (request, response) {
    response.send(items);
});

router.all('/data.xml', function (request, response) {
    var output = '';
    output += '<?xml version="1.0" encoding="UTF-8" ?>';
    output += '<products>';
    items.forEach(function (item) {
        output += '<product>';
        output += '    <name>' + item.name + '</name>';
        output += '    <price>' + item.price + '</price>';
        output += '</product>';
    });
    output += '</products>';
    response.type('text/xml');
    response.send(output);
});

router.all('/parameter', function (request, response) {
    // 변수를 선언합니다.
    var name = request.param('name');
    var region = request.param('region');

    // 응답합니다.
    response.send('<h1>' + name + ':' + region + '</h1>');
});

router.all('/parameter/:id', function (request, response) {
    // 변수를 선언합니다.
    var id = request.param('id');

    // 응답합니다.
    response.send('<h1>' + id + '</h1>');
});


router.get('/products', function (request, response) {
	response.set({ 'content-type': 'application/json; charset=UTF-8' });
    response.send(items);
});

router.get('/products/:id', function (request, response) {
    // 변수를 선언합니다.
    var id = Number(request.param('id'));

    if (isNaN(id)) {
        // 오류: 잘못된 경로
        response.send({
            error: '숫자를 입력하세요!'
        });
    } else if (items[id]) {
        // 정상
		response.set({ 'content-type': 'application/json; charset=UTF-8' });
        response.send(items[id]);
    } else {
        // 오류: 요소가 없을 경우
        response.send({
            error: '존재하지 않는 데이터입니다!'
        });
    }
});

router.post('/products', function (request, response) {
    // 변수를 선언합니다.
    var name = request.param('name');
    var price = request.param('price');
    var item = {
        name: name,
        price: price
    };

    // 데이터를 추가합니다.
    items.push(item);

    // 응답합니다.
	response.set({ 'content-type': 'application/json; charset=UTF-8' });
    response.send({
        message: '데이터를 추가했습니다.',
        data: item
    });
});

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


router.put('/products/:id', function (request, response) {
    // 변수를 선언합니다.
    var id = Number(request.param('id'));
    var name = request.param('name');
    var price = request.param('price');

    if (items[id]) {
        // 데이터를 수정합니다.
        if (name) { items[id].name = name; }
        if (price) { items[id].price = price; }

        // 응답합니다.
		response.set({ 'content-type': 'application/json; charset=UTF-8' });
        response.send({
            message: '데이터를 수정했습니다.',
            data: items[id]
        });
    } else {
        // 오류: 요소가 없을 경우
        response.send({
            error: '존재하지 않는 데이터입니다!'
        });
    }
});

router.delete('/products/:id', function (request, response) {
    // 변수를 선언합니다.
    var id = Number(request.param('id'));

    if (isNaN(id)) {
        // 오류: 잘못된 경로
        response.send({
            error: '숫자를 입력하세요!'
        });
    } else if (items[id]) {
        // 정상: 데이터 삭제
        items.splice(id, 1);
        response.send({
            message: '데이터를 삭제했습니다.'
        });
    } else {
        // 오류: 요소가 없을 경우
        response.send({
            error: '존재하지 않는 데이터입니다!'
        });
    }
});

app.use('/api', router);

// 웹 서버를 실행합니다.
var port = 8000;
app.listen(port, function() {
    console.log('Server Running at http://127.0.0.1:'+port);
});

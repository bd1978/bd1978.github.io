// 모듈을 추출합니다.
var express = require('express');
var bodyParser = require('body-parser');

// 웹 서버를 생성합니다.
var app = express();
app.use(express.static('public'));
app.use(bodyParser());

var router = express.Router();

//변수를 선언합니다.
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

app.use('/api', router);

module.exports = app;

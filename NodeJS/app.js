//var http = require('http');
//var express = require('express');
//var path = require('path');
//var favicon = require('static-favicon');
//var logger = require('morgan');
//var cookieParser = require('cookie-parser');
//var bodyParser = require('body-parser');

//var routes = require('./routes/index');
//var users = require('./routes/users');

//var app = express();

// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

//app.use(favicon());
//app.use(logger('dev'));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded());
//app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', routes);
//app.use('/users', users);

var Hapi = require('hapi');
var server = Hapi.createServer('172.21.110.76', 3000);


// ������ �����մϴ�.
var items = [{
    name: '����',
    price: '2000'
}, {
    name: 'ȫ��',
    price: '5000'
}, {
    name: 'Ŀ��',
    price: '5000'
}];


server.route({
	method: 'GET',
	path: '/products',
	handler: function(req, res) {
	    res.send(items);
	}
});


// ���Ʈ�մϴ�.
/*
app.all('/parameter', function (request, response) {
    // ������ �����մϴ�.
    var name = request.param('name');
    var region = request.param('region');

    // �����մϴ�.
    response.send('<h1>' + name + ':' + region + '</h1>');
});

app.all('/parameter/:id', function (request, response) {
    // ������ �����մϴ�.
    var id = request.param('id');

    // �����մϴ�.
    response.send('<h1>' + id + '</h1>');
});

app.get('/products', function (request, response) {
    response.send(items);
});

app.get('/products/:id', function (request, response) {
    // ������ �����մϴ�.
    var id = Number(request.param('id'));

    if (isNaN(id)) {
        // ����: �߸��� ���
        response.send({
            error: '���ڸ� �Է��ϼ���!'
        });
    } else if (items[id]) {
        // ����
        response.send(items[id]);
    } else {
        // ����: ��Ұ� ���� ���
        response.send({
            error: '�������� �ʴ� �������Դϴ�!'
        });
    }
});

app.post('/products', function (request, response) {
    // ������ �����մϴ�.
    var name = request.param('name');
    var price = request.param('price');
    var item = {
        name: name,
        price: price
    };

    // �����͸� �߰��մϴ�.
    items.push(item);

    // �����մϴ�.
    response.send({
        message: '�����͸� �߰��߽��ϴ�.',
        data: item
    });
});

app.put('/products/:id', function (request, response) {
    // ������ �����մϴ�.
    var id = Number(request.param('id'));
    var name = request.param('name');
    var price = request.param('price');

    if (items[id]) {
        // �����͸� �����մϴ�.
        if (name) { items[id].name = name; }
        if (price) { items[id].price = price; }

        // �����մϴ�.
        response.send({
            message: '�����͸� �����߽��ϴ�.',
            data: items[id]
        });
    } else {
        // ����: ��Ұ� ���� ���
        response.send({
            error: '�������� �ʴ� �������Դϴ�!'
        });
    }
});

app.delete('/products/:id', function (request, response) {
    // ������ �����մϴ�.
    var id = Number(request.param('id'));

    if (isNaN(id)) {
        // ����: �߸��� ���
        response.send({
            error: '���ڸ� �Է��ϼ���!'
        });
    } else if (items[id]) {
        // ����: ������ ����
        items.splice(id, 1);
        response.send({
            message: '�����͸� �����߽��ϴ�.'
        });
    } else {
        // ����: ��Ұ� ���� ���
        response.send({
            error: '�������� �ʴ� �������Դϴ�!'
        });
    }
});

// �� ������ �����մϴ�.
http.createServer(app).listen(3000, function () {
    console.log('Server Running at http://127.0.0.1:3000');
});

module.exports = app;
*/

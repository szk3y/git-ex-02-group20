/*
 * This code is from the sample program shown in
 * "Node.js in Action" by M. Cantelon et al.
 *
 *
 * 1) To start server:
 * w1$ node simple.js
 * Server running at http://127.0.0.1:3000/
 *
 *
 * 2) To test, on other window:
 * w2$ curl -i -X GET http://127.0.0.1:3000/
 * HTTP/1.1 200 OK
 * Connection: closed
 * Content-Length: 159
 * Content-Type: application/json; charset=utf8
 * Date: Tue, 18 Apr 2017 07:06:01 GMT
 *
 * [
 * 	{
 * 		"id": 0,
 * 		"data": "0th item"
 * 	},
 * 	{
 * 		"id": 1,
 * 		"data": "1st item"
 * 	},
 * 	{
 * 		"id": 2,
 * 		"data": "2nd item"
 * 	},
 * 	{
 * 		"id": 3,
 * 		"data": "3rd item"
 * 	}
 * ]
 * w2$
 *
 * 3) Don't forget stop server:
 * type Ctl-C on w1.
 *
*/

function searchObj(dictArray, id) {
    for(i = 0; i < dictArray.length; i++) {
        if(dictArray[i].id === id) {
            return dictArray[i];
        }
    }
    return null;
}

function searchObjIndex(dictArray, id) {
    for(i = 0; i < dictArray.length; i++) {
        if(dictArray[i].id === id) {
            return i;
        }
    }
    return -1;
}

const http = require('http');
var url = require('url');

const hostname = '127.0.0.1';
const port = 3000;
var items = [
    {'id': 0, 'data': '0th item'},
    {'id': 1, 'data': '1st item'},
    {'id': 2, 'data': '2nd item'},
    {'id': 3, 'data': '3rd item'}
];

const server = http.createServer();

server.on('request', function(req, res) {
    var path = url.parse(req.url).pathname;
    req.setEncoding('utf8');
    res.setHeader('Connection', 'closed');
    switch(req.method) {
        case 'GET':
            if(path.match(/^\/id\/:\d/)) {
            // $ curl -i -X GET http://127.0.0.1:3000
                var id = parseInt(path.split(':')[1]);
                var targetObj = searchObj(items, id);
                var body = JSON.stringify(targetObj, null, '\t');
                body += '\n';
                res.setHeader('Content-Length', Buffer.byteLength(body));
                res.setHeader('Content-Type', 'application/json; charset=utf8');
                res.statusCode = 200;
                res.statusMessage = 'OK';
                res.end(body);
            } else {
                res.statusCode = 400;
                res.statusMessage = 'Bad Request';
                res.end('Bad Request');
            }
            break;
        case 'POST':
            if(path.match(/^\/$/)) {
            // $ curl -i -v --data '{"data":"testdata"}' -X POST http://127.0.0.1:3000
                var item;
                var data = '';
                req.on('data', function(chunk){
                    data += chunk;
                });
                req.on('end', function(){
                    try {
                        item = JSON.parse(data, function(key, value) {
                            if(key === '' ) return value;
                            if(key === 'data') return value;
                        });
                    } catch(e) {
                        res.statusCode = 400;
                        res.statusMessage = e.message;
                        res.end('Bad Request');
                    }
                    if('data' in item){
                        item.id = items.length;
                        items.push(item);
                        var body = JSON.stringify(item, null, '\t');
                        res.setHeader('Content-Length', Buffer.byteLength(body));
                        res.setHeader('Content-Type', 'application/json; charset=utf8');
                        res.statusCode = 200;
                        res.statusMessage = 'OK';
                        res.end(body);
                    }else{
                        res.statusCode = 400;
                        res.statusMessage = ('Bad Request');
                        res.end('Bad Request');
                    }
                });
            } else {
                res.statusCode = 400;
                res.statusMessage = ('Bad Request');
                res.end('Bad Request');
            }
            break;
        case 'DELETE':
            if(path.match(/^\/id\/:\d/)) {
                var id = parseInt(path.split(':')[1]);
                var objIndex = searchObjIndex(items, id);
                if(objIndex === -1) {
                    res.statusCode = 404;
                    res.statusMessage = ('Not Found');
                    res.end('Not Found');
                    break;
                }
                var body = '\n';
                items.splice(objIndex, 1);
                res.statusCode = 200;
                res.statusMessage = 'OK';
                res.end(body);
            } else {
                res.statusCode = 404;
                res.statusMessage = ('Not Found');
                res.end('Not Found');
            }
        default:
            res.statusCode = 400;
            res.statusMessage = ('Bad Request');
            res.end('Bad Request');
            break;
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

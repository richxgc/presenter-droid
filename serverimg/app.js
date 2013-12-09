var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')

app.listen(8080);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200,{'Content-Type': 'text/html'});
    res.end(data);
  });
}

io.sockets.on('connection',response);
function response(socket){
	socket.emit('response',{success:true});
	socket.on('sendImage',function(data){
		socket.broadcast.emit('displayImage',data);
	});
  socket.on('pointer',function(data){
    socket.broadcast.emit('pointerMove',data);
  });
}
var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , path = require('path')  
  , url = require('url') ;
 
app.listen(8001);

function handler (req, res) {
   console.log('request starting...' + req.url);
     
    var filePath = '.' + req.url;
    if (filePath == './')
        filePath = './index.html';
         
    var extname = path.extname(filePath);
     var contentTypesByExtension = {
    '.html': 'text/html',
    '.css':  'text/css',
    '.js':   'text/javascript'
  };
  var contentType = contentTypesByExtension[extname];
  
   
    fs.exists(filePath, function(exists) {
    
      if (exists) {
	  fs.readFile(filePath, function(error, content) {
	      if (error) {
		  res.writeHead(500);
		  res.end();
	      }
	      else {
		  res.writeHead(200, { 'Content-Type': contentType });
		  res.end(content, 'utf-8');
	      }
	  });
      }
      else {
	  res.writeHead(404);
	  res.end();
      }
      
  });
}
var simple = io
  .sockets
  .on('connection', function(socket) {
    socket.on('message', function(data) {
      socket.broadcast.send(data);
    });
    socket.on('disconnect', function() {
      // handle disconnect
    });
  });
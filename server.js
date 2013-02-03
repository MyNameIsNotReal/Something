/******************************************************************************
*
* Basic Server
*
* Author:  Shiliang Lu
*
******************************************************************************/



var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , vm = require('vm')
  , path = require('path')  
  , url = require('url')
  , querystring = require('querystring')
  , crypto = require('crypto')
  , redis = require('redis')
    client =  redis.createClient(6379, 'nodejitsudb4658577237.redis.irstack.com');
             client.auth('nodejitsudb4658577237.redis.irstack.com:f327cfe980c971946e80b8e975fbebb4', function (err) {
               if (err) { throw err; }
               // You are now connected to your redis.
             });
    
app.listen(8001);
var publicCookie = 'public';
var validLogon = 'valid'
//User name and password
var aUser = {
  'goinstant1':'d8f254590a4a43b21d33c4550c16b8d5',
  'goinstant2':'aba45b89ae3a7435cc79fd8161b5d3cd',
  'goinstant3':'eb41242558550db88715085b2be52761',
  'goinstant4':'720664d75ea8d3b71c8a4cd1d9dd7caf'

};

//Post Page name with callback handler
var postHandler = {
    './index.html': indexPost
}
//Post handler for index.html
function indexPost(req, res,filePath,data){
  
  //authentication
  if(aUser[data.user] != undefined && aUser[data.user] == crypto.createHash('md5').update(data.password).digest("hex")){
    
    filePath = './main.html';
    //create client ID
    var hashkey = crypto.createHash('md5').update(Math.random().toString(36).substring(7)).digest("hex");
    client.set(hashkey, validLogon, function(err, res){});
    readFiles(req, res, filePath,hashkey); 
  }
  else{
    filePath = './errorlogon.html';
    readFiles(req, res, filePath,publicCookie); 
  }
  
}




//Server handler 
function handler (req, res) {
  console.log('req starting...' + req.url);
  var filePath = '.' + req.url;
  if (filePath == './')
      filePath = './index.html';
      
  if (req.method == 'POST') {;
    postRequest(req,res,filePath,postHandler[filePath]);
  }
  else if (filePath.match(/.html$/)){
    //authentication for none public page
    var cookies = parseCookie(req.headers.cookie);
   
    client.get(cookies['clientId'], function (err, reply) { 
      var cookieString = publicCookie;
      if (err || reply == null || reply != validLogon ) {
            filePath = './index.html';
      } 
      else{
        cookieString = cookies['clientId'];
      }
      readFiles(req, res, filePath,cookieString);
    });
    
  }
  else{
    readFiles(req, res, filePath,publicCookie);
  }
}

//Read File function
function readFiles(req, res, filePath, cookieId){

  //Serve read file rewrite res  
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
            res.writeHead(200, { 'Set-Cookie': 'clientId='+cookieId,'Content-Type': contentType,'Location':filePath });
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
     

//Server Post function
function postRequest(req, res, filePath, callback) {
    var queryData = "";
    if(typeof callback !== 'function') return null;

    req.on('data', function(data) {
        queryData += data;
        if(queryData.length > 1e6) {
            queryData = "";
            res.writeHead(413, {'Content-Type': 'text/plain'});
            req.connection.destroy();
        }
    });
    req.on('end', function(data) {
      callback(req, res, filePath,querystring.parse(queryData),filePath);
    });

}



function parseCookie(cookieString) {
    var cookies = {};
    cookieString && cookieString.split(';').forEach(function( cookie ) {
    var parts = cookie.split('=');
    cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
  });
  return cookies;
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
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
var validOtherLogon = 'other'
var userName1 = 'goinstant1';
var userName2 = 'goinstant2';
var userName3 = 'goinstant3';
var userName4 = 'goinstant4';
//User name and password
var aUser = {
   'goinstant1':'d8f254590a4a43b21d33c4550c16b8d5',
   'goinstant2':'aba45b89ae3a7435cc79fd8161b5d3cd',
   'goinstant3':'eb41242558550db88715085b2be52761',
   'goinstant4':'720664d75ea8d3b71c8a4cd1d9dd7caf'

};

//-------------------------------------------------------------------------
// postHandler
// Post Page name with callback handler
//-------------------------------------------------------------------------
var postHandler = {
    './index.html': indexPost
}

//-------------------------------------------------------------------------
// indexPost
// Post handler for index.html
//-------------------------------------------------------------------------
function indexPost(req, res,filePath,data){
  
  //authentication
  if(aUser[data.user] != undefined && aUser[data.user] == crypto.createHash('md5').update(data.password).digest("hex")){
    
    filePath = './main.html';
     //create client ID
    var hashkey = crypto.createHash('md5').update(Math.random().toString(36).substring(7)).digest("hex");
    if(data.user == userName3 || data.user == userName4 ){
      filePath = './mainUseOther.html';
       client.set(hashkey, validOtherLogon, function(err, res){});
    }
    else{
      client.set(hashkey, validLogon, function(err, res){});
    }
      
   
   
    readFiles(req, res, filePath,hashkey); 
  }
  else{
    filePath = './errorlogon.html';
    readFiles(req, res, filePath,publicCookie); 
  }
  
}

//-------------------------------------------------------------------------
// handler
// Server handler 
//-------------------------------------------------------------------------
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
      else if(reply == validOtherLogon){
        filePath = './mainUseOther.html';
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

//-------------------------------------------------------------------------
// readFiles
// Read File function
//------------------------------------------------------------------------
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
     
//-------------------------------------------------------------------------
// postRequest
// Server Post function
//------------------------------------------------------------------------
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


//-------------------------------------------------------------------------
// parseCookie
// parse Cookie  variable
//------------------------------------------------------------------------
function parseCookie(cookieString) {
    var cookies = {};
    cookieString && cookieString.split(';').forEach(function( cookie ) {
    var parts = cookie.split('=');
    cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
  });
  return cookies;
}

//-------------------------------------------------------------------------
// predictIO
// A very simple socketio For prediected demo
//------------------------------------------------------------------------
var predictIO = io
  .sockets
  .on('connection', function(socket) {
   socket.on('message', function(data) {

     socket.broadcast.send(data);
   });
  });
  
  
//-------------------------------------------------------------------------
// For the small demo game
//------------------------------------------------------------------------
var users = {};
var gameFrame = 1000;
var targetObject = function(width, height, color,pX, pY){
    this.width = width;
    this.height = height;
    this.color = color;
    this.pX = pX;
    this.pY = pY;
}
var frameId;
var gameStart = false;
//-------------------------------------------------------------------------
//Start new game
//---------------------------------------------------------------------
function startGame(socket){
  frameId = setInterval(function () {
  var send = new targetObject()
  send.width= Math.floor((Math.random()*30)+1);
  send.height= Math.floor((Math.random()*30)+1);
  send.pX= Math.floor((Math.random()*200)+300);
  send.pY = Math.floor((Math.random()*200)+300);
  send.color = Math.floor((Math.abs(Math.random() * 16777215)) % 16777215).toString(16);  
  io.of('/game').emit('target',JSON.stringify(send));

  }, gameFrame);
  console.log('game start');
}
//-------------------------------------------------------------------------
// Stop Game
//---------------------------------------------------------------------
function stopGame(socket){
  clearInterval(frameId);
  gameStart = false;
 
}
//-------------------------------------------------------------------------
// Game namespace
//---------------------------------------------------------------------
var gameIO = io
  .of('/game')
  .on('connection', function(socket) {
    socket.on('checkIn', function (incoming) {
        users[socket.id] = socket;
    });
    //Only one interval should fired
    if(!gameStart){
      startGame(socket);
      gameStart = true;
    }
    console.log(gameStart);
    socket.on('disconnect', function () {
      stopGame(socket);
    });
    
    socket.on('clicked', function(data) {
      //Send win/lose text out
      socket.emit('result','You Win');
      socket.broadcast.emit('result','You lose');
       //Disconnect all users
      for (var key in users) {
          users[key].disconnect();
      }
      stopGame(socket);
    });
  });  
  


  
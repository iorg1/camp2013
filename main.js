var app = require('http').createServer()
  , io = require('socket.io').listen(app)
  , fs = require('fs');

app.listen(1337);

var files = fs.readdirSync(__dirname + '/images');

io.sockets.on('connection', function (socket) {
    var loadImage = function(){
    var index = Math.floor((Math.random()*files.length));
    fs.readFile(__dirname + '/images/' + files[index], 'base64', function(err, data){
      if(!err){
        socket.emit('picture', data);
      }else{
        socket.emit('error', err);
      }
    });
  }
  
  setInterval(loadImage, 6000);
  loadImage();
});
var app = require('http').createServer()
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , chokidar = require('chokidar');

app.listen(1337);

var watcher = chokidar.watch(__dirname + '/images', {ignored: /^\./, persistent: true});



io.sockets.on('connection', function (socket) {
  watcher
    .on('add', function(path) {
      fs.readFile(path, 'base64', function(err, data){
      if(!err){
        socket.emit('picture', data);
      }else{
        socket.emit('error', err);
      }
    });
  });
});
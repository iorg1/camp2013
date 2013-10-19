var app = require('http').createServer()
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , chokidar = require('chokidar');

app.listen(1337);

var emit = function(event, data){
  clients.forEach(function (client) {
    client.emit(event, data);
  });
};

var watcher = chokidar.watch(__dirname + '/images', {ignored: /^\./, persistent: true});

var clients = [];

io.sockets.on('connection', function (socket) {
  clients.push(socket);
  watcher
    .on('add', function(path) {
      fs.readFile(path, 'base64', function(err, data){
      if(!err){
        emit('picture', 'data:image/jpg;base64,' + data);
        //socket.emit('picture', 'data:image/jpg;base64,' + data);
      }else{
        emit('error', err);
      }
    });
  });
  socket.on('addphoto', function (data) {
    emit('picture', data.dataurl);
  });
});
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

var resetTimer = function () {
  clearTimeout(timeout);
  timeout = setTimeout(loadFromArchive, (5 + Math.random()*15)*1000);
};

var loadFromArchive = function(){
  var files = fs.readdirSync(__dirname + '/imagepool');
  if(files.length > 0){
      var index = Math.floor((Math.random()*files.length));
      fs.readFile(__dirname + '/imagepool/' + files[index], 'base64', function(err, data){
        if(!err){
          emit('picture', 'data:image/jpg;base64,' + data);
        }else{
          emit('error', err);
        }
      });
  };
  resetTimer();
};

var uploadDir = chokidar.watch(__dirname + '/images', {ignored: /^\./, persistent: true});

var clients = [];
var timeout = 0;
io.sockets.on('connection', function (socket) {
  clients.push(socket);
  uploadDir
    .on('add', function(path) {
      fs.readFile(path, 'base64', function(err, data){
      if(!err){
        emit('picture', 'data:image/jpg;base64,' + data);
        resetTimer();
        //socket.emit('picture', 'data:image/jpg;base64,' + data);
      }else{
        emit('error', err);
      }
    });
  });
  socket.on('addphoto', function (data) {
    var base64Data = data.dataurl.replace(/^data:image\/jpeg;base64,/, ""); 
    base64Data += base64Data.replace('+', ' ');
    binaryData = new Buffer(base64Data, 'base64').toString('binary');

    fs.writeFile(__dirname + '/imagepool/' + Math.floor(Math.random() * 10000000) + ".jpg", binaryData, "binary", function (err) {
        console.log(err); // writes out file without error, but it's not a valid image
    });
    emit('picture', data.dataurl);
    resetTimer();
  });
  
  resetTimer();
  
});
var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , fs = require('fs');

server.listen(process.env.PORT || 8008);

// routing
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

// tracks attendees at the event
var attendees = new Array();

io.sockets.on('connection', function (socket) {
  if(attendees.length != 0)  
    socket.emit('previous', attendees);

  // when the client emits submit name, updates attendees list
  socket.on('sendAttendees', function (data) {
      console.log(data.email + 'printout');
      var unique = true;

      for (var i = 0; i < attendees.length; i++) {
        if (attendees[i].email == data.email) {
          console.log('We have a match');
          unique = false;
          socket.emit('used');
        }   
      } 
      if(unique) {
        var user = data.firstName + ' ' + data.lastName + ' ' + data.email + '\n';
        fs.appendFile('log.txt', user, function (err) {
          if (err) throw err;
          console.log('A new attendee was added to the log');
        });
        attendees.push(data); 
        console.log(attendees); // write to a file?
        // we tell the client to execute 'updateAttendees' with 3 parameters
        io.sockets.emit('updateAttendees', data);
      }
  });

});
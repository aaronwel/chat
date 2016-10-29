var express = require("express");
var path = require("path");
var app = express();
app.use(express.static(path.join(__dirname, "./static")));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
app.get('/', function(req, res) {
 res.render("index");
})

var server = app.listen(8000, function() {
 console.log("listening on port 8000");
})

var io = require('socket.io').listen(server)
var users = {};
var currentUsers = [];
var chatLog = [];

// Whenever a connection event happens (the connection event is built in) run the following code
io.sockets.on('connection', function (socket) {
  	console.log("WE ARE USING SOCKETS!");

  	socket.on('sendchat',function(data){
  		var msg = '<b id="chatMsg">' + users[socket.id] + '</b>'+'&#8658; ' + data+ '<br>';
  		chatLog.push(msg)
  		io.sockets.emit('updatechat', msg);
  		console.log(chatLog)
        
  	})
 

  	socket.on('adduser', function(new_name){
  		if(currentUsers.hasOwnProperty(new_name)){
  			console.log('username is taken')
  		}
  		else{
  			currentUsers.push(new_name);
			users[socket.id] = new_name;
			socket.emit('updatechat', chatLog)
			socket.emit('updatechat', users[socket.id] + ' you have connected<br>');
			socket.broadcast.emit('updatechat', users[socket.id] + ' has connected<br>');
			io.sockets.emit('updateusers', currentUsers);
			console.log(currentUsers)
  		}
	});
	socket.on('disconnect',function(){
		currentUsers.splice(currentUsers.indexOf(users[socket.id]),1)

		console.log(socket.id)
		console.log(users)
		console.log(users[socket.id])
		socket.broadcast.emit('updatechat', users[socket.id] + ' (logged off) Bye Felicia!</br>')
		delete users[socket.id];
		socket.broadcast.emit('updateusers', currentUsers)
		
	})
});


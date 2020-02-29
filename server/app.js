var express = require('express');
var cookieParser = require('cookie-parser');

var app = express();
var path = require('path');

//////// IMPORTING ROUTES ///////////

var userRouter = require('./routes/user.js');

//////// IMPORTING ROUTES ///////////

///////// VIEW ENGINE ///////////////
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//////// VIEW ENGINE ///////////////

////// STATIC ///////
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
////// STATIC ///////

/////// USING ROUTES /////
app.use('/user', userRouter);

/////// USING ROUTES /////

app.get('/', function(req, res) {
  res.render('chat');
});

app.get('/connect', function(req, res) {
  res.json({connected: 'true'});
});

var server = require('http').createServer(app);
var io = require('socket.io')(server);

server.listen(process.env.PORT || '3000', function() {
  console.log(`Example app listening on port 3000!`);
});

function findChatRoom(room_name) {
  let find1 = io.sockets.adapter.rooms[room_name];
  //   let find2 =
  //     io.sockets.adapter.rooms[
  //       room_name
  //         .split('')
  //         .reverse()
  //         .join('')
  //     ];
  let find2 =
    io.sockets.adapter.rooms[
      room_name.split('-')[1] + '-' + room_name.split('-')[0]
    ];
  console.log('find1', find1);
  console.log('find2', find2);
  if (find1 === undefined && find2 === undefined) {
    return {ok: false};
  } else {
    let return_room_name =
      //   find1 === undefined
      //     ? room_name
      //         .split('')
      //         .reverse()
      //         .join('')
      //     : room_name;
      find1 === undefined
        ? room_name.split('-')[1] + '-' + room_name.split('-')[0]
        : room_name;
    return {ok: true, room: return_room_name, room_object: find1 || find2};
  }
}

let socketsArray = [];

io.on('connection', socket => {
  let table = {
    table_id: socket.handshake.query['table_id'],
    username: socket.handshake.query['username'],
    socket_id: socket.id,
    table_name: socket.handshake.query['table_name'],
  };

  socket.emit('self-acknowledge', {
    tables: socketsArray,
  });

  socketsArray.push(table);

  console.log('Users Connceted', socketsArray);

  socket.broadcast.emit('add-tables', {
    tables: socketsArray,
  });

  socket.on('disconnect', () => {
    let index = socketsArray
      .map(function(d) {
        return d['socket_id'];
      })
      .indexOf(socket.id);
    socketsArray.splice(index, 1);
    io.emit('remove-table', {table: socketsArray});
    console.log('After Disconnect', socketsArray);
  });

  ////// FOR REAL TIME CHAT MESSAGING ///////////////
  socket.on('send-chat-message', function(data) {
    console.log(data, 'Message');
    let result = findChatRoom(data.room_name);
    if (result.ok) {
      if (io.sockets.adapter.rooms[result.room].length === 1) {
        console.log('Send Push Notification ....');
      }
      socket.to(result.room).emit('receive-message', {
        message: data.message,
      });
    }
  });
  ////// FOR REAL TIME CHAT MESSAGING ///////////////

  //// FOR JOINING AND LEAVING CHAT ROOM //////////
  socket.on('join-room', function(data) {
    let result = findChatRoom(data.room_name);
    if (result.ok) {
      socket.join(result.room);
    } else {
      socket.join(data.room_name);
    }
    console.log('all rooms', io.sockets.adapter.rooms);
  });

  socket.on('leave-room', function(data) {
    let result = findChatRoom(data.room_name);
    if (result.ok) {
      socket.leave(result.room);
    }
    console.log('all rooms', io.sockets.adapter.rooms);
  });
  //// FOR JOINING AND LEAVING CHAT ROOM //////////
});

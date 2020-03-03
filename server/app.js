var express = require('express');
var cookieParser = require('cookie-parser');

var app = express();
var path = require('path');

//////// IMPORTING ROUTES ///////////

var userRouter = require('./routes/user.js');
var notificationsRouter = require('./routes/notifications');
var FCM = require('fcm-node');
var serverKey =
  'AAAA9EurmAs:APA91bGFqMTTcl9YXHR_FKIabA9jnZjUZDpABX6wGHt8wODCzvBQfNJ7hc_UbuaotSfexLia2fe2oUpKSBr6vtq4lqC4ijCQhssanYLYT6lQsNNG7FzagdSPl9BKCu2FgksMMALNE-16';
var fcm = new FCM(serverKey);
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
app.use('/notifications', notificationsRouter);
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

async function Notify(to, message, sender_user_name, sender_table_name) {
  var message = {
    to: to,
    notification: {
      sound: 'default',
      title: sender_user_name,
      body: message,
    },
    data: {
      my_key: 'my value',
      my_another_key: 'my another value',
    },
  };
  fcm.send(message, function(err, response) {
    if (err) {
      console.log('Something has gone wrong!');
    } else {
      console.log('Successfully sent with response: ', response);
    }
  });
}

function findChatRoom(room_name) {
  let find1 = io.sockets.adapter.rooms[room_name];
  let find2 =
    io.sockets.adapter.rooms[
      room_name.split('-')[1] + '-' + room_name.split('-')[0]
    ];
  if (find1 === undefined && find2 === undefined) {
    return {ok: false};
  } else {
    let return_room_name =
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
    token: socket.handshake.query['token'],
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
    io.emit('remove-tables', {tables: socketsArray});
    console.log('After Disconnect', socketsArray);
  });

  ////// FOR REAL TIME CHAT MESSAGING ///////////////
  socket.on('send-chat-message', async function(data) {
    console.log(data, 'Message');
    let result = findChatRoom(data.room_name);
    if (result.ok) {
      if (io.sockets.adapter.rooms[result.room].length === 1) {
        console.log('Send Push Notification ....');
        await Notify(
          data.sender_token,
          data.message.text,
          data.username,
          data.table_name,
        );
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

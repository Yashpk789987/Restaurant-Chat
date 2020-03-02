var express = require('express');
var router = express.Router();
var FCM = require('fcm-node');
var serverKey =
  'AAAA9EurmAs:APA91bGFqMTTcl9YXHR_FKIabA9jnZjUZDpABX6wGHt8wODCzvBQfNJ7hc_UbuaotSfexLia2fe2oUpKSBr6vtq4lqC4ijCQhssanYLYT6lQsNNG7FzagdSPl9BKCu2FgksMMALNE-16';
var fcm = new FCM(serverKey);

router.get('/push', function(req, res) {
  var message = {
    to:
      'fVUcmdqrCfQ:APA91bH6IzLT0Lt3gW9XUl_GgWB68vyS9wi6vt-ZCfZozpSTBccXLkMPvUrCFzXZU_NpRySkHmNNyQGAAjWtTBb8rwIFkH4d7gVQSoHlyS4KWHHx5y3sa9VTjw0mGEEKoENeoTXtlApt',
    notification: {
      subtitle: 'subtitle',
      sound: 'default',
      title: 'Title of your push notification',
      body: 'Body of your push notification',
      image:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3MiAmA8IvIhKxDnFCTgzjGcutJDkx0SsP-1gJ6mgdL4_KJ01ayg&s',
    },

    android: {
      notification: {
        sound: 'default',
        color: '#FF0000',
        image:
          'https://www.ishafoundation.org/images/stories/aboutus/wp/nandi_wallpaper_2.jpg',
      },
    },

    data: {
      image:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3MiAmA8IvIhKxDnFCTgzjGcutJDkx0SsP-1gJ6mgdL4_KJ01ayg&s',
      my_key: 'my value',
      my_another_key: 'my another value',
    },
    message: 'Firebase Push Message Using API',
  };
  fcm.send(message, function(err, response) {
    if (err) {
      console.log('Something has gone wrong!');
      res.json({code: 'failed'});
    } else {
      console.log('Successfully sent with response: ', response);
      res.json({response});
    }
  });
});

module.exports = router;

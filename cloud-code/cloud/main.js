
Parse.Cloud.define('addUpvote', function(request, response) {
  var query = new Parse.Query('Song');
  query.get(request.params.songId, {
    success: function(song) {
      var upVotes = song.attributes.up_votes + 1;
      song.set('up_votes', upVotes);
      song.save(null);
      response.success();
    },
    error: function() {
      response.error('song lookup failed');
    }
  });
});

Parse.Cloud.define('removeUpvote', function(request, response) {
  var query = new Parse.Query('Song');
  query.get(request.params.songId, {
    success: function(song) {
      var upVotes = song.attributes.up_votes > 0 ? song.attributes.up_votes - 1 : 0;
      song.set('up_votes', upVotes);
      song.save(null);
      response.success();
    },
    error: function() {
      response.error('song lookup failed');
    }
  });
});

Parse.Cloud.define('setAsPlayed', function(request, response) {
  var query = new Parse.Query('Song');
  query.get(request.params.songId, {
    success: function(song) {
      song.set('played', true);
      song.save(null);
      response.success();
    },
    error: function() {
      response.error('song lookup failed');
    }
  });
});


Parse.Cloud.beforeSave('Song', function(request, response) {
  if (request.object.id) {
    response.success();
  } else {
    var query = new Parse.Query('Song');
    query.equalTo('href', request.object.get('href'));
    query.equalTo('party_session', request.object.get('party_session'));
    query.find({
      success: function(res) {
        if (res.length === 0) {
          var defaults = {
            up_votes: 1,
            down_votes: 0,
            played: false
          };
          Object.keys(defaults).forEach(function(key) {
            if (typeof request.object.get(key) === 'undefined') {
              request.object.set(key, defaults[key]);
            }
          });
          response.success();
        } else {
          response.error('song already in playlist');
        }
      },
      error: function() {
        response.error('song lookup failed');
      }
    });
  }
});

Parse.Cloud.define('addUpvote', function(request, response) {
  var query = new Parse.Query('Song');
  query.get(request.params.songId, {
    success: function(song) {
      var upVotes = song.get('up_votes') + 1;
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
      var upVotes = song.get('up_votes') > 0 ? song.get('up_votes') - 1 : 0;
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

Parse.Cloud.define('getNowPlaying', function(request, response) {
  var query = new Parse.Query('Song');
  query.equalTo('party_session', request.params.partySession);
  query.equalTo('played', true);
  query.limit(10000);
  query.find({
    success: function(res) {
      var songs = res;
      songs.sort(function(a, b) { return b.get('updatedAt') - a.get('updatedAt'); });
      var nowPlaying = songs[0];
      if (nowPlaying.id !== request.params.songId) {
        response.success(nowPlaying);
      } else {
        response.success('Now playing song hasn\'t changed');;
      }
    },
    error: function() {
      response.error('No song has yet been played');
    }
  });
});

Parse.Cloud.define('getQueue', function(request, response) {
  // var Song = Parse.Object.extend('Song');
  var query = new Parse.Query('Song');
  query.equalTo('party_session', request.params.partySession);
  query.equalTo('played', false);
  query.limit(10000);
  query.find({
    success: function(res) {
      // get last update
      var lastUpdate = res.reduce(function (acc, s) { return s.attributes.updatedAt > acc ? s.attributes.updatedAt : acc; }, 0);
      if (!request.params.lastUpdate || lastUpdate > request.params.lastUpdate) {
        // res.sort(function (a, b) {
        //   const delta = (b.attributes.up_votes - b.attributes.down_votes) - (a.attributes.up_votes - a.attributes.down_votes);
        //   return delta !== 0 ? delta : (a.attributes.createdAt - b.attributes.createdAt);
        // });
        response.success({ res: res, lastUpdate: lastUpdate });
      } else {
        response.success('Queue hasn\'t changed');
      }
    },
    error: function() {
      response.error('Queue lookup failed');
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
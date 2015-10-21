
Parse.Cloud.define('addUpvote', function(request, response) {
  var query = new Parse.Query('Song');
  query.get(request.params.songId, {
    success: function(song) {
      var upVotes = song.attributes.up_votes + 1;
      song.set('up_votes', upVotes);
      song.save(null);
      response.success(upVotes);
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
      response.success(upVotes);
    },
    error: function() {
      response.error('song lookup failed');
    }
  });
});
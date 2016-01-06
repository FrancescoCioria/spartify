import { range, includes } from 'lodash';
import keypress from 'keypress';
import utils from './utils';
import getCursorPosition from '../cursor-position';
keypress(process.stdin);

const QUIT = 'q',
  PLAY_PAUSE = [ 'f8', 'p' ],
  NEXT = [ 'f9', 'n' ],
  FADE_STEPS = 50,
  FADE_DURATION = 2000;

const rl = utils.rlinterface(),
  spotify = utils.spotifyInterface(),
  app = utils.appInterface();

let queue,
  interval,
  pointer,
  currentSong,
  skips = 0,
  partySession,
  updatingCurrentSong = false,
  insidePlayingNext = false,
  transitioning = false,
  ping;

function log(l) {
  process.stdout.clearLine();
  console.log(l);
}


// TESTS
// getCursorPosition(function(error, init) {
//   setInterval(function() {
//       time++;
//       _logInline(init.row, 'alpha-' + time);
//       _logInline(init.row + 1, 'bravo-' + time * time);
//   }, delay);
// });
function cursorInterface() {
  return {
    getCursorPosition: () => new Promise((resolve) => {
      getCursorPosition((err, res) => resolve(err || res));
    })
  };
}

function logInfos() {
  ping = new Date();
  // currentSong = {title: 'BEAUTIFUL SONG'};
  queue = range(10);
  const hours = ('0' + ping.getHours()).slice(-2);
  const minutes = ('0' + ping.getMinutes()).slice(-2);
  const seconds = ('0' + ping.getSeconds()).slice(-2);
  process.stdout.write(`
    Now Playing: ${currentSong.title}\r\n
    Songs in Queue: ${queue.length}\r\n
    PING: ${hours}:${minutes}:${seconds}\r
  `);
  // log(`Now Playing: ${currentSong.title}`);
  // cleanLine();
  // process.stdout.write(`PING: ${hours}:${minutes}:${seconds}\r`);
}

function fadeTransition(volume, step, counter) {
  transitioning = true;
  if (counter === Math.floor(FADE_STEPS / 2)) {
    spotify.playTrack(currentSong.href);
  }
  if (counter < Math.floor(FADE_STEPS / 2)) {
    volume = Math.min(Math.max(1, volume - step), 100);
  } else if (counter < FADE_STEPS) {
    volume = Math.min(Math.max(1, volume + step), 100);
  } else {
    spotify.setVolume(volume);
    transitioning = false;
    return;
  }
  spotify.setVolume(volume);
  setTimeout(() => fadeTransition(volume, step, counter + 1), Math.floor(FADE_DURATION / FADE_STEPS));
}

// APP
async function updateQueue() {
  const res = await app.find('Song', {where: {party_session: pointer, played: false}, limit: 10000});
  queue = res.results.sort((a, b) => {
    const deltaVotes = (b.up_votes - b.down_votes) - (a.up_votes - a.down_votes);
    const deltaCreationDate = (new Date(a.createdAt)) - (new Date(b.createdAt));
    const deltaTitle = a.title < b.title ? -1 : 1;
    return deltaVotes || deltaCreationDate || deltaTitle;
  });
}

async function playNext(state) {
  // log('playNext');
  insidePlayingNext = true;
  await updateQueue();
  currentSong = queue.shift();
  await app.update('Song', currentSong.objectId, { played: true });
  if (state && false) { // no fade transition :(
    const { volume } = state;
    const step = (volume / FADE_STEPS) * 2;
    fadeTransition(volume, step, 0);
  } else {
    await spotify.playTrack(currentSong.href);
  }
  insidePlayingNext = false;
}

async function updateCurrentSong(track) {
  // called when user changes song manually on Spotify
  updatingCurrentSong = true;
  await app.insert('Song', {
    title: track.name,
    href: track.id,
    artist: track.artist,
    played: true,
    party_session: pointer
  });
  const res = await app.find('Song', { where: { party_session: pointer, href: track.id } });
  if (res.results.length) {
    currentSong = res.results[0];
    await app.update('Song', currentSong.objectId, { played: true, up_votes: 0, skips: 0 });
  }
  updatingCurrentSong = false;
}

async function controlSongState() {
  const now = new Date();
  const hours = ('0' + now.getHours()).slice(-2);
  const minutes = ('0' + now.getMinutes()).slice(-2);
  const seconds = ('0' + now.getSeconds()).slice(-2);
  process.stdout.clearLine();
  process.stdout.write(`PING: ${hours}:${minutes}:${seconds}\r`);
  const skipPosition = (100 - (Math.min(81, Math.pow(1.7, skips)) - 1)) / 100;
  if (!insidePlayingNext && !transitioning) {
    const state = await spotify.getState();
    const track = await spotify.getTrack();
    if (!updatingCurrentSong && track.id !== currentSong.href) {
      updateCurrentSong(track);
    } else if (state.position * 1000 > Math.min(track.duration * skipPosition, track.duration - 10000)) {
      playNext(state);
    }
  }
}

async function updateSkips() {
  const res = await app.find('Song', { objectId: currentSong.objectId });
  skips = Math.max(0, res.skips || 0);
}

async function askForActions(prompt) {
  log(prompt);
  process.stdin.on('keypress', function (chunk, key) {
    if (key && (key.name === QUIT || (key.ctrl && key.name === 'c'))) {
      process.exit(1);
    } else if (includes(PLAY_PAUSE, key.name)) {
      log('PLAY_PAUSE');
      spotify.playPause();
    } else if (includes(NEXT, key.name)) {
      log('NEXT');
      if (!insidePlayingNext) {
        playNext();
      } else {
        log('discarded');
      }
    }
  });
  process.stdin.setRawMode(true);
  process.stdin.resume();
}

async function runPlayer(_partySession) {
  partySession = _partySession || await rl.question(`Ahoy 'n welcome to Partify.\nPlease, scribe ye parrrty code:`);
  pointer = {
    __type: 'Pointer',
    className: 'PartySession',
    objectId: partySession
  };
  playNext();
  setInterval(controlSongState, 1000);
  setInterval(updateSkips, 1000);
  askForActions(`\nuse mediakeys to control songs. type 'CTRL + C' to quit`);
  // setInterval(logInfos, 1000);
}

export default runPlayer;

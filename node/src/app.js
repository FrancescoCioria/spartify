import { range } from 'lodash';
import keypress from 'keypress';
import utils from './utils';
import getCursorPosition from '../cursor-position';
keypress(process.stdin);

const QUIT = 'q',
  // PREV = 'f7',
  PLAY_PAUSE = 'f8',
  NEXT = 'n';

const rl = utils.rlinterface(),
  spotify = utils.spotifyInterface(),
  app = utils.appInterface();

let queue,
  interval,
  pointer,
  currentSong,
  insidePlayingNext,
  ping;


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

function log(l) {
  process.stdout.clearLine();
  console.log(l);
}

function logInfos() {
  ping = new Date();
  currentSong = {title: 'BEAUTIFUL SONG'};
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

// APP
async function updateQueue() {
  const res = await app.find('Song', {where: {party_session: pointer, played: false}, limit: 1000});
  queue = res.results;
  queue.sort((a, b) => (b.up_votes - b.down_votes) - (a.up_votes - a.down_votes));
}

async function playNext() {
  // log('playNext');
  insidePlayingNext = true;
  await updateQueue();
  currentSong = queue.shift();
  await app.update('Song', currentSong.objectId, { played: true });
  await spotify.playTrack(currentSong.href);
  insidePlayingNext = false;
}

async function controlSongState() {
  const now = new Date();
  const hours = ('0' + now.getHours()).slice(-2);
  const minutes = ('0' + now.getMinutes()).slice(-2);
  const seconds = ('0' + now.getSeconds()).slice(-2);
  process.stdout.clearLine();
  process.stdout.write(`PING: ${hours}:${minutes}:${seconds}\r`);
  if (!insidePlayingNext) {
    const state = await spotify.getState();
    const track = await spotify.getTrack();
    // if ((state.position / (track.duration / 1000)) > 0.1) {
    if ((track.duration / 1000) - state.position < 3) {
      playNext();
    }
  }
}

async function askForActions(prompt) {
  log(prompt);
  process.stdin.on('keypress', function (chunk, key) {
    if (key && (key.name === QUIT || (key.ctrl && key.name === 'c'))) {
      process.exit(1);
      return;
    }
    switch (key.name) {
      case PLAY_PAUSE:
        log('PLAY_PAUSE');
        spotify.playPause();
        break;
      case NEXT:
        log('NEXT');
        if (!insidePlayingNext) {
          playNext();
        } else {
          log('discarded');
        }
        break;
    }
    // resetInterval();
  });
  process.stdin.setRawMode(true);
  process.stdin.resume();
}

// function resetInterval() {
//   if (interval) {
//     clearInterval(interval);
//   }
//   interval = setInterval(controlSongState, 1000);
// };

async function runPlayer(partySession) {
  partySession = partySession || await rl.question(`Ahoy 'n welcome to Partify.\nPlease, scribe ye parrrty code:`);
  pointer = {
    __type: 'Pointer',
    className: 'PartySession',
    objectId: partySession
  };
  playNext();
  setInterval(controlSongState, 1000);
  askForActions(`\nuse mediakeys to control songs. type 'CTRL + C' to quit`);
  // setInterval(logInfos, 1000);
}

export default runPlayer;

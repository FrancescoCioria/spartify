import _spotify from 'spotify-node-applescript';
import request from 'request-promise';
import readlineSync from 'readline-sync';
import { Parse } from 'node-parse-api';
import { filter, sortBy, includes, range, debounce } from 'lodash';
import keypress from 'keypress';
import getCursorPosition from '../cursor-position';
keypress(process.stdin);



getCursorPosition(function(error, init) {
  setInterval(function() {
      time++;
      _logInline(init.row, 'alpha-' + time);
      _logInline(init.row + 1, 'bravo-' + time * time);
  }, delay);
});

const APP_ID = 'f9wu4ZdFIMfE7CNlVKs9zj98Q9lOi0EPwB6tr0Fl',
  MASTER_KEY = 'NqcjMzG5vDZ0c2wz3k6K2RizTxLSoLCWTIv5o1a1',
  _app = new Parse(APP_ID, MASTER_KEY);

const QUIT = 'q',
  PREV = 'f7',
  PLAY_PAUSE = 'f8',
  NEXT = 'n';

function isMediaKey(key) {
  return includes([PLAY_PAUSE, PREV, NEXT], key);
};

function log(l) {
  process.stdout.clearLine();
  console.log(l);
};

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
};

let queue,
  interval,
  pointer,
  code,
  currentSong,
  insidePlayingNext,
  ping,
  mediaInputs = [];

function cursorInterface() {
  return {
    getCursorPosition: () => new Promise((resolve) => {
      getCursorPosition((err, res) => resolve(err || res));
    })
  };
};


function rlinterface() {
  return {
    question: (q, defaultInput) => new Promise((resolve) => {
      const out = readlineSync.question(q + ' ', { defaultInput });
      resolve(out);
    }),
    keyIn: (q) => new Promise((resolve) => {
      const out = readlineSync.keyIn(q + ' ');
      resolve(out);
    })
  }
};

function spotifyInterface() {
  return {
    playTrack: (href) => new Promise((resolve, reject) => {
      _spotify.playTrack(href, (err, res) => resolve(err || res));
    }),
    getTrack: () => new Promise((resolve, reject) => {
      _spotify.getTrack((err, res) => resolve(err || res));
    }),
    getState: () => new Promise((resolve, reject) => {
      _spotify.getState((err, res) => resolve(err || res));
    }),
    playPause: () => new Promise((resolve, reject) => {
      _spotify.playPause((err, res) => resolve(err || res));
    })
  };
};

function appInterface() {
  return {
    find: (Class, query) => new Promise((resolve, reject) => {
      _app.find(Class, query, (err, res) => resolve(err || res));
    }),
    update: (Class, id, patch) => new Promise((resolve, reject) => {
      _app.update(Class, id, patch, (err, res) => resolve(err || res));
    }),
    delete: (Class, id) => new Promise((resolve, reject) => {
      _app.delete('Foo', 'someId', (err, res) => resolve(err || res));
    })
  }
};

const rl = rlinterface(),
  spotify = spotifyInterface(),
  app = appInterface();

async function updateQueue() {
  const res = await app.find('Song', {where: {party_session: pointer, played: false}, limit: 1000});
  queue = res.results;
  queue.sort((a, b) => (b.up_votes - b.down_votes) - (a.up_votes - a.down_votes));
};

async function playNext() {
  // log('playNext');
  insidePlayingNext = true;
  await updateQueue();
  currentSong = queue.shift();
  await app.update('Song', currentSong.objectId, { played: true });
  await spotify.playTrack(currentSong.href);
  insidePlayingNext = false;
};

async function controlSongState() {
  const now = new Date();
  const hours = ('0' + now.getHours()).slice(-2);
  const minutes = ('0' + now.getMinutes()).slice(-2);
  const seconds = ('0' + now.getSeconds()).slice(-2);
  cleanLine();
  process.stdout.write(`PING: ${hours}:${minutes}:${seconds}\r`);
  if (!insidePlayingNext) {
    const state = await spotify.getState();
    const track = await spotify.getTrack();
    // if ((state.position / (track.duration / 1000)) > 0.1) {
    if ((track.duration / 1000) - state.position < 3) {
      playNext();
    }
  }
};

async function askForActions(prompt) {
  log(prompt);
  process.stdin.on('keypress', function (chunk, key) {
    if (key && key.ctrl && key.name == 'c') {
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
};

// function resetInterval() {
//   if (interval) {
//     clearInterval(interval);
//   }
//   interval = setInterval(controlSongState, 1000);
// };

// async function controlMediaActions() {
//   const action = (await app.find('Action', {where: {party_session: pointer, active: true}})).results[0];
//   switch (action.type) {
//     case 'next_song':
//       const x = await app.update('Action', action.objectId, {active: false});
//       playNext();
//   }
// }

async function runApp() {
  // const code = await rl.question(`Ahoy 'n welcome to Partify.\nPlease, scribe ye parrrty code:`);
  const code = '7Ooxqxnt4A';
  pointer = {
    __type: 'Pointer',
    className: 'PartySession',
    objectId: code
  };
  // playNext();
  // setInterval(controlSongState, 1000);
  // askForActions(`\nuse mediakeys to control songs. type 'CTRL + C' to quit`);
  setInterval(logInfos, 1000);
};

runApp();

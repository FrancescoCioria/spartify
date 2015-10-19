import _spotify from 'spotify-node-applescript';
import request from 'request-promise';
import readlineSync from 'readline-sync';
import { Parse } from 'node-parse-api';
import { filter, sortBy, includes } from 'lodash';
import keypress from 'keypress';
keypress(process.stdin);

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

let queue,
  interval,
  pointer,
  code,
  currentSong,
  insidePlayingNext,
  mediaInputs = [];

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
  console.log(`SONGS IN QUEUE: ${queue.length}`);
  queue.sort((a, b) => (b.up_votes - b.down_votes) - (a.up_votes - a.down_votes));
};

async function playNext() {
  // console.log('playNext');
  insidePlayingNext = true;
  await updateQueue();
  currentSong = queue.shift();
  console.log(`Now Playing: ${currentSong.title}`);
  await app.update('Song', currentSong.objectId, { played: true });
  await spotify.playTrack(currentSong.href);
  insidePlayingNext = false;
};

async function controlSongState() {
  // console.log('controlSongState');
  if (!insidePlayingNext) {
    const state = await spotify.getState();
    const track = await spotify.getTrack();
    // if ((state.position / (track.duration / 1000)) > 0.1) {
    if ((track.duration / 1000) - state.position < 3) {
      playNext();
    }
  }
};

// async function askForActions(prompt) {
//   console.log(prompt);
//   process.stdin.on('keypress', function (chunk, key) {
//     if (key && key.ctrl && key.name == 'c') {
//       process.exit(1);
//     }
//     switch (key.name) {
//       case PLAY_PAUSE:
//         console.log('PLAY_PAUSE');
//         spotify.playPause();
//         break;
//       case NEXT:
//         console.log('NEXT');
//         if (!insidePlayingNext) {
//           playNext();
//         } else {
//           console.log('discarded');
//         }
//         break;
//     }
//     resetInterval();
//   });
//   process.stdin.setRawMode(true);
//   process.stdin.resume();
// };

// function resetInterval() {
//   if (interval) {
//     clearInterval(interval);
//   }
//   interval = setInterval(controlSongState, 1000);
// };

async function controlMediaActions() {
  const action = (await app.find('Action', {where: {party_session: pointer, active: true}})).results[0];
  switch (action.type) {
    case 'next_song':
      const x = await app.update('Action', action.objectId, {active: false});
      playNext();
  }
}

async function runApp() {
  // const code = await rl.question(`Ahoy 'n welcome to Partify.\nPlease, scribe ye parrrty code:`);
  const code = '7Ooxqxnt4A';
  pointer = {
    __type: 'Pointer',
    className: 'PartySession',
    objectId: code
  };
  playNext();
  setInterval(controlSongState, 1000);
  setInterval(controlMediaActions, 1000);
  // askForActions(`\nuse mediakeys to control songs. type 'CTRL + C' to quit`);
};

runApp();

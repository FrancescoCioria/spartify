import { Parse as ParseAPI } from 'node-parse-api';
import readlineSync from 'readline-sync';
import _spotify from 'spotify-node-applescript';

const APP_ID = 'f9wu4ZdFIMfE7CNlVKs9zj98Q9lOi0EPwB6tr0Fl',
  MASTER_KEY = 'NqcjMzG5vDZ0c2wz3k6K2RizTxLSoLCWTIv5o1a1',
  _app = new ParseAPI(APP_ID, MASTER_KEY);

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
  };
}

function spotifyInterface() {
  return {
    playTrack: (href) => new Promise((resolve) => {
      _spotify.playTrack(href, (err, res) => resolve(err || res));
    }),
    getTrack: () => new Promise((resolve) => {
      _spotify.getTrack((err, res) => resolve(err || res));
    }),
    getState: () => new Promise((resolve) => {
      _spotify.getState((err, res) => resolve(err || res));
    }),
    playPause: () => new Promise((resolve) => {
      _spotify.playPause((err, res) => resolve(err || res));
    })
  };
}

function appInterface() {
  return {
    find: (Class, query) => new Promise((resolve) => {
      _app.find(Class, query, (err, res) => resolve(err || res));
    }),
    update: (Class, id, patch) => new Promise((resolve) => {
      _app.update(Class, id, patch, (err, res) => resolve(err || res));
    }),
    delete: (Class, id) => new Promise((resolve) => {
      _app.delete(Class, id, (err, res) => resolve(err || res));
    }),
    insert: (Class, object) => new Promise((resolve) => {
      _app.insert(Class, object, (err, res) => resolve(err || res));
    })
  };
}

// function buildPromise(func) {
//   const args = Array.prototype.splice.call(arguments, 1);
//   return new Promise((resolve) => {
//     f.apply(null, args.concat((err, res) => resolve(err || res)));
//   });
// }

// function spotifyInterface() {
//   return {
//     playTrack: (href) => buildPromise(_spotify.playTrack, href),
//     getTrack: () => buildPromise(_spotify.getTrack),
//     getState: () => buildPromise(_spotify.getState),
//     playPause: () => buildPromise(_spotify.playPause)
//   };
// }

// function appInterface() {
//   return {
//     find: (Class, query) => buildPromise(_app.find, Class, query),
//     update: (Class, id, patch) => buildPromise(_app.update, Class, id, patch),
//     delete: (Class, id) => buildPromise(_app.delete, Class, id),
//     insert: (Class, object) => buildPromise(_app.insert, Class, object)
//   };
// }

export default {
  rlinterface,
  spotifyInterface,
  appInterface
};
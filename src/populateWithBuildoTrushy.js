import { Parse } from 'node-parse-api';
import readlineSync from 'readline-sync';
import tracks from '../buildo-trushy.json';
import { values } from 'lodash';

const APP_ID = 'f9wu4ZdFIMfE7CNlVKs9zj98Q9lOi0EPwB6tr0Fl',
  MASTER_KEY = 'NqcjMzG5vDZ0c2wz3k6K2RizTxLSoLCWTIv5o1a1',
  _app = new Parse(APP_ID, MASTER_KEY);

function rlinterface() {
  return {
    question: (q, defaultInput) => new Promise((resolve) => {
      const out = readlineSync.question(q + ' ', { defaultInput });
      resolve(out);
    })
  }
};

function appInterface() {
  return {
    find: (Class, query) => new Promise((resolve, reject) => {
      _app.find(Class, query, (err, res) => err ? reject(err) : resolve(res));
    }),
    insert: (Class, object) => new Promise((resolve, reject) => {
      _app.insert(Class, object, (err, res) => err ? reject(err) : resolve(res));
    })
  }
};

const rl = rlinterface(),
  app = appInterface();

async function populateScript() {
  // const code = await rl.question(`Ahoy 'n welcome to Partify.\nPlease, scribe ye parrrty code:`);
  const code = '7Ooxqxnt4A';
  const pointer = {
    __type: 'Pointer',
    className: 'PartySession',
    objectId: code
  };

  const uniqueTracks = values(tracks.reduce((acc, track) => {
    acc[track.track.id] = track.track;
    return acc;
  }, {}));
  await uniqueTracks.map(track => {
    return app.insert('Song', {
      title: track.name,
      href: track.uri,
      played: false,
      up_votes: 0,
      down_votes: 0,
      artist: track.artists[0].name,
      party_session: pointer
    });
  });
};

populateScript();

export default populateScript;
// import tracks from '../buildo-trushy.json';
import tracks from '../buildo-intro.json';
import { values, includes } from 'lodash';
import utils from './utils';

const rl = utils.rlinterface(),
  app = utils.appInterface();

async function populateScript(partySession) {
  console.log(partySession);
  partySession = partySession || await rl.question(`Ahoy 'n welcome to Partify.\nPlease, scribe ye parrrty code:`);
  const pointer = {
    __type: 'Pointer',
    className: 'PartySession',
    objectId: partySession
  };

  // clear session
  const res = await app.find('Song', {where: {party_session: pointer}, limit: 10000});
  await Promise.all(res.results.map(song => app.delete('Song', song.objectId)));

  // keep only unique and available tracks
  const uniqueTracks = values(tracks.reduce((acc, track) => {
    if (true || includes(track.track.available_markets, 'IT')) { // songs must be available in Italy...
      acc[track.track.id] = track.track;
    }
    return acc;
  }, {}));

  // save songs
  await Promise.all(uniqueTracks.map(track => {
    return app.insert('Song', {
      title: track.name,
      href: track.uri,
      played: false,
      up_votes: 0,
      down_votes: 0,
      artist: track.artists[0].name,
      party_session: pointer
    });
  }));
}

export default populateScript;
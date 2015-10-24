import runPlayer from './app';
import resetDB from './populateWithBuildoTrushy';
import utils from './utils';

const HARDCODED_PARTY_SESSION = 'the-spooky-loft';

const rl = utils.rlinterface();

async function init() {
  let action;
  while (action !== '1' && action !== '2') {
   action = await rl.question(`\n\nAhoy 'n welcome to Partify.\n\n [1] run player\n [2] reset database\n\nEnter number: `);
   if (action === '2' && await rl.question(`Are you sure? (y)`) !== 'y') {
    action = undefined;
   }
  }
  switch (action) {
    case '1':
      runPlayer(HARDCODED_PARTY_SESSION);
      break;
    case '2':
      resetDB(HARDCODED_PARTY_SESSION);
      break;
  }
}

init();
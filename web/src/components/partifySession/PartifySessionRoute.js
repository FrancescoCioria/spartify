import React from 'react/addons';
import Parse from 'parse';
import Song from './Song';
import { pick } from 'lodash';

export default class PartifySessionRoute extends React.Component {

  constructor(props) {
    super();
    this.state = {};
    this.pointer = {
      __type: 'Pointer',
      className: 'PartySession',
      objectId: props.params.partySession
    };
  }

  componentDidMount() {
    this.getQueue();
  }

  getQueue() {
    const Song = Parse.Object.extend('Song');
    const query = new Parse.Query(Song);
    query.equalTo('party_session', this.pointer);
    query.find({
      success: this.onGetQueueSuccess,
      error: (err) => { console.log(err); }
    });
  }

  onGetQueueSuccess = (res) => {
    const queue = res.map(s => ({ id: s.id, ...s.attributes }));
    queue.sort((a, b) => (b.up_votes - b.down_votes) - (a.up_votes - a.down_votes));
    this.setState({ queue });
  }

  render() {
    const { queue } = this.state;
    if (!queue) {
      return null;
    }
    return (
      <div id='partify'>
        { queue.map((song, k) => <Song { ...pick(song, ['id', 'title', 'artist']) } key={k} />) }
      </div>
    );
  }

}
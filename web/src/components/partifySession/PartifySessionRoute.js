import React from 'react/addons';
import Parse from 'parse';

export default class PartifySessionRoute extends React.Component {

  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
    this.getQueue();
  }

  getQueue() {
    const { partySession } = this.props.params;
    const pointer = {
      __type: 'Pointer',
      className: 'PartySession',
      objectId: partySession
    };
    const Song = Parse.Object.extend('Song');
    const query = new Parse.Query(Song);
    query.equalTo('party_session', pointer);
    query.find({
      success: this.onGetQueueSuccess,
      error: (err) => { console.log(err); }
    });
  }

  onGetQueueSuccess = (queue) => {
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
        { queue.map((s, k) => <div key={k}>{s.attributes.title}</div>) }
      </div>
    );
  }

}
import React from 'react';
import Parse from 'parse';
import cx from 'classnames';
import pick from 'lodash/object/pick';
import { FlexView } from 'buildo-react-components/lib/flex';
import LoadingSpinner from 'buildo-react-components/lib/loading-spinner';
import AddSong from './AddSong';
import Song from './Song';

export default class PartifySessionRoute extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: false
    };
  }

  componentDidMount() {
    this.getQueue();
  }

  getPartySessionPointer = () => {
    return {
      __type: 'Pointer',
      className: 'PartySession',
      objectId: this.props.params.partySession
    };
  }

  setLoading = (loading) => this.setState({ loading })

  getQueue = () => {
    const Song = Parse.Object.extend('Song');
    const query = new Parse.Query(Song);
    query.equalTo('party_session', this.getPartySessionPointer());
    query.equalTo('played', false);
    query.limit(1000);
    query.find({
      success: this.onGetQueueSuccess,
      error: (err) => { console.log(err); }
    });
    this.setState({ loading: true });
  }

  onGetQueueSuccess = (res) => {
    const queue = res.map(s => ({ id: s.id, ...s.attributes }));
    queue.sort((a, b) => (b.up_votes - b.down_votes) - (a.up_votes - a.down_votes)); // TODO(keep queue order secret -> sort by title)
    this.setState({ queue, loading: false });
  }

  onSave = (uri, options) => {
    const { title, artist, href } = options[0];
    const { setLoading } = this;

    const Song = Parse.Object.extend('Song');
    const song = new Song();

    song.set('title', title);
    song.set('artist', artist);
    song.set('href', href);
    song.set('party_session', this.getPartySessionPointer());

    song.save(null, {
      success: (newSong) => {
        localStorage.setItem(newSong.id, 'voted');
        this.getQueue();
      },
      error: () => {
        setLoading(false);
      }
    });

    this.setState({ loading: true });
  }

  render() {
    const { queue, loading } = this.state;
    if (!queue) { return null; }
    return (
      <div id='partify' className='songs-list' grow column>
        <AddSong onSave={this.onSave} />
        <FlexView className='page-content' hAlignContent='center'>
          <FlexView className={cx('queue', { loading })} style={{ position: 'relative' }} column grow>
            { loading && <LoadingSpinner /> }
            { queue.map((song, k) => <Song { ...pick(song, ['id', 'title', 'artist']) } key={k} />) }
          </FlexView>
        </FlexView>
      </div>
    );
  }

}
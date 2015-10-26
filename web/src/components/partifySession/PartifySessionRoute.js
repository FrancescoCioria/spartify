import React from 'react';
import Parse from 'parse';
import cx from 'classnames';
import pick from 'lodash/object/pick';
import { FlexView } from 'buildo-react-components/lib/flex';
import LoadingSpinner from 'buildo-react-components/lib/loading-spinner';
import AddSong from './AddSong';
import Song from './Song';
import NowPlaying from './NowPlaying';

export default class PartifySessionRoute extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      lastUpdate: 0,
      nowPlaying: {
        id: ''
      }
    };
  }

  componentDidMount() {
    this.refresh();
    this.interval = setInterval(this.refresh, 2000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  getPartySessionPointer = () => {
    return {
      __type: 'Pointer',
      className: 'PartySession',
      objectId: this.props.params.partySession
    };
  }

  setLoading = (loading) => this.setState({ loading })

  refresh = () => {
    Promise.all([this.getNowPlaying(), this.getQueue()])
      .then(res => {
        const state = {};
        console.log(res[0]);
        if (!(res[0] instanceof Parse.Error)) {
          state.nowPlaying = res[0];
        }
        if (!(res[1] instanceof Parse.Error)) {
          state.queue = res[1].queue;
          state.lastUpdate = res[1].lastUpdate;
        }
        this.setState(state);
      });
  }

  getNowPlaying = () => {
    return new Promise(resolve => {
      Parse.Cloud.run('getNowPlaying', { songId: this.state.nowPlaying.id, partySession: this.getPartySessionPointer() }, {
        success: (nowPlaying) => resolve(nowPlaying),
        error: resolve
      });
    });
  }

  sortQueue = (queue) => {
    queue.sort((a, b) => {
      const delta = (b.up_votes - b.down_votes) - (a.up_votes - a.down_votes);
      return delta !== 0 ? delta : (a.createdAt - b.createdAt);
    });
  }

  getQueue = () => {
    const { sortQueue } = this;
    return new Promise(resolve => {
      Parse.Cloud.run('getQueue', { lastUpdate: this.state.lastUpdate, partySession: this.getPartySessionPointer() }, {
        success: (res) => {
          const queue = res.res.map(s => ({ id: s.id, ...s.attributes }));
          sortQueue(queue);
          resolve({ queue, lastUpdate: res.lastUpdate });
        },
        error: resolve
      });
    });
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
    const { queue, loading, nowPlaying } = this.state;
    if (!queue) { return null; }
    return (
      <div id='partify' className='songs-list' grow column>
        <AddSong onSave={this.onSave} />
        <FlexView className='page-content' hAlignContent='center'>
          <FlexView className={cx('queue', { loading })} style={{ position: 'relative' }} column grow>
            { loading && <LoadingSpinner /> }
            <NowPlaying { ...pick(nowPlaying, ['id', 'title', 'artist']) } key='now-playing' />
            { queue.map((song, k) => <Song { ...pick(song, ['id', 'title', 'artist']) } key={k} />) }
          </FlexView>
        </FlexView>
      </div>
    );
  }

}
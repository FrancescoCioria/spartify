import React from 'react';
// import Parse from 'parse';
import { props, t } from 'tcomb-react';
import cx from 'classnames';
import { FlexView } from 'buildo-react-components/lib/flex';

require('./song.scss');

@props({
  id: t.Str,
  title: t.Str,
  artist: t.Str
})
export default class NowPlaying extends React.Component {

  toggleSkip = () => {
    // update localStorage
    const item = this.isSkipped() ? '' : 'skip';
    localStorage.setItem(this.props.id, item);
    // update Parse
    // const action = this.isSkipped() ? 'add' : 'remove';
    // Parse.Cloud.run(`${action}Upvote`, { songId: this.props.id });
    // refresh
    this.forceUpdate();
  }

  isSkipped = () => localStorage.getItem(this.props.id) === 'skip'

  render() {
    const { title, artist } = this.props;
    return (
      <FlexView className='song now-playing' vAlignContent='center'>
        <div className='info'>
          <div className='title'>{title}</div>
          <div className='artist'>{artist}</div>
        </div>
        <div className={cx('upvote skipped', { active: this.isSkipped() })}>
          Now playing
        {
          // <div onClick={this.toggleSkip} className={cx('upvote skipped', { active: this.isSkipped() })}>
            // {this.isSkipped() ? 'skipped' : 'skip'}
          }
        </div>
      </FlexView>
    );
  }

}
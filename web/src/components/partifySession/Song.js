import React from 'react';
import Parse from 'parse';
import { props, t } from 'tcomb-react';
import cx from 'classnames';
import { FlexView } from 'buildo-react-components/lib/flex';

require('./song.scss');

@props({
  id: t.Str,
  title: t.Str,
  artist: t.Str
})
export default class Song extends React.Component {

  toggleUpvote = () => {
    // update localStorage
    const item = this.isUpvoted() ? '' : 'voted';
    localStorage.setItem(this.props.id, item);
    // update Parse
    const action = this.isUpvoted() ? 'add' : 'remove';
    Parse.Cloud.run(`${action}Upvote`, { songId: this.props.id });
    // refresh
    this.forceUpdate();
  }

  isUpvoted = () => localStorage.getItem(this.props.id) === 'voted'

  render() {
    const { title, artist } = this.props;
    return (
      <FlexView className='song' vAlignContent='center'>
        <div className='info'>
          <div className='title'>{title}</div>
          <div className='artist'>{artist}</div>
        </div>
        <div onClick={this.toggleUpvote} className={cx('upvote', { active: this.isUpvoted() })}>
          {this.isUpvoted() ? '+1' : '+0'}
        </div>
      </FlexView>
    );
  }

}
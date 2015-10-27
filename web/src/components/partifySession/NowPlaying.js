import React from 'react';
// import Parse from 'parse';
import { props, t } from 'tcomb-react';
import Song from './Song';

@props({
  id: t.Str,
  title: t.Str,
  artist: t.Str,
  index: t.Num
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
    const action = {
      onClick: this.toggleSkip,
      text: 'skip',
      className: 'upvote', //TODO
      active: this.isSkipped()
    };
    return <Song { ...this.props } className='now-playing' action={action} />;
  }

}
import React from 'react';
import Parse from 'parse';
import { props, t } from 'tcomb-react';
import Song from './Song';

@props({
  id: t.Str,
  title: t.Str,
  artist: t.Str,
  upvotes: t.Num,
  onChange: t.Func
})
export default class QueueSong extends React.Component {

  toggleUpvote = () => {
    const { id, onChange } = this.props;
    // update localStorage
    const item = this.isUpvoted() ? '' : 'voted';
    localStorage.setItem(id, item);
    // update Parse
    const action = this.isUpvoted() ? 'add' : 'remove';
    Parse.Cloud.run(`${action}Upvote`, { songId: id });
    // refresh
    this.forceUpdate();
    onChange(id, this.isUpvoted());
  }

  isUpvoted = () => localStorage.getItem(this.props.id) === 'voted'

  render() {
    const { onChange, ...props } = this.props;
    const action = {
      onClick: this.toggleUpvote,
      text: '+1',
      className: 'upvote',
      active: this.isUpvoted()
    };
    return <Song { ...props } className='queue-song' action={action} />;
  }

}
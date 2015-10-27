import React from 'react';
import Parse from 'parse';
import { props, t } from 'tcomb-react';
import Song from './Song';


@props({
  id: t.Str,
  title: t.Str,
  artist: t.Str,
  upvotes: t.Num,
  index: t.Num,
  onChange: t.Func
})
export default class QueueSong extends React.Component {

  constructor(props) {
    super(props);
    this.animating = false;
  }

  toggleUpvote = (duration) => {
    const { id, onChange } = this.props;
    // update localStorage
    const item = this.isUpvoted() ? '' : 'voted';
    localStorage.setItem(id, item);
    // update Parse
    const action = this.isUpvoted() ? 'add' : 'remove';
    Parse.Cloud.run(`${action}Upvote`, { songId: id });
    // set animating to true for custon style
    this.setAnimating(true);
    setTimeout(() => this.setAnimating(false), duration * 1000);
    onChange(id, this.isUpvoted());
  }

  setAnimating = (value) => {
    this.animating = value;
    this.forceUpdate();
  }

  isUpvoted = () => localStorage.getItem(this.props.id) === 'voted'

  render() {
    const { onChange, ...props } = this.props;
    const { animating } = this;
    const action = {
      onClick: this.toggleUpvote,
      text: '+1',
      className: 'upvote',
      active: this.isUpvoted()
    };

    return <Song { ...props } animating={animating} className='queue-song' action={action} />;
  }

}
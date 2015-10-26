import React from 'react';
import Parse from 'parse';
import { props, t } from 'tcomb-react';
import Song from './Song';

const baseAnimationDuration = 0.3;

@props({
  id: t.Str,
  title: t.Str,
  artist: t.Str,
  upvotes: t.Num,
  onChange: t.Func
})
export default class QueueSong extends React.Component {

  constructor(props) {
    super(props);
    this.animating = false;
    this.state = {
      lastIndex: this.props.index,
      index: this.props.index
    };
  }

  toggleUpvote = () => {
    const { id, onChange } = this.props;
    // update localStorage
    const item = this.isUpvoted() ? '' : 'voted';
    localStorage.setItem(id, item);
    // update Parse
    const action = this.isUpvoted() ? 'add' : 'remove';
    Parse.Cloud.run(`${action}Upvote`, { songId: id });
    // refresh
    // this.forceUpdate();
    this.setAnimating(true);
    setTimeout(() => this.setAnimating(false), this.getDuration() * 1000);
    onChange(id, this.isUpvoted());
  }

  setAnimating = (value) => {
    this.animating = value;
    this.forceUpdate();
  }

  isUpvoted = () => localStorage.getItem(this.props.id) === 'voted'

  getDuration = () => {
    const { index, lastIndex } = this.state;
    const delta = Math.min(100, Math.abs(index - lastIndex)) - 1;
    return baseAnimationDuration + (0.02 * delta);
  }

  render() {
    const { onChange, index, ...props } = this.props;
    const { animating } = this;
    const action = {
      onClick: this.toggleUpvote,
      text: '+1',
      className: 'upvote',
      active: this.isUpvoted()
    };
    console.log(this.getDuration());
    const style = {
      transform: `translateY(${100 * this.state.index}%)`,
      WebkitTransition: `all ${this.getDuration()}s ease-in-out`,
      transition: `all ${this.getDuration()}s ease-in-out`,
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      zIndex: animating ? 999 : undefined,
      backgroundColor: animating ? '#EAEAEA' : undefined
    };
    return <Song { ...props } className='queue-song' action={action} style={style}/>;
  }

  componentWillReceiveProps(nextProps) {
    const { index } = nextProps;
    const { index: lastIndex } = this.props;
    if (index !== lastIndex) {
      setTimeout(() => this.setState({ index, lastIndex }));
    }
  }

}
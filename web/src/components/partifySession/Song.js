import React from 'react';
import { props, t } from 'tcomb-react';
import cx from 'classnames';
import { FlexView } from 'buildo-react-components/lib/flex';

require('./song.scss');

const baseAnimationDuration = 0.3;
const maxAnimationDuration = 3;
const songHeight = 61;
const offsetY = 400 + songHeight;
const accettableArea = 300; // +/- 100px still considered visible

@props({
  id: t.Str,
  title: t.Str,
  artist: t.Str,
  className: t.maybe(t.Str),
  style: t.maybe(t.Obj),
  upvotes: t.maybe(t.Num),
  index: t.Num,
  animating: t.maybe(t.Bool),
  action: t.struct({
    onClick: t.Func,
    text: t.Str,
    className: t.maybe(t.Str),
    active: t.maybe(t.Bool)
  })
})
export default class Song extends React.Component {

  constructor(props) {
    super(props);
    this.animating = false;
    this.state = {
      lastIndex: this.props.index,
      index: this.props.index
    };
  }

  getDuration = () => {
    const { index, lastIndex } = this.state;
    const delta = Math.max(0, Math.abs(index - lastIndex) - 1);
    return Math.min(maxAnimationDuration, baseAnimationDuration + (0.04 * delta));
  }

  isVisible = () => {
    const { scrollY, innerHeight } = window;
    const start = offsetY + ( this.state.index * songHeight);
    const lastStart = offsetY + ( this.state.lastIndex * songHeight);
    const end = lastStart + songHeight;
    const lastEnd = start + songHeight;

    const visible = (end > scrollY - accettableArea && start < scrollY + innerHeight + accettableArea);
    const lastVisible = (lastEnd > scrollY - accettableArea && lastStart < scrollY + innerHeight + accettableArea);
    return visible || lastVisible;
  }

  onClick = () => {
    this.props.action.onClick(this.getDuration());
  }

  render() {
    const { title, artist, className, action, upvotes, animating } = this.props;
    const { text, className: actionClassName, active } = action;

    const style = {
      transform: `translate3d(0,${100 * this.state.index}%,0)`,
      WebkitTransition: this.isVisible() ? `all ${this.getDuration()}s ease-in-out` : undefined,
      transition: this.isVisible() ? `all ${this.getDuration()}s ease-in-out` : undefined,
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      zIndex: animating ? 999 : undefined,
      backgroundColor: animating ? '#EAEAEA' : undefined,
      ...this.props.style
    };

    return (
      <FlexView className={cx('song', className)} style={style} vAlignContent='center'>
        <div className='info'>
          <div className='title'>{title}</div>
          <div className='artist'>{artist}</div>
        </div>

        <FlexView className='action-container' vAlignContent='center'>
          {typeof upvotes !== 'undefined' && `(${upvotes})`}
          <div onClick={this.onClick} className={cx('action', actionClassName, { active })}>
            {text}
          </div>
        </FlexView>
      </FlexView>
    );
  }

  componentWillReceiveProps(nextProps) {
    const { index } = nextProps;
    const { index: lastIndex } = this.props;
    if (index !== lastIndex) {
      // delay animation: wait for React to reorder elements in DOM
      setTimeout(() => this.setState({ index, lastIndex }));
    }
  }

}
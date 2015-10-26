import React from 'react';
import { props, t } from 'tcomb-react';
import cx from 'classnames';
import { FlexView } from 'buildo-react-components/lib/flex';

require('./song.scss');

@props({
  id: t.Str,
  title: t.Str,
  artist: t.Str,
  className: t.maybe(t.Str),
  style: t.maybe(t.Obj),
  upvotes: t.maybe(t.Num),
  action: t.struct({
    onClick: t.Func,
    text: t.Str,
    className: t.maybe(t.Str),
    active: t.maybe(t.Bool)
  })
})
export default class Song extends React.Component {

  render() {
    const { title, artist, className, action, style, upvotes } = this.props;
    const { onClick, text, className: actionClassName, active } = action;
    return (
      <FlexView className={cx('song', className)} style={style} vAlignContent='center'>
        <div className='info'>
          <div className='title'>{title}</div>
          <div className='artist'>{artist}</div>
        </div>

        <FlexView className='action-container' vAlignContent='center'>
          {typeof upvotes !== 'undefined' && `(${upvotes})`}
          <div onClick={onClick} className={cx('action', actionClassName, { active })}>
            {text}
          </div>
        </FlexView>
      </FlexView>
    );
  }

}
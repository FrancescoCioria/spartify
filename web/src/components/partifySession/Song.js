import React from 'react/addons';
import { props, t } from 'revenge';
import { FlexView } from 'revenge-react-components';
// import Parse from 'parse';

@props({
  id: t.Str,
  title: t.Str,
  artist: t.Str
})
export default class Song extends React.Component {

  toggleUpvote = () => {
    const item = this.isUpvoted() ? '' : 'voted';
    localStorage.setItem(this.props.id, item);
    this.forceUpdate();
  }

  isUpvoted = () => localStorage.getItem(this.props.id) === 'voted'

  render() {
    const { title, artist } = this.props;
    return (
      <FlexView className='song'>
        <p>{`${artist} - ${title}`}</p>
        <div style={{marginLeft: 'auto'}} onClick={this.toggleUpvote}>
          {this.isUpvoted() ? '+1' : '+0'}
        </div>
      </FlexView>
    );
  }

}
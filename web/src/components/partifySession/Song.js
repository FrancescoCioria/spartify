import React from 'react/addons';
import { props, t } from 'revenge';
import { FlexView } from 'revenge-react-components';
import Parse from 'parse';

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
      <FlexView className='song'>
        <p>{`${artist} - ${title}`}</p>
        <div style={{marginLeft: 'auto'}} onClick={this.toggleUpvote}>
          {this.isUpvoted() ? '+1' : '+0'}
        </div>
      </FlexView>
    );
  }

}
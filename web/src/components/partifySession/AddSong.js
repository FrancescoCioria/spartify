import React from 'react';
import { props, t} from 'revenge';
import axios from 'axios';
import cx from 'classnames';
import { Dropdown } from 'revenge-react-components';

const spotifySearch = (q) => `https://api.spotify.com/v1/search?q=${q}&type=track&market=IT`;

@props({
  // valueLink: t.Obj,
  onSave: t.Func,
  loading: t.maybe(t.Bool)
})
export default class AddSong extends React.Component {

  searchSpotify = (input, cb) => {
    if (input && input !== this.input) {
      const headers = {
        'Accept': 'application/json'
      };
      axios.get(spotifySearch(input), headers).then((res) => {
        this.options = res.data.tracks.items.map((track) => {
          return {
            title: track.name,
            artist: track.artists[0].name,
            href: track.uri,
            value: track.uri,
            label: track.name
          };
        });
        cb(null, { options: this.options });
      });
    } else if (!input) {
      cb(null, { options: [] });
    } else {
      cb(null, this.options);
    }
    this.input = input;
  }

  renderOption = (data) => {
    const { title, artist } = data;
    return (
      <div className='song-option'>
        <div className='title'>{title}</div>
        <div className='artist'>{artist}</div>
      </div>
    );
  }

  render() {
    const { loading, onSave } = this.props;
    return (
      <div className={cx('add-song', { loading })}>
        <Dropdown asyncOptions={this.searchSpotify} onChange={onSave} optionRenderer={this.renderOption} value='' />
      </div>
    );
  }

}
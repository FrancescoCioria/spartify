import React from 'react';
import { props, t } from 'tcomb-react';
import axios from 'axios';
import cx from 'classnames';
import { FlexView } from 'buildo-react-components/lib/flex';
import Dropdown from 'buildo-react-components/lib/dropdown';

require('./addSong.scss');

const spotifySearch = (q) => `https://api.spotify.com/v1/search?q=${q}&type=track&market=IT`;

@props({
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
        const { items } = res.data.tracks;
        this.options = items.map((track, i) => {
          return {
            title: track.name,
            artist: track.artists[0].name,
            href: track.uri,
            value: i + '',
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
      <div className={cx('add-song', { loading })} style={{ position: 'relative' }}>
        <div className='background-image'/>
        <FlexView style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} hAlignContent='center' vAlignContent='center' column>
          <Dropdown placeholder='Aggiungi...' filterOptions={options => options || []} asyncOptions={this.searchSpotify} optionRenderer={this.renderOption} onChange={onSave} value='' />
        </FlexView>
      </div>
    );
  }

}
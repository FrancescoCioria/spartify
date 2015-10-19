import React from 'react';

const Example = React.createClass({

  propTypes: {},

  getInitialState() {
    return {
      value: 'replace me with your component'
    };
  },

  render() {
    return (
      <div>
        <p>{this.state.value}</p>
      </div>
    );
  }

});

React.render(<Example />, document.getElementById('container'));
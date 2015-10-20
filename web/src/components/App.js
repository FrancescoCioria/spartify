import React from 'react/addons';
import { RouteHandler } from 'react-router-transition-context';

export default class App extends React.Component {

  render() {
    return (
      <div>
        <h1>Partify</h1>
        <RouteHandler />
      </div>
    );
  }

}
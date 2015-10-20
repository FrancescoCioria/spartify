import React from 'react/addons';
import { linkState } from 'revenge-react-components';
// import { Navigation } from 'react-router-transition-context';

export default class CodeVerificationRoute extends React.Component {

  constructor() {
    super();
    this.state = {};
  }

  onSubmit() {
    // const { code } = this.state;
    // if (code) {

    // }
  }

  render() {
    return (
      <div id='code-verification'>
        <form>
          <label>Inserisci codice</label>
          <input valueLink={linkState(this, 'code')}/>
          <button onClick={this.onSubmit}>INVIA</button>
        </form>
      </div>
    );
  }

}
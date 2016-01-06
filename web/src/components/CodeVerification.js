import React from 'react';
// import { linkState } from 'buildo-react-components/lib/link-state';

export default class CodeVerificationRoute extends React.Component {

  static contextTypes = {
    router: React.PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.context.router.replaceWith('PARTIFY_SESSION', { partySession: 'intro' });
  }

  onSubmit() {
    // const { code } = this.state;
    // if (code) {

    // }
  }

  render() {
    return null;
    // return (
    //   <div id='code-verification'>
    //     <form>
    //       <label>Inserisci codice</label>
    //       <input valueLink={linkState(this, 'code')}/>
    //       <button onClick={this.onSubmit}>INVIA</button>
    //     </form>
    //   </div>
    // );
  }

}
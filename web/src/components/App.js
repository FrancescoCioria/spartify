import React from 'react/addons';
import cx from 'classnames';
import { RouteHandler } from 'react-router-transition-context';
import { MobileDetector, FlexView } from 'revenge-react-components';

require('./main.scss');

export default class App extends React.Component {

  setClassesToDocument = (environment) => {
    const classes = {
      'is-mobile': environment.isMobile,
      'is-desktop': environment.isDesktop,
      'is-phone': environment.isPhone,
      'is-tablet': environment.isTablet
    };
    const { documentElement } = document;
    const re = new RegExp(Object.keys(classes).join('|'), 'g'); // regexp to select environment classes
    documentElement.className = cx(documentElement.className.replace(re, ''), classes).trim(); // remove old classes, add new ones
  }

  template = (env) => {
    this.setClassesToDocument(env);
    return (
      <div>
        <FlexView className='header' grow hAlignContent='center'>
          <h1>Spartify</h1>
        </FlexView>
        <FlexView className='page-content' hAlignContent='center'>
          <RouteHandler />
        </FlexView>
      </div>
    );
  }

  render() {
    return <MobileDetector>{this.template}</MobileDetector>;
  }

}
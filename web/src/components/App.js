import React from 'react';
import cx from 'classnames';
import { RouteHandler } from 'react-router';
import { FlexView } from 'buildo-react-components/lib/flex';
import MobileDetector from 'buildo-react-components/lib/mobile-detector';

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
          {
          //<h1>Spartify</h1>
          }
        </FlexView>
        <RouteHandler />
      </div>
    );
  }

  render() {
    return <MobileDetector>{this.template}</MobileDetector>;
  }

}
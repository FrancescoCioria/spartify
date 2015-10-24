import React from 'react';
import Parse from 'parse';
import { Route, DefaultRoute, create } from 'react-router-transition-context';
import App from './components/App';
import PartifySessionRoute from './components/partifySession/PartifySessionRoute';
import CodeVerification from './components/CodeVerification';

require('normalize-css/normalize.css');
require('buildo-react-components/lib/flex/flexView.css');
require('buildo-react-components/node_modules/react-select/dist/default.css');

Parse.initialize('f9wu4ZdFIMfE7CNlVKs9zj98Q9lOi0EPwB6tr0Fl', 'iDe9ae2ralCq1of41TdvbM5Td8eTjuXj1JxptwAU');

const routes = (
  <Route path='/' handler={App}>
    <DefaultRoute handler={CodeVerification} />
    <Route path='/:partySession' name='PARTIFY_SESSION' handler={PartifySessionRoute} />
  </Route>
);

const router = create({
  // transitionContext: alt,
  routes: routes
});

router.run((Handler) => {
  // RENDERS
  React.render(<Handler />, document.getElementById('app'));
});
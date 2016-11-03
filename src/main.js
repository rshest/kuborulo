import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.jsx';
import { Router, Route, browserHistory } from 'react-router';

ReactDOM.render((
  <Router history={browserHistory} >
    <Route name="Kuborulo" path="/" component={App}>
      <Route name="levels" path="/levels/:levelIndex" component={App} />
    </Route>
  </Router>
), document.getElementById('root')); 
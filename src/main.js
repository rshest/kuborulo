import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.jsx';
import { Router, Route, browserHistory } from 'react-router';

ReactDOM.render((
  <Router history={browserHistory} >
    <Route name="Kuborulo" path="/" component={App}/>
  </Router>
), document.getElementById('root')); 
import React from 'react';
import ReactDOM from 'react-dom';

import PuzzleView from './components/PuzzleView.jsx';
import Toolbar from './components/Toolbar.jsx';

class App extends React.Component {
  render() {    
    return (
      <div className="outer">
        <div className="container">
          <PuzzleView/>
        </div>
        <div className="container">
          <Toolbar/>
        </div>
      </div>
    );
  }
} 

ReactDOM.render(<App/>, document.getElementById('root'));




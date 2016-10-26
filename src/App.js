import React from 'react';
import ReactDOM from 'react-dom';

import PuzzleView from './PuzzleView.jsx';
import Toolbar from './Toolbar.jsx';

class App extends React.Component {
  render() {    
    return (
      <div>
        <Toolbar/>
        <PuzzleView/>
      </div>
    );
  }
} 

ReactDOM.render(<App/>, document.getElementById('root'));




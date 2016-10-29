import React from 'react';

import PuzzleView from './components/PuzzleView.jsx';
import Toolbar from './components/Toolbar.jsx';
 
const App = () =>
  <div className="outer">
    <div className="container">
      <PuzzleView/>
    </div>
    <div className="container">
      <Toolbar/>
    </div>
  </div>;
  
export default App;




import React, { PureComponent } from 'react';


import PuzzleView from './components/PuzzleView.jsx';
import Toolbar from './components/Toolbar.jsx';

export default class App extends PureComponent {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    return (
      <div className="outer">
        <div className="container">
          <PuzzleView ref={e => this.puzzleView = e} levelIndex={this.props.levelIndex} />
        </div>
        <div className="container">
          <Toolbar onSolve={() => this.puzzleView.solveLevel()} />
        </div>
      </div>
    );
  }
}

App.defaultProps = {
  levelIndex: 17
};



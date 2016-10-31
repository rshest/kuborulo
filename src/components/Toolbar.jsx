import React, {PureComponent} from 'react';

export default class Toolbar extends PureComponent {
  render() {    
    return (
      <div>
        <button className="toolbar-button" onClick={this.props.onSolve}>Solve</button>
      </div>
    );
  }
}
 
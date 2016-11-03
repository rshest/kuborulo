import React from 'react';

const Toolbar = ({onSolve}) =>
  ( 
    <div>
      <button className="toolbar-button" onClick={onSolve}>Solve</button>
    </div>
  );

export default Toolbar;
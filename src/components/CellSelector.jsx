import React, {Component} from 'react';
import THREE, {Vector3, Euler} from 'three';

import {CELL_SIDE, SEL_COLOR, SEL_OPACITY} from '../constants';

export default class CellSelector extends Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    const hs = CELL_SIDE*0.5; 
    const x = CELL_SIDE*this.props.cellX + hs;
    const y = CELL_SIDE*this.props.cellY + hs;

    return (
      <mesh
        position={new Vector3(x, 0.2, y)}
        rotation={new Euler(Math.PI/2, 0, 0, 'XYZ')}>
        <planeGeometry
          width={CELL_SIDE}
          height={CELL_SIDE}
          widthSegments={1}
          heightSegments={1}
          dynamic/>
        <meshBasicMaterial
          side={THREE.DoubleSide}
          transparent
          color={SEL_COLOR}
          opacity={SEL_OPACITY}>
          <texture
            url="img/selection.png"
            wrapS={THREE.RepeatWrapping}
            wrapT={THREE.RepeatWrapping}/>
        </meshBasicMaterial>
      </mesh>
    );
  }
}

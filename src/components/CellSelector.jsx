import React, {Component} from 'react';
import THREE, {Vector3, Euler} from 'three';

const CELL_SIDE = 20;

const SEL_COLOR = 0x33FF33;
const SEL_OPACITY = 0.7; 

export default class CellSelector extends Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    let x = CELL_SIDE*this.props.cellX;
    let y = CELL_SIDE*this.props.cellY;

    return (
      <mesh
        position={new Vector3(10, 0.2, 10)}
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

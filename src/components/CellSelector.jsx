import React from 'react';
import THREE from 'three';

const CELL_SIDE = 20;

const SEL_COLOR = 0x33FF00;
const SEL_OPACITY = 0.4;

class CellSelector extends React.Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    let x = CELL_SIDE*this.props.cellX;
    let y = CELL_SIDE*this.props.cellY;

    let uvs = [];
    return (
      <mesh
        position={new THREE.Vector3(x, 0.2, y)}
        rotation={new THREE.Euler(Math.PI/2, 0, 0, 'XYZ')}>
        <planeGeometry
          width={CELL_SIDE}
          height={CELL_SIDE}
          widthSegments={1}
          heightSegments={1}
          dynamic/>
        <meshBasicMaterial
          blending={THREE.NormalBlending}
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

export default CellSelector;
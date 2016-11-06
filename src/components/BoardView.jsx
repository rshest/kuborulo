import React, { PureComponent } from 'react';
import THREE, { Vector3 } from 'three';

import {
  CELL_SIDE, FACE_COLOR_ODD,
  FACE_COLOR_EVEN, BOARD_HEIGHT
} from '../constants';


export default class BoardView extends PureComponent {
  constructor(props, context) {
    super(props, context);
  }

  box(x, y) {
    const {width} = this.props.level;
    const key = x + y * width;
    const hs = CELL_SIDE * 0.5;
    const px = x * CELL_SIDE + hs;
    const py = y * CELL_SIDE + hs;
    const color = (x + y) % 2 == 1 ? FACE_COLOR_ODD : FACE_COLOR_EVEN;
    return (
      <mesh
        key={key}
        castShadow
        receiveShadow
        position={new Vector3(px, -BOARD_HEIGHT * 0.5, py)}
      >
        <boxGeometry
          width={CELL_SIDE}
          height={BOARD_HEIGHT}
          depth={CELL_SIDE} 
        />
        <meshLambertMaterial color={color}>
          <textureResource
            resourceId="texture"
          />
        </meshLambertMaterial>
      </mesh>
    );
  }

  render() {
    const {width, height} = this.props.level;
    var boxes = [];
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        boxes.push(this.box(i, j));
      }
    }
    return (
      <group>
        <resources>
          <texture
            resourceId="texture"
            url="img/board.png"
            wrapS={THREE.RepeatWrapping}
            wrapT={THREE.RepeatWrapping}
          />
        </resources>
        {boxes}
      </group>);
  }
}





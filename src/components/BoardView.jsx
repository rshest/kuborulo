import React, {Component} from 'react';
import THREE, {Vector3} from 'three';

const CELL_SIDE = 20;
const BOARD_HEIGHT = 20;
const FACE_COLOR_ODD = 0xAAAA77;
const FACE_COLOR_EVEN = 0xFFFFAA;

export default class BoardView extends Component {
  constructor(props, context) {
    super(props, context);
  }

  box(x, y) {
    const {width, height} = this.props.level;
    const key = x + y*width;
    const px = x*CELL_SIDE - (width  - 1)*CELL_SIDE*0.5;
    const py = y*CELL_SIDE - (height - 1)*CELL_SIDE*0.5;
    const color = (x + y)%2 == 1 ? FACE_COLOR_ODD : FACE_COLOR_EVEN;
    return (
      <mesh
        key={key}
        castShadow
        receiveShadow
        position={new Vector3(px, -BOARD_HEIGHT*0.5, py)}
        >
        <boxGeometry
          width={CELL_SIDE}
          height={BOARD_HEIGHT}
          depth={CELL_SIDE}/>
        <meshLambertMaterial
          color={color}>
          <texture
            url="img/board.png"
            wrapS={THREE.RepeatWrapping}
            wrapT={THREE.RepeatWrapping}
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
        boxes.push(this.box(j, i));
      }
    }
    return (<group>{boxes}</group>);
  }
}





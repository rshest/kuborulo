import React, {Component} from 'react';
import THREE, {Vector3} from 'three';

const CELL_SIDE = 20;
const BOARD_HEIGHT = 20;

export default class BoardView extends Component {
  constructor(props, context) {
    super(props, context);

    const level = {
      width:  8,
      height: 8,
      start:  {x: 0, y: 0},
      target: {x: 7, y: 0, faces: [0]}
    };

    this.state = {
      level: level
    };
  }

  box(x, y) {
    const [w, h] = [this.state.level.width, this.state.level.height];
    const key = x + y*w;
    const px = x*CELL_SIDE - (w - 1)*CELL_SIDE*0.5;
    const py = y*CELL_SIDE - (h - 1)*CELL_SIDE*0.5;
    const color = (x + y)%2 == 1 ? 0xAAAA77 : 0xFFFFAA;
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
    var boxes = [];
    for (let i = 0; i < this.state.level.width; i++) {
      for (let j = 0; j < this.state.level.height; j++) {
        boxes.push(this.box(j, i));
      }
    }
    return (<group>{boxes}</group>);
  }
}





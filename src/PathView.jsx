import React from 'react';
import THREE from 'three';
import {Board, MOVE_OFFSETS} from './Board';

const FRAME_UV_WIDTH = 0.25;
const PATH_COLOR = 0x779988;
const CELL_SIDE = 20;
const PATH_OPACITY = 0.7;

class PathView extends React.Component {
  constructor(props, context) {
    super(props, context);

    const level = {
      width:  8,
      height: 8,
      start:  {x: 0, y: 0},
      target: {x: 7, y: 0, faces: [0]}
    };

    let board = new Board(level);
    let sol = board.solve();
    this.state = {
      path: sol.result, 
      level: level
    };
  }


  makeUVs(path) {    
    const TRANS = [
      ([x, y]) => [x, y],
      ([x, y]) => [y, 1 - x],
      ([x, y]) => [1 - x, 1 - y],
      ([x, y]) => [1 - y, x]];

    const CONN = [
      [[0, 1], [1, 0], [0, 1], [1, 3], [3, 3]], 
      [[1, 2], [0, 0], [1, 3], [0, 0], [3, 2]],
      [[0, 1], [1, 1], [0, 1], [1, 2], [3, 1]], 
      [[1, 1], [0, 0], [1, 0], [0, 0], [3, 0]],
      [[2, 1], [2, 0], [2, 3], [2, 2], [0, 0]]];
    
    const CORNERS = [[0, 0], [1, 0], [1, 1], [0, 1]];
    const level = this.state.level;
    const [w, h] = [level.width, level.height];
    const size = w*h;

    let uvs = [];
    for (let i = 0; i < size; i++) {
      uvs.push([0, 0, 0], [0, 0, 0]);
    }

    let posx = level.start.x;
    let posy = level.start.y;

    const n = path.length;

    for (let i = 0; i <= n; i++) {
      const dir  = i < n ? path[i    ] - 1 : 4;
      const dir1 = i > 0 ? path[i - 1] - 1 : 4;
      
      if (i > 0) {
        const offs = MOVE_OFFSETS[dir1];
        posx += offs[0];
        posy += offs[1];
      }

      const [frame, rot] = CONN[dir1][dir]; 
      let uv = []; 
      for (let j = 0; j < CORNERS.length; j++) {
        let [x, y] = TRANS[rot](CORNERS[j]);
        x = (x + frame)*FRAME_UV_WIDTH;
        uv.push(new THREE.Vector2(x, y));
      }
      const idx = (h - posy - 1) + level.width*(w - posx - 1);

      uvs[idx*2    ] = [uv[3], uv[2], uv[0]];
      uvs[idx*2 + 1] = [uv[2], uv[1], uv[0]];      
    }
    return uvs;
  }

  render() {
    let uvs = [this.makeUVs(this.state.path)];
    const level = this.state.level;
    
    return (
      <mesh
        position={new THREE.Vector3(0, 0.1, 0)}
        rotation={new THREE.Euler(Math.PI/2, 0, 0, 'XYZ')}
        receiveShadow>
        <planeGeometry
          width={level.width*CELL_SIDE}
          height={level.height*CELL_SIDE}
          widthSegments={level.width}
          heightSegments={level.height}
          dynamic
          faceVertexUvs={uvs}/>
        <meshLambertMaterial
          side={THREE.DoubleSide}
          transparent
          color={PATH_COLOR}
          opacity={PATH_OPACITY}>
          <texture
            url="img/path.png"
            wrapS={THREE.RepeatWrapping}
            wrapT={THREE.RepeatWrapping}/>
        </meshLambertMaterial>
      </mesh>
    );
  }
}

export default PathView;
import React, {PureComponent} from 'react';

import THREE, {Vector3, Vector2, Euler} from 'three';
import {MOVE_OFFSETS} from '../model/Board';

import {CELL_SIDE, FRAME_UV_WIDTH, 
  PATH_COLOR, PATH_OPACITY} from '../constants';

export default class PathView extends PureComponent {
  constructor(props, context) {
    super(props, context);    
  }

  makeUVs() {  
    const TRANS = [
      ([x, y]) => [x, y],
      ([x, y]) => [y, 1 - x],
      ([x, y]) => [1 - x, 1 - y],
      ([x, y]) => [1 - y, x]];

    const CONN = [
      [[0, 0], [1, 1], [0, 0], [1, 0]], 
      [[1, 3], [0, 1], [1, 0], [0, 1]],
      [[0, 0], [1, 2], [0, 0], [1, 3]], 
      [[1, 2], [0, 1], [1, 1], [0, 1]],
      [[2, 2], [2, 1], [2, 0], [2, 3]]];
    
    const CORNERS = [[0, 0], [1, 0], [1, 1], [0, 1]];
    const {cellsX, cellsY, startX, startY, path} = this.props;
    const size = cellsX*cellsY;
      
    let uvs = [];
    for (let i = 0; i < size; i++) {
      uvs.push([[0, 0], [0, 0], [0, 0]], 
               [[0, 0], [0, 0], [0, 0]]);
    }

    const n = path.length;
    if (n == 0) {
      return uvs;
    }

    let posx = startX;
    let posy = startY;

    
    for (let i = 0; i < n; i++) {
      const dir  = path[i] - 1;
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
        uv.push(new Vector2(x, y));
      }
      const idx = posx + cellsX*(cellsY - posy - 1);

      uvs[idx*2    ] = [uv[3], uv[2], uv[0]];
      uvs[idx*2 + 1] = [uv[2], uv[1], uv[0]];      
    }

    return uvs;
  }

  onGeometryRef(planeGeometry) {
    //  workaround for uvsNeedUpdate not working in three.js r79
    if (planeGeometry != null) {
      planeGeometry.elementsNeedUpdate = true;
    }
  }

  render() {        
    const {cellsX, cellsY} = this.props;
    const x = cellsX*CELL_SIDE*0.5;
    const y = cellsY*CELL_SIDE*0.5;
    const uvs = [this.makeUVs()];

    return (
      <mesh
        position={new Vector3(x, 0.1, y)}
        rotation={new Euler(Math.PI/2, 0, 0, 'XYZ')}
        receiveShadow>
        <planeGeometry
          width={cellsX*CELL_SIDE} 
          height={cellsY*CELL_SIDE}
          widthSegments={cellsX} 
          heightSegments={cellsY}
          ref={this.onGeometryRef}
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
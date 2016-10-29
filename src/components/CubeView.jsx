import React, {Component} from 'react';
import THREE, {Euler, Quaternion, Vector3, Matrix4} from 'three';
import {Board, MOVE_OFFSETS, FACE_MOVEMENT} from '../model/Board';

import {CELL_SIDE, CUBE_COLOR, TOP_FACE_COLOR} from '../constants';
    
export default class CubeView extends Component {
  constructor(props, context) {
    super(props, context);

    const level = props.level;
    this.state = {
      x: level.start.x,
      y: level.start.y,
      face: level.start.faces !== undefined ? level.start.faces[0] : 0, 
      moveDir: 0,
      movePhase: 0,
      level: level
    };
  }

  pathAnim() {
    const level = this.props.level;
    const path = Board.textToPath(level.solution);
    
    let step = 0;
    let t = 0;
    let animate = () => {
      t += 0.05;
      let x = this.state.x;
      let y = this.state.y;
      let face = this.state.face;
      if (t > 1.0) {
        const dir = path[step] - 1;
        const [dx, dy] = MOVE_OFFSETS[dir];
        t = 0;
        step++;
        x += dx;
        y += dy;
        
        face = FACE_MOVEMENT[dir][face];
      }
      if (step >= path.length) {
        step = 0;
        x = level.start.x;
        y = level.start.y;
      }
      setTimeout(animate, 10);  
      this.setState({
        x: x,
        y: y,
        face: face,
        moveDir: path[step] - 1,
        movePhase: t
      });
      
    };

    setTimeout(animate, 10);
  }

  getRotationTransform(dir, t = 0) {
    const XZ_AXIS = [[0, -1], [1,  0], [0, 1], [-1, 0]];
    const [ax, az] = XZ_AXIS[dir];
    const angle = Math.PI*0.5*t;
    const axis = new Vector3(ax, 0, az);
    return new Matrix4().makeRotationAxis(axis, angle);
  }

  getOrientationTransform(face) {
    let tm = new Matrix4();
    let path = Board.orientPath(face);  
    for (let i = 0; i < path.length; i++) {
      tm.premultiply(this.getRotationTransform(path[i] - 1, 1));
    }
    return tm;
  }

  getTransform(cellX, cellY, dir = 0, face = 0, t = 0) {
    const XZ_DIR  = [[-1, 0], [0, -1], [ 1, 0], [0, 1]];
    const [dx, dz] = XZ_DIR[dir];

    const hs = CELL_SIDE*0.5;
    const x = cellX*CELL_SIDE + hs;
    const y = cellY*CELL_SIDE + hs;

    const shift = [dx*hs, hs, dz*hs];
    const unshift = [x - dx*hs, 0, y - dz*hs];
    
    let res = this.getOrientationTransform(face);
    res.premultiply(new Matrix4().makeTranslation(...shift));
    res.premultiply(this.getRotationTransform(dir, t));
    res.premultiply(new Matrix4().makeTranslation(...unshift));
    
    return res;
  }

  render() {
    const trans = this.getTransform(this.state.x, this.state.y, 
      this.state.moveDir, this.state.face, this.state.movePhase);
    const pos = new Vector3();
    const rot = new Quaternion();
    const scale = new Vector3();
    trans.decompose(pos, rot, scale);
    
    return (
      <group
        position={pos}
        quaternion={rot}>
        <mesh
          castShadow
          receiveShadow>
          <boxGeometry
            width={CELL_SIDE}
            height={CELL_SIDE}
            depth={CELL_SIDE}/>
          <meshLambertMaterial
            color={CUBE_COLOR}>
            <texture
              url="img/crate.png"
              wrapS={THREE.RepeatWrapping}
              wrapT={THREE.RepeatWrapping}
            />
          </meshLambertMaterial>
        </mesh>
        <mesh
          position={new Vector3(0, CELL_SIDE*0.5 + 0.05, 0)}
          rotation={new Euler(Math.PI/2, 0, 0, 'XYZ')}
          receiveShadow>
          <planeGeometry
            width={CELL_SIDE}
            height={CELL_SIDE}/>
          <meshLambertMaterial
            side={THREE.DoubleSide}
            transparent
            color={TOP_FACE_COLOR}>
            <texture
              url="img/marked-face.png"
              wrapS={THREE.RepeatWrapping}
              wrapT={THREE.RepeatWrapping}
            />
          </meshLambertMaterial>
        </mesh>
      </group>
    );
  }
}
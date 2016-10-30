import React, {Component} from 'react';
import Rx from 'rxjs';
import THREE, {Euler, Quaternion, Vector3, Matrix4} from 'three';
import {Board} from '../model/Board';

import {CELL_SIDE, CUBE_COLOR, TOP_FACE_COLOR} from '../constants';
    
export default class CubeView extends Component {
  constructor(props, context) {
    super(props, context);

    const level = props.level;
    const {x, y} = level.start;
    const face = level.start.faces !== undefined ? level.start.faces[0] : 0;
    this.state = {
      x, y, face,
      moveDir: 0,
      movePhase: 0,
      level: level
    };

    this.pathAnim({x, y, face}, Board.textToPath(level.solution));
  }

  animateRoll(x, y, face, moveDir, duration) {
    const PERIOD = 100;
    const dPhase = duration*1000/PERIOD;

    const source = Rx.Observable.timer(0, PERIOD)
      .timeInterval()
      .take(Math.ceil(duration/PERIOD));
    
    let movePhase = 0;
    let animate = () => {
      movePhase +=dPhase;
      if (movePhase > 1.0) {
        this.setState({movePhase: 1});
        return;
      }
      setTimeout(animate, PERIOD);  
      this.setState({x, y, face, moveDir, movePhase});  
    };
    setTimeout(animate, PERIOD);
  }

  pathAnim(pos, path) {
    Rx.Observable.from(path)
      .scan(Board.move, pos)
      .zip(Rx.Observable.interval(1000).timeInterval(),
           Rx.Observable.from(path))
      .subscribe(([{x, y, face}, {interval}, dir]) => 
        this.animateRoll(x, y, face, +dir, interval));
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

  getTransform(cellX, cellY, face = 0, moveDir = 0, movePhase = 0) {
    const XZ_DIR  = [[-1, 0], [0, -1], [ 1, 0], [0, 1]];
    const [dx, dz] = XZ_DIR[moveDir];

    const hs = CELL_SIDE*0.5;
    const x = cellX*CELL_SIDE + hs;
    const y = cellY*CELL_SIDE + hs;

    const shift = [dx*hs, hs, dz*hs];
    const unshift = [x - dx*hs, 0, y - dz*hs];
    
    let res = this.getOrientationTransform(face);
    res.premultiply(new Matrix4().makeTranslation(...shift));
    res.premultiply(this.getRotationTransform(moveDir, movePhase));
    res.premultiply(new Matrix4().makeTranslation(...unshift));
    
    return res;
  }

  render() {
    const {x, y, moveDir, face, movePhase} = this.state;
    const trans = this.getTransform(x, y, face, moveDir,movePhase);
    const pos = new Vector3();
    const rot = new Quaternion();
    const scale = new Vector3();
    trans.decompose(pos, rot, scale);
    
    return (
      <group position={pos} quaternion={rot}>
        <mesh castShadow receiveShadow>
          <boxGeometry 
            width={CELL_SIDE} height={CELL_SIDE} depth={CELL_SIDE}/>
          <meshLambertMaterial color={CUBE_COLOR}>
            <texture url="img/crate.png"/>
          </meshLambertMaterial>
        </mesh>
        <mesh
          position={new Vector3(0, CELL_SIDE*0.5 + 0.05, 0)}
          rotation={new Euler(Math.PI/2, 0, 0, 'XYZ')}
          receiveShadow>
          <planeGeometry width={CELL_SIDE} height={CELL_SIDE}/>
          <meshLambertMaterial
            side={THREE.DoubleSide} transparent color={TOP_FACE_COLOR}>
            <texture url="img/marked-face.png"/>
          </meshLambertMaterial>
        </mesh>
      </group>
    );
  }
}
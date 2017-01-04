import React, { PureComponent } from 'react';
import Rx from 'rxjs';
import { Euler, Quaternion, Vector3, Matrix4, DoubleSide } from 'three';
import { Board } from '../model/Board';

import { CELL_SIDE, CUBE_COLOR, TOP_FACE_COLOR, CUBE_ROLL_DURATION } from '../constants';

export default class CubeView extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      x: props.cubeX,
      y: props.cubeY,
      face: props.cubeFace,
      moveDir: 0, movePhase: 0
    };
  }

  componentWillUpdate(nextProps) {
    const {cubeX, cubeY} = this.props;
    const nx = nextProps.cubeX;
    const ny = nextProps.cubeY;
    const nface = nextProps.cubeFace;

    if (nx != cubeX || ny != cubeY) {
      const dir = Board.getDir(nx - cubeX, ny - cubeY);
      if (dir !== undefined) {
        this.animateRoll(nx, ny, nface, dir, CUBE_ROLL_DURATION);
      }
    }
  }

  animateRoll(x, y, face, dir, duration) {
    const revDir = Board.reverseDir(dir);
    const PERIOD = 10;
    const steps = Math.ceil(duration / PERIOD);

    this.setState({ x, y, face, movePhase: 1, moveDir: revDir - 1 });

    if (this.roll$ !== undefined) {
      this.roll$.unsubscribe();
    }

    this.roll$ = Rx.Observable
      .interval(PERIOD, Rx.Scheduler.requestAnimationFrame)
      .take(steps)
      .subscribe(i => {
        const movePhase = 1 - i * PERIOD / duration;
        const newState = {
          x, y, face,
          moveDir: revDir - 1, movePhase
        };
        this.setState(newState);
      },
      null,
      () => this.setState({ x, y, face, movePhase: 0 }));
  }

  getRotationTransform(dir, t = 0) {
    const XZ_AXIS = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    const [ax, az] = XZ_AXIS[dir];
    const angle = Math.PI * 0.5 * t;
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
    const XZ_DIR = [[-1, 0], [0, -1], [1, 0], [0, 1]];
    const [dx, dz] = XZ_DIR[moveDir];

    const hs = CELL_SIDE * 0.5;
    const x = cellX * CELL_SIDE + hs;
    const y = cellY * CELL_SIDE + hs;

    const shift = [dx * hs, hs, dz * hs];
    const unshift = [x - dx * hs, 0, y - dz * hs];

    let res = this.getOrientationTransform(face);
    res.premultiply(new Matrix4().makeTranslation(...shift));
    res.premultiply(this.getRotationTransform(moveDir, movePhase));
    res.premultiply(new Matrix4().makeTranslation(...unshift));

    return res;
  }

  render() {
    const {x, y, moveDir, face, movePhase} = this.state;
    const trans = this.getTransform(x, y, face, moveDir, movePhase);
    const pos = new Vector3();
    const rot = new Quaternion();
    const scale = new Vector3();
    trans.decompose(pos, rot, scale);

    return (
      <group position={pos} quaternion={rot}>
        <mesh castShadow receiveShadow>
          <boxGeometry
            width={CELL_SIDE} height={CELL_SIDE} depth={CELL_SIDE} 
          />
          <meshLambertMaterial color={CUBE_COLOR}>
            <texture url="img/crate.png" />
          </meshLambertMaterial>
        </mesh>
        <mesh
          position={new Vector3(0, CELL_SIDE * 0.5 + 0.05, 0)}
          rotation={new Euler(Math.PI / 2, 0, 0, 'XYZ')}
          receiveShadow
        >
          <planeGeometry width={CELL_SIDE} height={CELL_SIDE} />
          <meshLambertMaterial
            side={DoubleSide} transparent color={TOP_FACE_COLOR}
          >
            <texture url="img/marked-face.png" />
          </meshLambertMaterial>
        </mesh>
      </group>
    );
  }
}
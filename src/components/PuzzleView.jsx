import THREE, { Vector3, Vector2, Plane } from 'three';
import React, { PureComponent } from 'react';
import Rx from 'rxjs';
import React3 from 'react-three-renderer';

import { Board } from '../model/Board';

import PathView from './PathView.jsx';
import CubeView from './CubeView.jsx';
import CellMark from './CellMark.jsx';
import BoardView from './BoardView.jsx';

import levels from '../../data/levels.json';

import {
  CELL_SIDE, VIEW_WIDTH, VIEW_HEIGHT, LOOKAT_HEIGHT,
  LIGHT_OFFSET, BACKGROUND_COLOR, CAMERA_FOV,
  AMBIENT_COLOR, LIGHT_COLOR, CUBE_ROLL_DURATION,
  SEL_COLOR, SEL_OPACITY
} from '../constants';

export default class PuzzleView extends PureComponent {
  constructor(props, context) {
    super(props, context);

    let level = levels[props.levelIndex];
    if (level.solution === undefined) {
      let board = new Board(level);
      let sol = board.solve();
      level.solution = Board.pathToText(sol.result);
    }

    const {x, y} = level.start;
    const face = level.start.faces !== undefined ? level.start.faces[0] : 0;

    const {width, height} = level;
    const camDist = (Math.max(width, height) + 1) * CELL_SIDE * 1.2;

    this.state = {
      camLatitude: Math.PI * 0.5,
      camLongitude: 0.7,
      camDist,

      level: level,
      selectX: 0,
      selectY: 0,
      cubeX: x,
      cubeY: y,
      cubeFace: face,
      path: []
    };

    let down = false;
    let sx = 0, sy = 0;
    window.onmousedown = (e) => {
      const {cubeX, cubeY, cubeFace, selectX, selectY, path} = this.state;
      const pathPtIdx = Board.findPointOnPath(selectX, selectY, x, y, face, path);
      const dir = Board.getDir(selectX - cubeX, selectY - cubeY);
      const pos = { x: cubeX, y: cubeY, face: cubeFace };

      if (pathPtIdx >= 0) {
        // undo part of the path
        const unpath = path.slice(pathPtIdx).map(Board.reverseDir).reverse();
        this.pathAnim(pos, unpath, true);
      } else if (dir !== undefined) {
        //  move cube
        const {face} = Board.move(pos, dir);
        this.setState({
          cubeX: selectX, cubeY: selectY,
          cubeFace: face, path: [...path, dir]
        });
      } else {
        //  move camera
        down = true;
        sx = e.clientX;
        sy = e.clientY;
      }
    };
    
    window.onmouseup = () => down = false;

    let plane = new Plane(new Vector3(0, 1, 0), 0);
    let raycaster = new THREE.Raycaster();
    let mouse = new Vector2();
    let intersection = new Vector3();

    window.onmousemove = (e) => {
      e.preventDefault();

      if (down) {
        let dx = e.clientX - sx;
        let dy = e.clientY - sy;
        const camLatitude = this.state.camLatitude + dx * 0.01;
        let camLongitude = this.state.camLongitude - dy * 0.01;
        camLongitude = Math.min(Math.max(0.2, camLongitude), 1.2);

        this.setState({ camLatitude, camLongitude });
        sx += dx;
        sy += dy;
      } else {
        mouse.x = (e.clientX / VIEW_WIDTH) * 2 - 1;
        mouse.y = -(e.clientY / VIEW_HEIGHT) * 2 + 1;
        raycaster.setFromCamera(mouse, this.camera);
        if (raycaster.ray.intersectPlane(plane, intersection)) {
          const selectX = Math.floor(intersection.x / CELL_SIDE);
          const selectY = Math.floor(intersection.z / CELL_SIDE);
          if (selectX >= 0 && selectY >= 0 &&
            selectX < width && selectY < height) {
            this.setState({ selectX, selectY });
          }
        }
      }
    };

  }

  getCameraLookAt() {
    const {width, height} = this.state.level;
    return new Vector3(width * CELL_SIDE * 0.5, LOOKAT_HEIGHT, height * CELL_SIDE * 0.5);
  }

  getCameraPosition() {
    const lookAt = this.getCameraLookAt();
    const {camLatitude, camLongitude, camDist} = this.state;
    const sinLongitude = Math.sin(camLongitude);
    const pos = new Vector3(
      Math.cos(camLatitude) * sinLongitude * camDist + lookAt.x,
      Math.cos(camLongitude) * camDist + lookAt.y,
      Math.sin(camLatitude) * sinLongitude * camDist + lookAt.z);
    return pos;
  }

  solveLevel() {
    const {level} = this.state;
    const {x, y} = level.start;
    const face = level.start.faces !== undefined ? level.start.faces[0] : 0;
    this.setState({ cubeX: x, cubeY: y, cubeFace: face, path: [] });
    this.pathAnim({ x, y, face }, Board.textToPath(level.solution));
  }

  pathAnim(startPos, path, undo = false) {
    if (this.pathAnim$ !== undefined) {
      this.pathAnim$.unsubscribe();
    }
    this.pathAnim$ = Rx.Observable.from(path)
      .scan(Board.move, startPos)
      .zip(Rx.Observable.from(path),
      Rx.Observable.interval(CUBE_ROLL_DURATION).timeInterval())
      .subscribe(([pos, dir]) => {
        const curPath = this.state.path;
        const newPath = undo ? curPath.slice(0, -1) : [...curPath, +dir];
        this.setState({
          cubeX: pos.x,
          cubeY: pos.y,
          cubeFace: pos.face,
          path: newPath
        });
      });
  }

  render() {
    const {level, selectX, selectY,
      cubeX, cubeY, cubeFace,
      path} = this.state;
    const lookAt = this.getCameraLookAt();
    const lightPos = lookAt.clone().add(LIGHT_OFFSET);

    return (
      <React3
        width={VIEW_WIDTH}
        height={VIEW_HEIGHT}
        antialias
        pixelRatio={window.devicePixelRatio}
        mainCamera="mainCamera"
        onAnimate={this.onAnimate}
        sortObjects={false}
        shadowMapEnabled
        shadowMapType={THREE.PCFShadowMap}
        clearColor={BACKGROUND_COLOR}
      >
        <scene>
          <perspectiveCamera
            aspect={1}
            far={1000}
            fov={CAMERA_FOV}
            near={1}
            position={this.getCameraPosition()}
            lookAt={lookAt}
            name="mainCamera"
            ref={(cam) => this.camera = cam}
          />
          <ambientLight color={AMBIENT_COLOR} />
          <directionalLight
            color={LIGHT_COLOR}
            intensity={0.8}
            position={lightPos}
            lookAt={lookAt}

            castShadow
            shadowCameraNear={100}
            shadowCameraFar={500}
            shadowCameraLeft={-150}
            shadowCameraBottom={-150}
            shadowCameraRight={150}
            shadowCameraTop={150}
            shadowBias={0.002}
            shadowMapWidth={1024}
            shadowMapHeight={1024}
          />

          <BoardView level={level} />
          <PathView
            path={path}
            cellsX={level.width}
            cellsY={level.height}
            startX={level.start.x}
            startY={level.start.y}
          />
          <CellMark
            level={level}
            cellX={selectX}
            cellY={selectY}
            side={CELL_SIDE}
            color={SEL_COLOR}
            opacity={SEL_OPACITY}
          />
          <CubeView
            cubeX={cubeX}
            cubeY={cubeY}
            cubeFace={cubeFace}
          />
        </scene>
      </React3>
    );
  }
}


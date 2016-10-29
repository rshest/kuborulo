import THREE, {Vector3, Vector2, Plane} from 'three';
import React, {Component} from 'react';
import React3 from 'react-three-renderer';
import {Board} from '../model/Board';

import levels from '../../data/levels.json';


import PathView from './PathView.jsx';
import CubeView from './CubeView.jsx';
import CellSelector from './CellSelector.jsx';
import BoardView from './BoardView.jsx';

import {CELL_SIDE, VIEW_WIDTH, VIEW_HEIGHT, LOOKAT_HEIGHT,
  LIGHT_OFFSET, BACKGROUND_COLOR, CAMERA_FOV,
  AMBIENT_COLOR, LIGHT_COLOR} from '../constants';

export default class PuzzleView extends Component {
  constructor(props, context) {
    super(props, context);

    let level = levels[2];
    if (level.solution === undefined) {
      let board = new Board(level);
      let sol = board.solve();
      level.solution = Board.pathToText(sol.result);
      console.log(level.solution);
    } 

    const {width, height} = level;
    const camDist = (Math.max(width, height) + 1)*CELL_SIDE*1.2;

    this.state = {
      camLatitude: Math.PI*0.5,
      camLongitude: 0.7,
      camDist,

      level: level,
      selectX: 0,
      selectY: 0
    };

    let down = false;
    let sx = 0, sy = 0;
    window.onmousedown = (e) => {
      down = true; 
      sx = e.clientX; 
      sy = e.clientY;
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
        const camLatitude  = this.state.camLatitude + dx*0.01;
        let camLongitude = this.state.camLongitude - dy*0.01;
        camLongitude = Math.min(Math.max(0.2, camLongitude), 1.2);

        this.setState({camLatitude, camLongitude});
        sx += dx;
        sy += dy;
      } else {
        mouse.x =  (e.clientX/VIEW_WIDTH )*2 - 1;
        mouse.y = -(e.clientY/VIEW_HEIGHT)*2 + 1;
        raycaster.setFromCamera(mouse, this.camera);
        if (raycaster.ray.intersectPlane(plane, intersection)) {
          const selectX = Math.floor(intersection.x/CELL_SIDE);
          const selectY = Math.floor(intersection.z/CELL_SIDE);
          if (selectX >= 0 && selectY >= 0 && 
            selectX < width && selectY < height) 
          {
            this.setState({selectX, selectY});
          }
        }
      }
    };

  }

  getCameraLookAt() {
    const {width, height} = this.state.level;
    return new Vector3(width*CELL_SIDE*0.5,  LOOKAT_HEIGHT, height*CELL_SIDE*0.5);
  }

  getCameraPosition() {
    const lookAt = this.getCameraLookAt();
    const {camLatitude, camLongitude, camDist} = this.state;
    const sinLongitude = Math.sin(camLongitude);
    const pos = new Vector3(
      Math.cos(camLatitude )*sinLongitude*camDist + lookAt.x, 
      Math.cos(camLongitude)*camDist + lookAt.y, 
      Math.sin(camLatitude )*sinLongitude*camDist + lookAt.z);
    return pos;        
  }

  onAnimate() {
  }

  render() {
    const {level, selectX, selectY} = this.state;
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
        clearColor={BACKGROUND_COLOR}>
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
          <ambientLight color={AMBIENT_COLOR}/>
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
          
          <BoardView level={level}/>
          <PathView level={level}/>
          <CellSelector 
            level={level} 
            cellX={selectX} 
            cellY={selectY}/>
          <CubeView level={level}/>
        </scene>
      </React3>
    );
  }
}

 
import THREE, {Vector3, Vector2, Plane} from 'three';
import React, {Component} from 'react';
import React3 from 'react-three-renderer';
import {Board} from '../model/Board';



import PathView from './PathView.jsx';
import CubeView from './CubeView.jsx';
import CellSelector from './CellSelector.jsx';
import BoardView from './BoardView.jsx';

const WIDTH = 640;
const HEIGHT = 480;

const BACKGROUND_COLOR = 0xeeeecc;
const AMBIENT_COLOR = 0x555555;
const LIGHT_COLOR = 0xffffff;
const LOOKAT_HEIGHT = 25;


export default class PuzzleView extends Component {
  constructor(props, context) {
    super(props, context);

    // let level = {
    //   width:  8,
    //   height: 8,
    //   start:  {x: 0, y: 0},
    //   target: {x: 7, y: 0, faces: [0]},
    // };

    let level = {
      width:  8,
      height: 8,
      start:  {x: 2, y: 3, faces: [1]},
      target: {x: 2, y: 3},
    };

    let board = new Board(level);
    let sol = board.solve();
    level.solution = Board.pathToText(sol.result);

    this.state = {
      cameraPosition: new Vector3(-150, 200, 0),
      level: level
    };

    let that = this;
    let down = false;
    let sx = 0, sy = 0;
    let rot = -Math.PI;

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
        rot += dx*0.01;
        let cy = Math.min(300, Math.max(100, that.state.cameraPosition.y+dy));
        const newState = {
          cameraPosition: new Vector3(Math.cos(rot)*150, cy, Math.sin(rot)*150)
        };

        that.setState(newState);
        sx += dx;
        sy += dy;
      } else {
        
        mouse.x =  (e.clientX/WIDTH )*2 - 1;
        mouse.y = -(e.clientY/HEIGHT)*2 + 1;
        raycaster.setFromCamera(mouse, this.camera);
        if (raycaster.ray.intersectPlane(plane, intersection)) {
          //console.log(intersection);  
        }
      }
    };

  }

  render() {
    const {level} = this.state;
    return (
      <React3
        width={WIDTH}
        height={HEIGHT}
        antialias
        pixelRatio={window.devicePixelRatio}
        mainCamera="mainCamera"
        onAnimate={this._onAnimate}
        sortObjects={false}
        shadowMapEnabled
        shadowMapType={THREE.PCFShadowMap}
        clearColor={BACKGROUND_COLOR}>
        <scene>
          <perspectiveCamera
            aspect={1}
            far={1000}
            fov={45}
            near={1}
            position={this.state.cameraPosition}
            lookAt={new Vector3(0, LOOKAT_HEIGHT, 0)}
            name="mainCamera"
            ref={(cam) => this.camera = cam}
            />
          <ambientLight color={AMBIENT_COLOR}/>
          <directionalLight
            color={LIGHT_COLOR}
            intensity={0.8}
            position={new Vector3(-120, 200, -100)}
            lookAt={new Vector3(0, 0, 0)}

            castShadow
            shadowCameraNear={100}
            shadowCameraFar={500}
            shadowCameraLeft={-100}
            shadowCameraBottom={-100}
            shadowCameraRight={100}
            shadowCameraTop={100}
            shadowBias={0.002}
            shadowMapWidth={1024}
            shadowMapHeight={1024}
          />
          
          <BoardView level={level}/>
          <PathView level={level}/>
          <CellSelector level={level}/>
          <CubeView level={level}/>
        </scene>
      </React3>
    );
  }
}

 
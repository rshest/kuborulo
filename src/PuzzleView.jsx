import THREE from 'three';

import React from 'react';
import React3 from 'react-three-renderer';


import PathView from './PathView.jsx';
import CubeView from './CubeView.jsx';
import BoardView from './BoardView.jsx';


class PuzzleView extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      cameraPosition: new THREE.Vector3(-150, 200, 0),
      mouseInput: null,
      hovering: false,
      dragging: false,
    };

    this._cursor = {
      hovering: false,
      dragging: false,
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
    window.onmouseup = () => {down = false;};
    window.onmousemove = (e) => {
      if (down) {
        let dx = e.clientX - sx;
        let dy = e.clientY - sy;
        rot += dx*0.01;
        let cy = Math.min(300, Math.max(100, that.state.cameraPosition.y+dy));
        const newState = {
          cameraPosition: new THREE.Vector3(Math.cos(rot)*150, cy, Math.sin(rot)*150)
        };

        that.setState(newState);
        sx += dx;
        sy += dy;
      }
    };

  }

  render() {
    return (
      <React3
        width={640}
        height={480}
        antialias
        pixelRatio={window.devicePixelRatio}
        mainCamera="mainCamera"
        onAnimate={this._onAnimate}
        sortObjects={false}
        shadowMapEnabled
        shadowMapType={THREE.PCFShadowMap}
        clearColor={0xeeeecc}>
        <scene>
          <perspectiveCamera
            aspect={1}
            far={1000}
            fov={45}
            near={1}
            position={this.state.cameraPosition}
            lookAt={new THREE.Vector3(0, 25, 0)}
            name="mainCamera"/>
          <ambientLight color={0x555555}/>
          <directionalLight
            color={0xffffff}
            intensity={0.8}
            position={new THREE.Vector3(-120, 200, -100)}
            lookAt={new THREE.Vector3(0, 0, 0)}

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
          
          <BoardView/>
          <PathView/>
          <CubeView/>
        </scene>
      </React3>
    );
  }
}

export default PuzzleView;

 
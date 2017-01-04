import { Vector3, Euler, DoubleSide, RepeatWrapping } from 'three';
import React from 'react';

const CellMark = ({cellX, cellY, color, opacity, side}) => {
  const hs = side * 0.5;
  const x = side * cellX + hs;
  const y = side * cellY + hs;

  return (
    <mesh
      position={new Vector3(x, 0.2, y)}
      rotation={new Euler(Math.PI / 2, 0, 0, 'XYZ')}
    >
      <planeGeometry
        width={side}
        height={side}
        widthSegments={1}
        heightSegments={1}
        dynamic 
      />
      <meshBasicMaterial
        side={DoubleSide}
        transparent
        color={color}
        opacity={opacity}
      >
        <texture
          url="img/selection.png"
          wrapS={RepeatWrapping}
          wrapT={RepeatWrapping} 
        />
      </meshBasicMaterial>
    </mesh>
  );
};

export default CellMark;

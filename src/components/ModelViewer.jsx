import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useAnimations, useGLTF } from '@react-three/drei';

// MODEL COMPONENT
function Model({ dressColor, isRotating }) {
  const group = useRef();
  const { scene, animations } = useGLTF('/model/boy-model.glb');
  const { actions, names } = useAnimations(animations, group);

  // Dress color application
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        const meshName = child.name.toLowerCase();
        const materialName = child.material?.name?.toLowerCase();

        if (
          meshName.includes('object_9') ||
          materialName.includes('peoplecolors')
        ) {
          child.material = child.material.clone();
          child.material.color.set(dressColor);
        }
      }
    });
  }, [scene, dressColor]);

  // Start animation on mount unless rotating
  useEffect(() => {
    if (actions && names.length > 0) {
      if (!isRotating) {
        actions[names[0]]?.reset().play();
      } else {
        actions[names[0]]?.stop();
      }
    }
  }, [isRotating, actions, names]);

  // Rotate when requested
  useFrame(() => {
    if (isRotating && group.current) {
      group.current.rotation.y += 0.01;
    }
  });

  return <primitive ref={group} object={scene} scale={1.5} />;
}

// MAIN VIEWER
export default function ModelViewer() {
  const [tempColor, setTempColor] = useState('#ffffff');
  const [dressColor, setDressColor] = useState('#ffffff');
  const [isRotating, setIsRotating] = useState(false);

  const handleApplyColor = () => {
    setDressColor(tempColor);
  };

  return (
    <>
      {/* Controls Panel */}
      <div style={styles.panel}>
        <h3 style={styles.title}>🎨 Customize Model</h3>
        <label style={styles.label}>Pick Dress Color:</label>
        <input
          type="color"
          value={tempColor}
          onChange={(e) => setTempColor(e.target.value)}
          style={styles.colorPicker}
        />
        <div style={styles.buttonContainer}>
          <button onClick={handleApplyColor} style={styles.button}>OK</button>
          <button onClick={() => setIsRotating(true)} style={styles.button}>Rotate</button>
          <button onClick={() => setIsRotating(false)} style={styles.button}>Move</button>
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas style={{ height: '100vh', width: '100vw' }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} />
        <Suspense fallback={null}>
          <Model dressColor={dressColor} isRotating={isRotating} />
        </Suspense>
        <OrbitControls />
      </Canvas>
    </>
  );
}

// Responsive styles
const styles = {
  panel: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    zIndex: 10,
    background: 'rgba(255, 255, 255, 0.95)',
    padding: '16px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    fontFamily: 'sans-serif',
    width: 'calc(100vw - 40px)',
    maxWidth: '340px',
  },
  title: {
    marginBottom: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  label: {
    fontWeight: 'bold',
    fontSize: '14px',
  },
  colorPicker: {
    marginTop: '8px',
    width: '100%',
    height: '40px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    padding: '4px',
    backgroundColor: '#fff',
    cursor: 'pointer',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '12px',
  },
  button: {
    width: '100%',
    padding: '10px',
    fontSize: '14px',
    fontWeight: 'bold',
    borderRadius: '8px',
    border: 'none',
    background: '#007bff',
    color: 'white',
    cursor: 'pointer',
  },
};

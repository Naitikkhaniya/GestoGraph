import * as THREE from "three";

export function createParticleSystem(container) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  const count = 250;
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);

  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 6;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  const material = new THREE.PointsMaterial({
    color: 0x00ffff,
    size: 0.03,
    transparent: true,
    opacity: 0.85,
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  function update(forcesFn) {
    if (forcesFn) {
      forcesFn(positions, velocities);
      geometry.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
  }

  function destroy() {
    renderer.dispose();
    container.removeChild(renderer.domElement);
  }

  return {
    update,
    destroy,
    positions,
    velocities,
  };
}

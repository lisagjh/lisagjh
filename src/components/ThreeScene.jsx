import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ReflectiveObject() {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const meshRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // === Scene Setup ===
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      logarithmicDepthBuffer: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.8;
    containerRef.current.appendChild(renderer.domElement);

    // === Lighting ===
    scene.add(new THREE.AmbientLight(0xffffff, 0.1));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const pointLights = [
      { color: 0x64c1d8, pos: [3, 3, 3] },
      { color: 0xeeb384, pos: [-3, 2, -3] },
      { color: 0x64c1d8, pos: [0, -3, 3] },
    ];

    pointLights.forEach(({ color, pos }) => {
      const light = new THREE.PointLight(color, 0.8);
      light.position.set(...pos);
      scene.add(light);
    });
    

    // === Geometry & Material ===
    const geometry = new THREE.TorusKnotGeometry(1, 0.4, 128, 16);
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.01,
      roughness: 0.5,
      envMap: null,
      envMapIntensity: 0.5,
      clearcoat: 0.1,
      clearcoatRoughness: 0.1,
      transparent: false,
      transmission: 0.6,
      thickness: 0.5,
      ior: 5.8,
      iridescence: 10.0,
      iridescenceIOR: 10.5,
      iridescenceThicknessRange: [100, 400],
      sheenColor: new THREE.Color(0xaaddff),
      sheen: 0.1,
      specularIntensity: 0.1,
      specularColor: new THREE.Color(0xffffff),
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Store refs
    rendererRef.current = renderer;
    sceneRef.current = scene;
    cameraRef.current = camera;
    meshRef.current = mesh;

    // === Animation Loop ===
    const animate = () => {
      requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      if (mesh) {
        mesh.rotation.x += 0.0015;
        mesh.rotation.y += 0.0015;
        material.iridescenceIOR = 1.3 + Math.sin(time) * 0.2;
      }

      renderer.render(scene, camera);
    };
    animate();

    // === Resize Handling ===
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // === Cleanup ===
    return () => {
      window.removeEventListener("resize", handleResize);
      containerRef.current?.removeChild(renderer.domElement);

      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
      }}
    />
  );
}

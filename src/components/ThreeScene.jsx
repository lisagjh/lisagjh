import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ReflectiveObject() {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const meshRef = useRef(null);
  const geometryRef = useRef(null);
  const materialRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      logarithmicDepthBuffer: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.8;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Add point lights with different colors for iridescent effect
    const pointLight1 = new THREE.PointLight(0x64c1d8, 0.8);
    pointLight1.position.set(3, 3, 3);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xeeb384, 0.8);
    pointLight2.position.set(-3, 2, -3);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x64c1d8, 0.8);
    pointLight3.position.set(0, -3, 3);
    scene.add(pointLight3);

    // Create geometry - keep your torus knot
    const geometry = new THREE.TorusKnotGeometry(1, 0.4, 128, 16);

    // Create holographic material with no HDR environment map
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.01,
      roughness: 0.5,
      envMap: null, // Remove the HDR environment map
      envMapIntensity: 0.5, // Optional, if you want to simulate a simple reflection
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
    meshRef.current = mesh;

    geometryRef.current = geometry;
    materialRef.current = material;

    const animate = () => {
      requestAnimationFrame(animate);

      if (meshRef.current) {
        // Animate
        meshRef.current.rotation.x += 0.0015;
        meshRef.current.rotation.y += 0.0015;

        // Subtly animate material properties for holographic effect
        if (materialRef.current) {
          const time = Date.now() * 0.001;
          materialRef.current.iridescenceIOR = 1.3 + Math.sin(time) * 0.2;
        }
      }

      renderer.render(scene, camera);
    };

    animate(); // start animation after everything is ready

    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      if (meshRef.current) {
        meshRef.current.geometry.dispose();
        meshRef.current.material.dispose();
      }
      if (geometryRef.current) geometryRef.current.dispose();
      if (materialRef.current) materialRef.current.dispose();

      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        right: 0,
        top: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
      }}
    />
  );
}

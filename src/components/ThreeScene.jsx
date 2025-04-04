import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

export default function ReflectiveObject() {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const meshRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Set up the scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Set up camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Set up renderer with higher quality settings
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      logarithmicDepthBuffer: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio); // For high DPI displays
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add ambient and directional light for enhanced visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Load HDRI for environment map
    // Using a try-catch to handle potential loading issues
    const hdrLoader = new RGBELoader();
    hdrLoader.setDataType(THREE.HalfFloatType);

    try {
      // Fallback to a simple environment if HDR fails to load
      const defaultEnvMap = new THREE.CubeTextureLoader()
        .setPath("https://threejs.org/examples/textures/cube/MilkyWay/")
        .load([
          "dark-s_px.jpg",
          "dark-s_nx.jpg",
          "dark-s_py.jpg",
          "dark-s_ny.jpg",
          "dark-s_pz.jpg",
          "dark-s_nz.jpg",
        ]);

      scene.environment = defaultEnvMap;

      // Try loading the HDR
      hdrLoader.load(
        "/industrial_sunset_02_puresky_1k.hdr",
        (hdrEquirect) => {
          hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
          scene.environment = hdrEquirect;
        },
        undefined,
        (error) => {
          console.warn("HDR loading failed, using fallback environment", error);
        }
      );

      // Reduce polygon count to a balanced level
      const geometry = new THREE.TorusKnotGeometry(
        1, // radius
        0.4, // tube radius
        128, // tubular segments (reduced from 256)
        16 // radial segments (reduced from 32)
      );

      const material = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.9, // More metallic for better reflections
        roughness: 0.05, // Less roughness for smoother appearance
        envMapIntensity: 1.0, // Stronger reflections
        clearcoat: 1.0,
        clearcoatRoughness: 0.03,
        opacity: 1.0,
        transparent: true,
      });

      const torusGeometry = geometry;

      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      meshRef.current = mesh;

      // Position the camera
      camera.position.z = 5;

      let needsUpdate = true;

      // Remove the incorrect onChange call

      const animate = () => {
        requestAnimationFrame(animate);

        if (meshRef.current) {
          meshRef.current.rotation.x += 0.0015;
          meshRef.current.rotation.y += 0.0015;
          needsUpdate = true; // Mark for render
        }

        // Only render when needed
        if (needsUpdate) {
          renderer.render(scene, camera);
          needsUpdate = false;
        }
      };
      animate();
    } catch (error) {
      console.error("Error setting up scene:", error);
    }

    // Handle window resize
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener("resize", handleResize);

    // Cleanup on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      if (geometry) geometry.dispose();
      if (material) material.dispose();
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
        height: "100%", // Increased from 50% to full height
        zIndex: -1,
      }}
    />
  );
}

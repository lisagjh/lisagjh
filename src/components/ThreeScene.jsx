import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function ReflectiveObject() {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const meshRef = useRef(null);
  const lastInteractionRef = useRef(0);
  const ripplePosRef = useRef(new THREE.Vector3(0, 0, 0));
  const prevRipplePosRef = useRef(new THREE.Vector3(0, 0, 0));
  const isHoveringRef = useRef(false);

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
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // === Lighting ===
    scene.add(new THREE.AmbientLight(0xffffff, 0.1));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // === Shaders ===
    const vertexShader = `
      uniform float uTime;
      uniform vec3 uRipplePos;
      uniform float uRippleStrength;
      uniform float uRippleSpeed;
      uniform float uRippleSize;
      varying vec3 vNormal;
      varying vec3 vViewPosition;

      void main() {
        float dist = distance(position, uRipplePos);
        
        // Reduced amplitude for initial ripple effect
        float ripple = sin(dist * uRippleSize - uTime * uRippleSpeed) * 0.03 * uRippleStrength / (dist * 0.6 + 0.6);
        vec3 newPosition = position + normal * ripple;

        vec4 mvPosition = modelViewMatrix * vec4(newPosition, 0.8);
        vViewPosition = -mvPosition.xyz;
        vNormal = normalMatrix * normal;

        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = `
      uniform sampler2D uMatcap;
      varying vec3 vNormal;
      varying vec3 vViewPosition;

      void main() {
        vec3 viewDir = normalize(vViewPosition);
        vec3 x = normalize(vec3(viewDir.z, 0.0, -viewDir.x));
        vec3 y = cross(viewDir, x);
        vec2 uv = vec2(dot(x, vNormal), dot(y, vNormal)) * 0.5 + 0.5;

        vec3 color = texture2D(uMatcap, uv).rgb;
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    // Initialize uniforms with significantly reduced values for the initial state
    const uniforms = {
      uTime: { value: 0 },
      uRipplePos: { value: ripplePosRef.current },
      uMatcap: { value: null },
      uRippleStrength: { value: 0.05 }, // Significantly reduced from 0.15
      uRippleSpeed: { value: 2.0 }, // Reduced from 3.0 for slower, more subtle movement
      uRippleSize: { value: 10.0 }, // Reduced from 15.0 for wider, gentler ripples
    };

    // Load texture before creating material
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      "/light.jpg",
      (matcapTexture) => {
        // Modern Three.js uses .colorSpace instead of .encoding
        if (THREE.ColorManagement) {
          matcapTexture.colorSpace = THREE.SRGBColorSpace;
        } else {
          // Fallback for older Three.js versions
          matcapTexture.encoding = THREE.sRGBEncoding;
        }

        uniforms.uMatcap.value = matcapTexture;

        // Create geometry and material after texture is loaded
        const geometry = new THREE.TorusKnotGeometry(1, 0.4, 96, 16);
        const material = new THREE.ShaderMaterial({
          vertexShader,
          fragmentShader,
          uniforms,
          transparent: true,
        });

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        meshRef.current = mesh;

        // Start animation loop after mesh is created
        animate();
      },
      undefined,
      (error) => {
        console.error("Error loading matcap texture:", error);
      }
    );

    // === Mouse Interaction ===
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onMouseMove(event) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      if (meshRef.current) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(meshRef.current);

        if (intersects.length > 0) {
          // Store previous position before updating
          prevRipplePosRef.current.copy(ripplePosRef.current);
          ripplePosRef.current.copy(intersects[0].point);
          lastInteractionRef.current = Date.now();
          isHoveringRef.current = true;

          // Increase ripple values for interactive state
          uniforms.uRippleStrength.value = THREE.MathUtils.lerp(
            uniforms.uRippleStrength.value,
            0.8,
            0.1
          );

          // Speed up ripples during interaction
          uniforms.uRippleSpeed.value = THREE.MathUtils.lerp(
            uniforms.uRippleSpeed.value,
            3.0,
            0.1
          );

          // Increase ripple definition during interaction
          uniforms.uRippleSize.value = THREE.MathUtils.lerp(
            uniforms.uRippleSize.value,
            15.0,
            0.1
          );
        } else if (isHoveringRef.current) {
          // Just left the object
          isHoveringRef.current = false;
        }
      }
    }

    // Add mouseout handler for the entire window
    function onMouseOut() {
      isHoveringRef.current = false;
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseout", onMouseOut);

    // === Animation Loop ===
    const clock = new THREE.Clock();
    const animate = () => {
      if (!meshRef.current) return;

      requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      uniforms.uTime.value = elapsedTime;

      // Handle ripple parameters changes
      const timeSinceInteraction = Date.now() - lastInteractionRef.current;

      if (!isHoveringRef.current && timeSinceInteraction > 500) {
        // Gradually reduce ripple parameters back to minimal values
        uniforms.uRippleStrength.value = THREE.MathUtils.lerp(
          uniforms.uRippleStrength.value,
          0.05, // Return to minimal ripple
          0.03
        );

        uniforms.uRippleSpeed.value = THREE.MathUtils.lerp(
          uniforms.uRippleSpeed.value,
          2.0, // Slower in idle state
          0.03
        );

        uniforms.uRippleSize.value = THREE.MathUtils.lerp(
          uniforms.uRippleSize.value,
          10.0, // Wider, more gentle waves in idle state
          0.03
        );

        // Also interpolate the ripple position back to center when not hovering
        if (timeSinceInteraction > 2000) {
          const centerPos = new THREE.Vector3(0, 0, 0);
          ripplePosRef.current.lerp(centerPos, 0.01);
        }
      }

      // Update uniform with current ripple position
      uniforms.uRipplePos.value.copy(ripplePosRef.current);

      // Gentle rotation
      meshRef.current.rotation.x += 0.0015;
      meshRef.current.rotation.y += 0.0015;

      renderer.render(scene, camera);
    };

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
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseout", onMouseOut);
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      if (rendererRef.current) rendererRef.current.dispose();
      if (meshRef.current) {
        if (meshRef.current.geometry) meshRef.current.geometry.dispose();
        if (meshRef.current.material) meshRef.current.material.dispose();
      }
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

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ReflectiveObject() {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
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
      varying vec3 vNormal;
      varying vec3 vViewPosition;

      void main() {
        float dist = distance(position, uRipplePos);
        float ripple = sin(dist * 20.0 - uTime * 5.0) * 0.05 / max(dist, 0.5);
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

    // Initialize uniforms first with placeholder for the texture
    const uniforms = {
      uTime: { value: 0 },
      uRipplePos: { value: new THREE.Vector3(0, 0, 0) },
      uMatcap: { value: null },
    };

    // Load texture before creating material
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      // Use a relative path or import the texture properly for Astro
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
      undefined, // onProgress callback not needed
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
          uniforms.uRipplePos.value.copy(intersects[0].point);
        }
      }
    }

    window.addEventListener("mousemove", onMouseMove);

    // === Animation Loop ===
    const clock = new THREE.Clock();
    const animate = () => {
      if (!meshRef.current) return;

      requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      uniforms.uTime.value = elapsedTime;

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

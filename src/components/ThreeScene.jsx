import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function TranslucentGeometricFlower() {
  const containerRef = useRef(null);
  const [isInViewport, setIsInViewport] = useState(false);
  const animationRef = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    if (!containerRef.current || !isInViewport) return;
    
    // Setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(containerWidth, containerHeight);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      containerWidth / containerHeight,
      0.1,
      1000
    );
    camera.position.z = 8;
    
    // Simple ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    // Add directional light for highlights
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Custom shader for the translucent, iridescent material
    const vertexShader = `
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `;
    
    const fragmentShader = `
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      
      uniform float time;
      
      // Function to create iridescent effect based on viewing angle
      vec3 iridescentColor(float cosAngle) {
        // Create rainbow-like gradient based on angle
        float hue = 0.6 + 0.4 * cosAngle;
        
        // Simple HSV to RGB conversion
        vec3 rgb = clamp(abs(mod(hue * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
        
        // Make color more subtle and add blue tint
        rgb = mix(vec3(0.8, 0.9, 1.0), rgb, 0.3);
        
        return rgb;
      }
      
      void main() {
        // Calculate viewing angle
        vec3 viewDir = normalize(vViewPosition);
        float cosAngle = dot(vNormal, viewDir);
        
        // Add time-based variation to angle
        cosAngle = cosAngle * 0.5 + 0.5 + 0.1 * sin(time * 0.5);
        
        // Get base color from iridescent function
        vec3 color = iridescentColor(cosAngle);
        
        // Add highlight at grazing angles
        float rim = pow(1.0 - abs(cosAngle), 4.0);
        color += vec3(0.3, 0.4, 0.5) * rim;
        
        // Final color with transparency
        gl_FragColor = vec4(color, 0.4 + 0.1 * sin(time * 0.3));
      }
    `;
    
    // Create the flower group
    const flowerGroup = new THREE.Group();
    scene.add(flowerGroup);
    
    // Parameters for the flower
    const numPetals = 12;
    const radius = 2.5;
    
    // Create planes
    for (let i = 0; i < numPetals; i++) {
      // Calculate angle for this petal
      const angle = (i / numPetals) * Math.PI * 2;
      
      // Create shader material with unique time offset for each petal
      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          time: { value: 0.0 }
        },
        transparent: true,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      
      // Create a simple plane for each petal
      const geometry = new THREE.PlaneGeometry(3, 3);
      const plane = new THREE.Mesh(geometry, material);
      
      // Position and rotate the plane
      plane.position.x = Math.cos(angle) * radius * 0.2;
      plane.position.y = Math.sin(angle) * radius * 0.2;
      
      // Rotate to face the center and then add additional rotation
      plane.rotation.z = angle;
      
      // Add a slight tilt for more interesting overlaps
      plane.rotation.x = 0.2;
      plane.rotation.y = 0.1;
      
      // Add the plane to the flower group
      flowerGroup.add(plane);
    }
    
    // Animation
    let lastFrameTime = 0;
    const targetFPS = 30;
    const frameTime = 1000 / targetFPS;
    
    const animate = (currentTime) => {
      animationRef.current = requestAnimationFrame(animate);
      
      if (currentTime - lastFrameTime < frameTime) {
        return;
      }
      lastFrameTime = currentTime;
      
      const elapsedTime = currentTime * 0.001; // Convert to seconds
      
      // Update the time uniform for all petals
      flowerGroup.children.forEach((plane, i) => {
        plane.material.uniforms.time.value = elapsedTime + i * 0.2;
      });
      
      // Rotate the entire flower group slightly
      flowerGroup.rotation.z += 0.001;
      
      // Add a slight "breathing" animation
      const breathScale = 1.0 + 0.02 * Math.sin(elapsedTime * 0.5);
      flowerGroup.scale.set(breathScale, breathScale, breathScale);
      
      renderer.render(scene, camera);
    };
    
    if (isInViewport) {
      animationRef.current = requestAnimationFrame(animate);
    }
    
    // Handle resize
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (!containerRef.current) return;
        
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }, 300);
    };
    
    window.addEventListener("resize", handleResize);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      window.removeEventListener("resize", handleResize);
      
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      // Clean up resources
      flowerGroup.children.forEach(plane => {
        plane.geometry.dispose();
        plane.material.dispose();
      });
      
      renderer.dispose();
    };
  }, [isInViewport]);
  
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
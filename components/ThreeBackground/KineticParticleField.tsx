'use client';

// KINETIC CORE - 3D Kinetic Particle Field
// Subtle, high-performance particle network representing force vectors and kinetic momentum.

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface KineticParticleFieldProps {
  activityLevel?: 'IDLE' | 'WORK' | 'REST' | 'PR';
  density?: number;
  className?: string;
}

export const KineticParticleField: React.FC<KineticParticleFieldProps> = ({
  activityLevel = 'IDLE',
  density = 600,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const currentSpeedRef = useRef<number>(0.0008);

  useEffect(() => {
    // Check reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current) return;

    const width = containerRef.current.clientWidth || window.innerWidth;
    const height = containerRef.current.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.z = 240;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    if (containerRef.current.children.length === 0) {
      containerRef.current.appendChild(renderer.domElement);
    }

    // Generate Particle Field
    const particleCount = density;
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const baseColor = new THREE.Color('#38bdf8'); // electric blue
    const workColor = new THREE.Color('#00ff87'); // kinetic green
    const activeColor = activityLevel === 'WORK' ? workColor : baseColor;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 360;
      positions[i3 + 1] = (Math.random() - 0.5) * 360;
      positions[i3 + 2] = (Math.random() - 0.5) * 220;

      velocities[i3] = (Math.random() - 0.5) * 0.4;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.4;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.2;

      colors[i3] = activeColor.r;
      colors[i3 + 1] = activeColor.g;
      colors[i3 + 2] = activeColor.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle Material
    const material = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Subtle Vector Grid Lines
    const lineGeo = new THREE.BufferGeometry();
    const linePositions = new Float32Array(200 * 6);
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x1d293d,
      transparent: true,
      opacity: 0.25
    });
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lines);

    let angle = 0;

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      // Smoothly interpolate speed according to activity
      let targetSpeed = 0.0006;
      if (activityLevel === 'WORK') targetSpeed = 0.0022;
      else if (activityLevel === 'REST') targetSpeed = 0.0003;
      else if (activityLevel === 'PR') targetSpeed = 0.005;

      currentSpeedRef.current += (targetSpeed - currentSpeedRef.current) * 0.05;

      angle += currentSpeedRef.current;
      particles.rotation.y = angle * 0.7;
      particles.rotation.x = angle * 0.3;
      lines.rotation.y = angle * 0.7;
      lines.rotation.x = angle * 0.3;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.domElement.remove();
        rendererRef.current.dispose();
      }
      geometry.dispose();
      material.dispose();
      lineGeo.dispose();
      lineMat.dispose();
    };
  }, [activityLevel, density]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
};

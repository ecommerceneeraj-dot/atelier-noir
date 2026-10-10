import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Garment3DCanvasProps {
  silhouette?: 'tshirt' | 'hoodie' | 'jacket' | 'shirt' | 'trousers' | 'coord' | 'monolith';
  primaryColorHex?: string;
  roughness?: number;
  metalness?: number;
  interactive?: boolean;
  className?: string;
  label?: string;
}

export const Garment3DCanvas: React.FC<Garment3DCanvasProps> = ({
  silhouette = 'monolith',
  primaryColorHex = '#1A1A1E',
  roughness = 0.72,
  metalness = 0.14,
  interactive = true,
  className = '',
  label,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [activeFinish, setActiveFinish] = useState<'matte' | 'satin' | 'wireframe'>('matte');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglSupported(false);
      return;
    }

    const width = container.clientWidth || 480;
    const height = container.clientHeight || 480;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const canvasEl = renderer.domElement;
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglSupported(false);
    };
    const handleContextRestored = () => {
      setWebglSupported(true);
    };
    canvasEl.addEventListener('webglcontextlost', handleContextLost, false);
    canvasEl.addEventListener('webglcontextrestored', handleContextRestored, false);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 5.2);

    // Three-Point Studio Lighting per 3D spatial reference
    const ambientLight = new THREE.AmbientLight(0xd4d4d8, 0.65);
    scene.add(ambientLight);

    // Warm Key Light
    const keyLight = new THREE.DirectionalLight(0xfff5e4, 2.4);
    keyLight.position.set(3.5, 4.5, 4.0);
    scene.add(keyLight);

    // Cool Fill Light
    const fillLight = new THREE.DirectionalLight(0x8b9bb4, 1.1);
    fillLight.position.set(-4.0, 1.5, 2.5);
    scene.add(fillLight);

    // Sharp Champagne Rim Light from behind
    const rimLight = new THREE.SpotLight(0xc5a880, 3.2);
    rimLight.position.set(0, 3.5, -4.5);
    scene.add(rimLight);

    const group = new THREE.Group();
    scene.add(group);

    // Build an architectural draped cloth / garment form
    const baseColor = new THREE.Color(primaryColorHex);
    // Ensure exceedingly dark colors still show 3D pleat highlights
    if (baseColor.getHSL({ h: 0, s: 0, l: 0 }).l < 0.12) {
      baseColor.setHex(0x222228);
    }

    const material = new THREE.MeshPhysicalMaterial({
      color: baseColor,
      roughness: activeFinish === 'satin' ? 0.28 : roughness,
      metalness: activeFinish === 'satin' ? 0.35 : metalness,
      clearcoat: activeFinish === 'satin' ? 0.4 : 0.08,
      clearcoatRoughness: 0.5,
      wireframe: activeFinish === 'wireframe',
      side: THREE.DoubleSide,
    });

    const accentMaterial = new THREE.MeshStandardMaterial({
      color: 0xc5a880,
      roughness: 0.35,
      metalness: 0.75,
    });

    // Parametric draped garment sculpture based on silhouette
    const torsoGeom = new THREE.CylinderGeometry(
      silhouette === 'trousers' ? 0.62 : 0.88,
      silhouette === 'jacket' || silhouette === 'coord' ? 1.05 : 0.78,
      2.3,
      64,
      48,
      true
    );

    const posAttr = torsoGeom.attributes.position;
    const vertex = new THREE.Vector3();
    for (let i = 0; i < posAttr.count; i++) {
      vertex.fromBufferAttribute(posAttr, i);
      const angle = Math.atan2(vertex.z, vertex.x);
      const yNorm = (vertex.y + 1.15) / 2.3; // 0 bottom to 1 top

      // Architectural vertical pleats & organic cloth drape folds
      const pleatFreq = silhouette === 'trousers' ? 8 : 6;
      const pleatAmp = (1 - yNorm * 0.55) * 0.11;
      const fold = Math.sin(angle * pleatFreq + yNorm * 2.2) * pleatAmp;
      const secondaryFold = Math.cos(angle * (pleatFreq * 2) - yNorm * 3.0) * 0.03;

      // Compress front-to-back slightly for a tailored garment torso profile
      vertex.z *= 0.62;
      vertex.x += Math.cos(angle) * (fold + secondaryFold);
      vertex.z += Math.sin(angle) * (fold + secondaryFold);

      posAttr.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    torsoGeom.computeVertexNormals();

    const torsoMesh = new THREE.Mesh(torsoGeom, material);
    group.add(torsoMesh);

    // Architectural shoulders / sleeves or structured collar ring
    if (silhouette !== 'trousers') {
      const collarGeom = new THREE.TorusGeometry(0.56, 0.11, 24, 64);
      collarGeom.scale(1.15, 0.85, 0.72);
      const collarMesh = new THREE.Mesh(collarGeom, material);
      collarMesh.position.y = 1.14;
      collarMesh.rotation.x = Math.PI / 2 + 0.12;
      group.add(collarMesh);

      // Dropped architectural sleeves
      const leftSleeveGeom = new THREE.CylinderGeometry(0.28, 0.36, 1.35, 32, 16, true);
      const leftSleeve = new THREE.Mesh(leftSleeveGeom, material);
      leftSleeve.position.set(-1.02, 0.42, 0);
      leftSleeve.rotation.z = 0.42;
      group.add(leftSleeve);

      const rightSleeve = leftSleeve.clone();
      rightSleeve.position.set(1.02, 0.42, 0);
      rightSleeve.rotation.z = -0.42;
      group.add(rightSleeve);
    } else {
      // Tailored waistband ring for trousers
      const waistGeom = new THREE.CylinderGeometry(0.65, 0.65, 0.22, 48, 4, true);
      const waistMesh = new THREE.Mesh(waistGeom, accentMaterial);
      waistMesh.position.y = 1.15;
      group.add(waistMesh);
    }

    // Minimalist brutalist architectural framing ring
    const frameRingGeom = new THREE.TorusGeometry(1.75, 0.008, 16, 100);
    const frameRing = new THREE.Mesh(frameRingGeom, accentMaterial);
    frameRing.rotation.x = Math.PI / 2.3;
    frameRing.rotation.y = 0.25;
    group.add(frameRing);

    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let targetRotY = 0.35;
    let targetRotX = 0.08;

    const onPointerDown = (e: PointerEvent) => {
      if (!interactive) return;
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!interactive) return;
      if (isDragging) {
        const dx = e.clientX - prevX;
        const dy = e.clientY - prevY;
        targetRotY += dx * 0.01;
        targetRotX = Math.max(-0.45, Math.min(0.45, targetRotX + dy * 0.006));
        prevX = e.clientX;
        prevY = e.clientY;
      } else {
        // Subtle parallax tilt on hover
        const rect = canvasEl.getBoundingClientRect();
        const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 0.35;
        const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 0.2;
        if (!reducedMotion) {
          targetRotX = normY;
          targetRotY += normX * 0.02;
        }
      }
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    canvasEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 480;
      const newH = container.clientHeight || 480;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (!reducedMotion && !isDragging) {
        targetRotY += 0.0035;
        group.position.y = Math.sin(elapsed * 1.2) * 0.05;
      }

      // Smooth camera/object interpolation (damping)
      group.rotation.y += (targetRotY - group.rotation.y) * 0.08;
      group.rotation.x += (targetRotX - group.rotation.x) * 0.08;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      canvasEl.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', handleResize);
      canvasEl.removeEventListener('webglcontextlost', handleContextLost);
      canvasEl.removeEventListener('webglcontextrestored', handleContextRestored);
      torsoGeom.dispose();
      material.dispose();
      accentMaterial.dispose();
      renderer.dispose();
    };
  }, [silhouette, primaryColorHex, roughness, metalness, interactive, reducedMotion, activeFinish]);

  if (!webglSupported) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center bg-[#121215] border border-white/10 p-8 text-center ${className}`}
      >
        <p className="font-display text-sm tracking-widest uppercase text-[#F5F2EB]">
          3D GARMENT SILHOUETTE PREVIEW
        </p>
        <p className="mt-2 text-xs text-[#9A9A9E]">
          Static architectural fallback active (WebGL context unavailable on this device).
        </p>
      </div>
    );
  }

  return (
    <div className={`relative select-none overflow-hidden ${className}`}>
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        aria-label={label || 'Interactive 3D garment drape sculpture'}
      />

      {interactive && (
        <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
          <div className="px-3 py-1.5 bg-black/50 backdrop-blur-md border border-white/10 text-[11px] text-[#9A9A9E]">
            {label ? <span className="text-[#F5F2EB] mr-2">{label}</span> : null}
            <span>Drag to rotate 360°</span>
          </div>

          <div className="flex items-center gap-1 p-1 bg-black/60 backdrop-blur-md border border-white/10">
            {(['matte', 'satin', 'wireframe'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setActiveFinish(mode)}
                className={`px-2.5 py-1 text-[11px] uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 ${
                  activeFinish === mode
                    ? 'bg-[#C5A880] text-[#0B0B0C] font-semibold'
                    : 'text-[#9A9A9E] hover:text-[#F5F2EB]'
                }`}
              >
                {mode === 'wireframe' ? 'Mesh' : mode}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

"use client";

import { useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { TextureLoader } from "three";

const TEXTURE_BASE = "https://threejs.org/examples/textures/planets";

interface EarthProps {
  radius: number;
}

export function Earth({ radius }: EarthProps) {
  const cloudsRef = useRef<THREE.Mesh>(null);

  const [dayMap, normalMap, specularMap, cloudsMap] = useLoader(TextureLoader, [
    `${TEXTURE_BASE}/earth_atmos_2048.jpg`,
    `${TEXTURE_BASE}/earth_normal_2048.jpg`,
    `${TEXTURE_BASE}/earth_specular_2048.jpg`,
    `${TEXTURE_BASE}/earth_clouds_1024.png`,
  ]);

  dayMap.colorSpace = THREE.SRGBColorSpace;
  dayMap.anisotropy = 8;

  useFrame((_, delta) => {
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.012;
  });

  return (
    <group>
      <mesh>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshPhongMaterial
          map={dayMap}
          normalMap={normalMap}
          specularMap={specularMap}
          specular={new THREE.Color("#1a2a44")}
          shininess={18}
        />
      </mesh>

      <mesh ref={cloudsRef} scale={1.006}>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshPhongMaterial
          map={cloudsMap}
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </mesh>

      <mesh scale={1.04}>
        <sphereGeometry args={[radius, 64, 64]} />
        <shaderMaterial
          transparent
          side={THREE.BackSide}
          depthWrite={false}
          uniforms={{
            uColor: { value: new THREE.Color("#4ea8ff") },
          }}
          vertexShader={`
            varying vec3 vNormal;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            varying vec3 vNormal;
            uniform vec3 uColor;
            void main() {
              float intensity = pow(0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.4);
              gl_FragColor = vec4(uColor, 1.0) * intensity;
            }
          `}
        />
      </mesh>
    </group>
  );
}

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Simplified 6205 visual proportions (mm-like units)
const PITCH_R = 19.25;
const OUTER_TUBE = 5.6;
const INNER_TUBE = 3.4;
const BALL_R = 3.969;
const BALL_COUNT = 9;

interface Bearing6205Props {
  rpm: number;
  direction: "cw" | "ccw";
  isPlaying: boolean;
}

export default function Bearing6205({ rpm, direction, isPlaying }: Bearing6205Props) {
  const innerRef = useRef<THREE.Mesh>(null);
  const cageRef = useRef<THREE.Group>(null);
  const ballRefs = useRef<(THREE.Mesh | null)[]>([]);

  // Balls evenly spaced on pitch circle
  const ballPositions = useMemo(
    () =>
      Array.from({ length: BALL_COUNT }, (_, i) => {
        const a = (i / BALL_COUNT) * Math.PI * 2;
        return [Math.cos(a) * PITCH_R, 0, Math.sin(a) * PITCH_R] as const;
      }),
    [],
  );

  // Animation loop
  useFrame((_, delta) => {
    if (!isPlaying || rpm <= 0) return;

    const sign = direction === "cw" ? 1 : -1;
    const w = sign * (rpm / 60) * Math.PI * 2 * delta;

    // Inner ring rotates at shaft speed
    if (innerRef.current) innerRef.current.rotation.y += w;

    // Cage orbits at ~40% shaft speed (6205 approximation)
    if (cageRef.current) cageRef.current.rotation.y += w * 0.4;

    // Balls self-spin (visual approximation)
    for (const b of ballRefs.current) {
      if (b) b.rotation.x += w * 2.4;
    }
  });

  return (
    <group rotation={[Math.PI / 6, 0, 0]}>
      {/* Outer ring — stationary */}
      <mesh>
        <torusGeometry args={[PITCH_R, OUTER_TUBE, 32, 140]} />
        <meshBasicMaterial color="#75c8ff" wireframe={false} />
      </mesh>

      {/* Inner ring — rotates with shaft */}
      <mesh ref={innerRef}>
        <torusGeometry args={[PITCH_R, INNER_TUBE, 28, 120]} />
        <meshBasicMaterial color="#e2f2ff" wireframe={false} />
      </mesh>

      {/* Ball cage assembly — orbits at cage speed */}
      <group ref={cageRef}>
        {/* Cage ring */}
        <mesh>
          <torusGeometry args={[PITCH_R, 0.6, 8, 64]} />
          <meshBasicMaterial color="#f9c95d" />
        </mesh>

        {/* Rolling elements */}
        {ballPositions.map((pos, i) => (
          <mesh
            key={i}
            ref={(el) => {
              ballRefs.current[i] = el;
            }}
            position={[pos[0], pos[1], pos[2]]}
          >
            <sphereGeometry args={[BALL_R, 32, 32]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Simplified 6205 visual proportions (mm-like units)
const PITCH_R = 19.25;
const OUTER_TUBE = 5.6;
const INNER_TUBE = 3.4;
const BALL_R = 3.969;
const BALL_COUNT = 9;

// Exaggerated deflection scale so it's clearly visible in the viewport.
// Real 6205 deflection at 1 kN ≈ 13 µm — far too small to see,
// so we use a large multiplier for an obvious visual shift.
const DEFLECTION_PER_KN = 6;

interface Bearing6205Props {
  rpm: number;
  direction: "cw" | "ccw";
  isPlaying: boolean;
  /** Radial load in kN (applied downward, i.e. –Z in bearing plane) */
  loadForce?: number;
}

export default function Bearing6205({
  rpm,
  direction,
  isPlaying,
  loadForce = 0,
}: Bearing6205Props) {
  const innerRef = useRef<THREE.Mesh>(null);
  const cageRef = useRef<THREE.Group>(null);
  const ballRefs = useRef<(THREE.Mesh | null)[]>([]);
  const cageAngle = useRef(0);

  const deflection = loadForce * DEFLECTION_PER_KN; // scene-units

  // Balls evenly spaced on pitch circle
  const ballPositions = useMemo(
    () =>
      Array.from({ length: BALL_COUNT }, (_, i) => {
        const a = (i / BALL_COUNT) * Math.PI * 2;
        return { angle: a, x: Math.cos(a) * PITCH_R, z: Math.sin(a) * PITCH_R };
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
    cageAngle.current += w * 0.4;
    if (cageRef.current) cageRef.current.rotation.y = cageAngle.current;

    // Update ball squish under load — balls in the load zone (–Z) get compressed
    if (loadForce > 0) {
      for (let i = 0; i < ballRefs.current.length; i++) {
        const b = ballRefs.current[i];
        if (!b) continue;
        // Effective angle of this ball after cage rotation
        const a = ballPositions[i].angle + cageAngle.current;
        // Load zone factor: 1 at bottom (–Z), 0 at top (+Z)
        const loadZone = Math.max(0, -Math.sin(a));
        // Squish: compress radially, expand tangentially — heavy exaggeration
        const squish = 1 - loadZone * loadForce * 0.18;
        b.scale.set(1 + loadZone * loadForce * 0.10, squish, 1 + loadZone * loadForce * 0.10);
      }
    } else {
      // Reset scale when no load
      for (const b of ballRefs.current) {
        if (b) b.scale.set(1, 1, 1);
      }
    }

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

      {/* Inner ring — rotates with shaft, offset by deflection under load */}
      <mesh ref={innerRef} position={[0, 0, deflection]}>
        <torusGeometry args={[PITCH_R, INNER_TUBE, 28, 120]} />
        <meshBasicMaterial color="#e2f2ff" wireframe={false} />
      </mesh>

      {/* Ball cage assembly — orbits at cage speed, follows inner ring deflection */}
      <group ref={cageRef} position={[0, 0, deflection * 0.5]}>
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
            position={[pos.x, 0, pos.z]}
          >
            <sphereGeometry args={[BALL_R, 32, 32]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ))}
      </group>

      {/* Force arrow — shown when load > 0 */}
      {loadForce > 0 && (
        <group position={[0, 0, -(PITCH_R + OUTER_TUBE + 8)]}>
          {/* Arrow shaft */}
          <mesh position={[0, 0, -loadForce * 4]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[1.0, 1.0, loadForce * 8, 12]} />
            <meshBasicMaterial color="#ff4444" />
          </mesh>
          {/* Arrowhead */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[3, 6, 12]} />
            <meshBasicMaterial color="#ff4444" />
          </mesh>
        </group>
      )}
    </group>
  );
}

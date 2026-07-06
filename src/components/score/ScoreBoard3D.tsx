"use client";

import * as THREE from "three";
import { Suspense, useEffect, useRef, useState, type ComponentProps, type ComponentType } from "react";
import { Canvas, ThreeEvent, useFrame } from "@react-three/fiber";
import { useCursor, MeshReflectorMaterial, Image, Environment, Text3D } from "@react-three/drei";
import { useRouter, useParams } from "next/navigation";

const GOLDENRATIO = 1.61803398875;

type Text3DWithMaxWidthProps = ComponentProps<typeof Text3D> & {
  maxWidth?: number;
};
const T3D = Text3D as unknown as ComponentType<Text3DWithMaxWidthProps>;

interface FrameData {
  position: [number, number, number];
  rotation: [number, number, number];
  url: string;
  title: string;
  Etitle: string;
  name: string;
  Ename: string;
  score: string | null;
  Escore: string | null;
  number: string | null;
}

type ImageMesh = THREE.Mesh & {
  material: THREE.Material & { zoom?: number };
};

const images: FrameData[] = [
  { position: [0, 0, 1.5], rotation: [0, 0, 0], url: "/images/AC.png", title: "卫冕冠军", Etitle: "Defending Champion", name: "AC米兰", Ename: "A.C. Milan", score: null, Escore: null, number: null },
  { position: [1, 0, 1], rotation: [0, 0, 0], url: "/images/MC.png", title: "亚军", Etitle: "Second Runner-up", name: "曼城", Ename: "Manchester City F.C.", score: null, Escore: null, number: null },
  { position: [-2.15, 0, 1.5], rotation: [0, Math.PI / 2.5, 0], url: "/images/cantona.jpg", title: "卫冕金靴", Etitle: "Golden Boot", name: "坎通纳", Ename: "Cantona", score: "进球数", Escore: "Goals", number: "11" },
  { position: [-3, 0, 2.75], rotation: [0, Math.PI / 2.5, 0], url: "/images/essein.jpg", title: "卫冕脏王-1", Etitle: "Fouls King-1", name: "埃辛", Ename: "Essien", score: "黄牌数", Escore: "Yellow Cards", number: "3" },
  { position: [-3.5, 0, 4.3], rotation: [0, Math.PI / 2.5, 0], url: "/images/Puyol.jpg", title: "卫冕脏王-2", Etitle: "Fouls King-2", name: "普约尔", Ename: "Puyol", score: "黄牌数", Escore: "Yellow Cards", number: "3" },
  { position: [-3.5, 0, 5.5], rotation: [0, Math.PI / 2.5, 0], url: "/images/Koundé.jpg", title: "卫冕脏王-3", Etitle: "Fouls King-3", name: "孔德", Ename: "Koundé", score: "黄牌数", Escore: "Yellow Cards", number: "3" },
  { position: [2.4, 0, 1.5], rotation: [0, -Math.PI / 2.5, 0], url: "/images/Gullit.jpg", title: "卫冕助攻王", Etitle: "Best Assits", name: "古力特", Ename: "Gullit", score: "助攻数", Escore: "Assits", number: "7" },
  { position: [3.2, 0, 2.75], rotation: [0, -Math.PI / 2.5, 0], url: "/images/carlos.jpg", title: "卫冕脏王之王", Etitle: "Fouls God", name: "卡洛斯", Ename: "Carlos", score: "红牌数", Escore: "Red Cards", number: "2" },
];

export default function ScoreBoard3D() {
  return (
    <div className="scoreboard-container">
      <Suspense fallback={null}>
        <Canvas gl={{ alpha: false }} dpr={[1, 1.5]} camera={{ fov: 70, position: [0, 2, 15] }}>
          <color attach="background" args={["#191920"]} />
          <fog attach="fog" args={["#191920", 0, 15]} />
          <Environment preset="city" />
          <group position={[0, -0.5, 0]}>
            <Frames images={images} />
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
              <planeGeometry args={[50, 50]} />
              <MeshReflectorMaterial
                blur={[300, 100]} resolution={2048} mixBlur={1} mixStrength={40}
                roughness={1} depthScale={1.2} minDepthThreshold={0.4} maxDepthThreshold={1.4}
                color="#101010" metalness={0.5}
              />
            </mesh>
          </group>
        </Canvas>
      </Suspense>
    </div>
  );
}

function Frames({
  images: imgs,
  q = new THREE.Quaternion(),
  p = new THREE.Vector3(),
}: {
  images: FrameData[];
  q?: THREE.Quaternion;
  p?: THREE.Vector3;
}) {
  const ref = useRef<THREE.Group>(null);
  const clicked = useRef<THREE.Object3D | null>(null);
  const params = useParams();
  const slug = params.slug as string[] | undefined;
  const selectedId = slug?.[1];
  const router = useRouter();
  useEffect(() => {
    clicked.current = selectedId ? (ref.current?.getObjectByName(selectedId) ?? null) : null;
    if (clicked.current) {
      clicked.current.parent?.updateWorldMatrix(true, true);
      clicked.current.parent?.localToWorld(p.set(0, GOLDENRATIO / 2, 1.25));
      clicked.current.parent?.getWorldQuaternion(q);
    } else {
      p.set(0, 0, 5.5);
      q.identity();
    }
  }, [selectedId, p, q]);
  useFrame((state) => {
    state.camera.position.lerp(p, 0.025);
    state.camera.quaternion.slerp(q, 0.025);
  });
  return (
    <group
      ref={ref}
      onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); router.push(clicked.current === e.object ? "/review" : "/review/item/" + e.object.name); }}
      onPointerMissed={() => router.push("/review")}
    >
      {imgs.map((props) => <Frame key={props.url} {...props} />)}
    </group>
  );
}

function getSimpleUuid(s: string): string {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i);
    hash |= 0;
  }
  return "frame-" + Math.abs(hash).toString(36);
}

function Frame({
  url,
  c = new THREE.Color(),
  position,
  rotation,
  title,
  Etitle,
  name: displayName,
  Ename,
  score,
  Escore,
  number,
}: FrameData & { c?: THREE.Color }) {
  const [hovered, hover] = useState(false);
  const [rnd] = useState(() => Math.random());
  const image = useRef<ImageMesh>(null);
  const frame = useRef<THREE.Mesh>(null);
  const name = getSimpleUuid(url);
  useCursor(hovered);
  useFrame((state) => {
    if (!image.current?.material) return;
    image.current.material.zoom = 1 + Math.sin(rnd * 10000 + state.clock.elapsedTime / 3) / 2;
    image.current.scale.x = THREE.MathUtils.lerp(image.current.scale.x, 0.85 * (hovered ? 0.85 : 1), 0.1);
    image.current.scale.y = THREE.MathUtils.lerp(image.current.scale.y, 0.9 * (hovered ? 0.905 : 1), 0.1);
    const material = frame.current?.material;
    if (material instanceof THREE.MeshBasicMaterial) {
      material.color.lerp(c.set(hovered ? "orange" : "white"), 0.1);
    }
  });
  return (
    <group position={position} rotation={rotation}>
      <mesh
        name={name}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); hover(true); }}
        onPointerOut={() => hover(false)}
        scale={[1, GOLDENRATIO, 0.05]}
        position={[0, GOLDENRATIO / 2, 0]}
      >
        <boxGeometry />
        <meshStandardMaterial color="#151515" metalness={0.5} roughness={0.5} envMapIntensity={2} />
        <mesh ref={frame} raycast={() => null} scale={[0.9, 0.93, 0.9]} position={[0, 0, 0.2]}>
          <boxGeometry />
          <meshBasicMaterial toneMapped={false} fog={false} />
        </mesh>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image raycast={() => null} ref={image} position={[0, 0, 0.7]} url={url} />
      </mesh>
      <T3D maxWidth={0.1} font="/fonts/FZYaoTi_Regular.json" position={[0.55, GOLDENRATIO - 0.1, 0]} scale={0.1}>
        {title}
        <meshNormalMaterial />
      </T3D>
      <T3D maxWidth={0.1} font="/fonts/FZYaoTi_Regular.json" position={[0.55, GOLDENRATIO - 0.2, 0]} scale={0.05}>
        {Etitle}
        <meshNormalMaterial />
      </T3D>
      <T3D maxWidth={0.1} font="/fonts/FZYaoTi_Regular.json" position={[0.55, GOLDENRATIO - 0.4, 0]} scale={0.1}>
        {displayName}
        <meshNormalMaterial />
      </T3D>
      <T3D maxWidth={0.1} font="/fonts/FZYaoTi_Regular.json" position={[0.55, GOLDENRATIO - 0.5, 0]} scale={0.05}>
        {Ename}
        <meshNormalMaterial />
      </T3D>
      <T3D maxWidth={0.1} font="/fonts/FZYaoTi_Regular.json" position={[0.55, GOLDENRATIO - 0.7, 0]} scale={0.1}>
        {score}
        <meshNormalMaterial />
      </T3D>
      <T3D maxWidth={0.1} font="/fonts/FZYaoTi_Regular.json" position={[0.55, GOLDENRATIO - 0.8, 0]} scale={0.05}>
        {Escore}
        <meshNormalMaterial />
      </T3D>
      <T3D maxWidth={0.1} font="/fonts/FZYaoTi_Regular.json" position={[1.05, GOLDENRATIO - 0.75, 0]} scale={0.1}>
        {number}
        <meshNormalMaterial />
      </T3D>
    </group>
  );
}

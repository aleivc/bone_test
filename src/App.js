import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Box, Environment, OrbitControls, PerspectiveCamera, Html } from '@react-three/drei'
import { CCDIKHelper, CCDIKSolver } from 'three-stdlib'

export default function App() {
  return (
    <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 4], fov: 50 }}>
      <Html>why</Html>
      <Environment preset="city" />
      <PerspectiveCamera position={[0, 4, 53]} makeDefault />
      <OrbitControls />
      <Bones />
    </Canvas>
  )
}

function Bones(props) {
  const { nodes } = useGLTF('/simple.glb')
  const [selected, setSelected] = useState()

  const { scene } = useThree()

  const sceneRef = useRef()
  const ikTestRef = useRef()
  const meshRef = useRef()
  const boxRef = useRef()

  useEffect(() => {
    if (ikTestRef.current) return
    if (!scene) return
    if (!meshRef.current) return

    const OOI = {}

    scene.traverse((n) => {
      if (n.name === 'bone3') OOI.effector = n
      if (n.name === 'target') OOI.target = n

      if (n.name === 'cylinder') OOI.mainMesh = n
    })

    const iks = [
      {
        target: 5,
        effector: 4,
        links: [
          {
            index: 3
          },
          {
            index: 2
          },
          {
            index: 1
          }
        ]
      }
    ]

    const config = {
      mesh: OOI.mainMesh,
      target: OOI.target,
      iks
    }

    ikTestRef.current = new CCDIKSolver(meshRef.current, config.iks)
    scene.add(new CCDIKHelper(meshRef.current, config.iks))

    setSelected(config.target)
  }, [scene])

  useFrame(({ clock }) => {
    if (!ikTestRef.current) return
    ikTestRef.current.update()

    if (!selected) return
    selected.position.x = Math.cos(clock.elapsedTime) * 30

    if (!boxRef.current) return
    boxRef.current.position.copy(selected.position)
  })

  return (
    <>
      <group ref={sceneRef} {...props} dispose={null}>
        <primitive object={nodes.root} />
        <skinnedMesh
          name="cylinder"
          ref={meshRef}
          geometry={nodes.Geo.geometry}
          material={nodes.Geo.material}
          skeleton={nodes.Geo.skeleton}
        />
        <Box ref={boxRef} />
      </group>
    </>
  )
}

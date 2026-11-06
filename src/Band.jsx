import * as THREE from 'three'
import { useEffect, useRef, useState } from 'react'
import { extend, useThree, useFrame } from '@react-three/fiber'
import { useGLTF, useTexture, MeshTransmissionMaterial } from '@react-three/drei'
import { BallCollider, CuboidCollider, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'

extend({ MeshLineGeometry, MeshLineMaterial })

useGLTF.preload('/tag.glb')
useTexture.preload('/band.svg')
useTexture.preload('/Card.jpg')
useTexture.preload('/card-back.svg')

export default function Band({ maxSpeed = 50, minSpeed = 10 }) {
    const band = useRef()
    const fixed = useRef()
    const j1 = useRef()
    const j2 = useRef()
    const j3 = useRef()
    const card = useRef()

    const vec = new THREE.Vector3()
    const ang = new THREE.Vector3()
    const rot = new THREE.Vector3()
    const dir = new THREE.Vector3()

    // Physics properties for all segments
    const segmentProps = {
        type: 'dynamic',
        canSleep: true,
        colliders: false,
        angularDamping: 2,
        linearDamping: 2
    }

    // Load models and textures
    const { nodes, materials } = useGLTF('/tag.glb')
    const texture = useTexture('/band.svg')
    const cardTexture = useTexture('/Card.jpg')
    const backTexture = useTexture('/card-back.svg')
    texture.colorSpace = backTexture.colorSpace = THREE.SRGBColorSpace
    cardTexture.colorSpace = THREE.SRGBColorSpace

    const { width, height } = useThree((state) => state.size)
    const [curve] = useState(() => new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 4, 0), new THREE.Vector3(0, 3, 0), new THREE.Vector3(0, 2, 0), new THREE.Vector3(0, 1, 0)
    ]))


    const [dragged, drag] = useState(false)
    const [hovered, hover] = useState(false)

    // Link joints together forming a chain
    useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1])
    useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1])
    useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1])
    // Spherical joint connects the lanyard to the physical card
    useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.45, 0]])

    useEffect(() => {
        if (hovered) {
            document.body.style.cursor = dragged ? 'grabbing' : 'grab'
            return () => void (document.body.style.cursor = 'auto')
        }
    }, [hovered, dragged])

    useFrame((state, delta) => {
        // If being dragged, set the kinematic translation of the card manually to follow mouse/pointer
        if (dragged) {
            vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera)
            dir.copy(vec).sub(state.camera.position).normalize()
            vec.add(dir.multiplyScalar(state.camera.position.length()))

                ;[card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp())
            card.current?.setNextKinematicTranslation({
                x: vec.x - dragged.x,
                y: vec.y - dragged.y,
                z: vec.z - dragged.z
            })
        }

        // Fix jitter when the card is pulled too far by lerping joints smoothly
        if (fixed.current && j1.current && j2.current && j3.current) {
            const fixedT = fixed.current.translation()
            const j1T = j1.current.translation()
            const j2T = j2.current.translation()
            const j3T = j3.current.translation()

            if (fixedT && j1T && j2T && j3T) {
                ;[j1, j2].forEach((ref) => {
                    if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation())
                    const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())))
                    const alpha = Math.min(1, delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)))
                    ref.current.lerped.lerp(ref.current.translation(), alpha)
                })

                // Calculate path curve for the lanyard band
                curve.points[0].copy(j3T)
                curve.points[1].copy(j2.current.lerped)
                curve.points[2].copy(j1.current.lerped)
                curve.points[3].copy(fixedT)

                let pts = curve.getPoints(32)
                band.current.geometry.setPoints(pts)

                // Keep the card tilting mainly toward the camera/screen nicely
                ang.copy(card.current.angvel())
                rot.copy(card.current.rotation())
                card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z })
            }
        }
    })

    // curve.curveType = 'chordal'
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping

    return (
        <>
            <group position={[0, 4, 0]}>
                <RigidBody ref={fixed} {...segmentProps} type="fixed" />
                <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
                    <BallCollider args={[0.1]} />
                </RigidBody>
                <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
                    <BallCollider args={[0.1]} />
                </RigidBody>
                <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
                    <BallCollider args={[0.1]} />
                </RigidBody>

                <RigidBody
                    position={[2, 0, 0]}
                    ref={card}
                    {...segmentProps}
                    type={dragged ? 'kinematicPosition' : 'dynamic'}
                >
                    <CuboidCollider args={[0.8, 1.125, 0.01]} />
                    <group
                        scale={2.25}
                        position={[0, -1.2, -0.05]}
                        onPointerOver={() => hover(true)}
                        onPointerOut={() => hover(false)}
                        onPointerUp={(e) => {
                            e.target.releasePointerCapture(e.pointerId)
                            drag(false)
                        }}
                        onPointerDown={(e) => {
                            e.target.setPointerCapture(e.pointerId)
                            drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())))
                        }}
                    >
                        {/* The base translucent plastic card holder */}
                        <mesh geometry={nodes.card.geometry}>
                            <MeshTransmissionMaterial
                                clearcoat={1}
                                clearcoatRoughness={0.15}
                                iridescence={1}
                                iridescenceIOR={1}
                                iridescenceThicknessRange={[0, 2400]}
                                roughness={0.15}
                                transmission={1}
                                thickness={0.1}
                            />
                        </mesh>
                        <mesh position={[0, 0.523, 0.006]}>
                            <planeGeometry args={[0.7, 0.933]} />
                            <meshBasicMaterial map={cardTexture} toneMapped={false} />
                        </mesh>
                        <mesh position={[0, 0.523, 0]} rotation={[0, Math.PI, 0]}>
                            <planeGeometry args={[0.7, 0.933]} />
                            <meshBasicMaterial map={backTexture} toneMapped={false} />
                        </mesh>
                        {/* The top metallic clip */}
                        <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
                        <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
                    </group>
                </RigidBody>
            </group>

            <mesh ref={band} frustumCulled={false}>
                <meshLineGeometry />
                <meshLineMaterial
                    color="white"
                    depthTest={false}
                    resolution={[width, height]}
                    useMap
                    map={texture}
                    repeat={[-3, 1]}
                    lineWidth={1}
                />
            </mesh>
        </>
    )
}

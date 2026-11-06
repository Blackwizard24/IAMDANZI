# 3D Interactive Badge (Vercel Ship 24 Style)

This project replicates the dynamic, 3D interactive conference badge featured at Vercel Ship 24, utilizing React Three Fiber for WebGL rendering and Rapier for real-time physics simulation. The application generates a physically responsive lanyard attached to a glossy badge encasing a user-uploaded profile image.

## Features

- Real-time physics simulation using Rapier (Spherical and Rope Joints)
- Interactive drag-and-swing mechanics based on mouse pointer movements
- Customized lanyard rendering with procedural Catmull-Rom curve geometry
- Iridescent MeshTransmissionMaterial simulating a clear plastic badge holder
- Custom IAMDANZI lanyard texture and a technical profile on the reverse
- Performance optimizations enforcing minimum geometric distances to prevent floating-point NaN WebGL crashes

## Tech Stack

- React 18
- Vite
- Three.js
- React Three Fiber (@react-three/fiber)
- React Three Drei (@react-three/drei)
- React Three Rapier (@react-three/rapier)
- MeshLine (meshline)

## Preview
[3D Interactive Badge](https://3d-event-badge.netlify.app/)

## Getting Started

### Prerequisites

You will need Node.js installed in your environment.

### Installation

1. Clone or download the repository.
2. Navigate to the project directory:
   cd 3d-badge
3. Install the dependencies:
   npm install
4. Start the development server:
   npm run dev

The application will be served locally at http://localhost:5173

## Project Architecture

- /src/App.jsx: Sets up the main Three.js Canvas, lighting, and environmental reflections.
- /src/Band.jsx: The core component managing Rapier physics joints, the procedural generation of the lanyard, mouse interactions, and 3D modeling of the badge and metallic clip.
- /public: Contains static assets such as the 3D model tag.glb, user image Card.jpg, and the generated lanyard texture band.svg.

## Using in Your Own Project

Yes, you can easily use this 3D badge in your own React projects, such as a portfolio website!

### 1. Install Dependencies

In your target project, install the necessary Three.js and Rapier libraries:

npm install three @react-three/fiber @react-three/drei @react-three/rapier meshline

### 2. Copy the Core Component

Copy the `src/Band.jsx` file from this repository into your project's component directory.

### 3. Move the Assets

Copy the following files from the `public/` directory of this repo into your portfolio's `public/` (or equivalent static assets) folder:
- `tag.glb` (The 3D model of the clip and card holder)
- `Card.jpg` (Your profile picture)
- `band.svg` (The texture for the lanyard)

### 4. Implementation

Import and render the `<Band />` component inside a React Three Fiber `<Canvas>` wrapped with a Rapier `<Physics>` provider. Example:

```jsx
import { Canvas } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import Band from './components/Band' // Adjust path accordingly

export default function MyPortfolio() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas camera={{ position: [0, 0, 13], fov: 25 }}>
        <ambientLight intensity={Math.PI} />
        <Physics gravity={[0, -40, 0]} timeStep={1 / 60}>
          <Band maxSpeed={50} minSpeed={10} />
        </Physics>
        <Environment background blur={0.75}>
          <color attach="background" args={['#000']} />
          <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
        </Environment>
      </Canvas>
    </div>
  )
}
```

---

**Gadang Jatu Mahiswara**  
[My Portfolio](https://jmahiswara.my.id)


## Personalizing the badge

- Replace `public/Card.jpg` with your photo, keeping the exact capitalization. Both the loader and preload in `src/Band.jsx` must match if you rename it.
- Edit `public/band.svg` to change the IAMDANZI ribbon text.
- Edit `public/card-back.svg` to update the reverse; keep the accessible description in `src/App.jsx` in sync.
- The badge opens with the photo facing forward. Dragging moves the badge.
- The reverse lists four published projects supplied by the owner, plus ongoing projects and a cybersecurity interest. Add only verified projects, certifications and measurable achievements.
- Run `npm test` to catch missing assets and filename-case mismatches, then `npm run build` before deployment.


## Motion and contact

The introduction uses a brief entrance, project links respond to hover and keyboard focus, and section headings use CSS view timelines where supported. Content stays visible without view-timeline support. Badge rendering and physics pause off-screen; visitors can also pause manually. The OS reduced-motion preference replaces the 3D scene with a static photo and disables spatial CSS effects, including when the preference changes while browsing.

Motion guidance applied directly (no additional animation dependency):
- LottieFiles: https://github.com/LottieFiles/motion-design-skill/blob/main/skills/motion-design/SKILL.md
- iart-ai: https://github.com/iart-ai/web-animation-skills/blob/main/skills/micro-interaction/SKILL.md
- ibelick: https://github.com/ibelick/ui-skills/blob/main/skills/fixing-motion-performance/SKILL.md

Contact links use email and telephone URI schemes, plus @iamdanzi on Instagram. The supplied Instagram QR image is preserved in `public/iamdanzi_qr.png` and lazy-loaded. No contact form server is needed; email/call actions use the visitor's installed app.

import * as THREE from 'three'

const green = { dark: 0x132a13, hunter: 0x31572c, fern: 0x4f772d, palm: 0x90a955, lime: 0xecf39e }
const up = new THREE.Vector3(0, 1, 0)
const delta = new THREE.Vector3()
const point = p => new THREE.Vector3(p.x, -p.y, p.z ?? 1)

function abdomenTexture() {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#31572c'
    ctx.fillRect(0, 0, 256, 256)
    for (let row = 0; row < 5; row++) {
        ctx.beginPath()
        for (let x = 0; x <= 256; x++) {
            const y = 35 + row * 40 + 9 * Math.cos(x / 256 * Math.PI * 4 + row * .45)
            if (x === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
        }
        ctx.lineWidth = 4 + row % 3
        ctx.strokeStyle = row % 2 ? '#ecf39e' : '#90a955'
        ctx.stroke()
    }
    // Fine mottling follows the shell in UV space as the spider turns.
    for (let i = 0; i < 1400; i++) {
        const x = (i * 137.51) % 256, y = (i * i * 1.73) % 256
        ctx.fillStyle = i % 3 ? '#132a1330' : '#ecf39e50'
        ctx.fillRect(x, y, 1, 2)
    }
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
}

export function createCursorScene(canvas) {
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setClearColor(0, 0)
    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(0, 1, 0, -1, .1, 1000)
    camera.position.z = 300
    scene.add(new THREE.HemisphereLight(0xf5ffe4, green.hunter, 1.6))
    const key = new THREE.DirectionalLight(0xfff8d8, 2.5)
    key.position.set(-.6, .9, 1.8)
    scene.add(key)

    const resources = new Set()
    function keep(resource) { resources.add(resource); return resource }
    const sphere = keep(new THREE.SphereGeometry(1, 18, 12))
    const bone = keep(new THREE.CylinderGeometry(.72, 1, 1, 9))
    const fur = (color, props = {}) => keep(new THREE.MeshStandardMaterial({ color, roughness: .55, ...props }))
    const dark = fur(green.dark), hunter = fur(green.hunter), fern = fur(green.fern)
    const palm = fur(green.palm), lime = fur(green.lime)
    const eye = fur(green.dark, { roughness: .08, metalness: .45 })
    const abdomen = fur(0xffffff, { map: keep(abdomenTexture()) })
    const wing = fur(green.lime, { transparent: true, opacity: .54, depthWrite: false, roughness: .18 })
    const silk = fur(green.lime, { roughness: .22, transparent: true, opacity: .69 })
    const dew = fur(green.palm, { roughness: .08, metalness: .35 })
    function mesh(parent, geometry, material) {
        const item = new THREE.Mesh(geometry, material)
        parent.add(item)
        return item
    }
    function oval(parent, material, x, y, z, sx, sy, sz) {
        const item = mesh(parent, sphere, material)
        item.position.set(x, y, z)
        item.scale.set(sx, sy, sz)
        return item
    }

    const spider = new THREE.Group()
    scene.add(spider)
    const belly = oval(spider, abdomen, -10, 0, 11, 11, 17, 10)
    belly.rotation.z = Math.PI / 2
    oval(spider, hunter, 8, 0, 10, 10, 8, 7)
    for (const side of [-1, 1]) {
        oval(spider, fern, 16, side * 4.5, 8, 4, 2, 2.5)
        oval(spider, eye, 14, side * 3, 14, 3, 3, 2.8)
        oval(spider, lime, 15, side * 3 + .6, 16.4, .75, .65, .5)
        oval(spider, eye, 11, side * 6.5, 13, 1.6, 1.6, 1.6)
    }
    const shadowCanvas = document.createElement('canvas')
    shadowCanvas.width = shadowCanvas.height = 64
    const shadowCtx = shadowCanvas.getContext('2d')
    const shade = shadowCtx.createRadialGradient(32,32,2,32,32,31)
    shade.addColorStop(0,'rgba(19,42,19,.5)')
    shade.addColorStop(1,'rgba(19,42,19,0)')
    shadowCtx.fillStyle = shade
    shadowCtx.fillRect(0,0,64,64)
    const shadow = new THREE.Sprite(keep(new THREE.SpriteMaterial({
        map: keep(new THREE.CanvasTexture(shadowCanvas)), transparent:true, depthWrite:false,
    })))
    shadow.scale.set(59,42,1)
    scene.add(shadow)
    const legs = Array.from({ length: 8 }, () => ({
        bones: [mesh(scene, bone, hunter), mesh(scene, bone, fern), mesh(scene, bone, dark)],
        joints: [mesh(scene, sphere, palm), mesh(scene, sphere, hunter)],
    }))
    function connect(item, a, b, radius) {
        delta.subVectors(b, a)
        item.position.copy(a).lerp(b, .5)
        item.scale.set(radius, Math.max(.01, delta.length()), radius)
        item.quaternion.setFromUnitVectors(up, delta.normalize())
    }

    const fly = new THREE.Group()
    scene.add(fly)
    fly.scale.setScalar(1.45)
    oval(fly, dark, -2, 0, 0, 5, 2.8, 3)
    oval(fly, palm, 3, 0, 0, 3, 3.5, 3)
    for (const side of [-1, 1]) oval(fly, eye, 4.8, side * 2, 1, 1.7, 1.4, 1.4)
    for (const side of [-1,1]) {
        for (let i = 0; i < 3; i++) {
            const leg = oval(fly, dark, 2-i*2, side*3.4, -1, .55, 3.3, .5)
            leg.rotation.z = side*(i-1)*.4
        }
    }
    const wings = [-1, 1].map(side => oval(fly, wing, -3, side * 4.2, 2, 7, 3.5, .45))

    // A thread sags toward the page and catches light on its round cross-section.
    function strand(a, b) {
        const start = point(a), end = point(b)
        const middle = start.clone().lerp(end, .5)
        middle.y -= Math.min(12, start.distanceTo(end) * .06)
        middle.z = Math.max(.6, middle.z - 5)
        const curve = new THREE.QuadraticBezierCurve3(start, middle, end)
        return new THREE.TubeGeometry(curve, 14, .62, 5, false)
    }
    const threads = []
    function addThread(a, b) {
        const thread = mesh(scene, strand(a, b), silk)
        const bead = oval(thread, dew, (a.x+b.x)/2, -(a.y+b.y)/2-4, 2, 1.4, 1.4, 1.4)
        threads.push({ thread, bead })
        if (threads.length > 32) removeThread(threads.shift())
    }
    function removeThread({thread}) { scene.remove(thread); thread.geometry.dispose() }
    let live, lastTail, lastAnchor
    function clearWeb() {
        threads.splice(0).forEach(removeThread)
        if (live) { scene.remove(live); live.geometry.dispose(); live = null }
    }
    return {
        resize(width, height) {
            renderer.setSize(width, height, false)
            camera.right = width
            camera.bottom = -height
            camera.updateProjectionMatrix()
        },
        addThread, clearWeb,
        draw(body, poses, insect, anchor, showFly, resting, time, jump, bite) {
            const hop = Math.sin(Math.PI * jump / .5) * 10
            spider.position.set(body.x, -body.y, hop)
            spider.rotation.z = -body.heading
            shadow.position.set(body.x+3, -body.y-4, .15)
            shadow.material.rotation = -body.heading
            poses.forEach((pose, i) => {
                const joints = [pose.hip, pose.knee, pose.ankle, pose.foot].map(point)
                joints[0].z += hop
                joints[1].z += hop * .6
                legs[i].bones.forEach((item, j) => connect(item, joints[j], joints[j+1], [2, 1.65, .95][j]))
                legs[i].joints.forEach((item, j) => { item.position.copy(joints[j+1]); item.scale.setScalar(j ? 1.1 : 1.85) })
            })
            fly.visible = showFly && bite < 1
            fly.scale.setScalar(1.45 * (1 - bite))
            const mouthX = body.x + 16 * Math.cos(body.heading)
            const mouthY = body.y + 16 * Math.sin(body.heading)
            fly.position.set(
                insect.x + (mouthX - insect.x) * bite,
                -(insect.y + (mouthY - insect.y) * bite),
                resting ? 3 + bite * 6 : 12 + Math.sin(time*.02)*1.5,
            )
            fly.rotation.z = -insect.heading
            wings.forEach((part, i) => {
                const side = i ? 1 : -1
                part.rotation.z = side * (resting ? -.25 : -.55)
                part.rotation.x = side * (resting ? .18 : Math.sin(time*.18)*.85)
            })
            const tail = { x: body.x-23*Math.cos(body.heading), y: body.y-23*Math.sin(body.heading), z: 9+hop }
            if (!live || lastAnchor !== anchor || Math.abs(lastTail.x-tail.x)+Math.abs(lastTail.y-tail.y)+Math.abs(lastTail.z-tail.z) > .2) {
                const geometry = strand(anchor, tail)
                if (live) { live.geometry.dispose(); live.geometry = geometry }
                else live = mesh(scene, geometry, silk)
                lastAnchor = anchor
                lastTail = tail
            }
            renderer.render(scene, camera)
        },
        clear() { renderer.clear() },
        dispose() { clearWeb(); resources.forEach(resource => resource.dispose()); renderer.dispose() },
    }
}

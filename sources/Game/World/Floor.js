import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import MeshGridMaterial, { MeshGridMaterialLine } from '../Materials/MeshGridMaterial.js'
import { color, mix, output, positionGeometry, positionLocal, remap, remapClamp, smoothstep, texture, uniform, uv, vec3, vec4 } from 'three/tsl'

export class Floor
{
    constructor()
    {
        this.game = Game.getInstance()

        // this.setGrid()
        this.setGround()
        // this.setKeys()
        this.setPhysical()

        this.game.time.events.on('tick', () =>
        {
            this.update()
        }, 9)
    }

    setGround()
    {
        // console.log(this.game.resources.terrainModel.scene.children[0].geometry)
        const geometry = this.game.resources.terrainModel.scene.children[0].geometry
        // geometry.rotateX(- Math.PI * 0.5)

        const material = new THREE.MeshLambertNodeMaterial({ color: '#000000', wireframe: false })

        // Terrain data
        const terrainColor = texture(this.game.resources.terrainTexture, uv()).rgb

        /**
         * Color
         */
        const grassColorUniform = uniform(color('#e0e239'))
        const dirtColorUniform = uniform(color('#ffb869'))
        const waterSurfaceColorUniform = uniform(color('#00ffea'))
        const waterDepthColorUniform = uniform(color('#1800b2'))

        // Dirt color
        let baseColor = color(dirtColorUniform)

        // Grass
        baseColor = mix(baseColor, grassColorUniform, terrainColor.g)

        // Water
        baseColor = mix(baseColor, waterSurfaceColorUniform, smoothstep(terrainColor.b, 0, 0.1))
        baseColor = mix(baseColor, waterDepthColorUniform, smoothstep(0.1, 1, terrainColor.b))

        material.outputNode = this.game.materials.lightOutputNode(baseColor.rgb, this.game.materials.getTotalShadow(material))
        
        /**
         * Position
         */
        const depthUniform = uniform(1)
        material.positionNode = positionLocal.sub(vec3(0, terrainColor.b.mul(depthUniform), 0))

        this.ground = new THREE.Mesh(geometry, material)
        this.ground.receiveShadow = true
        this.game.scene.add(this.ground)

        // Debug

        if(this.game.debug.active)
        {
            const debugPanel = this.game.debug.panel.addFolder({
                title: '🪴 Ground',
                expanded: true,
            })

            this.game.debug.addThreeColorBinding(debugPanel, grassColorUniform.value, 'grassColor')
            this.game.debug.addThreeColorBinding(debugPanel, dirtColorUniform.value, 'dirtColorUniform')
            this.game.debug.addThreeColorBinding(debugPanel, waterSurfaceColorUniform.value, 'waterSurfaceColorUniform')
            this.game.debug.addThreeColorBinding(debugPanel, waterDepthColorUniform.value, 'waterDepthColorUniform')
        }
    }

    setKeys()
    {
        // Texture
        // this.game.resources.floorKeysTexture.magFilter = THREE.NearestFilter
        // this.game.resources.floorKeysTexture.minFilter = THREE.NearestFilter

        // Geometry
        const geometry = new THREE.PlaneGeometry(4, 1)

        // Material
        const material = new THREE.MeshBasicNodeMaterial({
            alphaMap: this.game.resources.floorKeysTexture,
            alphaTest: 0.5,
            transparent: true,
        })

        // Mesh
        this.keys = new THREE.Mesh(geometry, material)
        // this.keys.castShadow = true
        // this.keys.receiveShadow = true
        this.keys.scale.setScalar(3)
        this.keys.rotation.x = - Math.PI * 0.5
        this.keys.rotation.z = Math.PI * 0.5
        this.keys.position.y = 1
        this.keys.position.x = 4
        this.game.scene.add(this.keys)
    }

    setGrid()
    {
        const lines = [
            // new MeshGridMaterialLine(0x705df2, 1, 0.03, 0.2),
            // new MeshGridMaterialLine(0xffffff, 10, 0.003, 1),
            new MeshGridMaterialLine(0x423f25, 1, 0.03, 0.2),
            new MeshGridMaterialLine(0x696969, 10, 0.003, 1),
        ]

        const uvGridMaterial = new MeshGridMaterial({
            color: 0x1b191f,
            scale: 0.001,
            antialiased: true,
            reference: 'uv', // uv | world
            side: THREE.DoubleSide,
            lines
        })

        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(1000, 1000),
            uvGridMaterial
        )
        ground.position.y -= 0.02
        ground.rotation.x = - Math.PI * 0.5
        this.game.scene.add(ground)

        // Debug
        if(this.game.debug.active)
        {
            const debugPanel = this.game.debug.panel.addFolder({
                title: '🌐 Grid Floor',
                expanded: false,
            })

            debugPanel.addBinding(uvGridMaterial, 'scale', { min: 0, max: 0.002, step: 0.0001 })

            for(const line of lines)
            {
                const lineDebugPanel = debugPanel.addFolder({
                    title: 'Line',
                    expanded: false,
                })
                lineDebugPanel.addBinding(line.scale, 'value', { label: 'scale', min: 0, max: 1, step: 0.001 })
                lineDebugPanel.addBinding(line.thickness, 'value', { label: 'thickness', min: 0, max: 1, step: 0.001 })
                lineDebugPanel.addBinding(line.offset, 'value', { label: 'offset', min: 0, max: 1, step: 0.001 })
                lineDebugPanel.addBinding(line.cross, 'value', { label: 'cross', min: 0, max: 1, step: 0.001 })
                lineDebugPanel.addBinding({ color: '#' + line.color.value.getHexString(THREE.SRGBColorSpace) }, 'color').on('change', tweak => line.color.value.set(tweak.value))
            }
        }
    }

    setPhysical()
    {
        this.game.entities.add({
            type: 'fixed',
            friction: 0.25,
            restitution: 0,
            colliders: [ { shape: 'cuboid', parameters: [ 1000, 1, 1000 ], position: { x: 0, y: - 1.01, z: 0 } } ]
        })
    }

    update()
    {
        // // TODO: Mutualise formula as for grass
        // const offset = new THREE.Vector3(this.game.view.spherical.offset.x, 0, this.game.view.spherical.offset.z).setLength(80 / 2).negate()
        // this.ground.position.set(
        //     this.game.view.position.x,
        //     0,
        //     this.game.view.position.z
        // ).add(offset)
    }
}
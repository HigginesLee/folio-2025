import { color, float, Fn, max, PI, positionWorld, texture, uniform, uv, vec3 } from 'three/tsl'
import { Game } from '../Game.js'
import { References } from '../References.js'
import { MeshDefaultMaterial } from '../Materials/MeshDefaultMaterial.js'

export class Scenery
{
    constructor()
    {
        this.game = Game.getInstance()

        this.references = new References()
        const model = [...this.game.resources.sceneryModel.scene.children]
        for(const child of model)
        {
            // Add
            if(typeof child.userData.prevent === 'undefined' || child.userData.prevent === false)
            {
                // Objects
                this.game.objects.addFromModel(
                    child,
                    {

                    },
                    {
                        position: child.position,
                        rotation: child.quaternion,
                        sleeping: true,
                        mass: child.userData.mass
                    }
                )
            }

            this.references.parse(child)
        }

        this.setRoad()

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        })
    }
    
    setRoad()
    {
        this.road = {}

        // Mesh and material
        const mesh = this.references.items.get('road')[0]
        
        this.road.color = uniform(color('#383039'))
        this.road.middleLighten = uniform(0.1)
        this.road.glitterViewMultiplier = 0.01
        this.road.glitterVariation = uniform(0)
        this.road.glitterScarcity = uniform(100)
        this.road.glitterIntensity = uniform(0.3)
        this.road.glitterPerlinFrequency = uniform(0.05)
        this.road.glitterHashFrequency = uniform(0.2)

        const colorNode = Fn(() =>
        {
            const glitter = float(0)

            // Hash
            const hashUv = positionWorld.xz.mul(this.road.glitterHashFrequency)
            const hash = texture(this.game.noises.hash, hashUv).r.mul(2).add(this.road.glitterVariation).mod(2).sub(1).abs()
            glitter.addAssign(hash)

            // Scarcity
            glitter.assign(glitter.pow(this.road.glitterScarcity))

            // Intensity
            glitter.mulAssign(this.road.glitterIntensity)
            
            const perlinUv = positionWorld.xz.mul(this.road.glitterPerlinFrequency)
            const perlin = texture(this.game.noises.perlin, perlinUv).r
            glitter.mulAssign(perlin)

            const middle = uv().y.mul(PI).sin()
            glitter.mulAssign(middle)
            
            // Output
            const baseColor = this.road.color.toVar()
            baseColor.addAssign(glitter)

            return vec3(baseColor)
        })()

        const material = new MeshDefaultMaterial({
            colorNode: colorNode,

            hasLightBounce: false,
            hasWater: false,
        })
        mesh.material = material

        // // Physics
        // this.road.body = mesh.userData.object.physical.body
        // this.road.body.setEnabled(false)

        // Debug
        if(this.game.debug.active)
        {
            const debugPanel = this.game.debug.panel.addFolder({
                title: '🛣️ Road',
                expanded: false
            })
            this.game.debug.addThreeColorBinding(debugPanel, this.road.color.value, 'color')
            debugPanel.addBinding(this.road.glitterScarcity, 'value', { label: 'glitterScarcity', min: 0, max: 1, step: 0.001 })
            debugPanel.addBinding(this.road.glitterLighten, 'value', { label: 'glitterLighten', min: 0, max: 1, step: 0.001 })
            debugPanel.addBinding(this.road.middleLighten, 'value', { label: 'middleLighten', min: 0, max: 0.2, step: 0.001 })
        }
    }

    update()
    {
        this.road.glitterVariation.value += this.game.ticker.deltaScaled * 0.004 + this.game.view.delta.length() * 0.004
    }
}
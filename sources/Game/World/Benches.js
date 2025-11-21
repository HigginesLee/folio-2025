import { Game } from '../Game.js'
import { InstancedGroup } from '../InstancedGroup.js'

export class Benches
{
    constructor()
    {
        this.game = Game.getInstance()

        // Base and references
        const [ base, references ] = InstancedGroup.getBaseAndReferencesFromInstances(this.game.resources.benchesModel.scene.children)
        base.castShadow = true
        base.receiveShadow = true
        base.frustumCulled = true

        // Descriptions > To extract colliders
        const descriptions = this.game.objects.getFromModel(base, {}, {})
        
        // Update materials 
        this.game.materials.updateObject(base)

        // Physics
        for(const reference of references)
        {
            this.game.objects.add(
                {
                    model: reference,
                    updateMaterials: false,
                    parent: null,
                },
                {
                    type: 'dynamic',
                    position: reference.position,
                    rotation: reference.quaternion,
                    friction: 0.7,
                    mass: 0.1,
                    sleeping: true,
                    colliders: descriptions[1].colliders,
                    waterGravityMultiplier: - 1,
                    contactThreshold: 10,
                    onCollision: (force, position) =>
                    {
                        // this.game.audio.groups.get('hitMetal').playRandomNext(force, position)
                    }
                },
            )
        }

        // Instanced group
        this.testInstancedGroup = new InstancedGroup(references, base, true)
    }
}
import * as THREE from 'three/webgpu'
import { Game } from './Game.js'

export class Respawns
{
    constructor()
    {
        this.game = Game.getInstance()

        this.setItems()
    }

    setItems()
    {
        this.items = new Map()

        for(const child of this.game.resources.respawnsModel.scene.children)
        {
            child.rotation.reorder('YXZ')

            let name = child.name.replace(/^respawn(.+)$/i, '$1')

            name = name.charAt(0).toLowerCase() + name.slice(1)

            const item = {
                name: name,
                position: new THREE.Vector3(
                    child.position.x,
                    4,
                    child.position.z
                ),
                rotation: child.rotation.y
            }

            this.items.set(name, item)
        }
    }

    getByName(name)
    {
        const item = this.items.get(name)

        return item
    }

    getClosest(position)
    {
        let closestItem = null
        let closestDistance = Infinity

        this.items.forEach((item) =>
        {
            const distance = Math.hypot(item.position.x - position.x, item.position.z - position.z)

            if(distance < closestDistance)
            {
                closestDistance = distance
                closestItem = item
            }
        })

        return closestItem
    }
}
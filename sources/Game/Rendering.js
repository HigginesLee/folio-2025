import * as THREE from 'three/webgpu'
import { pass, mrt, output, emissive, renderOutput, vec4 } from 'three/tsl'
import { bloom } from 'three/addons/tsl/display/BloomNode.js'
import { Game } from './Game.js'
import { cheapDOF } from './Passes/cheapDOF.js'

export class Rendering
{
    constructor(readyCallback)
    {
        this.game = Game.getInstance()

        this.readyCallback = readyCallback

        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '📸 Rendering',
                expanded: false,
            })
        }

        this.setRenderer()
        this.setPostprocessing()

        this.game.ticker.events.on('tick', () =>
        {
            this.render()
        }, 998)

        this.game.viewport.events.on('change', () =>
        {
            this.resize()
        })
    }

    setRenderer()
    {
        this.renderer = new THREE.WebGPURenderer({ canvas: this.game.canvasElement, forceWebGL: false, antialias: true })
        this.renderer.setSize(this.game.viewport.width, this.game.viewport.height)
        this.renderer.setPixelRatio(this.game.viewport.pixelRatio)
        // this.renderer.sortObjects = false
        this.renderer.domElement.classList.add('experience')
        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap

        this.renderer
            .init()
            .then(this.readyCallback)
    }

    setPostprocessing()
    {
        this.postProcessing = new THREE.PostProcessing(this.renderer)

        const scenePass = pass(this.game.scene, this.game.view.camera)
        const scenePassColor = scenePass.getTextureNode('output')

        this.bloomPass = bloom(scenePassColor)
        this.bloomPass.threshold.value = 1
        this.bloomPass.strength.value = 0.25
        this.bloomPass.smoothWidth.value = 1

        // this.postProcessing.outputNode = scenePassColor.add(this.bloomPass)

        this.cheapDOFPass = cheapDOF(renderOutput(scenePass))

        this.postProcessing.outputNode = this.cheapDOFPass.add(this.bloomPass)

        // Debug
        if(this.game.debug.active)
        {
            const bloomPanel = this.debugPanel.addFolder({
                title: 'bloom',
                expanded: false,
            })

            bloomPanel.addBinding(this.bloomPass.threshold, 'value', { label: 'threshold', min: 0, max: 2, step: 0.01 })
            bloomPanel.addBinding(this.bloomPass.strength, 'value', { label: 'strength', min: 0, max: 3, step: 0.01 })
            bloomPanel.addBinding(this.bloomPass.radius, 'value', { label: 'radius', min: 0, max: 1, step: 0.01 })
            bloomPanel.addBinding(this.bloomPass.smoothWidth, 'value', { label: 'smoothWidth', min: 0, max: 1, step: 0.01 })

            const blurPanel = this.debugPanel.addFolder({
                title: 'blur',
                expanded: false,
            })

            blurPanel.addBinding(this.cheapDOFPass.strength, 'value', { label: 'strength', min: 0, max: 3, step: 0.01 })
        }
    }

    resize()
    {
        this.renderer.setSize(this.game.viewport.width, this.game.viewport.height)
        this.renderer.setPixelRatio(this.game.viewport.pixelRatio)
    }

    async render()
    {
        // await this.renderer.renderAsync(this.game.scene, this.game.view.camera)
        await this.postProcessing.renderAsync()

        if(this.game.monitoring?.stats)
        {
            this.game.rendering.renderer.resolveTimestampsAsync(THREE.TimestampQuery.RENDER)
            this.game.monitoring.stats.update()
        }
    }
}
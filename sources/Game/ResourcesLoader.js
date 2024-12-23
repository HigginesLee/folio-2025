import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import * as THREE from 'three/webgpu'

export class ResourcesLoader
{
    constructor()
    {
        this.loaders = new Map()
        this.cache = new Map()
    }

    getLoader(_type)
    {
        if(this.loaders.has(_type))
            return this.loaders.get(_type)

        let loader = null
        
        if(_type === 'texture')
            loader = new THREE.TextureLoader()
        else if(_type === 'gltf')
        {
            const dracoLoader = new DRACOLoader()
            dracoLoader.setDecoderPath('/draco/')
            dracoLoader.preload()
            
            loader = new GLTFLoader()
            loader.setDRACOLoader(dracoLoader)
        }

        this.loaders.set(_type, loader)

        return loader
    }

    load(_files, _callback = null)
    {
        let toLoad = _files.length
        const loadedResources = {}

        // Success callback
        const success = (_file, _resource) =>
        {
            toLoad--
            loadedResources[ _file.name ] = _resource
            this.cache.set(_file.path, _resource)
            
            if(toLoad === 0)
                _callback(loadedResources)
        }

        // Error callback
        const error = (_file) =>
        {
            console.log(`Resources > Couldn't load file ${_file.path}`)
        }

        // Each file
        for(const _file of _files)
        {
            // In cache
            if(this.cache.has(_file.path))
            {
                success(_file, this.cache.get(_file.path))
            }

            // Not in cache
            else
            {
                const loader = this.getLoader(_file.type)
                loader.load(
                    _file.path,
                    resource => { success(_file, resource) },
                    undefined,
                    // resource => { error(_file, resource) },
                )
            }
        }
    }
}
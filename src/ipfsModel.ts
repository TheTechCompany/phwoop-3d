import { Scene,TransformNode, SceneLoader, Vector3, Mesh } from "@babylonjs/core";

export class IPFSModelLoader{
    private _ipfs;

    private _models = {};

    constructor(ipfs){
        this._ipfs = ipfs;
    }

    public async getIPFSModel(cid){
        let startTime = new Date().getTime();
        console.log(`=> Loading IPFS Model from CID: ${cid}`)
        
        if(!this._models[cid]){
            let stream = this._ipfs.cat(cid)
            let chunks = Buffer.from('')

            for await(const chunk of stream){
                console.log(`Fetching chunk for CID: ${cid}`)
                chunks = Buffer.concat([chunks, chunk])
            }
            let endTime = new Date().getTime();
            console.log(`Finished fetching CID: ${cid} took ${(endTime - startTime) / 1000} seconds`)
            let blob = new Blob([chunks])
            let url = URL.createObjectURL(blob)
            
            this._models[cid] = url;
        }
        return this._models[cid];
    }

    public async getSTLModel(cid: String, scene: Scene, position: Vector3){
        let url = await this.getIPFSModel(cid);

        SceneLoader.LoadAssetContainer("", url, scene, (container) => {
            let rootNode = container.meshes[0];
            rootNode.checkCollisions = true

            for(var i = 0; i< container.meshes.length; i++){
                container.meshes[i].checkCollisions = true;
            }
            
            rootNode.isPickable = false

            scene.addMesh(rootNode, true)

            let tNode = new TransformNode(`ipfs-root-stl-${cid}`, scene)

            rootNode.parent = tNode;
            tNode.normalizeToUnitCube()
            tNode.scaling.scaleInPlace(30);

            scene.addTransformNode(tNode)
           // container.addAllToScene();
        }, null, null, ".stl")

    }

    public async getModel(parent: Mesh, cid: string, scene: Scene, position: Vector3, scaling?: number, rotation?: Vector3){
        
        let url = await this.getIPFSModel(cid);
        SceneLoader.LoadAssetContainer("", url, scene, (container) => {
            container.meshes[0].checkCollisions = true

            for(var i = 0; i < container.meshes.length; i++){
                container.meshes[i].checkCollisions = true
            }
            container.meshes[0].isPickable = false
            //container.meshes[0].position = position;
            //container.addAllToScene();

            scene.addMesh(container.meshes[0], true)
            let rootNode = new TransformNode(`ipfs-root-${cid}`, scene)
            if(parent)rootNode.parent = parent
            rootNode.position = position
            if(rotation) rootNode.rotation = rotation
            
            container.meshes[0].parent = rootNode;
            
            rootNode.normalizeToUnitCube()
            rootNode.scaling.scaleInPlace(scaling || 3)

//            scene.addTransformNode()
            scene.addTransformNode(rootNode)
            //rootNode.add
        }, null, null, ".glb")
    }
}
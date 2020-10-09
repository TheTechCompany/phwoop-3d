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
            //rootNode.checkCollisions = true

            for(var i = 0; i< container.meshes.length; i++){
               // container.meshes[i].checkCollisions = true;
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

    public async getModel(cid: string, scene: Scene, cb, checkCollisions?: boolean){
        
        let url = await this.getIPFSModel(cid);
        SceneLoader.ImportMesh(null, "", url, scene, (meshes, particles, skeletons, animationGroups) => {
            let mesh = meshes[0];
            mesh.isVisible = false;
            mesh.isPickable = false;
            mesh.checkCollisions = checkCollisions;

            for(var i = 0; i < meshes.length; i++){
                meshes[i].isPickable = false;
                meshes[i].isVisible = true;
                //meshes[i].checkCollisions = checkCollisions
            }
            cb(null, mesh)
        }, (e) => {
            //onProgress
            console.log(e)
        }, null, ".glb")
     
    }
}
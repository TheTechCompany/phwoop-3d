import { Scene, TransformNode } from "@babylonjs/core";
import { IPFSModelLoader } from "../ipfsModel";

export class ModelEngine{

    private _ipfs: IPFSModelLoader;
    private _scene: Scene;

    private _models = {}

    constructor(scene: Scene, ipfs: IPFSModelLoader){
        this._ipfs = ipfs;
        this._scene = scene;
    }

    public async instanceModel(cid, cb, checkCollisions?: boolean){
        console.log("Instancing Model: "+ cid)
        await this.loadModel(cid, (err, mesh) => {
            let d = new Date();
            mesh.isVisible = false;
            mesh.isPickable = false;
            //console.log(mesh)
            mesh.setParent(null)

            let newMesh = mesh.clone()
            newMesh.isPickable = false
          //  console.log("Loaded new mesh", newMesh)
            /*let rootNode = new TransformNode(`ipfs-root-${cid}`, this._scene)
            mesh.parent = rootNode;
            mesh.isVisible = true;*/
           // this._scene.addMesh(newMesh)

            //rootNode.normalizeToUnitCube()
            
            cb(null, newMesh)
        }, checkCollisions)
    }

    public async loadModel(cid, cb, checkCollisions?: boolean){
        console.log("Loading Model: " + cid)
        if(!this._models[cid]){
            this._ipfs.getModel(cid, this._scene, (err, mesh) => {
                this._models[cid] = mesh;
                cb(null, this._models[cid])
            }, checkCollisions)

        }else{
            cb(null, this._models[cid])
        } 
    }
}
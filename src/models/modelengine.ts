import { Scene, Mesh, TransformNode } from "@babylonjs/core";
import { IPFSModelLoader } from "../base/ipfsModel";

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
        await this.loadModel(cid, (err, mesh, animation) => {
            let d = new Date();
            mesh.isVisible = false;
            mesh.isPickable = false;

            //console.log(mesh)
            mesh.setParent(null)

            let newMesh : Mesh = mesh.clone()
            newMesh.isPickable = false
            if(mesh.skeleton) newMesh.skeleton = mesh.skeleton.clone("clonedSkeleton")
            cb(null, newMesh)
        }, checkCollisions)
    }

    public async loadModel(cid, cb, checkCollisions?: boolean){
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
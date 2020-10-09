import { Scene } from "@babylonjs/core"
import { Vector3 } from "babylonjs";
import { ModelEngine } from "../models/modelengine";
export default class Prefab{
    private _scene: Scene;
    private _engine: ModelEngine;
    private _prefab;

    constructor(scene : Scene, modelEngine : ModelEngine, prefab){
        this._scene = scene;
        this._engine = modelEngine;
        this._prefab = prefab;
    }

    private getCidForModel(_id){
        return this._prefab.components.filter((a) => a._id == _id)[0].ipfs;
    }

    public build(){
        let items = this._prefab.locations;
        for(var i = 0; i < items.length; i++){
            let position = items[i].position;
            let rotation = items[i].rotation;
            let scaling = items[i].scaling;

            console.log("Placing model", items[i])
            this._engine.instanceModel(this.getCidForModel(items[i].model), (err, model) => {
                //model.checkCollisions = true;
                model.position = new Vector3(position.x, position.y, position.z)
                model.rotation = new Vector3(rotation.x, rotation.y, rotation.z);
                model.scaling = new Vector3(scaling.x, scaling.y, scaling.z)
            }, true)
        }
    }
}
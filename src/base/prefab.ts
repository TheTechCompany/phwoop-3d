import { Scene, Vector3, PointLight, Color3 } from "@babylonjs/core"
import { ModelEngine } from "../models/modelengine";
import Model from '../models/model';
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
        let lights = this._prefab.lights;

        for(var i = 0; i < lights.length; i++){
            let light = lights[i]
            let _light = new PointLight("light-" + i, new Vector3(light.position.x, light.position.y, light.position.z), this._scene)
            _light.intensity = light.intensity;
            let color =  new Color3(light.color.r, light.color.g, light.color.b);
            _light.diffuse = color
            _light.specular = color

            this._scene.addLight(_light)
        }
        for(var i = 0; i < items.length; i++){
            let position = items[i].position;
            let rotation = items[i].rotation;
            let scaling = items[i].scaling;

            console.log("Placing model", items[i])
            this._engine.instanceModel(this.getCidForModel(items[i].model), (err, model) => {
                //model.checkCollisions = true;
                let _model = new Model(model)
                _model.setPosition(new Vector3(position.x, position.y, position.z))
                _model.setRotationVec(new Vector3(rotation.x, rotation.y, rotation.z))
                _model.scaleVec(new Vector3(scaling.x, scaling.y, scaling.z))
            }, true)
        }
    }
}
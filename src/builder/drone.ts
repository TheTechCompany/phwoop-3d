import { Scene,ArcRotateCamera, TransformNode, Mesh, Vector3 } from "@babylonjs/core";
import { ModelEngine } from "../models/modelengine";


const CID = "QmavG3PQ7ad66vmm5G3XKri2cv7CNPRPXJQ1cZbV656tmf"

export default class Drone extends TransformNode{

    private _camera: ArcRotateCamera;

    private _drone: Mesh;

    private _modelEngine: ModelEngine;

    constructor(scene: Scene, modelEngine: ModelEngine){
        super("drone-node", scene)
        this._modelEngine = modelEngine;


        this._modelEngine.loadModel("QmavG3PQ7ad66vmm5G3XKri2cv7CNPRPXJQ1cZbV656tmf", (err, model) => {
            this._drone = model as Mesh;
            
            this._drone.scaling.scaleInPlace(2)
            this._drone.parent = this;
            this._drone.position = Vector3.Zero()
            this._drone.rotation = new Vector3(0, -90 * (Math.PI / 180), 0)
            this.position = new Vector3(10, 5, 0);

            
            var alpha = 0;
            var beta = Math.PI / 2.5;
            var target = new Vector3(this.position.x, this.position.y + 1.5, this.position.z);

            this._camera = new ArcRotateCamera("ArcRotateCamera", alpha, beta, 5, target, scene); 
            this._camera.lowerRadiusLimit = 2;
            this._camera.upperRadiusLimit = 20;
            this._camera.parent = this;
            this._camera.position = Vector3.Zero()
            this._camera.attachControl(scene.getEngine().getRenderingCanvas());

            this._scene.activeCamera = this._camera

        }, true)
    }
}
import { Scene, Mesh, TransformNode, Sound, Vector3 } from "@babylonjs/core";
import { ModelEngine } from "./modelengine";

export default class Speaker extends TransformNode{

    private _modelEngine: ModelEngine;

    private _music : Sound;
    private _musicOptions = {
        loop: true,
        autoPlay: true,
        spatialSound: true,
        distanceModel: "exponential",
        falloff: 1,
        maxDistance: 33
    }

    private _speaker : Mesh;
    private _speakerCid = "QmcHPKWtLfaWfnhs2pP95Lycq8hsBLuLp2PUcsPn2yaVZt";

    constructor(scene: Scene, modelEngine: ModelEngine){
        super("speaker", scene)
        
        this._modelEngine = modelEngine
        
        this._music = new Sound("kereru", "kereru.mp3", scene, () => {
            console.log("Ready to play")
            this._music.attachToMesh(this);

            this._music.play()
        }, this._musicOptions)

        this._modelEngine.instanceModel(this._speakerCid, (err, model) => {
            this._speaker = model
            this._speaker.parent = this;
            this._speaker.position = Vector3.Zero()

            
            this._music.setPosition(Vector3.Zero())
         
        }, false)
    }

    public scale(factor){
        this.normalizeToUnitCube()
        this.scaling.scaleInPlace(factor)
        this._music.setVolume(factor)
    }

    public setPosition(vec){
        this.position = vec;
        this._music.setPosition(vec)
    }

}
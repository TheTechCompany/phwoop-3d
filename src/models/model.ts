
import { Vector3, Scene, Mesh, TransformNode } from '@babylonjs/core';

export default class Model{

    public _model : Mesh;

    constructor(_model){
        this._model = _model;
        this._model.isPickable = false;
    }

    get position(){
        return this._model.position;
    }

    get rotation(){
        return this._model.rotation;
    }

    get scaling(){
        return this._model.scaling;
    }

    public setPosition(vector: Vector3): void{
        this._model.position = vector;
    }

    public setRotation(rotation: number): void{
        this._model.rotation = new Vector3(0, rotation * (Math.PI / 180), 0);
    }

    public setRotationVec(vector: Vector3){
        this._model.rotation = vector;
    }

    public scale(factor: number): void{
        this._model.normalizeToUnitCube()
        this._model.scaling.scaleInPlace(factor);// = new Vector3(factor, factor, factor)
    }

    public scaleVec(vec: Vector3){
        this._model.normalizeToUnitCube()
        this._model.scaling.scaleInPlace(vec.x)// = vec;
    }

    public dispose(): void{
        this._model.dispose();
    }

    public addToScene(scene: Scene){
        scene.addMesh(this._model)
    }
}
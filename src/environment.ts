import { Mesh, Vector3, Scene } from '@babylonjs/core';
import { HexTile } from './hex';

export class Environment {
  private _scene: Scene;
  private _width: number;
  private _height: number;

  constructor(scene: Scene, width: number, height: number){
    this._scene = scene;
    this._width = width;
    this._height = height;
  }

  public async load(){
   let ground = []
    for(var x = 0; x < this._width; x++){
      for(var y = 0; y < this._height; y++){
        ground.push(new HexTile(this._scene, 13, x, y))
      }
    }
   /* var _ground = Mesh.CreateBox("ground", 60, this._scene);
    _ground.scaling = new Vector3(1, .02, 1);
    _ground.checkCollisions = true;*/
    //_ground.freezeWorldMatrix();
  }
}

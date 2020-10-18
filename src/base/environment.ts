import { Mesh,StandardMaterial, Texture, Vector3, Scene } from '@babylonjs/core';
import { HexTile } from './hex';

export class Environment {
  private _scene: Scene;
  private _width: number;
  private _height: number;
  private _ground = [];

  private _terrainMap;

  private _textures = [
    "cobble",
    "dirt",
    "grass",
    "terrain",
    "tile",
    "water",
    "wood"
  ]
  private _textureMap = {};


  constructor(scene: Scene, width: number, height: number, terrainMap){
    this._scene = scene;
    this._width = width;
    this._height = height;
    this._terrainMap = terrainMap;

    this._textures.map((x) => {
      let texture = new Texture(`textures/${x}-base.png`, this._scene)
      let bumpTexture = new Texture(`textures/${x}-bump.png`, this._scene)

      this._scaleTexture(texture)
      this._scaleTexture(bumpTexture)

      let mat = new StandardMaterial(`mat-${x}`, this._scene)
      mat.diffuseTexture = texture;
      mat.bumpTexture = bumpTexture
      this._textureMap[x] = mat;
    })

    this._scene.createDefaultEnvironment({
      createGround: false,
      createSkybox: false
    });
  }

  private _scaleTexture(texture){
    texture.uScale = 3.0;
    texture.vScale = 3.0;
  }

  private _getTexture(terrain){
    switch(terrain){
      case null:
        return this._textureMap["water"]
      default:
        return this._textureMap[terrain];
    }
  }

  public async load(){
    for(var x = 0; x < this._width; x++){
      let row = []
      for(var y = 0; y < this._height; y++){
        
        row.push(new HexTile(this._scene, 7, x, y, this._getTexture(this._terrainMap[y][x])))
      }
      this._ground.push(row)
    }
  }

  public getTile(x, y){
    let tile = this._ground[x][y];
    return tile;
  }
}

import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { 
  PointLight,
  Color3,
  Engine, 
  Scene, 
  Color4, 
  FreeCamera, 
  SceneLoader, 
  ShadowGenerator, 
  Quaternion, 
  Matrix, 
  ArcRotateCamera, 
  Vector3, 
  HemisphericLight, 
  Mesh, 
  MeshBuilder, DirectionalLight } from "@babylonjs/core";
  import {HexTile} from './hex';
import { Player } from './characterController';
import { Environment } from './environment';
import { Hud } from "./ui";
import { Character } from "./character";
import IPFS from 'ipfs';
import { IPFSModelLoader } from "./ipfsModel";
import { CharacterSelector } from "./signup/characterSelector";
import { getCollections, getModels } from './api/modelCollections';
import BaseEngine from "./base/engine";
import { ModelEngine } from "./models/modelengine";
import { addModelToPrefab, getPrefab } from './api/prefabActions';
import Prefab from './base/prefab';
import { Builder } from "./models/builder";

enum State { START = 0, GAME = 1, LOSE = 2, CUTSCENE = 3 };

class App{
  
  private _baseEngine: BaseEngine;
  private _builder: Builder;

  private _ui: Hud;
  private _ipfs;
  private _ipfsModelLoader: IPFSModelLoader;
  private _scene: Scene;
  private _canvas: HTMLCanvasElement;
  private _engine: Engine;
  
  public assets;
  private _player: Character;
  private _enviroment: Environment;

  private _state: number = 0;

  private characterCid;

  private _mouseX;
  private _mouseY;
  private _buildingMode: boolean = false;


  private _modelEngine: ModelEngine;

  private _modelCollections = [];
  private _models = [];
  private _activeModel = 0;

  private _prefab;

  constructor(){

    let characterSelector = new CharacterSelector(this._loadCharacter.bind(this));
    characterSelector.mount()

    
    

            getPrefab().then((r) => {
              this._prefab = r;
            })
      
      
        
  }

  private _loadCharacter(id){
    this.characterCid = id.cid;
    this._goToGame()
  }

  private placedObject = null;

  private async _goToGame(){

    this._baseEngine = new BaseEngine();

    this._engine = this._baseEngine._engine;
    this._canvas = this._baseEngine._canvas;
    this._scene = this._baseEngine._scene;

    this._engine.displayLoadingUI()

    
    //Setup lights
    var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 33, 0), this._scene);  
    light1.intensity = 0.444;

    //Setup camera
    var camera: ArcRotateCamera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), this._scene);
    camera.attachControl(this._canvas, true);

    //Setup action
    const environment = new Environment(this._scene, 12, 12)
    this._enviroment = environment;
    await this._enviroment.load();
 
    //Debug layer controls
    window.addEventListener('keydown', (ev) => {
      if(ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode == 73){
        if(this._scene.debugLayer.isVisible()){
          this._scene.debugLayer.hide();
        }else{
          this._scene.debugLayer.show();
        }
      }
    })

    await this._setUpIPFS();
    await this._setUpGame();

    this._canvas.focus();

    let p = new Prefab(this._scene, this._modelEngine, this._prefab);

    p.build();
    

  }

  private async _setUpIPFS(){
    this._ipfs = await IPFS.create({
      config: {
        Addresses: {
        }
      }
    })
    console.log("IPFS", this._ipfs);
    this._ipfsModelLoader = new IPFSModelLoader(this._ipfs)
  }

  private async _setUpGame(){
    let scene = this._scene

    this._modelEngine = new ModelEngine(this._scene, this._ipfsModelLoader)

    this._builder = new Builder(this._scene, this._modelEngine)
  
    await this._loadCharacterAssets(scene, this.characterCid);
    
    await this._initPlayer(scene)

    this._engine.hideLoadingUI()
    this._baseEngine.mount();
   
   
  }


  private async _initPlayer(scene): Promise<void>{

    this._player = new Character(this.assets, scene, this._ipfsModelLoader);
        //Builder Controls
        
   // const camera = this._player.activatePlayerCamera();
    
  }





  private async _loadCharacterAssets(scene, cid): Promise<any> {
    async function loadCharacter(ipfs){
      
      const characterUrl = await ipfs.getIPFSModel(cid)

      const outer = MeshBuilder.CreateBox("outer", {width: 0.5, depth: 0.5, height: 2}, scene)
      //outer.isVisible = false;
      outer.isPickable = false;
      outer.checkCollisions = true;

      outer.bakeTransformIntoVertices(Matrix.Translation(0.5, 2, 0.5))

      outer.position = new Vector3(3, 3, 0);

      outer.ellipsoid = new Vector3(0.5, 2, 0.5);
      outer.ellipsoidOffset = new Vector3(0, 0.9, 0);

      outer.rotationQuaternion = new Quaternion(0, 1, 0, 0);
      
      return SceneLoader.ImportMeshAsync(null, "", characterUrl, scene, null, ".glb").then((result) => {
        const player = result.meshes[0];
        const skeleton = result.skeletons[0];
        
        //player.scaling = new Vector3(1.5, 1.5, 1.5);

        player.skeleton = skeleton
        skeleton.enableBlending(0.1);
        player.parent = outer;
        player.isPickable = false;
        player.position = new Vector3(0, 0, 0);
        player.checkCollisions = true;
        player.ellipsoid = new Vector3(0.5, 2, 0.5);
        player.ellipsoidOffset = new Vector3(0, 0.9, 0);
  
        return {
          mesh: outer as Mesh,
          animationGroups: result.animationGroups
        }
      })
    }
    return loadCharacter(this._ipfsModelLoader).then((assets) => {
      this.assets = assets;
    })
  }
}

new App();

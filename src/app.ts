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
import { PlayerInput } from './inputController';
import { Player } from './characterController';
import { Environment } from './environment';
import { Hud } from "./ui";
import { Character } from "./character";
import IPFS from 'ipfs';
import { IPFSModelLoader } from "./ipfsModel";
import { CharacterSelector } from "./signup/characterSelector";

enum State { START = 0, GAME = 1, LOSE = 2, CUTSCENE = 3 };

class App{
  
  private _ui: Hud;
  private _ipfs;
  private _ipfsModelLoader: IPFSModelLoader;
  private _input: PlayerInput;
  private _scene: Scene;
  private _canvas: HTMLCanvasElement;
  private _engine: Engine;
  
  public assets;
  private _player: Character;
  private _enviroment: Environment;

  private _state: number = 0;

  private characterCid;

  constructor(){

    let characterSelector = new CharacterSelector(this._loadCharacter.bind(this));
    characterSelector.mount()
  }

  private _loadCharacter(id){
    this.characterCid = id.cid;
    this._goToGame()
  }

  private async _goToGame(){
    var canvas = this._createCanvas();
    
    const _engine = new Engine(canvas, true);
    this._engine = _engine;
    this._scene = new Scene(this._engine);

    var camera: ArcRotateCamera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), this._scene);
    camera.attachControl(canvas, true);

    //var light = new DirectionalLight("DirectionalLight", newVector3(0, -1, 0), this._scene);

    var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 33, 0), this._scene);
    
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

    this._engine.runRenderLoop(() => {
      this._scene.render();
    })

    canvas.focus();
    window.addEventListener("resize", function () {
      _engine.resize();
    });
  }

  private async _setUpIPFS(){
    this._ipfs = await IPFS.create()
    console.log("IPFS", this._ipfs);
    this._ipfsModelLoader = new IPFSModelLoader(this._ipfs)
  }

  private async _setUpGame(){
    //let scene = new Scene(this._engine);
    //this._scene = scene;
    
    let scene = this._scene

    const environment = new Environment(scene, 12, 12)
    this._enviroment = environment;

    
    await this._enviroment.load();

    await this._loadCharacterAssets(scene, this.characterCid);
    
    await this._initGround(scene)
    await this._initPlayer(scene)
   // const hex = new HexTile(scene, 13)
  }

  private async _initGround(scene){
    let tile = this._enviroment.getTile(0, 1)

    let tile2 = this._enviroment.getTile(1, 1);

    let carTile = this._enviroment.getTile(1, 0);

    let schoolTile = this._enviroment.getTile(0, 2);
    let getPos = (index, face = 1) => new Vector3((11 - (index * 1.15)), 0, (2 * (index+1)) * face)

    let nextTile = this._enviroment.getTile(2, 0);
    
    await this._ipfsModelLoader.getSTLModel("QmP1DeXeTWgcbNh6bDZx6CXY8ErFeRoHnKi7QhBjoq9KRD", this._scene, Vector3.Zero())

    /*await this._ipfsModelLoader.getModel(nextTile._hex, "QmWdi2RHoNJcTp2uMsS2KmpgC9eB558odJJ2KdtS1qiiu5", this._scene, new Vector3(0, 0, 0))

    await this._ipfsModelLoader.getModel(carTile._hex, "QmZK2FyPQti52uMRwNwNviQ2xL27YomHSRmu9D282Jfnu5", this._scene, new Vector3(0, 0, 0), 7)

    //School
    await this._ipfsModelLoader.getModel(schoolTile._hex, "QmRqxXVMjkZWBt7mUCiDLvcBQ3AeZiR6rWFiWMypSTNssc", this._scene, new Vector3(0, 0, 0), 13)

    //Bed
    await this._ipfsModelLoader.getModel(tile2._hex, "QmV1DWu78pgb2mz3T5xTvsuwVcnccRnpivz7mfQ86y7jws", this._scene, new Vector3(0, 0, 0), 7);
    await this._ipfsModelLoader.getModel(tile2._hex, "QmREprb3EZ3YFBhhCL4dTwFik7G954x7c2fbhhL9Nwogae", this._scene, getPos(1), 2, new Vector3(0, 60 * (Math.PI / 180), 0))
    await this._ipfsModelLoader.getModel(tile2._hex, "QmREprb3EZ3YFBhhCL4dTwFik7G954x7c2fbhhL9Nwogae", this._scene, getPos(2), 2, new Vector3(0, 60 * (Math.PI / 180), 0))

    
    //Pagoda Sun Tile
    await this._ipfsModelLoader.getModel(tile._hex, "QmNY7eDuFTTxwv3zyfSfoLykctEuZNC4T43zru8WqFXnQo", this._scene, new Vector3(0, 0, 0), 18) //Pagoda

    await this._ipfsModelLoader.getModel(tile._hex, "QmZ8JbrJh4QFxHMqrEGF5UenRueFbTkDUscntvp16YWPEs", this._scene, getPos(1), 2, new Vector3(0, 329.5 * (Math.PI / 180), 0)) // Solar Panel
    await this._ipfsModelLoader.getModel(tile._hex, "QmZ8JbrJh4QFxHMqrEGF5UenRueFbTkDUscntvp16YWPEs", this._scene, getPos(2), 2, new Vector3(0, 329.5 * (Math.PI / 180), 0)) // Solar Panel
    await this._ipfsModelLoader.getModel(tile._hex, "QmZ8JbrJh4QFxHMqrEGF5UenRueFbTkDUscntvp16YWPEs", this._scene, getPos(3), 2, new Vector3(0, 329.5 * (Math.PI / 180), 0)) // Solar Panel

    await this._ipfsModelLoader.getModel(tile._hex, "QmZ8JbrJh4QFxHMqrEGF5UenRueFbTkDUscntvp16YWPEs", this._scene, getPos(1, -1), 2, new Vector3(0, -(329.5 * (Math.PI / 180)), 0)) // Solar Panel
    await this._ipfsModelLoader.getModel(tile._hex, "QmZ8JbrJh4QFxHMqrEGF5UenRueFbTkDUscntvp16YWPEs", this._scene, getPos(2, -1), 2, new Vector3(0, -(329.5 * (Math.PI / 180)), 0)) // Solar Panel
    await this._ipfsModelLoader.getModel(tile._hex, "QmZ8JbrJh4QFxHMqrEGF5UenRueFbTkDUscntvp16YWPEs", this._scene, getPos(3, -1), 2, new Vector3(0, -(329.5 * (Math.PI / 180)), 0)) // Solar Panel
    */
  }

  private async _initPlayer(scene): Promise<void>{

    this._player = new Character(this.assets, scene);

   // const camera = this._player.activatePlayerCamera();
    
  }

  private _createCanvas(){
    document.documentElement.style["overflow"] = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.width = "100%";
    document.documentElement.style.height = "100%";
    document.documentElement.style.margin = "0";
    document.documentElement.style.padding = "0";
    document.body.style.overflow = "hidden";
    document.body.style.width = "100%";
    document.body.style.height = "100%";
    document.body.style.margin = "0";
    document.body.style.padding = "0";

    this._canvas = document.createElement('canvas');
    this._canvas.style.width = '100%';
    this._canvas.style.height = '100%';
    this._canvas.id = 'gameCanvas';

    document.body.appendChild(this._canvas);
    return this._canvas;
  }

  private async _goToStart(){
    this._engine.displayLoadingUI();

    this._scene.detachControl();

    let scene = new Scene(this._engine);

    scene.clearColor = new Color4(0, 0, 0, 1);

    let camera = new FreeCamera("camera1", new Vector3(0, 0, 0), scene);
    camera.setTarget(Vector3.Zero());

    await scene.whenReadyAsync();
    this._engine.hideLoadingUI();

    this._scene.dispose();
    this._scene = scene;
    this._state = State.START;
  }

  private async _loadCharacterAssets(scene, cid): Promise<any> {
    async function loadCharacter(ipfs){
      
      const characterUrl = await ipfs.getIPFSModel(cid)

      const outer = MeshBuilder.CreateBox("outer", {width: 1, depth: 1, height: 1}, scene)
      outer.isVisible = false;
      outer.isPickable = false;
      outer.checkCollisions = true;

      outer.bakeTransformIntoVertices(Matrix.Translation(0, 1.5, 0))

      outer.ellipsoid = new Vector3(1, 1.5, 1);
      outer.ellipsoidOffset = new Vector3(0, 1.5, 0);

      outer.rotationQuaternion = new Quaternion(0, 1, 0, 0);
      
      return SceneLoader.ImportMeshAsync(null, "", characterUrl, scene, null, ".glb").then((result) => {
        const player = result.meshes[0];
        const skeleton = result.skeletons[0];
        
        player.skeleton = skeleton
        skeleton.enableBlending(0.1);
        //player.parent = outer;
        player.position = new Vector3(0, 20, 0);
        player.checkCollisions = true;
        player.ellipsoid = new Vector3(0.5, 2, 0.5);
        player.ellipsoidOffset = new Vector3(0, 1, 0);
  
        return {
          mesh: player as Mesh,
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

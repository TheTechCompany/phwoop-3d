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
  MeshBuilder } from "@babylonjs/core";
  import {HexTile} from './hex';
import { PlayerInput } from './inputController';
import { Player } from './characterController';
import { Environment } from './environment';
import { Hud } from "./ui";
import { Character } from "./character";

enum State { START = 0, GAME = 1, LOSE = 2, CUTSCENE = 3 };

class App{
  
  private _ui: Hud;
  private _input: PlayerInput;
  private _scene: Scene;
  private _canvas: HTMLCanvasElement;
  private _engine: Engine;
  
  public assets;
  private _player: Character;
  private _enviroment: Environment;

  private _state: number = 0;

  constructor(){
    var canvas = this._createCanvas();
    
    const _engine = new Engine(canvas, true);
    this._engine = _engine;
    this._scene = new Scene(this._engine);

    var camera: ArcRotateCamera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), this._scene);
    camera.attachControl(canvas, true);

    var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), this._scene);
    
    window.addEventListener('keydown', (ev) => {
      if(ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode == 73){
        if(this._scene.debugLayer.isVisible()){
          this._scene.debugLayer.hide();
        }else{
          this._scene.debugLayer.show();
        }
      }
    })

    this._setUpGame();

    this._engine.runRenderLoop(() => {
      this._scene.render();
    })

    canvas.focus();
    window.addEventListener("resize", function () {
      _engine.resize();
    });
  }

  private async _setUpGame(){
    //let scene = new Scene(this._engine);
    //this._scene = scene;
    
    let scene = this._scene

    const environment = new Environment(scene, 6, 6)
    this._enviroment = environment;

    
    await this._enviroment.load();
    await this._loadCharacterAssets(scene);
    await this._initPlayer(scene)
   // const hex = new HexTile(scene, 13)
  }

  private async _initPlayer(scene): Promise<void>{
    
      const light = new PointLight("sparklight", new Vector3(0, 0, 0), scene);
        light.diffuse = new Color3(0.08627450980392157, 0.10980392156862745, 0.15294117647058825);
        light.intensity = 35;
        light.radius = 1;

    const shadowGenerator = new ShadowGenerator(1024, light);
    shadowGenerator.darkness = 0.4;
    this._ui = new Hud(scene)

    this._input = new PlayerInput(scene, this._ui);

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

  private async _loadCharacterAssets(scene): Promise<any> {
    async function loadCharacter(){
      
      const outer = MeshBuilder.CreateBox("outer", {width: 1, depth: 1, height: 1}, scene)
      outer.isVisible = false;
      outer.isPickable = false;
      outer.checkCollisions = true;

      outer.bakeTransformIntoVertices(Matrix.Translation(0, 1.5, 0))

      outer.ellipsoid = new Vector3(1, 1.5, 1);
      outer.ellipsoidOffset = new Vector3(0, 1.5, 0);

      outer.rotationQuaternion = new Quaternion(0, 1, 0, 0);
      
      return SceneLoader.ImportMeshAsync(null, "./models/", "purple-wizard.glb", scene).then((result) => {
        const player = result.meshes[0];
        const skeleton = result.skeletons[0];
        
        player.skeleton = skeleton
        skeleton.enableBlending(0.1);
        //player.parent = outer;
        player.position = new Vector3(0, 20, 0);
        player.checkCollisions = true;
        player.ellipsoid = new Vector3(0.5, 1, 0.5);
        player.ellipsoidOffset = new Vector3(0, 1, 0);
  
        return {
          mesh: player as Mesh,
          animationGroups: result.animationGroups
        }
      })
    }
    return loadCharacter().then((assets) => {
      this.assets = assets;
    })
  }
}

new App();

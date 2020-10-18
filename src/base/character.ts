import { AnimationGroup, Camera, UniversalCamera,  } from "@babylonjs/core";
import {CharacterController} from "babylonjs-charactercontroller";
import { ArcRotateCamera, Mesh,Vector3, Scene } from 'babylonjs';
import { IPFSModelLoader } from "./ipfsModel";

export class Character{
    private _controller: CharacterController;
    private _player: Mesh;
    private _scene: Scene;
    private _camera: ArcRotateCamera;


    private _run: AnimationGroup;
    private _idle: AnimationGroup;
    private _jump: AnimationGroup;
    private _strafeLeft: AnimationGroup;
    private _strafeRight: AnimationGroup;
    private _turnLeft: AnimationGroup;
    private _turnRight: AnimationGroup;
    private _land: AnimationGroup;
    private _walk: AnimationGroup;

    private _ipfs: IPFSModelLoader;
  
    constructor(assets, scene: Scene, ipfs: IPFSModelLoader){
        this._scene = scene;
        this._player = assets.mesh;
        this._ipfs = ipfs;

        this._scene.audioListenerPositionProvider = () => {
            return this._player.absolutePosition
        }

        this._player.normalizeToUnitCube()
        this._player.scaling.scaleInPlace(2)

        this._player.rotation = this._player.rotationQuaternion.toEulerAngles();
        this._player.rotationQuaternion = null;

        var alpha = 0;
        var beta = Math.PI / 2.5;
        var target = new Vector3(this._player.position.x, this._player.position.y + 1.5, this._player.position.z);

        this._camera = new ArcRotateCamera("ArcRotateCamera", alpha, beta, 5, target, scene); // new UniversalCamera("cam", new Vector3(0, -2, -5), this._scene);
        
        this._camera.wheelPrecision = 15;
        this._camera.checkCollisions = false;

        this._camera.keysLeft = [];
        this._camera.keysRight = [];
        this._camera.keysUp = [];
        this._camera.keysDown = [];

        this._camera.lowerRadiusLimit = 2;
        this._camera.upperRadiusLimit = 20;
        this._camera.attachControl(scene.getEngine().getRenderingCanvas(), false);

        this._jump = assets.animationGroups.filter((a) => a.name == "Jump")[0]
        this._walk = assets.animationGroups.filter((a) => a.name == "Walking")[0]
        this._idle = assets.animationGroups.filter((a) => a.name == "Idle")[0]
        this._run = assets.animationGroups.filter((a) => a.name =="Running")[0]
        this._strafeLeft = assets.animationGroups.filter((a) => a.name =="Leftstrafe")[0]
        this._strafeRight = assets.animationGroups.filter((a) => a.name == "Rightstrafe")[0]
        this._turnLeft = assets.animationGroups.filter((a) => a.name=="Leftturn")[0]
        this._turnRight = assets.animationGroups.filter((a) => a.name=="Rightturn")[0]

        const animations = {
            "walk": this._walk,
            "run": this._run,
            "idle": this._idle,
            "idleJump": this._jump,
            "strafeLeft": this._strafeLeft,
            "strafeRight": this._strafeRight,
            "turnLeft": this._turnLeft,
            "turnRight": this._turnRight
        }
        
        this._scene.activeCamera = this._camera;
        this._controller = new CharacterController(this._player, this._camera, scene, animations)    

        this._controller.setFaceForward(true)
        this._controller.setMode(0);
        
        this._controller.setTurnSpeed(180);

        this._controller.setCameraTarget(new Vector3(0, 1, 0));
        this._controller.setWalkSpeed(7);
        this._controller.setRunSpeed(14)
        this._controller.setNoFirstPerson(false);
        
        this._controller.setStepOffset(0.4);
        this._controller.setSlopeLimit(30, 60);


     this._controller.start()
    }

   
}
import { Color3, PointLight, Scene, Vector3 } from "@babylonjs/core";
import { int } from "babylonjs";
import { getCollections } from "../api/modelCollections";
import { addLightToPrefab, addModelToPrefab } from "../api/prefabActions";
import { Hud } from "../ui";
import Model from "../models/model";
import { ModelEngine } from "../models/modelengine";
import BuildMenu from "./menu";
import Speaker from "../models/speaker";

export class Builder {
    
    private _modelEngine : ModelEngine;
    private _ui : Hud;
    private _menu: BuildMenu;

    private _scene : Scene;
    
    //Mouse coords
    private _mouseX;
    private _mouseY;
    private _mouseVec : Vector3;

    private _modelCollections = [];

    private _currentCollection;
    private _activeModel;

    private _currentHeight = 0;
    private _currentScale = 1;
    private _currentRotation = 0;

    private _heightStep = 1;
    private _rotationStep = 10; //Hexagon angles
    private _scaleStep = 1;

    private buildingObject: Model;
    private light : PointLight;
    private speakerObject: Speaker;

    public lightMode: boolean = false;
    public soundMode: boolean = false;
    public buildingMode: boolean = false;

    private keyMap = {
        'Enter': 'PLACE_MODEL',
        'l': 'LIGHT_MODE',
        'b': 'BUILD_MODE',
        'n': 'NEXT_MODEL',
        'p': 'PREV_MODEL',
        'r': 'ROTATE_MODEL',
        '>': 'SCALE_UP',
        '<': 'SCALE_DOWN',
        '{': 'DOWN_LEVEL',
        '}': 'UP_LEVEL'
    }

    constructor(scene: Scene, modelEngine: ModelEngine){
        console.log("=> Builder Init");

        this._modelEngine = modelEngine;
        this._scene = scene;

        this._ui = new Hud(scene, this);
        this._menu = new BuildMenu()

        this._menu.setModelChangeListener((type, model) => {
            console.log("SET ACTIVE MODEL")
            if(type == "light"){
                this.lightMode = true;
                this.initLight()
            }else if(type == "media"){
                this.soundMode = true;
                this.initSpeaker();
            }else{
                if(this.light) this.deinitLight()
                this.lightMode = false;
                this._activeModel = model;
                if(this.buildingObject != undefined){
                    this.deinitBuildingModel()
                }
                this.initBuildingModel()
            }

        })

        this.mouseMove = this.mouseMove.bind(this);
        this.clickHandler = this.clickHandler.bind(this);
        this.keyDown = this.keyDown.bind(this);

        window.addEventListener('click', this.clickHandler);
        window.addEventListener('mousemove', this.mouseMove);
    
        window.addEventListener('keydown', this.keyDown);

    }

    private placeHandler(): void{
        if(this.buildingMode && !this.lightMode && !this.soundMode){
            addModelToPrefab(this._activeModel._id, this.buildingObject.position, this.buildingObject.rotation, this._currentScale).then((r) => {
                
            })
            this.initBuildingModel()
        }else if(this.lightMode){
            console.log("PLACE LIGHT")
            addLightToPrefab(this.light.position, this.light.intensity, this.light.specular).then((r) => {

            })
            this.initLight();
        }else if(this.soundMode){
            this.speakerObject = null
        }
    }

    private clickHandler(e): void{

    }

    private mouseMove(e): void{
        this._mouseX = e.clientX;
        this._mouseY = e.clientY;
        this._mouseVec = this.pickVec()
        
        if(this._mouseVec){
            if(this.buildingObject && !this.lightMode){
                this.buildingObject.setPosition(this._mouseVec)
            
            }else if(this.lightMode){
                this._mouseVec.y = this._currentHeight
                this.light.position = this._mouseVec;
            }else if(this.soundMode){
                this.speakerObject.setPosition(this._mouseVec)
            }
        }else{
        }
        

    }

    private keyDown(e){
        let key = this.keyMap[e.key]
        console.log("KeyDown", key, e.key)
        switch(key){
            case 'PLACE_MODEL':
                this.placeHandler();
                break;
            case 'BUILD_MODE':
                this.toggleBuilding();
                break;
            case 'ROTATE_MODEL':
                this.rotateActiveModel();
                break;
            case 'SCALE_UP':
                this.changeScale(this._scaleStep);
                break;
            case 'SCALE_DOWN':
                this.changeScale(-this._scaleStep);
                break;
            case 'UP_LEVEL':
                this.changeLevel(1 * this._heightStep);
                break;
            case 'DOWN_LEVEL':
                this.changeLevel(-1 * this._heightStep);
                break;
            default:
                return null;
        }
    }


    private changeScale(increment){
        this._currentScale += increment

        if(this.buildingMode && !this.lightMode && !this.soundMode){
            this.buildingObject.scale(this._currentScale)
        }else if(this.lightMode){
            this.light.intensity = this._currentScale
        }else if(this.soundMode){
            this.speakerObject.scale(this._currentScale)
        }
        
    }


    private changeLevel(index: number){
        this._currentHeight = this._currentHeight + index;
        if(this.buildingMode && !this.lightMode && !this.soundMode){
            this.buildingObject.position.y = (this._currentScale * this._currentHeight);
        }else if(this.lightMode){
            this.light.position.y = (this._currentHeight);
        }else if(this.soundMode){
            this.speakerObject.position.y = (this._currentHeight * this._currentScale)
        }
    }


    private rotateActiveModel(){
        this._currentRotation += this._rotationStep;
        if(this.buildingMode && !this.soundMode){
            this.buildingObject.setRotation(this._currentRotation);
        }else if(this.soundMode){
            this.speakerObject.rotation = new Vector3(0, this._currentRotation * (Math.PI / 180), 0)
        }
    }

    private toggleBuilding(){
        console.log("Building Toggle")
        this.buildingMode = !this.buildingMode;

        if(this.buildingMode) this.lightMode = false;

        if(this.buildingMode){
           // this.initBuildingModel()
            this._ui.mountControl(this._menu)
        }else{
            if(this.light) this.deinitLight()
            if(this.speakerObject) this.deinitSpeaker();
            this.lightMode = false;
            this.soundMode = false;
            this.deinitBuildingModel()
            this._ui.unmountControl(this._menu);
        }
    }
    

    public changeCollection(id){
        console.log("Change collection: ", id)
        this._currentCollection = this._modelCollections.filter((a) => a._id == id)[0];
        this._activeModel = 0;
        //this._models = this._currentCollection.items;
        this.deinitBuildingModel()
        this.initBuildingModel();
        
    }


    private pickVec(){
        let pickedPoint = this._scene.pick(this._mouseX, this._mouseY);

        if(pickedPoint && pickedPoint.hit){
            let x = parseInt(pickedPoint.pickedPoint.x.toFixed(1))
            let z = parseInt(pickedPoint.pickedPoint.z.toFixed(1))
            return new Vector3(x, this._currentHeight * this._currentScale, z)
        }else{
            return Vector3.Zero()
        }
    }

    private initLight(){
        console.log("ADD LIGHT")
        this.light = new PointLight("new-point", this.pickVec(), this._scene);
        this.light.intensity = this._currentScale;
        this.light.diffuse = new Color3(1, 1, 1);
        this.light.specular = new Color3(0, 0, 1);

        this._scene.addLight(this.light)
    }
    
    private initBuildingModel() {
        let vec = this.pickVec();
        if(!vec){
            vec = Vector3.Zero()
        }
        
        this._modelEngine.instanceModel(this._activeModel.ipfs, (err, model) => {

        this.buildingObject = new Model(model);

          this.buildingObject.setPosition(this.pickVec())
          this.buildingObject.scale(this._currentScale);
          this.buildingObject.setRotation(this._currentRotation);
          this.buildingObject.addToScene(this._scene);
        })
        //this._ipfsModelLoader.getModel(null, this._models[this._activeModel].ipfs, this._scene, new Vector3(pickedPoint.pickedPoint.x, 0, pickedPoint.pickedPoint.z), 3);
        
    }

    private initSpeaker(){
        let vec = this.pickVec()
        if(!vec){
            vec = Vector3.Zero()
        }

        this.speakerObject = new Speaker(this._scene, this._modelEngine)
        this._scene.addTransformNode(this.speakerObject)
    }

    private deinitSpeaker(){
        this.speakerObject.dispose()
        this.speakerObject = null
    }
    
      private deinitBuildingModel(){
        this.buildingObject.dispose()
        this.buildingObject = null;
      }

      private deinitLight(){
          this.light.dispose()
          this.light = null;
      }
    
}
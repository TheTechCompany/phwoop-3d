import { Color3, PointLight, Scene, Vector3 } from "@babylonjs/core";
import { int } from "babylonjs";
import { getCollections } from "../api/modelCollections";
import { addLightToPrefab, addModelToPrefab } from "../api/prefabActions";
import { Hud } from "../ui";
import Model from "./model";
import { ModelEngine } from "./modelengine";

export class Builder {
    
    private _modelEngine : ModelEngine;
    private _ui : Hud;
    private _scene : Scene;
    
    //Mouse coords
    private _mouseX;
    private _mouseY;
    private _mouseVec : Vector3;

    private _modelCollections = [];
    private _models = [];
    private _currentCollection;
    private _activeModel = 0;

    private _currentHeight = 0;
    private _currentScale = 1;
    private _currentRotation = 0;

    private _heightStep = 1;
    private _rotationStep = 90;
    private _scaleStep = 1;

    private buildingObject: Model;
    private light : PointLight;

    public lightMode: boolean = false;
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

        this.mouseMove = this.mouseMove.bind(this);
        this.clickHandler = this.clickHandler.bind(this);
        this.keyDown = this.keyDown.bind(this);

        getCollections().then((collections) => {
            this._modelCollections = collections;
            let collection = this._modelCollections.filter((a) => a.name == "Fantasy Town Kit")[0];
            this._models = collection.items;
        })

        window.addEventListener('click', this.clickHandler);
        window.addEventListener('mousemove', this.mouseMove);
    
        window.addEventListener('keydown', this.keyDown);

    }

    private placeHandler(): void{
        if(this.buildingMode){
            addModelToPrefab(this._models[this._activeModel]._id, this.buildingObject.position, this.buildingObject.rotation, this._currentScale).then((r) => {
                
            })
            this.initBuildingModel()
        }else if(this.lightMode){
            console.log("PLACE LIGHT")
            addLightToPrefab(this.light.position, this.light.intensity, this.light.specular).then((r) => {

            })
            this.initLight();
        }
    }

    private clickHandler(e): void{

    }

    private mouseMove(e): void{
        this._mouseX = e.clientX;
        this._mouseY = e.clientY;
        this._mouseVec = this.pickVec()
        
        if(this._mouseVec){
            if(this.buildingObject){
                this.buildingObject.setPosition(this._mouseVec)
            
            }else if(this.lightMode){
                this.light.position = this._mouseVec;
            }
        }else{
            console.log("No pick", this._mouseX)
        }
        

    }

    private keyDown(e){
        let key = this.keyMap[e.key]
        console.log("KeyDown", key, e.key)
        switch(key){
            case 'PLACE_MODEL':
                this.placeHandler();
                break;
            case 'LIGHT_MODE':
                this.toggleLightMode();
                break;
            case 'BUILD_MODE':
                this.toggleBuilding();
                break;
            case 'ROTATE_MODEL':
                this.rotateActiveModel();
                break;
            case 'NEXT_MODEL':
                this.nextModel();
                break;
            case 'PREV_MODEL':
                this.prevModel();
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

        if(this.buildingMode){
            this.buildingObject.scale(this._currentScale)
        }else if(this.lightMode){
            this.light.intensity = this._currentScale
        }
        
    }


    private changeLevel(index: number){
        this._currentHeight = this._currentHeight + index;
        if(this.buildingMode){
            this.buildingObject.position.y = (this._currentScale * this._currentHeight);
        }else if(this.lightMode){
            this.light.position.y = (this._currentScale * this._currentHeight);
        }
    }

    private nextModel(){
        if(this._activeModel < this._models.length){
            this._activeModel += 1
          }
          this.deinitBuildingModel()
          this.initBuildingModel()
          this.updateUI()
    }

    private prevModel(){
        if(this._activeModel > 0){
            this._activeModel -= 1;
          }
          this.deinitBuildingModel()
          this.initBuildingModel()
          this.updateUI()
    }
    private rotateActiveModel(){
        if(this.buildingMode){
            this._currentRotation += 90;
            this.buildingObject.setRotation(this._currentRotation);
        }
    }

    private toggleBuilding(){
        console.log("Building Toggle")
        this.buildingMode = !this.buildingMode;

        if(this.buildingMode) this.lightMode = false;
        this.updateUI()
        if(this.buildingMode){
            this.initBuildingModel()
            this._ui.mountBuildMenu(this._modelCollections);
        }else{
            this.deinitBuildingModel()
            this._ui.unmountBuildMenu();
        }
    }
    
    private toggleLightMode(){
        this.lightMode = !this.lightMode;

        if(this.lightMode) {
            if(this.buildingMode){
                this._ui.unmountBuildMenu();
                this.buildingObject.dispose()
            }

            this.buildingMode = false
        }
        this.updateUI();
        if(this.lightMode){
            this.initLight();
            
        }
    }
    public changeCollection(id){
        console.log("Change collection: ", id)
        this._currentCollection = this._modelCollections.filter((a) => a._id == id)[0];
        this._activeModel = 0;
        this._models = this._currentCollection.items;
        this.deinitBuildingModel()
        this.initBuildingModel();
        
        console.log(this._models, this._currentCollection)
        this.updateUI()
    }

    public placeModel(cid, pos, rot, scale){
    
    }
    
    private updateUI(){
        if(this.buildingMode){
            this._ui._clockTime.text = this.buildingMode ? "Build Mode: " + this._models[this._activeModel].name : "";

        }else if(this.lightMode){
            this._ui._clockTime.text = "Light Mode"
        }else{
            this._ui._clockTime.text = ""
        }
    
    }

    private pickVec(){
        let pickedPoint = this._scene.pick(this._mouseX, this._mouseY);

        if(pickedPoint.hit){
            return new Vector3(pickedPoint.pickedPoint.x, this._currentHeight * this._currentScale, pickedPoint.pickedPoint.z)
        }
    }

    private initLight(){
        console.log("ADD LIGHT")
        this.light = new PointLight("new-point", this.pickVec(), this._scene);
        this.light.intensity = this._currentScale;
        this.light.diffuse = new Color3(1, 0, 1);
        this.light.specular = new Color3(1, 0, 1);

        this._scene.addLight(this.light)
    }
    
    private initBuildingModel() {
        this._modelEngine.instanceModel(this._models[this._activeModel].ipfs, (err, model) => {

        this.buildingObject = new Model(model);

          this.buildingObject.setPosition(this.pickVec())
          this.buildingObject.scale(this._currentScale);
          this.buildingObject.setRotation(this._currentRotation);
          this.buildingObject.addToScene(this._scene);
        })
        //this._ipfsModelLoader.getModel(null, this._models[this._activeModel].ipfs, this._scene, new Vector3(pickedPoint.pickedPoint.x, 0, pickedPoint.pickedPoint.z), 3);
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
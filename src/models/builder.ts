import { Scene, Vector3 } from "@babylonjs/core";
import { int } from "babylonjs";
import { getCollections } from "../api/modelCollections";
import { Hud } from "../ui";
import { ModelEngine } from "./modelengine";

export class Builder {
    
    private _modelEngine;
    private _ui;
    private _scene;
    
    //Mouse coords
    private _mouseX;
    private _mouseY;

    private _modelCollections = [];
    private _models = [];
    private _currentCollection;
    private _activeModel = 1;

    private _currentHeight = 1;
    private _currentScale = 1;
    private _currentRotation = 0;

    private _heightStep = 1;
    private _rotationStep = 90;
    private _scaleStep = 1;

    private buildingObject;
    public buildingMode: boolean = false;

    private keyMap = {
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
        
/*            if(this.buildingMode){
              this.buildingObject.isPickable = false;
              /*addModelToPrefab(this._models[this._activeModel]._id, this.buildingObject.position, this.buildingObject.rotation, this._currentScale).then((r) => {
                console.log("Model update", r)
              })
              this.initBuildingModel()
            }*/
          
  
        window.addEventListener('mousemove', this.mouseMove);
    
        window.addEventListener('keydown', this.keyDown);

    }

    private clickHandler(e): void{

    }

    private mouseMove(e): void{
        this._mouseX = e.clientX
        this._mouseY = e.clientY

        if(this.buildingObject){
          let ray = this._scene.pick(this._mouseX, this._mouseY);
        console.log(ray)
          if(ray.hit){
            this.buildingObject.position = new Vector3(ray.pickedPoint.x.toFixed(1), this._currentHeight * this._currentScale, ray.pickedPoint.z.toFixed(1));
          }
        }
    }

    private keyDown(e){
        let key = this.keyMap[e.key]
        console.log("KeyDown", key, e.key)
        switch(key){
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
                this.scaleUp();
                break;
            case 'SCALE_DOWN':
                this.scaleDown();
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

    private addScale(amt: number){
        console.log(this._currentScale + amt)
        this._currentScale += amt;
    }

    private scaleDown(){
        this.addScale(-1)
        this.buildingObject.scaling = new Vector3(this._currentScale, this._currentScale, this._currentScale);
    }
    private scaleUp(){
        this.addScale(1);

        this.buildingObject.scaling = new Vector3(this._currentScale, this._currentScale, this._currentScale);
    }


    private changeLevel(index: number){
        this._currentHeight = this._currentHeight + index;
        this.buildingObject.position.y = (this._currentScale * this._currentHeight);
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
            this.buildingObject.rotation = new Vector3(0, this._currentRotation * Math.PI / 180, 0);
        }
    }

    private toggleBuilding(){
        console.log("Building Toggle")
        this.buildingMode = !this.buildingMode;
        this.updateUI()
        if(this.buildingMode){
            this.initBuildingModel()
            this._ui.mountBuildMenu(this._modelCollections);
        }else{
            this.deinitBuildingModel()
            this._ui.unmountBuildMenu();
        }
    }

    public changeCollection(id){
        console.log("Change collection: ", id)
        this._currentCollection = this._modelCollections.filter((a) => a._id == id)[0];
        this._models = this._currentCollection.items;
        this.deinitBuildingModel()
        this.initBuildingModel();
        
        console.log(this._models, this._currentCollection)
        this.updateUI()
    }

    public placeModel(cid, pos, rot, scale){
    
    }
    
    private updateUI(){
        this._ui._clockTime.text = this.buildingMode ? "Build Mode: " + this._models[this._activeModel].name : "";
    
    }
    
    private initBuildingModel() {
        let pickedPoint = this._scene.pick(this._mouseX, this._mouseY);
        this._modelEngine.instanceModel(this._models[this._activeModel].ipfs, (err, model) => {
    
          this.buildingObject = model;
          this.buildingObject.isPickable = false;
          this.buildingObject.position = new Vector3(pickedPoint.pickedPoint.x, this._currentHeight * this._currentScale, pickedPoint.pickedPoint.z)
          this.buildingObject.scaling = new Vector3(this._currentScale, this._currentScale, this._currentScale);
          this.buildingObject.rotation = new Vector3(0, this._currentRotation * Math.PI / 180, 0)
          this._scene.addMesh(this.buildingObject)
        })
        //this._ipfsModelLoader.getModel(null, this._models[this._activeModel].ipfs, this._scene, new Vector3(pickedPoint.pickedPoint.x, 0, pickedPoint.pickedPoint.z), 3);
      }
    
      private deinitBuildingModel(){
        this.buildingObject.dispose()
      }
    
}
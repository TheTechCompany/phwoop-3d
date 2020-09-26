import { Scene, ActionManager, ExecuteCodeAction, Observer, Scalar } from '@babylonjs/core';
import { Hud } from './ui';

export class PlayerInput{

    public inputMap : any;
    private _scene: Scene;
    
    public horizontal: number = 0;
    public vertical: number = 0;

    public horizontalAxis: number = 0;
    public verticalAxis: number = 0;

    public jumpKeyDown: boolean = false;
    public dashing: boolean = false;

    private _ui: Hud;
    public mobileLeft: boolean;
    public mobileRight: boolean;

    public mobileUp: boolean;
    public mobileDown: boolean;
    private _mobileJump: boolean;
    private _mobileDash: boolean;

    constructor(scene: Scene, ui: Hud){

        this._scene = scene;
        this._ui = ui;

        this._scene.actionManager = new ActionManager(this._scene);

        this.inputMap = {};
        scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (evt) => {
            this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }))

        scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (evt) => {
            this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }))

        scene.onBeforeRenderObservable.add(() => {
            this._updateFromKeyboard();
        })

        if(this._ui.isMobile){
            this._setupMobile();
        }
    }

    private _updateFromKeyboard(): void{

        if((this.inputMap["ArrowUp"] || this.mobileUp) && !this._ui.gamePaused){
            this.verticalAxis = 1;
            this.vertical = Scalar.Lerp(this.vertical, 1, 0.2);
        }else if((this.inputMap["ArrowDown"] || this.mobileDown) && !this._ui.gamePaused){
            this.vertical = Scalar.Lerp(this.vertical, -1, 0.2);
            this.verticalAxis = -1;
        }else{
            this.vertical = 0;
            this.verticalAxis = 0;
        }

        if((this.inputMap["ArrowLeft"] || this.mobileLeft) && !this._ui.gamePaused){
            this.horizontal = Scalar.Lerp(this.horizontal, -1, 0.2);
            this.horizontalAxis = -1;
        }else if((this.inputMap["ArrowRight"] || this.mobileRight) && !this._ui.gamePaused){
            this.horizontal = Scalar.Lerp(this.horizontal, 1, 0.2);
            this.horizontalAxis = 1;
        }else{
            this.horizontal = 0;
            this.horizontalAxis = 0;
        }

        if((this.inputMap["Shift"] || this._mobileDash) && this._ui.gamePaused){
            this.dashing = true;
        }else{  
            this.dashing = false;
        }

        if((this.inputMap[" "] || this._mobileJump) && !this._ui.gamePaused){
            this.jumpKeyDown = true;
        }else{
            this.jumpKeyDown = false;
        }


    }

    private _setupMobile(): void{
        this._ui.jumpBtn.onPointerDownObservable.add(() => {
            this._mobileJump = true;
        })

        this._ui.jumpBtn.onPointerUpObservable.add(() => {
            this._mobileJump = false;
        })

        this._ui.dashBtn.onPointerDownObservable.add(() => {
            this._mobileDash = true;
        })

        this._ui.dashBtn.onPointerUpObservable.add(() => {
            this._mobileDash = false;
        })

        this._ui.leftBtn.onPointerDownObservable.add(() => {
            this.mobileLeft = true;
        })

        this._ui.rightBtn.onPointerDownObservable.add(() => {
            this.mobileRight = true;
        })

        this._ui.rightBtn.onPointerUpObservable.add(() => {
            this.mobileRight = false
        })

        this._ui.upBtn.onPointerDownObservable.add(() => {
            this.mobileUp = true;
        })

        this._ui.upBtn.onPointerUpObservable.add(() => {
            this.mobileUp = false
        })

        this._ui.downBtn.onPointerDownObservable.add(() => {
            this.mobileDown = true;
        });
        this._ui.downBtn.onPointerUpObservable.add(() => {
            this.mobileDown = false;
        });


    }
}
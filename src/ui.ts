import { TextBlock, ScrollViewer, StackPanel, AdvancedDynamicTexture, Image, Button, Rectangle, Control, Grid } from "@babylonjs/gui";
import { Scene, Sound, ParticleSystem, PostProcess, Effect, SceneSerializer, Observable, Color3 } from "@babylonjs/core";
import { Builder } from "./models/builder";

export class Hud {
    private _scene: Scene;
    private _builder: Builder;

    private _playerUI;
    public _clockTime;

    private tutorial;

    private isMobile;

    private dashBtn;
    private jumpBtn;
    private leftBtn;
    private rightBtn;
    private upBtn;
    private downBtn;

    private _activeType = "buildings"

    private headerItems = [
        {
            type: "buildings",
            label: "Build",
            icon: "icons/build.svg"
        },
        {
            type: "nature",
            label: "Nature",
            icon: "icons/nature.svg"
        },
        {
            object: ["light"],
            label: "Light",
            icon: "icons/light.svg"
        },
        {
            label: "Art",
            object: ["speaker", "frame"],
            type: "media",
            icon: "icons/art.svg"
        }];

    private _buildMenu;

    private _controls;

    constructor(scene: Scene, builder: Builder) {

        this._scene = scene;
        this._builder = builder;

        const playerUI = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        this._playerUI = playerUI;
        this._playerUI.idealHeight = 720;


        const stackPanel = new StackPanel();
        stackPanel.height = "100%";
        stackPanel.width = "100%";
        stackPanel.top = "14px";
        stackPanel.verticalAlignment = 0;
        playerUI.addControl(stackPanel);

        //Game timer text
        const clockTime = new TextBlock();
        clockTime.name = "clock";
        clockTime.textHorizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_CENTER;
        clockTime.fontSize = "48px";
        clockTime.color = "white";
        clockTime.text = "";
        clockTime.resizeToFit = true;
        clockTime.height = "96px";
        clockTime.width = "220px";
        clockTime.fontFamily = "Viga";
        stackPanel.addControl(clockTime);
        this._clockTime = clockTime;

       
        //popup tutorials + hint
        const tutorial = new Rectangle();
        tutorial.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        tutorial.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        tutorial.top = "12%";
        tutorial.left = "-1%";
        tutorial.height = 0.2;
        tutorial.width = 0.2;
        tutorial.thickness = 0;
        tutorial.alpha = 0.6;
        this._playerUI.addControl(tutorial);
        this.tutorial = tutorial;
        //movement image, will disappear once you attempt all of the moves
        let movementPC = new Image("pause", "sprites/tutorial.jpeg");
        tutorial.addControl(movementPC);

        

        this._createControlsMenu();

        //Check if Mobile, add button controls
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            this.isMobile = true; // tells inputController to track mobile inputs

            //tutorial image
            movementPC.isVisible = false;
            let movementMobile = new Image("pause", "sprites/tutorialMobile.jpeg");
            tutorial.addControl(movementMobile);
            //--ACTION BUTTONS--
            // container for action buttons (right side of screen)
            const actionContainer = new Rectangle();
            actionContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
            actionContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
            actionContainer.height = 0.4;
            actionContainer.width = 0.2;
            actionContainer.left = "-2%";
            actionContainer.top = "-2%";
            actionContainer.thickness = 0;
            playerUI.addControl(actionContainer);

            //grid for action button placement
            const actionGrid = new Grid();
            actionGrid.addColumnDefinition(.5);
            actionGrid.addColumnDefinition(.5);
            actionGrid.addRowDefinition(.5);
            actionGrid.addRowDefinition(.5);
            actionContainer.addControl(actionGrid);

            const dashBtn = Button.CreateImageOnlyButton("dash", "./sprites/aBtn.png");
            dashBtn.thickness = 0;
            dashBtn.alpha = 0.8;
            dashBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
            this.dashBtn = dashBtn;

            const jumpBtn = Button.CreateImageOnlyButton("jump", "./sprites/bBtn.png");
            jumpBtn.thickness = 0;
            jumpBtn.alpha = 0.8;
            jumpBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
            this.jumpBtn = jumpBtn;

            actionGrid.addControl(dashBtn, 0, 1);
            actionGrid.addControl(jumpBtn, 1, 0);

            //--MOVEMENT BUTTONS--
            // container for movement buttons (section left side of screen)
            const moveContainer = new Rectangle();
            moveContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
            moveContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
            moveContainer.height = 0.4;
            moveContainer.width = 0.4;
            moveContainer.left = "2%";
            moveContainer.top = "-2%";
            moveContainer.thickness = 0;
            playerUI.addControl(moveContainer);

            //grid for placement of arrow keys
            const grid = new Grid();
            grid.addColumnDefinition(.4);
            grid.addColumnDefinition(.4);
            grid.addColumnDefinition(.4);
            grid.addRowDefinition(.5);
            grid.addRowDefinition(.5);
            moveContainer.addControl(grid);

            const leftBtn = Button.CreateImageOnlyButton("left", "./sprites/arrowBtn.png");
            leftBtn.thickness = 0;
            leftBtn.rotation = -Math.PI / 2;
            leftBtn.color = "white";
            leftBtn.alpha = 0.8;
            leftBtn.width = 0.8;
            leftBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
            this.leftBtn = leftBtn;

            const rightBtn = Button.CreateImageOnlyButton("right", "./sprites/arrowBtn.png");
            rightBtn.rotation = Math.PI / 2;
            rightBtn.thickness = 0;
            rightBtn.color = "white";
            rightBtn.alpha = 0.8;
            rightBtn.width = 0.8;
            rightBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
            this.rightBtn = rightBtn;

            const upBtn = Button.CreateImageOnlyButton("up", "./sprites/arrowBtn.png");
            upBtn.thickness = 0;
            upBtn.alpha = 0.8;
            upBtn.color = "white";
            this.upBtn = upBtn;

            const downBtn = Button.CreateImageOnlyButton("down", "./sprites/arrowBtn.png");
            downBtn.thickness = 0;
            downBtn.rotation = Math.PI;
            downBtn.color = "white";
            downBtn.alpha = 0.8;
            this.downBtn = downBtn;

            //arrange the buttons in the grid
            grid.addControl(leftBtn, 1, 0);
            grid.addControl(rightBtn, 1, 2);
            grid.addControl(upBtn, 0, 1);
            grid.addControl(downBtn, 1, 1);

        }
        this._scene.addTexture
    }

    public mountBuildMenu(collections): void{
        let sv = new ScrollViewer();
        sv.widthInPixels = 300;
        sv.height = 1;
        sv.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        this._buildMenu = sv;
        this._playerUI.addControl(sv)

        //Builder Grid
        let grid = new Grid();
        grid.addColumnDefinition(300, true)


        //Header Grid
        let headerGrid = new Grid();
        headerGrid.addRowDefinition(60, true)
        for(var i = 0; i < this.headerItems.length; i++){
          let item = this.headerItems[i];
          headerGrid.addColumnDefinition(300 / this.headerItems.length, true)
          
          let type = item.type;
          let button = Button.CreateImageOnlyButton("header-" + item.type, item.icon)

          button.onPointerClickObservable.add((e) => {
              console.log("Header Menu Button")
              this._activeType = type
          }, null, null, this)
          button.background = (this._activeType == item.type ? "#dfdfdf" : "white");
          button.paddingLeftInPixels = 2;
          button.paddingRightInPixels = 2;
          headerGrid.addControl(button, 0, i)
        }


        grid.addRowDefinition(60, true)
        grid.addControl(headerGrid, 0, 0)

        for(var i = 0; i < collections.length; i++){
            grid.addRowDefinition(60, true)

            let button = Button.CreateSimpleButton(collections[i]._id, collections[i].name)
            let collectionId = collections[i]._id
            button.onPointerClickObservable.add((e) => {
                console.log("Change collection to: " + collectionId)
                this._builder.changeCollection(collectionId)
            })
            //panel.addControl(button)
            grid.addControl(button, i+1, 0)

        }

        this._buildMenu.addControl(grid)

        
    }

    public unmountBuildMenu(): void{
        this._playerUI.removeControl(this._buildMenu)
    }

    public updateHud(): void {
      /*  if (!this._stopTimer && this._startTime != null) {
            let curTime = Math.floor((new Date().getTime() - this._startTime) / 1000) + this._prevTime; // divide by 1000 to get seconds

            this.time = curTime; //keeps track of the total time elapsed in seconds
            this._clockTime.text = this._formatTime(curTime);
        }*/
    }


    //---- Game Timer ----
    public startTimer(): void {
        //this._startTime = new Date().getTime();
        //this._stopTimer = false;
    }
    public stopTimer(): void {
        //this._stopTimer = true;
    }

    //format the time so that it is relative to 11:00 -- game time
    private _formatTime(time: number): void {
        let minsPassed = Math.floor(time / 60); //seconds in a min 
        let secPassed = time % 240; // goes back to 0 after 4mins/240sec
        //gameclock works like: 4 mins = 1 hr
        // 4sec = 1/15 = 1min game time        
        if (secPassed % 4 == 0) {
           // this._mString = Math.floor(minsPassed / 4) + 11;
           // this._sString = (secPassed / 4 < 10 ? "0" : "") + secPassed / 4;
        }
        //let day = (this._mString == 11 ? " PM" : " AM");
       // return (this._mString + ":" + this._sString + day);
    }

   

    //---- Pause Menu Popup ----
    private _createPauseMenu(): void {
        /*this.gamePaused = false;

        const pauseMenu = new Rectangle();
        pauseMenu.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        pauseMenu.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        pauseMenu.height = 0.8;
        pauseMenu.width = 0.5;
        pauseMenu.thickness = 0;
        pauseMenu.isVisible = false;

        //background image
        const image = new Image("pause", "sprites/pause.jpeg");
        pauseMenu.addControl(image);

        //stack panel for the buttons
        const stackPanel = new StackPanel();
        stackPanel.width = .83;
        pauseMenu.addControl(stackPanel);

        const resumeBtn = Button.CreateSimpleButton("resume", "RESUME");
        resumeBtn.width = 0.18;
        resumeBtn.height = "44px";
        resumeBtn.color = "white";
        resumeBtn.fontFamily = "Viga";
        resumeBtn.paddingBottom = "14px";
        resumeBtn.cornerRadius = 14;
        resumeBtn.fontSize = "12px";
        resumeBtn.textBlock.resizeToFit = true;
        resumeBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        resumeBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        stackPanel.addControl(resumeBtn);

        this._pauseMenu = pauseMenu;

        //when the button is down, make menu invisable and remove control of the menu
        resumeBtn.onPointerDownObservable.add(() => {
            this._pauseMenu.isVisible = false;
            this._playerUI.removeControl(pauseMenu);
            this.pauseBtn.isHitTestVisible = true;
            
            //game unpaused, our time is now reset
            this.gamePaused = false;
            this._startTime = new Date().getTime();

            //--SOUNDS--
            this._scene.getSoundByName("gameSong").play();
            this._pause.stop();

            if(this._sparkWarningSfx.isPaused) {
                this._sparkWarningSfx.play();
            }
            this._sfx.play(); //play transition sound
        });

        const controlsBtn = Button.CreateSimpleButton("controls", "CONTROLS");
        controlsBtn.width = 0.18;
        controlsBtn.height = "44px";
        controlsBtn.color = "white";
        controlsBtn.fontFamily = "Viga";
        controlsBtn.paddingBottom = "14px";
        controlsBtn.cornerRadius = 14;
        controlsBtn.fontSize = "12px";
        resumeBtn.textBlock.resizeToFit = true;
        controlsBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        controlsBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;

        stackPanel.addControl(controlsBtn);

        //when the button is down, make menu invisable and remove control of the menu
        controlsBtn.onPointerDownObservable.add(() => {
            //open controls screen
            this._controls.isVisible = true;
            this._pauseMenu.isVisible = false;

            //play transition sound
            this._sfx.play();
        });

        const quitBtn = Button.CreateSimpleButton("quit", "QUIT");
        quitBtn.width = 0.18;
        quitBtn.height = "44px";
        quitBtn.color = "white";
        quitBtn.fontFamily = "Viga";
        quitBtn.paddingBottom = "12px";
        quitBtn.cornerRadius = 14;
        quitBtn.fontSize = "12px";
        resumeBtn.textBlock.resizeToFit = true;
        quitBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        quitBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        stackPanel.addControl(quitBtn);

        //set up transition effect
        Effect.RegisterShader("fade",
            "precision highp float;" +
            "varying vec2 vUV;" +
            "uniform sampler2D textureSampler; " +
            "uniform float fadeLevel; " +
            "void main(void){" +
            "vec4 baseColor = texture2D(textureSampler, vUV) * fadeLevel;" +
            "baseColor.a = 1.0;" +
            "gl_FragColor = baseColor;" +
            "}");
        this.fadeLevel = 1.0;

        quitBtn.onPointerDownObservable.add(() => {
            const postProcess = new PostProcess("Fade", "fade", ["fadeLevel"], null, 1.0, this._scene.getCameraByName("cam"));
            postProcess.onApply = (effect) => {
                effect.setFloat("fadeLevel", this.fadeLevel);
            };
            this.transition = true;

            //--SOUNDS--
            this.quitSfx.play();
            if(this._pause.isPlaying){
                this._pause.stop();
            }
        })
        */
    }

    //---- Controls Menu Popup ----
    private _createControlsMenu(): void {
        const controls = new Rectangle();
        controls.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        controls.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        controls.height = 0.8;
        controls.width = 0.5;
        controls.thickness = 0;
        controls.color = "white";
        controls.isVisible = false;
        this._playerUI.addControl(controls);
        this._controls = controls;

        //background image
        const image = new Image("controls", "sprites/controls.jpeg");
        controls.addControl(image);

        const title = new TextBlock("title", "CONTROLS");
        title.resizeToFit = true;
        title.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        title.fontFamily = "Viga";
        title.fontSize = "32px";
        title.top = "14px";
        controls.addControl(title);

        const backBtn = Button.CreateImageOnlyButton("back", "./sprites/lanternbutton.jpeg");
        backBtn.width = "40px";
        backBtn.height = "40px";
        backBtn.top = "14px";
        backBtn.thickness = 0;
        backBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        backBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        controls.addControl(backBtn);

        //when the button is down, make menu invisable and remove control of the menu
        backBtn.onPointerDownObservable.add(() => {
            //this._pauseMenu.isVisible = true;
            this._controls.isVisible = false;

            //play transition sound
           // this._sfx.play();
        });
    }

}

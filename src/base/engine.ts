import { Engine, Scene } from '@babylonjs/core';

export default class BaseEngine{

  public _canvas;
  public _engine;
  public _scene;

  constructor(){
    var canvas = this._createCanvas();
    canvas.style.display = "hidden";
    const _engine = new Engine(canvas, true);
    this._engine = _engine;
    this._scene = new Scene(this._engine);

    this._engine.runRenderLoop(() => {
      this._scene.render();
    })

    window.addEventListener("resize",  () => {
      this._engine.resize();
    });
  }

  public mount(){
    this._canvas.style.display = "initial";
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
}
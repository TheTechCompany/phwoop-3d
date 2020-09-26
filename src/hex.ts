import { Color3, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3 } from "@babylonjs/core";

export class HexTile{
    private _scene : Scene;
    private _hex: Mesh;
    private _x : number;
    private _y : number;
    
    constructor(scene: Scene, size: number, x: number, y: number){
        this._scene = scene;
        this._x = x;
        this._y = y;
        this.makeHex(size)
    }

    private getHex( hexSize: number) {
        let corners = []
        for(var i = 0; i < 6; i++){
            let angle = i * 2 * Math.PI / 6;
            let _x = hexSize * Math.cos(angle);
            let _y = hexSize * Math.sin(angle);
            corners.push(new Vector3(_x, 0, _y))
        }
        return corners;
    }

    private makeHex(size: number){
        let corners = this.getHex(size)
        console.log(corners)
        this._hex = MeshBuilder.CreatePolygon('hexagon', {depth: 0.1, shape: corners, sideOrientation: Mesh.DOUBLESIDE}, this._scene)
        this._hex.checkCollisions = true

        let height = (size * 2)
        let width = (Math.sqrt(3) * size)

        let x = this._x * (height * (3/4))
        let y = this._y * width

        if(this._x % 2 == 0){
            y =  y - ((Math.sqrt(3) * size) / 2);
            let material = new StandardMaterial("Purple", this._scene);
            material.diffuseColor = Color3.Purple();
            this._hex.material = material;
        }else{
            let material = new StandardMaterial("Green", this._scene);
            material.diffuseColor = Color3.Green();
            this._hex.material = material;
        }
        this._hex.position = new Vector3(x, 0, y)
        this._hex.freezeWorldMatrix();
        //Mesh.CreatePolygon("hex", corners, this._scene)

        //MeshBuilder.CreateBox("box", {depth: 24, width: 24, height: 0.2}, this._scene)
    }
}
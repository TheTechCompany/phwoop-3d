import { ScrollViewer, Control, Grid, Button } from '@babylonjs/gui';
import { getCollections } from '../api/modelCollections';

export default class BuildMenu extends ScrollViewer{

    private _mainGrid : Grid;

    private _listGrid : Grid;
    private _headerGrid : Grid;
    
    private _headerButtons = [];

    private _activeType = "buildings"
    private _activeCollection = null;

    private _modelChanged;

    public _models = [];

    private _breadCrumb = "collections"

    private headerItems = [{
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
            type: "light",
            object: ["light"],
            label: "Light",
            icon: "icons/light.svg"
        },
        {
            label: "Art",
            object: ["speaker", "frame"],
            type: "media",
            icon: "icons/art.svg"}];


    constructor(){
        super("build-menu", false);
        this.widthInPixels = 300;
        this.height = 1;
        this.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT

        
        this._setupHeaderGrid()
        getCollections(this._activeType).then((collection) => {
            this._setupMainGrid(collection)
            this.addControl(this._mainGrid)
        })
    }


    public setModelChangeListener(cb){
        this._modelChanged = cb;
    }

    private _setupMainGrid(list){
        if(!this._mainGrid) {
            this._mainGrid = new Grid();
            this._mainGrid.addRowDefinition(60, true)
            this._mainGrid.addRowDefinition(1, false)
            this._mainGrid.addControl(this._headerGrid, 0, 0)
            
        }

        let listScroll = new ScrollViewer(null, false)
        listScroll.width = 1
        listScroll.height = 1

        if(this._listGrid) this._listGrid.dispose()
        this._listGrid = new Grid();
        this._listGrid.heightInPixels = 1600
        for(var i = 0; i < list.length; i++){
            this._listGrid.addRowDefinition(30, true)

            let button = Button.CreateSimpleButton(list[i]._id, list[i].name)
            button.background = "#dfdfdf";
            let collection = list[i];
            let collectionId = list[i]._id
            button.onPointerClickObservable.add((e) => {
                console.log("Change collection to: " + collectionId)
                if(this._breadCrumb == "collections"){
                    this._breadCrumb = "models"
                    this._activeCollection = collectionId;
                    this._setupMainGrid(collection.items)
                }else{
                    console.log("Set active model", collection)
                    //Set active model in builder
                    if(this._modelChanged) this._modelChanged(this._activeType, collection)
                }
                
            })
            //panel.addControl(button)
            this._listGrid.addControl(button, i+1, 0)
        }
    
        listScroll.addControl(this._listGrid)
        this._mainGrid.addControl(listScroll, 1, 0)
    }

    private _setupContent(item){
        let headerItem = this.headerItems.filter((a) => a.type == item)[0]

        if(headerItem.object){
            
        }else{
            getCollections(this._activeType).then((list) => {
                this._setupMainGrid(list)
            })
        }
    }

    private _setupHeaderGrid(){
        this._headerGrid = new Grid();
        this._headerGrid.addRowDefinition(60, true)
        for(var i = 0; i < this.headerItems.length; i++){
          let item = this.headerItems[i];
          this._headerGrid.addColumnDefinition(300 / this.headerItems.length, true)
          
          let type = item.type;
          let button = Button.CreateImageOnlyButton("header-" + item.type, item.icon)

          button.onPointerClickObservable.add((e) => {
              console.log("Header Menu Button Clicked")
              this._activeType = type
              this._breadCrumb = "collections";
              this._headerButtons.map((x) => x.background = "white");
              button.background = "#dfdfdf";
              this._setupContent(item.type)

              if(item.object){
                this._modelChanged(type)
              }
          })

          button.background = (this._activeType == item.type ? "#dfdfdf" : "white");
          button.paddingLeftInPixels = 2;
          button.paddingRightInPixels = 2;
          this._headerButtons.push(button)
          this._headerGrid.addControl(button, 0, i)
        }
    }
}
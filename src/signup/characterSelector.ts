import { Scene } from "babylonjs/scene";

export class CharacterSelector{
    private _scene: Scene;
    private _characters = {
        'Michelle': {
            cid: 'QmPTBtUaohMMNh5gjAgZjeqeFAZwmTNmU4E5GQpsKaBRPB',
            image: '/characters/michelle.png'
        },
        'Abe': {
            cid: 'QmPBwT21p8KYgDj9xatQeLtTut3aUEykGTht2rEUCW9g1i',
            image: '/characters/abe.png'
        }, 
        'Sporty Granny': {
            cid: 'QmYRb2nEC1KcDHjeeUQCBHQjDwsNN7cPw5cDTJGbzgePAD',
            image: '/characters/sporty-granny.png'
        },
        'Erika': {
            cid: 'QmVXQ7GRDGvRdJHqbAz8UC1KFdeBs75QhghifKWM9iha2k',
            image: '/characters/erika.png'
        }
    }

    private signupContainer;
    private loadCallback;

    constructor(callback){
        this.loadCallback = callback;

        this.signupContainer = document.createElement('div')
        this.signupContainer.className = "signup-container"
        for(var character in this._characters){
            let characterOpt = document.createElement('div')
            characterOpt.addEventListener('click', this.selectCharacter.bind(this, character))
            characterOpt.className = "character-opt";
            let characterImage = document.createElement('img')
            characterImage.src = this._characters[character].image;
            characterOpt.append(characterImage)

            let characterText = document.createElement('h4')
            characterText.innerHTML = character;

            characterOpt.append(characterText)
        
            this.signupContainer.append(characterOpt)
        }


    }

    public selectCharacter(char){
        console.log(char)
        this.loadCallback(this._characters[char])
        this.signupContainer.remove()
    }

    public mount(){
        document.body.append(this.signupContainer)
        
    }
}
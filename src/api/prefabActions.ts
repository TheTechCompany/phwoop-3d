import { BASEURL } from './conf';
import { Color3 } from '@babylonjs/core'

export function addModelToPrefab(model, position, rotation, scale){
    return fetch(`${BASEURL}/prefabs/5f802d9856b6aa82f052b267`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: model,
            position: {
                x: position.x,
                y: position.y,
                z: position.z
            },
            rotation: {
                x: rotation.x,
                y: rotation.y,
                z: rotation.z
            },
            scaling: scale
        })
    }).then((r) => {
        return r.json()
    })
}

export function addLightToPrefab(position, intensity, color : Color3){
    return fetch(`${BASEURL}/prefabs/5f802d9856b6aa82f052b267/lights`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            color: {
                r: color.r,
                g: color.g,
                b: color.b
            },
            intensity: intensity,
            position: position
        })
    }).then((r) => r.json())
}

export function getPrefab(){
    return fetch(`${BASEURL}/prefabs/5f802d9856b6aa82f052b267`).then((r) => {
        return r.json()
    })
}
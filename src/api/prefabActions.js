import { BASEURL } from './conf';

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

export function getPrefab(){
    return fetch(`${BASEURL}/prefabs/5f802d9856b6aa82f052b267`).then((r) => {
        return r.json()
    })
}
import { BASEURL } from './conf';

export function getModels(collection){
    return fetch(`${BASEURL}/collections/${collection}`).then((r) => r.json())
}

export function getCollections(){
    return fetch(`${BASEURL}/collections`).then((r) => r.json())
}
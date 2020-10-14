import { BASEURL } from './conf';

export function getModels(collection){
    return fetch(`${BASEURL}/collections/id/${collection}`).then((r) => r.json())
}

export function getCollections(type){
    return fetch(`${BASEURL}/collections/${type}`).then((r) => r.json())
}
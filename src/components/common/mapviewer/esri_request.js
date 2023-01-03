import { LoadModules } from './esri_loader'
export const esriRequest = function (url) {
  var token = ''
  //token now = window.__token__
  return LoadModules(['esri/request']).then(([esriRequest]) => {
    var requestHandler = esriRequest({
      'url': url,
      'content': { 'f': 'json', 'token': token },
      'callbackParamName': 'callback'
    })

    if (!window.esriRequest)
      return requestHandler.then((data) => {
        return data
      }, () => {
        throw new Error('error getting ESRI_TOKEN');
      });
  })
}

export const getMapInfo = async () => {
  return await fetch(window.__mapUrl__ + '?f=pjson', { method: 'GET' }).then(response => response.json()).then(json => json)
}

export const getFeatureServiceInfo = async (token) => {
  return await fetch(window.__applyEditsUrl__ + '?f=pjson'+`&token=${token}`, { method: 'GET' }).then(response => response.json()).then(json => json)
}

export const getLegend = async (url) => {
  return await fetch(url || window.__mapUrl__ + '/legend?f=pjson', { method: 'GET' }).then(response => response.json()).then(json => json)
}
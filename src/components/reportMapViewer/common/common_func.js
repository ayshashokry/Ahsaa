import { find } from "lodash"
import { esriRequest } from "../../common/mapviewer"

export const getFeatureDomainName = function (features, layerId, notReturnCode , mapServiceUrl) {

    return getDomain(layerId, {},mapServiceUrl).then(function (data) {
      var codedValue = {}
      features.forEach(function (feature) {
        Object.keys(feature.attributes).forEach(function (attr) {
          let result = find(data, { name: attr })
          if (result && result.domain) {
            codedValue = find(result.domain.codedValues, { 'code': feature.attributes[attr] })
            if (!codedValue) {
              if (!isNaN(feature.attributes[attr])) {
                codedValue = find(result.domain.codedValues, {
                  'code': +feature.attributes[attr]
                })
              }
            }
            if (codedValue && codedValue.name) {
              if (!notReturnCode)
                feature.attributes[attr + '_Code'] = feature.attributes[attr]
              feature.attributes[attr] = codedValue.name
            }
          }
        })
      })
      return features
    }, function (error) {
      return
    })
  }
  let serv = { Domains: {} };
  // fieldName ,code for subtypes
  export const getDomain = function (layerId, settings, mapServiceUrl) {
    return new Promise((resolve, reject) => {
      let loadings = [];
      var returnedDomain;
  
      if (serv.Domains && serv.Domains[layerId]) {
        const domain = serv.Domains[layerId];
        if (!settings.fieldName && !settings.code) {
          domain.fields.forEach(function (field) {
            if (!field.domain) {
              settings.fieldName = field.name;
              settings.isSubType = true;
              if (domain.types) {
                returnedDomain = getSubTypes(domain, settings);
  
                if (returnedDomain) {
                  if (settings.isfilterOpened) field.domain = returnedDomain;
                  else field.domain = { codedValues: returnedDomain };
                } else field.domain = null;
              }
            }
          });
          returnedDomain = domain.fields;
        } else if (settings.isSubType && settings.fieldName) {
          returnedDomain = getSubTypes(domain, settings);
        } else {
          domain.fields.forEach(function (field) {
            if (field.name == settings.fieldName && field.domain) {
              returnedDomain = field.domain.codedValues;
            }
          });
        }
      }
  
      if (returnedDomain) {
        resolve(returnedDomain);
        return;
      } else {
        var url = mapServiceUrl + "/" + layerId;
        if (loadings.indexOf(url) == -1) {
          loadings.push(url);
          esriRequest(url).then(
            (res) => {
              serv.Domains = {
                [layerId]: {
                  fields: res.fields,
                  types: res.types,
                },
              };
              loadings.pop(url);
              getDomain(layerId, settings).then(
                (data) => {
                  resolve(data);
                  return;
                },
                function () {}
              );
            },
            function () {
              loadings.pop(url);
            }
          );
        } else {
          return reject();
        }
      }
    });
  };

  export const getSubTypes = function (domain, settings) {
    var returnedDomain = []
    if (domain.types) {
      domain.types.forEach(function (subType) {
        if (settings.isSubType && !settings.code) {
          if (!returnedDomain)
            returnedDomain = []
  
          if (subType.domains[settings.fieldName]) {
            if (settings.isfilterOpened)
              returnedDomain.push({ id: subType.id, name: subType.name, isSubType: true })
            else
              returnedDomain.push.apply(returnedDomain, subType.domains[settings.fieldName].codedValues)
          }
        } else {
          if (subType.id == settings.code && subType.domains[settings.fieldName]) {
            returnedDomain = subType.domains[settings.fieldName].codedValues
          }
        }
      })
    }
  
    return returnedDomain.length == 0
      ? null
      : returnedDomain
  }
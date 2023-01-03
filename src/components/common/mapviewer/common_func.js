import { esriRequest } from "./esri_request";
import store from "../../../redux/store";
import { find, differenceBy, difference } from "lodash";
import { LoadModules } from "./esri_loader";
import logolocation from "../../../assets/images/location.svg"; // with import
import { layersSetting } from "../../reportMapViewer/config";
import { notificationMessage } from "../../../helpers/utlis/notifications_Func";

export const clearGraphicFromMap = function (map, name) {
  map.graphics.graphics.forEach(function (graphic) {
    if (graphic.attributes) {
      if (graphic.attributes.name == name) map.graphics.remove(graphic);
    }
  });
};

export const clearAllGraphicLayers = function (map) {
  ["zoomGraphicLayer", "highLightGraphicLayer"].forEach((layer) => {
    map.getLayer(layer).clear();
  });
};

export const getFeatureDomainName = function (
  features,
  layerId,
  notReturnCode
) {
  //
  return getDomain(layerId, {}).then(
    function (data) {
      var codedValue = {};
      features.forEach(function (feature) {
        Object.keys(feature.attributes).forEach(function (attr) {
          let result = find(data, { name: attr });
          if (result && result.domain) {
            codedValue = find(result.domain.codedValues, {
              code: feature.attributes[attr],
            });
            if (!codedValue) {
              if (!isNaN(feature.attributes[attr])) {
                codedValue = find(result.domain.codedValues, {
                  code: +feature.attributes[attr],
                });
              }
            }
            if (codedValue && codedValue.name) {
              if (!notReturnCode)
                feature.attributes[attr + "_Code"] = feature.attributes[attr];
              feature.attributes[attr] = codedValue.name;
            }
          }
        });
      });
      return features;
    },
    function (error) {
      return;
    }
  );
};

export const queryTask = function (settings) {
  // url, where, outFields, callbackResult,statistics[], callbackError, preQuery, returnGeometry) {

  LoadModules([
    "esri/tasks/query",
    "esri/tasks/StatisticDefinition",
    "esri/tasks/QueryTask",
  ]).then(([Query, StatisticDefinition, QueryTask]) => {
    var query = new Query();
    query.returnGeometry = settings.returnGeometry || false;
    if (settings.spatialRelationship) {
      query.spatialRelationship = settings.spatialRelationship;
    }
    if (settings.outSpatialReference) {
      query.outSpatialReference = settings.outSpatialReference;
    }

    if (settings.geometry) {
      query.geometry = window.dojo.clone(settings.geometry);
    }

    // Zero-based index indicating where to begin retrieving features.
    // query.start = settings.start

    // Number of features to retrieve.
    // query.num = 10
    query.returnIdsOnly = settings.returnIdsOnly || false;
    //query.returnCountOnly = settings.returnCountOnly || false
    query.outFields = settings.outFields || ["*"];
    query.returnDistinctValues = settings.returnDistinctValues || false;

    if (query.returnDistinctValues) {
      query.returnGeometry = false;
    }

    if (settings.statistics) {
      query.outStatistics = [];
      settings.statistics.forEach(function (val) {
        var statisticDefinition = new StatisticDefinition();
        statisticDefinition.statisticType = val.type;
        statisticDefinition.onStatisticField = val.field;
        statisticDefinition.outStatisticFieldName = val.name;
        query.outStatistics.push(statisticDefinition);
      });
    }

    query.groupByFieldsForStatistics = settings.groupByFields;
    if(settings.resultRecordCount) query.resultRecordCount = settings.resultRecordCount;
    query.orderByFields = settings.orderByFields; // array
    // query.returnCountOnly = settings.returnCountOnly || false
    if (settings.preQuery) {
      settings.preQuery(query, Query);
    }

    if (settings.queryWithGemoerty) {
      query.geometry = settings.geometry;
      query.distance = 5;
    } else query.where = settings.where || "1=1";

    var queryTask = new QueryTask(settings.url);

    function callback(data) {
      // console.log(`query_result:`,data);
      settings.callbackResult && settings.callbackResult(data);
    }

    function callbError(data) {
      console.error(`query_result: ${data}`);

      if (settings.callbackError) {
        settings.callbackError && settings.callbackError(data);
      }
    }

    if (settings.returnCountOnly) {
      queryTask.executeForCount(query, callback, callbError);
    } else {
      queryTask.execute(query, callback, callbError);
    }
  });
};

export const getStatistics = function (attribute, layerIndex) {
  return new Promise((resolve, reject) => {
    LoadModules([
      "esri/tasks/query",
      "esri/tasks/StatisticDefinition",
      "esri/tasks/QueryTask",
    ]).then(([Query, StatisticDefinition, QueryTask]) => {
      var sqlExpression = "1";

      var url = `${window.__mapUrl__}/${layerIndex}`;
      var sd = new StatisticDefinition();
      sd.statisticType = "count";
      sd.onStatisticField = sqlExpression;
      sd.outStatisticFieldName = "Count";

      var queryParams = new Query();
      queryParams.outFields = [attribute];
      queryParams.outStatistics = [sd];
      queryParams.groupByFieldsForStatistics = [attribute];
      var queryTask = new QueryTask(url);
      queryTask.execute(queryParams).then((r) => {
        getFeatureDomainName(r.features, layerIndex).then((res) => {
          resolve(res);
        });
      });
    });
  });
};

let serv = { Domains: {} };
// fieldName ,code for subtypes
export const getDomain = function (layerId, settings) {
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
      var url = window.__mapUrl__ + "/" + layerId;
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
  var returnedDomain = [];
  if (domain.types) {
    domain.types.forEach(function (subType) {
      if (settings.isSubType && !settings.code) {
        if (!returnedDomain) returnedDomain = [];

        if (subType.domains[settings.fieldName]) {
          if (settings.isfilterOpened)
            returnedDomain.push({
              id: subType.id,
              name: subType.name,
              isSubType: true,
            });
          else
            returnedDomain.push.apply(
              returnedDomain,
              subType.domains[settings.fieldName].codedValues
            );
        }
      } else {
        if (
          subType.id == settings.code &&
          subType.domains[settings.fieldName]
        ) {
          returnedDomain = subType.domains[settings.fieldName].codedValues;
        }
      }
    });
  }

  return returnedDomain.length == 0 ? null : returnedDomain;
};

export const project = function (features, outSR, callback) {
  if (features) {
    var isSameWkid = false;
    if (features.length) {
      if (features[0].spatialReference.wkid == outSR) {
        isSameWkid = true;
        callback([features]);
      }
    } else {
      if (
        features.spatialReference &&
        features.spatialReference.wkid == outSR
      ) {
        isSameWkid = true;
        callback([features]);
      }
    }

    if (!isSameWkid) {
      LoadModules([
        "esri/tasks/ProjectParameters",
        "esri/SpatialReference",
        "esri/tasks/GeometryService",
      ]).then(
        ([ProjectParameters, SpatialReference, GeometryService]) => {
          outSR = new SpatialReference({
            wkid: outSR,
          });

          var gemoertyService = new GeometryService(
            window.__geometryServiceUrl__
          );

          var params = new ProjectParameters();

          if (features.length) params.geometries = features;
          else params.geometries = [features];

          params.outSR = outSR;
          gemoertyService.project(params, callback);
        },
        function (error) {
          //
        }
      );
    } else {
      callback(null);
    }
  }
};

export const queryOnInvestLayers = function (
  where,
  layers,
  layersName,
  settings
) {
  let count = layers.length;
  var result = {};

  return new Promise((resolve, reject) => {
    layers.forEach((layer, key) => {
      queryTask({
        url: window.__mapUrl__ + "/" + layer,
        where: where.join(" and "),
        outFields:
          (settings && settings.outFields) ||
          layersSetting[layersName[key]].outFields,
        callbackResult: (data) => {
          count--;

          if (!result.features) result = data;
          else result.features.push.apply(result.features, data.features);

          if (count == 0) {
            resolve(result);
          }
        },
        returnGeometry: true,
        returnDistinctValues: settings && settings.returnDistinctValues,

        callbackError(error) {},
      });
    });
  });
};

export const highlightFeature = function (feature, map, settings) {
  if (feature) {
    window.identify = false;
    LoadModules([
      "esri/geometry/Point",
      "esri/geometry/Polyline",
      "esri/geometry/Polygon",
      "esri/graphic",
      "esri/symbols/SimpleFillSymbol",
      "esri/symbols/SimpleLineSymbol",
      "esri/symbols/SimpleMarkerSymbol",
      "esri/symbols/PictureMarkerSymbol",
    ]).then(
      ([
        Point,
        Polyline,
        Polygon,
        Graphic,
        SimpleFillSymbol,
        SimpleLineSymbol,
        SimpleMarkerSymbol,
        PictureMarkerSymbol,
      ]) => {
        let symbol;
        let graphicLayer = map.getLayer(settings.layerName);
        console.log(settings.layerName);
        if (!settings.noclear) graphicLayer.clear();

        // let highlightWidth = settings.highlightWidth || 3
        let fillColor = settings.fillColor || "black";
        let strokeColor = settings.strokeColor || "black";
        let highlighColor = settings.highlighColor || [0, 255, 255];
        let Color = window.dojo.Color;

        function highlightGeometry(feature) {
          if (feature.geometry) {
            if (feature.geometry.type == "polygon") {
              feature.geometry = new Polygon(feature.geometry);
              if (settings.isGetCenter) {
                feature.geometry = feature.geometry.getExtent().getCenter();
              }
            } else if (feature.geometry.type == "point") {
              feature.geometry = new Point(feature.geometry);
            }

            var graphic;

            if (feature.geometry.type === "point") {
              if (settings.isHiglightSymbol) {
                strokeColor = highlighColor;
                fillColor = settings.fillColor || highlighColor;
              }

              //settings.zoomFactor = 50
              /*symbol = new SimpleMarkerSymbol(
                SimpleMarkerSymbol.STYLE_CIRCLE,
                28,
                new SimpleLineSymbol(
                  SimpleLineSymbol.STYLE_SOLID,
                  new Color(strokeColor),
                  2
                ),
                new Color([0, 0, 0, 0.2])
              );*/

              symbol = new PictureMarkerSymbol({
                angle: 0,
                xoffset: 0,
                yoffset: 0,
                type: "esriPMS",
                url: logolocation,
                width: 40,
                height: 40,
              });

              if (settings.isInvest) {
                symbol = new PictureMarkerSymbol({
                  angle: 0,
                  xoffset: 0,
                  yoffset: 0,
                  type: "esriPMS",
                  url: "./images/noty.svg",
                  contentType: "image/png",
                  width: 40,
                  height: 40,
                });
              } else if (settings.isInvestPoint) {
                symbol = new PictureMarkerSymbol({
                  angle: 0,
                  xoffset: 0,
                  yoffset: 0,
                  type: "esriPMS",
                  url: "./images/invest_point.svg",
                  contentType: "image/png",
                  width: 40,
                  height: 40,
                });
              } else if (settings.isLocation) {
                console.log("1");
                symbol = new PictureMarkerSymbol({
                  angle: 0,
                  xoffset: 0,
                  yoffset: 0,
                  type: "esriPMS",
                  url: "./marker1.png",
                  contentType: "image/png",
                  width: 40,
                  height: 40,
                });
              }
            } else {
              symbol = GetSymbol(
                settings,
                settings.fillColor || fillColor,
                strokeColor,
                SimpleFillSymbol,
                SimpleLineSymbol,
                PictureMarkerSymbol
              );
            }
            graphic = new Graphic(feature.geometry, symbol, settings.attr);
          } else {
            if (feature.type === "point") {
              if (settings.isHiglightSymbol) {
                strokeColor = highlighColor;
                fillColor = settings.fillColor || highlighColor;
              }
              settings.zoomFactor = 50;
              /*symbol = new SimpleMarkerSymbol(
                SimpleMarkerSymbol.STYLE_CIRCLE,
                28,
                new SimpleLineSymbol(
                  SimpleLineSymbol.STYLE_SOLID,
                  new Color(strokeColor),
                  2
                ),
                new Color(fillColor)
              );*/

              symbol = new PictureMarkerSymbol({
                angle: 0,
                xoffset: 0,
                yoffset: 0,
                type: "esriPMS",
                url: logolocation,
                width: 40,
                height: 40,
              });

              if (settings.isLocation) {
                console.log("2");
                symbol = new PictureMarkerSymbol({
                  angle: 0,
                  xoffset: 0,
                  yoffset: 0,
                  type: "esriPMS",
                  url: "./madenty/marker1.png",
                  contentType: "image/png",
                  width: 40,
                  height: 40,
                });
              }
            } else if (feature.type === "polyline") {
              symbol = new SimpleLineSymbol(
                SimpleLineSymbol.STYLE_SOLID,
                new Color(fillColor),
                7
              );
            } else {
              symbol = GetSymbol(
                settings,
                settings.fillColor || fillColor,
                strokeColor,
                SimpleFillSymbol,
                SimpleLineSymbol,
                PictureMarkerSymbol
              );
            }
            graphic = new Graphic(feature, symbol, settings.attr, null);
          }
          graphicLayer.add(graphic);

          if (!settings.listOfFeatures && settings.isZoom) {
            if (!feature.length) {
              zoomToFeature([feature], map, settings.zoomFactor || 300, () => {
                setTimeout(() => {
                 if (arguments.length === 3)
                    window.__map__._fixedPan(0, window.__map__.height * 0.1);
                }, 200); 
                if (settings.callback) settings.callback();
              });
            } else {
              zoomToFeature(feature, map, settings.zoomFactor || 300, () => {
                setTimeout(() => {
                  if (arguments.length === 3)
                    window.__map__._fixedPan(0, window.__map__.height * 0.1);
                }, 200);
                if (settings.callback) settings.callback();
              });
            }
          }

          graphicLayer.redraw();
        }
        //
        if (feature && !feature.length) {
          if (feature.geometry || feature.type) {
            highlightGeometry(feature);
          }
        } else {
          if (
            feature &&
            feature[0] &&
            feature[0].geometry &&
            feature[0].geometry.type === "point"
          ) {
            if (settings.isHiglightSymbol) {
              strokeColor = highlighColor;
              fillColor = settings.fillColor || highlighColor;
            }
            settings.zoomFactor = 50;
            /*symbol = new SimpleMarkerSymbol(
              SimpleMarkerSymbol.STYLE_CIRCLE,
              10,
              new SimpleLineSymbol(
                SimpleLineSymbol.STYLE_SOLID,
                new Color(strokeColor),
                2
              ),
              new Color(fillColor)
            );*/
            symbol = new PictureMarkerSymbol({
              angle: 0,
              xoffset: 0,
              yoffset: 0,
              type: "esriPMS",
              url: logolocation,
              width: 40,
              height: 40,
            });
          } else {
            symbol = GetSymbol(
              settings,
              settings.fillColor || fillColor,
              strokeColor,
              SimpleFillSymbol,
              SimpleLineSymbol,
              PictureMarkerSymbol
            );
          }

          feature.forEach(function (elem) {
            if (elem.geometry) {
              if (elem.geometry.type == "polygon") {
                elem.geometry = new Polygon(elem.geometry);
                if (settings.isGetCenter) {
                  elem.geometry = elem.geometry.getExtent().getCenter();
                }
              }

              if (settings.isInvest) {
                symbol = new PictureMarkerSymbol({
                  angle: 0,
                  xoffset: 0,
                  yoffset: 0,
                  type: "esriPMS",
                  url: "./images/noty.svg",
                  contentType: "image/png",
                  width: 40,
                  height: 40,
                });
              } else if (settings.isInvestPoint) {
                symbol = new PictureMarkerSymbol({
                  angle: 0,
                  xoffset: 0,
                  yoffset: 0,
                  type: "esriPMS",
                  url: "./images/invest_point.svg",
                  contentType: "image/png",
                  width: 40,
                  height: 40,
                });
              } else if (settings.isLocation) {
                symbol = new PictureMarkerSymbol({
                  angle: 0,
                  xoffset: 0,
                  yoffset: 0,
                  type: "esriPMS",
                  url: "./images/marker2.png",
                  contentType: "image/png",
                  width: 40,
                  height: 40,
                });
              }

              var graphic = new Graphic(
                elem.geometry,
                symbol,
                elem.attributes,
                null
              );
              graphicLayer.add(graphic);
            } else if (elem.type == "point") {
              if (settings.isInvest) {
                symbol = new PictureMarkerSymbol({
                  angle: 0,
                  xoffset: 0,
                  yoffset: 0,
                  type: "esriPMS",
                  url: "./images/noty.svg",
                  contentType: "image/png",
                  width: 40,
                  height: 40,
                });
              } else if (settings.isInvestPoint) {
                symbol = new PictureMarkerSymbol({
                  angle: 0,
                  xoffset: 0,
                  yoffset: 0,
                  type: "esriPMS",
                  url: "./images/invest_point.svg",
                  contentType: "image/png",
                  width: 40,
                  height: 40,
                });
              } else if (settings.isLocation) {
                symbol = new PictureMarkerSymbol({
                  angle: 0,
                  xoffset: 0,
                  yoffset: 0,
                  type: "esriPMS",
                  url: "./images/marker2.png",
                  contentType: "image/png",
                  width: 40,
                  height: 40,
                });
              }

              graphic = new Graphic(elem, symbol, settings.attr, null);
              graphicLayer.add(graphic);
            }
          });

          if (settings.isZoom) {
            if (!feature.length) {
              zoomToFeature([feature], map, settings.zoomFactor || 150, () => {
                setTimeout(() => {
                  if (arguments.length === 3)
                    window.__map__._fixedPan(0, window.__map__.height * 0.1);
                }, 200);
                if (settings.callback) settings.callback();
              });
            } else {
              zoomToFeature(feature, map, settings.zoomFactor || 150, () => {
                // setTimeout(() => {
                //   window.__map__._fixedPan(0, window.__map__.height * 0.1);
                // }, 200);
                if (settings.callback) settings.callback();
              });
            }
          }

          // graphicLayer.redraw();
        }
      }
    );
  }
};

export const GetSymbol = function (
  settings,
  fillColor,
  strokeColor,
  SimpleFillSymbol,
  SimpleLineSymbol,
  PictureMarkerSymbol
) {
  //
  let symbol;
  let Color = window.dojo.Color;
  let highlightWidth = settings.highlightWidth || 3;
  let highlighColor = settings.highlighColor || [0, 255, 255];
  if (settings.isLocation) {
    symbol = new PictureMarkerSymbol({
      angle: 0,
      xoffset: 0,
      yoffset: 0,
      type: "esriPMS",
      url: "./images/marker2.png",
      contentType: "image/png",
      width: 40,
      height: 40,
    });
  } else if (settings.isHiglightSymbol)
    symbol = new SimpleFillSymbol(
      SimpleFillSymbol.STYLE_SOLID,
      new SimpleLineSymbol(
        SimpleFillSymbol.STYLE_SOLID,
        new Color(highlighColor),
        highlightWidth
      ),
      new Color(highlighColor)
    );
  else if (settings.isHiglightFillColorWithBorder)
    symbol = new SimpleFillSymbol(
      SimpleFillSymbol.STYLE_SOLID,
      new SimpleLineSymbol(
        SimpleFillSymbol.STYLE_SOLID,
        new Color(strokeColor),
        highlightWidth
      ),
      new Color(highlighColor)
    );
  else if (settings.isDashStyle)
    symbol = new SimpleFillSymbol(
      SimpleFillSymbol.STYLE_BACKWARD_DIAGONAL,
      new SimpleLineSymbol(
        SimpleFillSymbol.STYLE_SOLID,
        new Color(strokeColor),
        highlightWidth
      ),
      new Color(fillColor)
    );
  else if (settings.isHighlighPolygonBorder)
    symbol = new SimpleFillSymbol(
      SimpleFillSymbol.STYLE_NULL,
      new SimpleLineSymbol(
        SimpleFillSymbol.STYLE_SOLID,
        new Color(strokeColor),
        highlightWidth
      ),
      new Color(fillColor)
    );
  else
    symbol = new SimpleFillSymbol(
      SimpleFillSymbol.STYLE_NULL,
      new SimpleLineSymbol(
        SimpleFillSymbol.STYLE_SOLID,
        new Color(strokeColor),
        highlightWidth
      ),
      new Color(fillColor)
    );

  return symbol;
};

export const zoomToLayer = function (layerName, map, factor) {
  zoomToFeature(map.getLayer(layerName).graphics, map, factor || 2);
};

export const zoomToFeature = function (feature, map, zoomFactor, callback) {
  LoadModules([
    "esri/geometry/Point",
    "esri/geometry/Polyline",
    "esri/geometry/Polygon",
    "esri/graphic",
    "esri/graphicsUtils",
    "esri/geometry/Extent",
  ]).then(([Point, Polyline, Polygon, Graphic, graphicsUtils, Extent]) => {
    //
    var myFeatureExtent;
    //
    try {
      myFeatureExtent = graphicsUtils.graphicsExtent(feature);
    } catch (e) {
      if (feature.length) {
        feature.forEach(function (f) {
          if (f.geometry) {
            if (f.geometry.type == "polygon") {
              if (!f.geometry.spatialReference)
                f.geometry.spatialReference = {
                  wkid: map.spatialReference.wkid,
                };
              f.geometry = new Polygon(f.geometry);
            }
          } else if (f.type) {
            if (f.type == "point") {
              f.geometry = new Point(f);
            }
          }
        });
      } else {
        if (feature.geometry.type == "polygon") {
          feature.geometry = new Polygon(feature.geometry);
        }
        feature = [feature];
      }
      try {
        myFeatureExtent = graphicsUtils.graphicsExtent(feature);
      } catch (e) {
        // $rootScope.$apply()
      }
    }

    if (!feature.length) {
      if (feature.geometry.type == "point") {
        let extent = new Extent(
          myFeatureExtent.xmin - zoomFactor,
          myFeatureExtent.ymin - zoomFactor,
          myFeatureExtent.xmax + zoomFactor,
          myFeatureExtent.ymax + zoomFactor,
          map.spatialReference
        );

        map.setExtent(extent.expand(5)).then(callback);
      } else {
        if (zoomFactor) {
          myFeatureExtent.xmin = myFeatureExtent.xmin - zoomFactor;
          myFeatureExtent.ymin = myFeatureExtent.ymin - zoomFactor;
          myFeatureExtent.xmax = myFeatureExtent.xmax + zoomFactor;
          myFeatureExtent.ymax = myFeatureExtent.ymax + zoomFactor;
        }

        map.setExtent(myFeatureExtent.expand(2)).then(callback);
      }
    } else {
      if (feature[0].geometry) {
        if (feature[0].geometry.type == "point") {
          var extent = new Extent(
            myFeatureExtent.xmin - zoomFactor,
            myFeatureExtent.ymin - zoomFactor,
            myFeatureExtent.xmax + zoomFactor,
            myFeatureExtent.ymax + zoomFactor,
            map.spatialReference
          );

          map.setExtent(extent.expand(5)).then(callback);
        } else {
          if (zoomFactor) {
            myFeatureExtent.xmin = myFeatureExtent.xmin - zoomFactor;
            myFeatureExtent.ymin = myFeatureExtent.ymin - zoomFactor;
            myFeatureExtent.xmax = myFeatureExtent.xmax + zoomFactor;
            myFeatureExtent.ymax = myFeatureExtent.ymax + zoomFactor;
          }

          map.setExtent(myFeatureExtent.expand(2)).then(callback);
        }
      } else if (feature[0].type == "point") {
        extent = new Extent(
          myFeatureExtent.xmin - zoomFactor,
          myFeatureExtent.ymin - zoomFactor,
          myFeatureExtent.xmax + zoomFactor,
          myFeatureExtent.ymax + zoomFactor,
          map.spatialReference
        );

        map.setExtent(extent.expand(5)).then(callback);
      } else {
        if (zoomFactor) {
          myFeatureExtent.xmin = myFeatureExtent.xmin - zoomFactor;
          myFeatureExtent.ymin = myFeatureExtent.ymin - zoomFactor;
          myFeatureExtent.xmax = myFeatureExtent.xmax + zoomFactor;
          myFeatureExtent.ymax = myFeatureExtent.ymax + zoomFactor;
        }

        map.setExtent(myFeatureExtent.expand(2)).then(callback);
      }
    }
  });
};

//for report map
export const highlightFeatureForReportMap = function (feature, map, settings) {
  // layerName, isZoom, fillColor, strokeColor, isDashStyle, isHighlighPolygonBorder, callback, highlightWidth,zoomFactor) {
  if (feature) {
    if (settings && !settings.isSavePreviosZoom) window.extent = undefined;

    LoadModules([
      "esri/geometry/Point",
      "esri/geometry/Polyline",
      "esri/geometry/Polygon",
      "esri/graphic",
      "esri/symbols/SimpleFillSymbol",
      "esri/symbols/SimpleLineSymbol",
      "esri/symbols/SimpleMarkerSymbol",
      "esri/symbols/PictureMarkerSymbol",
    ]).then(
      ([
        Point,
        Polyline,
        Polygon,
        Graphic,
        SimpleFillSymbol,
        SimpleLineSymbol,
        SimpleMarkerSymbol,
        PictureMarkerSymbol,
      ]) => {
        let symbol;
        let graphicLayer = map.getLayer(settings.layerName);

        if (!settings.noclear) graphicLayer.clear();

        // let highlightWidth = settings.highlightWidth || 3
        let fillColor = settings.fillColor || "black";
        let strokeColor = settings.strokeColor || "black";
        let highlighColor = settings.highlighColor || [0, 255, 255];
        let Color = window.dojo.Color;

        function highlightGeometry(feature) {
          if (feature.geometry) {
            if (feature.geometry.type == "polygon") {
              feature.geometry = new Polygon(feature.geometry);
              if (settings.isGetCenter) {
                feature.geometry = feature.geometry.getExtent().getCenter();
              }
            } else if (feature.geometry.type == "point") {
              feature.geometry = new Point(feature.geometry);
            }

            var graphic;

            if (feature.geometry.type === "point") {
              if (settings.isHiglightSymbol) {
                strokeColor = highlighColor;
                fillColor = settings.fillColor || highlighColor;
              }

              //settings.zoomFactor = 50
              symbol = new SimpleMarkerSymbol(
                SimpleMarkerSymbol.STYLE_CIRCLE,
                28,
                new SimpleLineSymbol(
                  SimpleLineSymbol.STYLE_SOLID,
                  new Color(strokeColor),
                  2
                ),
                new Color([0, 0, 0, 0.2])
              );

              if (settings.isInvest) {
                symbol = new PictureMarkerSymbol({
                  angle: 0,
                  xoffset: 0,
                  yoffset: 0,
                  type: "esriPMS",
                  url: "./images/noty.svg",
                  contentType: "image/png",
                  width: 40,
                  height: 40,
                });
              } else if (settings.isInvestPoint) {
                symbol = new PictureMarkerSymbol({
                  angle: 0,
                  xoffset: 0,
                  yoffset: 0,
                  type: "esriPMS",
                  url: "./images/invest_point.svg",
                  contentType: "image/png",
                  width: 40,
                  height: 40,
                });
              } else if (settings.isLocation) {
                console.log("1");
                symbol = new PictureMarkerSymbol({
                  angle: 0,
                  xoffset: 0,
                  yoffset: 0,
                  type: "esriPMS",
                  url: "./images/marker2.png",
                  contentType: "image/png",
                  width: 40,
                  height: 40,
                });
              }
            } else {
              symbol = GetSymbol(
                settings,
                settings.fillColor || fillColor,
                strokeColor,
                SimpleFillSymbol,
                SimpleLineSymbol,
                PictureMarkerSymbol
              );
            }
            graphic = new Graphic(feature.geometry, symbol, settings.attr);
          } else {
            if (feature.type === "point") {
              if (settings.isHiglightSymbol) {
                strokeColor = highlighColor;
                fillColor = settings.fillColor || highlighColor;
              }
              settings.zoomFactor = 50;
              symbol = new SimpleMarkerSymbol(
                SimpleMarkerSymbol.STYLE_CIRCLE,
                28,
                new SimpleLineSymbol(
                  SimpleLineSymbol.STYLE_SOLID,
                  new Color(strokeColor),
                  2
                ),
                new Color(fillColor)
              );

              if (settings.isLocation) {
                console.log("2");
                symbol = new PictureMarkerSymbol({
                  angle: 0,
                  xoffset: 0,
                  yoffset: 0,
                  type: "esriPMS",
                  url: "./images/marker2.png",
                  contentType: "image/png",
                  width: 40,
                  height: 40,
                });
              }
            } else if (feature.type === "polyline") {
              symbol = new SimpleLineSymbol(
                SimpleLineSymbol.STYLE_SOLID,
                new Color(fillColor),
                7
              );
            } else {
              symbol = GetSymbol(
                settings,
                settings.fillColor || fillColor,
                strokeColor,
                SimpleFillSymbol,
                SimpleLineSymbol,
                PictureMarkerSymbol
              );
            }
            graphic = new Graphic(feature, symbol, settings.attr, null);
          }
          graphicLayer.add(graphic);

          if (!settings.listOfFeatures && settings.isZoom) {
            if (!feature.length) {
              zoomToFeature(
                [feature],
                map,
                settings.zoomFactor || 150,
                settings.callback
              );
            } else {
              zoomToFeature(
                feature,
                map,
                settings.zoomFactor || 150,
                settings.callback
              );
            }
          }

          graphicLayer.redraw();
        }
        if (feature && !feature.length) {
          if (feature.geometry || feature.type) {
            highlightGeometry(feature);
          }
        } else {
          if (
            feature &&
            feature[0] &&
            feature[0].geometry &&
            feature[0].geometry.type === "point"
          ) {
            if (settings.isHiglightSymbol) {
              strokeColor = highlighColor;
              fillColor = settings.fillColor || highlighColor;
            }
            settings.zoomFactor = 50;
            symbol = new SimpleMarkerSymbol(
              SimpleMarkerSymbol.STYLE_CIRCLE,
              10,
              new SimpleLineSymbol(
                SimpleLineSymbol.STYLE_SOLID,
                new Color(strokeColor),
                2
              ),
              new Color(fillColor)
            );
          } else {
            symbol = GetSymbol(
              settings,
              settings.fillColor || fillColor,
              strokeColor,
              SimpleFillSymbol,
              SimpleLineSymbol,
              PictureMarkerSymbol
            );
          }

          feature.forEach(function (elem) {
            if (elem.geometry) {
              if (elem.geometry.type == "polygon") {
                elem.geometry = new Polygon(elem.geometry);
                if (settings.isGetCenter) {
                  elem.geometry = elem.geometry.getExtent().getCenter();
                }
              }

              if (settings.isInvest) {
                symbol = new PictureMarkerSymbol({
                  angle: 0,
                  xoffset: 0,
                  yoffset: 0,
                  type: "esriPMS",
                  url: "./images/noty.svg",
                  contentType: "image/png",
                  width: 40,
                  height: 40,
                });
              } else if (settings.isInvestPoint) {
                symbol = new PictureMarkerSymbol({
                  angle: 0,
                  xoffset: 0,
                  yoffset: 0,
                  type: "esriPMS",
                  url: "./images/invest_point.svg",
                  contentType: "image/png",
                  width: 40,
                  height: 40,
                });
              } else if (settings.isLocation) {
                symbol = new PictureMarkerSymbol({
                  angle: 0,
                  xoffset: 0,
                  yoffset: 0,
                  type: "esriPMS",
                  url: "./images/marker2.png",
                  contentType: "image/png",
                  width: 40,
                  height: 40,
                });
              }

              var graphic = new Graphic(
                elem.geometry,
                symbol,
                settings.attr,
                null
              );
              graphicLayer.add(graphic);
            } else if (elem.type == "point") {
              if (settings.isInvest) {
                symbol = new PictureMarkerSymbol({
                  angle: 0,
                  xoffset: 0,
                  yoffset: 0,
                  type: "esriPMS",
                  url: "./images/noty.svg",
                  contentType: "image/png",
                  width: 40,
                  height: 40,
                });
              } else if (settings.isInvestPoint) {
                symbol = new PictureMarkerSymbol({
                  angle: 0,
                  xoffset: 0,
                  yoffset: 0,
                  type: "esriPMS",
                  url: "./images/invest_point.svg",
                  contentType: "image/png",
                  width: 40,
                  height: 40,
                });
              } else if (settings.isLocation) {
                symbol = new PictureMarkerSymbol({
                  angle: 0,
                  xoffset: 0,
                  yoffset: 0,
                  type: "esriPMS",
                  url: "./images/marker2.png",
                  contentType: "image/png",
                  width: 40,
                  height: 40,
                });
              }

              graphic = new Graphic(elem, symbol, settings.attr, null);
              graphicLayer.add(graphic);
            }
          });

          if (settings.isZoom) {
            if (!feature.length) {
              zoomToFeature(
                [feature],
                map,
                settings.zoomFactor || 150,
                settings.callback
              );
            } else {
              zoomToFeature(
                feature,
                map,
                settings.zoomFactor || 150,
                settings.callback
              );
            }
          }
          graphicLayer.redraw();
        }
      }
    );
  }
};

export const identify = function (map, settings) {
  return new Promise((resolve, reject) => {
    LoadModules([
      "esri/tasks/IdentifyTask",
      "esri/tasks/IdentifyParameters",
    ]).then(([IdentifyTask, IdentifyParameters]) => {
      // example of identify URL
      // it's the url of the `MAP SERVICE`
      // url =  https://webgis.eamana.gov.sa/arcgisnew/rest/services/MAPVIEWERMOBILE/MapServer
      var { url, tolerance, returnGeometry, geometry } = settings;

      var identifyParams = new IdentifyParameters();
      identifyParams.tolerance = tolerance || 1;
      // identifyParams.returnFieldName = true;
      identifyParams.returnGeometry = returnGeometry || false;
      // we just search the visible layers at the current scale
      identifyParams.layerOption = IdentifyParameters.LAYER_OPTION_VISIBLE;
      identifyParams.width = map.width;
      if (settings.layerIds) {
        identifyParams.layerIds = settings.layerIds;
      }
      identifyParams.height = map.height;
      identifyParams.geometry = geometry; // the geometry gonna be the click mapPoint
      identifyParams.mapExtent = map.extent;

      var identify = new IdentifyTask(url);
      identify.execute(
        identifyParams,
        function (r) {
          resolve(r);
        },
        function (err) {
          reject("something went wrong");
        }
      );
    });
  });
};

export const buffer = (point, buffer, callback) => {
  LoadModules([
    "esri/tasks/BufferParameters",
    "esri/SpatialReference",
    "esri/tasks/GeometryService",
    "esri/geometry/Point",
  ]).then(([BufferParameters, SpatialReference, GeometryService, Point]) => {
    // project point
    var gemoertyService = new GeometryService(window.__geometryServiceUrl__);
    var params = new BufferParameters();
    params.geometries = [point];

    //buffer in linear units such as meters, km, miles etc.
    params.distances = [buffer];
    params.unit = 9001;
    params.outSpatialReference = new SpatialReference({ wkid: 102100 });
    params.bufferSpatialReference = new SpatialReference({ wkid: 102100 });
    gemoertyService.buffer(params, (bufferedGeometries) => {
      callback(bufferedGeometries[0]);
    });
  });
};

export const getLayerIndex = (layername) => {
  let layerIndex, tableIndex;
  layerIndex = window.__layers__.findIndex(
    (layer) => layer.name.toLowerCase() == layername.toLowerCase()
  );
  if (layerIndex != -1) return layerIndex;
  tableIndex = window.__tables__.find(
    (layer) => layer.name.toLowerCase() == layername.toLowerCase()
  );
  if (tableIndex) return tableIndex.id;
  else return -1;
};
export const getLayerIndexFromFeatService = (layername) => {
  let layerIndex, tableIndex;
  if(window.__featureServiceLayers__){
  layerIndex = window.__featureServiceLayers__.findIndex(
    (layer) => layer.name.toLowerCase() == layername.toLowerCase()
  );
  if (layerIndex != -1) return layerIndex;
  tableIndex = window.__featureServiceTables__.find(
    (layer) => layer.name.toLowerCase() == layername.toLowerCase()
  );
  if (tableIndex) return tableIndex.id;
  else return -1;  
}
  else return -1;
};

export const printMap = async (
  printTaskURL,
  settings,
  successCallBack,
  errorCallBack
) => {
  var success;
  return new Promise((resolve, reject) => {
    LoadModules([
      "esri/tasks/PrintTemplate",
      "esri/tasks/PrintTask",
      "esri/tasks/PrintParameters",
    ]).then(async ([PrintTemplate, PrintTask, PrintParameters]) => {
      var template = new PrintTemplate();
      template.layoutOptions = { 
        // "authorText": "Made by:  Esri's JS API Team",
        // "copyrightText": "<copyright info here>",
        "legendLayers": [], 
        // "titleText": "Pool Permits", 
        "scalebarUnit": "Miles" 
      };
      template.exportOptions = 
      // settings.exportOptions
      //   ? settings.exportOptions
      //   :
         {
            width: 900,
            height: 600,
            dpi: 110,
          };
      template.format = settings.format ? settings.format : "PDF";
      template.layout = settings.layout ? settings.layout : "MAP_ONLY";
      template.preserveScale = true;
      // settings.preserveScale
      //   ? settings.preserveScale
      //   : false;
      template.showAttribution = settings.showAttribution
        ? settings.showAttribution
        : false;

      var params = PrintParameters();
      params.map = window.__map__;
      params.template = template;

      let printTask = new PrintTask(printTaskURL);
      printTask.execute(params, successCallBack, errorCallBack);
      await printTask.on("complete", () => {
        resolve(true);
      });
      await printTask.on("error", () => {
        resolve(false);
      });
    });
  });
};

export async function highLight(
  features,
  layername,
  tyeUseOfSelect,
  graphicLayerName
) {
  LoadModules([
    "esri/graphic",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/PictureMarkerSymbol",
    "esri/Color",
    "esri/graphicsUtils",
  ]).then(
    async ([
      Graphic,
      SimpleFillSymbol,
      SimpleLineSymbol,
      PictureMarkerSymbol,
      Color,
      graphicsUtils,
    ]) => {
      let graphicLayer = window.__map__.getLayer(graphicLayerName);

      if (
        features.length &&
        ["invest_site_polygon", "parcels"].includes(layername.toLowerCase())
      )
        await features.forEach((feat) => {
          var sfs = new SimpleFillSymbol(
            SimpleFillSymbol.STYLE_SOLID,
            new SimpleLineSymbol(
              SimpleLineSymbol.STYLE_SOLID,
              new Color([255, 120, 125]),
              5
            ),
            new Color([255, 224, 0, 0.7])
          );
          let graphic = new Graphic(
            feat.geometry,
            sfs,
            layername.toLowerCase() === "parcels"
              ? {
                  id: feat.attributes.OBJECTID,
                }
              : tyeUseOfSelect === "investmentReport"
              ? {
                  id: feat.attributes.SITE_GEOSPATIAL_ID,
                  SITE_GEOSPATIAL_ID: feat.attributes.SITE_GEOSPATIAL_ID,
                }
              : {
                  id: feat.attributes.SITE_GEOSPATIAL_ID,
                }
          );
          graphicLayer.add(graphic);
        });
      else {
        await features.forEach((feat) => {
          var sfs = new PictureMarkerSymbol({
            angle: 0,
            xoffset: 0,
            yoffset: 0,
            type: "esriPMS",
            url: logolocation,
            width: 40,
            height: 40,
          });
          let graphic = new Graphic(
            feat.geometry,
            sfs,
            layername.toLowerCase() === "parcels"
              ? {
                  id: feat.attributes.OBJECTID,
                }
              : {
                  id: feat.attributes.SITE_GEOSPATIAL_ID,
                }
          );
          graphicLayer.add(graphic);
        });
      }
      let feats = window.__map__.getLayer(graphicLayerName).graphics;
      let featsExtent = graphicsUtils.graphicsExtent(feats);
      window.__map__.setExtent(featsExtent.expand(3));
    }
  );
}

export const handleMultiSelectFeatures = async (
  layername,
  _this,
  callBackFunc,
  typeOfReport,
  graphicLayerName
) => {
  LoadModules([
    "esri/toolbars/draw",
    "esri/tasks/query",
    "dojo/_base/array",
    "dojo/on",
    "esri/geometry/Polygon",
    "esri/geometry/projection",
    "esri/SpatialReference",
    "esri/geometry/Point",
  ]).then(
    async ([
      Draw,
      Query,
      array,
      on,
      Polygon,
      projection,
      SpatialReference,
      Point,
    ]) => {
      let indexLayer =
      // typeOfReport&&typeOfReport==="technicalReport"?getLayerIndex("TBL_BUILD_DETAILS"): 
      getLayerIndex(layername.toLowerCase());
      let selectionToolbar = window.__MultiSelect__;
      window.__map__.disablePan();
      selectionToolbar.activate(Draw.EXTENT);
      let eventListenersArr = [];
      // selectionToolbar.onDrawEnd=null;
      eventListenersArr.push(
        on(selectionToolbar, "DrawEnd", async function (geometry) {
          let dublicatedIDs = [];
          console.log(geometry, 55555555);
          // selectionToolbar.deactivate();
          _this.props.openLoader();
          //return features with main data of layer
          let getDataFromLayerPromise = new Promise((resolve, reject) => {
            queryTask({
              returnGeometry: true,
              geometry: geometry,
              url: `${window.__mapUrl__}/${indexLayer}`,
              outFields: ["*"],
              where: "1=1",
              spatialRelationship: Query.SPATIAL_REL_INTERSECTS,
              // where: auctionNo=="Null"? `SITE_STATUS=3 AND AUCTION_NO IS Null AND OBJECTID=${feature.attributes['OBJECTID']}`:`SITE_STATUS=3 AND AUCTION_NO=${auctionNo}`,
              callbackResult: ({ features }) => {
                // window.__map__.enablePan();
                // window.__map__.enableMapNavigation();
                // _this.setState({ activeIcon: "" });
                if (features.length) {
                  let featuresClone = [...features];
                  let graphicLayerOfMultiSelect = window.__map__.getLayer(
                    graphicLayerName?graphicLayerName:"graphicLayer_Multi_Select"
                  );
                  // let graphicLayerOfMultiSelect = window.__map__.getLayer(
                  //   "temp_graphicLayer_Multi_Select"
                  // );
                  
                  let allGraphicsOnMap = graphicLayerOfMultiSelect.graphics;
                  if (featuresClone.length && allGraphicsOnMap.length) {
                    for (let i = 0; i < featuresClone.length; i++) {
                      const selectedFeat = featuresClone[i];
                      for (let j = 0; j < allGraphicsOnMap.length; j++) {
                        const graphic = allGraphicsOnMap[j];
                        let featID = layername==="PARCELS"?
                        selectedFeat.attributes.OBJECTID:
                        selectedFeat.attributes.SITE_GEOSPATIAL_ID
                        if (
                          (graphic.attributes.id||graphic.attributes.SITE_GEOSPATIAL_ID) ===
                          featID
                        )
                          // graphicLayerOfMultiSelect.remove(graphic);
                          dublicatedIDs.push(featID);
                      }
                    }
                  }
                  featuresClone = featuresClone.filter(
                    (f) => !dublicatedIDs.includes(layername==="PARCELS"?f.attributes.OBJECTID:f.attributes.SITE_GEOSPATIAL_ID)
                  );
                  if (featuresClone.length){
                    highLight(
                      featuresClone,
                      layername,
                      typeOfReport,
                      graphicLayerName?graphicLayerName:"graphicLayer_Multi_Select"
                    ).then(() => {
                      // setTimeout(() => {
                      // window.__map__
                      //   .getLayer("graphicLayer_Multi_Select")
                      //   .clear();
                      //remove multiselect handler after draw end
                      // array.forEach(eventListenersArr, function (handle) {
                      //   handle.remove();
                      // });
                      // }, 1500);
                    });
                  resolve({
                    layername,
                    data: featuresClone,
                    isThereSelection: true,
                    boxGeometry:geometry
                  });
                }
                  else if(!featuresClone.length&&dublicatedIDs.length){
                    resolve({ layername, data: [], dublicated:true });
                }
                } else resolve({ layername, data: [] });
              },
            });
          });
          if (
            layername.toLowerCase() === "invest_site_polygon" ||
            layername.toUpperCase() === "ADVERTISING_BOARDS" ||
            layername.toUpperCase() === "PARCELS"
          )
          getDataFromLayerPromise.then(res=>{

            callBackFunc(
              res,
              layername,
              _this,
              eventListenersArr,
              array,
              Query,
              Polygon,
              projection,
              SpatialReference,
              Point
            );
          })
        })
      );
      _this.setState({
        disableMultiSelect: {
          eventListenersArr: eventListenersArr,
          esriArr: array,
        },
      });
    }
  );
};

export const handleSingleSelectFeature = async (mapPoint, callBackFunc, purposeOfSelect) => {
  var graphicLayer = window.__map__.getLayer("highLightGraphicLayer");
  if (graphicLayer.graphics) {
    graphicLayer.clear();
    // if(purposeOfSelect==="showPricing") {
      //in case of select temp site
      store.dispatch({ type: "EMPTY_DATA_FROM_TEMP" });
      //in case of existing the wizard of showing price with data
      store.dispatch({ type: "CLEAR_SELECTED" });
    // }
    // else store.dispatch({ type: "CLEAR_SELECTED" });
  }
  var layerIndex = getLayerIndex("INVEST_SITE_POLYGON");
  queryTask({
    returnGeometry: true,
    url: `${window.__mapUrl__}/${layerIndex}`,
    geometry: mapPoint,
    outFields: ["OBJECTID", "SITE_GEOSPATIAL_ID"],
    callbackResult: ({ features }) => {
      if (!features.length) {
        notificationMessage("برجاءالضغط على طبقة من الخريطة");
        return;
      } else if (features.length > 1) {
        notificationMessage("برجاءالضغط على استثماري واحد فقط لادخال الدراسة");
        return;
      } else {
        const featureToSelect = features[0];
        // add the feature to the highlight layer
        setTimeout(() => {
          // if(purposeOfSelect==="showPricing"){
            store.dispatch({
              type:"ADD_DATA_TO_TEMP",
              data:[featureToSelect]
            })
          // }else
          // store.dispatch({
          //   type: "ADD_TO_SELECTED_FEATURES",
          //   features: [featureToSelect],
          // });
          // callBackFunc();
        }, 200);
        highlightFeature([featureToSelect], window.__map__, {
          isZoom: true,
          layerName: "highLightGraphicLayer",
          highlightWidth: 5,
        });
      }
    },
  });
};

export const uploadCADFile = function (url, params, callback, callbackError) {
  //  params==> {
  //     "CAD File Name": filePathForTest
  // }
  if (url) {
    LoadModules(["esri/tasks/Geoprocessor"]).then(
      ([Geoprocessor]) => {
        var gp = new Geoprocessor(url);
        gp.submitJob(params, (response) => {
          console.log(response);
          if (response.jobStatus == "esriJobFailed") callbackError();
          else gp.getResultData(response.jobId, "output_value", callback);
        });
      },
      function (error) {
        callbackError();
      }
    );
  }
};

export const uploadKMZFile = function (url, params, callback, callbackError) {
  //  params==> {
  //     "CAD File Name": filePathForTest
  // }
  if (url) {
    LoadModules(["esri/tasks/Geoprocessor"]).then(
      ([Geoprocessor]) => {
        var gp = new Geoprocessor(url);
        gp.submitJob(params, (response) => {
          console.log(response);
          if (response.jobStatus == "esriJobFailed") callbackError();
          else gp.getResultData(response.jobId, "Output_JSON", callback);
        });
      },
      function (error) {
        callbackError();
      }
    );
  }
};

export const exportCADFile = (url, params, callback, callbackError) => {
  LoadModules(["esri/tasks/Geoprocessor"]).then(([Geoprocessor]) => {
    var gp = new Geoprocessor(url);
    gp.execute(
      params,
      (response) => {
        console.log(response);
        if (response[0].value) callback(response[0].value);
      },
      function (error) {
        callbackError(error);
      }
    );
  });
};

export const convertNumbersToEnglish = (numberInArabic) => {
  let numberInStr = numberInArabic.toString();
  return numberInStr
    .replace(/[\u0660-\u0669]/g, (c) => {
      return c.charCodeAt(0) - 0x0660;
    })
    .replace(/[\u06f0-\u06f9]/g, (c) => {
      return c.charCodeAt(0) - 0x06f0;
    });
};

export const convertEngNumbersToArabic = (digit) => {
  let digitInStr = digit.toString();
  return digitInStr.replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
};
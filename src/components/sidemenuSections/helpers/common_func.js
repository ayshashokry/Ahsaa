import axios from "axios";
import AtmIcon from "../../../assets/images/atm-icon-for-form.svg";
import GoogleIcon from "../../../assets/images/google-maps.svg";
import EmojiTransportationIcon from "@material-ui/icons/EmojiTransportation";
import PhotoLibraryIcon from "@material-ui/icons/PhotoLibrary";
import { AiOutlineFile } from "react-icons/ai";
import BorderAllIcon from "@material-ui/icons/BorderAll";
import { notificationMessage } from "../../../helpers/utlis/notifications_Func";
import { isResultEmpty } from "../../../helpers/utlis/utilzFunc";
import {
  getLayerIndex,
  queryTask,
  getFeatureDomainName,
  zoomToFeature,
  LoadModules,
  highlightFeature
} from "../../common/mapviewer";

export const valueToBoolean = (value) => {
  if (value) return true;
  else return false;
};


export function catchPlans(selectedMunicipality, setState, state) {
  var layerIndex = getLayerIndex("INVEST_SITE_POLYGON");
  queryTask({
    returnGeometry: false,
    url: `${window.__mapUrl__}/${layerIndex}`,
    returnDistinctValues: true,
    outFields: ["PLAN_NO"],
    where: `MUNICIPALITY_NAME=${selectedMunicipality} AND PLAN_NO LIKE '%' AND PLAN_NO <> 'بدون' AND PLAN_NO <>'<Null>' AND PLAN_NO <>' ' `,
    callbackResult: ({ features }) => {
      setState(features);
    },
  });
}

export function catchLands(selectedMunicipality, setState, state) {
  var layerIndex = getLayerIndex("INVEST_SITE_POLYGON");
  queryTask({
    returnGeometry: false,
    url: `${window.__mapUrl__}/${layerIndex}`,
    returnDistinctValues: true,
    outFields: ["PARCEL_PLAN_NO"],
    where: `MUNICIPALITY_NAME=${selectedMunicipality} AND PARCEL_PLAN_NO LIKE '%' AND PARCEL_PLAN_NO <> 'بدون' AND PARCEL_PLAN_NO <>'<Null>' AND PARCEL_PLAN_NO <>' '`,
    callbackResult: ({ features }) => {
      // fix features
      console.log(features);
      setState(features.map((feat) => feat.attributes));
    },
  });
}

export function catchDistricts(selectedMunicipality, setState) {
  var layerIndex = getLayerIndex("INVEST_SITE_POLYGON");
  queryTask({
    returnGeometry: false,
    url: `${window.__mapUrl__}/${layerIndex}`,
    returnDistinctValues: true,
    outFields: ["DISTRICT_NAME"],
    where: `MUNICIPALITY_NAME=${selectedMunicipality} AND DISTRICT_NAME LIKE '%'`,
    callbackResult: ({ features }) => {
      // fix features
      getFeatureDomainName(features, layerIndex).then((districts) => {
        setState(districts);
      });
    },
  });
}

/**
 * desc: (zoomToParticularArea) will zoom to a particular area based on entering value to the general earch input
 * input: the condition which map will zoom to based on
 * output: none --> it just implement the logic to zoom
 **/
export const zoomToParticularArea = async (whereCondition, props_) => {
  var layerIndex = getLayerIndex("Invest_Site_Polygon");
  props_.openLoader(); //for loader in case of zooimng
  await queryTask({
    returnGeometry: true,
    url: `${window.__mapUrl__}/${layerIndex}`,
    outFields: ["OBJECTID", "SITE_GEOSPATIAL_ID"],
    where: whereCondition,
    callbackResult: ({ features }) => {
      if (features.length) {
        zoomToFeature(features, window.__map__, 150, () =>
          setTimeout(() => {
            window.__map__._fixedPan(0, window.__map__.height * 0.1);
          }, 100)
        );
        props_.closeLoader(); //for loader in case of zooimng
      } else props_.closeLoader();
    },
  });
};

export const checkIsDataComplete = (feature) => {
  let { data, tblData, layername } = feature;
  let flagObj = {};
  const validateFieldValue = (value) => {
    if (value) return true;
    else return false;
  };
  //check main data
  let isCurrentLayerInvestSitePolygon =
    layername.toLocaleLowerCase() === "invest_site_polygon";
  let validationCoditionForMainData = isCurrentLayerInvestSitePolygon
    ? validateFieldValue(data.PARCEL_PLAN_NO) &&
      validateFieldValue(data.SITE_SUBTYPE) &&
      validateFieldValue(data.SITE_STATUS) &&
      validateFieldValue(data.SITE_COMMON_USE)
    : validateFieldValue(data.SITE_STATUS) &&
      validateFieldValue(data.GROUP_CODE) &&
      validateFieldValue(data.SITE_COMMON_USE) &&
      validateFieldValue(data.SITE_ACTIVITY_ISIC) &&
      validateFieldValue(data.PLAN_NO);

  if (!validationCoditionForMainData)
    flagObj.mainData = {
      bool: false,
      name: "layerData",
    };
  else
    flagObj.mainData = {
      bool: true,
      name: "layerData",
    };

  //check borders validation
  if (isCurrentLayerInvestSitePolygon) {
    let validateBorders =
      validateFieldValue(data.NORTH_BOUNDARY_DESC) &&
      validateFieldValue(data.SOUTH_BOUNDARY_DESC) &&
      validateFieldValue(data.EAST_BOUNDARY_DESC) &&
      validateFieldValue(data.WEST_BOUNDARY_DESC) &&
      validateFieldValue(data.NORTH_BOUNDARY_LENGTH) &&
      validateFieldValue(data.SOUTH_BOUNDARY_LENGTH) &&
      validateFieldValue(data.EAST_BOUNDARY_LENGTH) &&
      validateFieldValue(data.WEST_BOUNDARY_LENGTH) &&
      //borders from plan
      validateFieldValue(data.EAST_BOUNDARY_DESCRIPTION) &&
      validateFieldValue(data.SOUTH_BOUNDARY_DESCRIPTION) &&
      validateFieldValue(data.NORTH_BOUNDARY_DESCRIPTION) &&
      validateFieldValue(data.WEST_BOUNDARY_DESCRIPTION);
    if (validateBorders)
      flagObj.bordersData = { bool: true, name: "bordersData" };
    else flagObj.bordersData = { bool: false, name: "bordersData" };
  } else flagObj.bordersData = { bool: true, name: "bordersData" };
  //check tables data
  //1 - in case of ad boards layer --> check ad boards group table
  if (!isCurrentLayerInvestSitePolygon) {
    if (tblData) {
      let validationCoditionForTblDataOfAdBoardsGroup =
        validateFieldValue(tblData.GROUP_CODE) &&
        validateFieldValue(tblData.BOARD_TYPE !== "") &&
        validateFieldValue(tblData.SITE_NO) &&
        validateFieldValue(tblData.BOARD_NO) &&
        validateFieldValue(tblData.FRONTBOARD_NO) &&
        validateFieldValue(tblData.LIGHT_STATUS) &&
        // validateFieldValue(tblData.GROUP_BOARD_PERPDATE) &&
        validateFieldValue(tblData.GROUP_BOARD_LENGTH) &&
        validateFieldValue(tblData.GROUP_BOARD_WIDTH) &&
        validateFieldValue(tblData.GROUP_BOARD_AREA) &&
        validateFieldValue(tblData.GROUP_DESCRIPTION);
      if (validationCoditionForTblDataOfAdBoardsGroup)
        flagObj.tblData = { bool: true, name: "tblData" };
      else flagObj.tblData = { bool: false, name: "tblData" };
    } else flagObj.tblData = { bool: false, name: "tblData" };
  } else {
    //check tables data
    //1 - in case of invest site polygon layer
    if (validateFieldValue(tblData) && validateFieldValue(data.SITE_SUBTYPE)) {
      switch (data.SITE_SUBTYPE) {
        case 1: //building tbl
          let isBuildingTblOk =
            validateFieldValue(tblData.BLD_CODE) &&
            validateFieldValue(tblData.BLD_AREA) &&
            validateFieldValue(tblData.BLD_NO_FLOORS) &&
            validateFieldValue(tblData.BLD_NO_UNITS) &&
            validateFieldValue(tblData.BLD_POST_CODE) &&
            validateFieldValue(tblData.BLD_MATRIAL) &&
            validateFieldValue(tblData.BLD_STATUS);
          if (isBuildingTblOk)
            flagObj.tblData = { bool: true, name: "tblData" };
          else flagObj.tblData = { bool: false, name: "tblData" };
          break;
        case 3: //tower tbl
          let isTowerTblOk =
            validateFieldValue(tblData.TOWER_LOCATION_CODE) &&
            validateFieldValue(tblData.TOWER_TYPE) &&
            validateFieldValue(tblData.TOWER_HEIGHT) &&
            validateFieldValue(tblData.TOWER_SERVICE_PROVIDER);

          if (isTowerTblOk) flagObj.tblData = { bool: true, name: "tblData" };
          else flagObj.tblData = { bool: false, name: "tblData" };
          break;

        case 5: //elec tbl
          let isElecTblOk =
            validateFieldValue(tblData.NAME) &&
            validateFieldValue(tblData.ELEC_TYPE);

          if (isElecTblOk) flagObj.tblData = { bool: true, name: "tblData" };
          else flagObj.tblData = { bool: false, name: "tblData" };
          break;

        case 6: //atm tbl
          let isTblAtmOk =
            validateFieldValue(tblData.NAME) &&
            validateFieldValue(tblData.TYPE);
          if (isTblAtmOk) flagObj.tblData = { bool: true, name: "tblData" };
          else flagObj.tblData = { bool: false, name: "tblData" };
          break;
      }
    } else if (data.SITE_SUBTYPE == 4 || !data.SITE_SUBTYPE)
      flagObj.tblData = { bool: true, name: "tblData" };
    //lands
    else flagObj.tblData = { bool: false, name: "tblData" };
  }
  return flagObj;
};

export const checkIsDataOfLandsComplete = (feature) => {
  let { data, tblData } = feature;
  let flagObj = {};
  const validateFieldValue = (value) => {
    if (value) return true;
    else return false;
  };
  //check main data
  let validationCoditionForMainData =
    validateFieldValue(data.PARCEL_PLAN_NO) &&
    validateFieldValue(data.SITE_SUBTYPE) &&
    validateFieldValue(data.SITE_STATUS) &&
    validateFieldValue(data.SITE_COMMON_USE);

  if (!validationCoditionForMainData)
    flagObj.mainData = {
      bool: false,
      name: "layerData",
    };
  else
    flagObj.mainData = {
      bool: true,
      name: "layerData",
    };

  //check borders validation
  let validateBorders =
    validateFieldValue(data.NORTH_BOUNDARY_DESC) &&
    validateFieldValue(data.SOUTH_BOUNDARY_DESC) &&
    validateFieldValue(data.EAST_BOUNDARY_DESC) &&
    validateFieldValue(data.WEST_BOUNDARY_DESC) &&
    validateFieldValue(data.NORTH_BOUNDARY_LENGTH) &&
    validateFieldValue(data.SOUTH_BOUNDARY_LENGTH) &&
    validateFieldValue(data.EAST_BOUNDARY_LENGTH) &&
    validateFieldValue(data.WEST_BOUNDARY_LENGTH) &&
    //borders from plan
    validateFieldValue(data.EAST_BOUNDARY_DESCRIPTION) &&
    validateFieldValue(data.SOUTH_BOUNDARY_DESCRIPTION) &&
    validateFieldValue(data.NORTH_BOUNDARY_DESCRIPTION) &&
    validateFieldValue(data.WEST_BOUNDARY_DESCRIPTION);
  if (validateBorders)
    flagObj.bordersData = { bool: true, name: "bordersData" };
  else flagObj.bordersData = { bool: false, name: "bordersData" };

  //check tables data
  //1 - in case of invest site polygon layer
  if (validateFieldValue(tblData) && validateFieldValue(data.SITE_SUBTYPE)) {
    switch (data.SITE_SUBTYPE) {
      case 1: //building tbl
        let isBuildingTblOk =
          validateFieldValue(tblData.BLD_CODE) &&
          validateFieldValue(tblData.BLD_AREA) &&
          validateFieldValue(tblData.BLD_NO_FLOORS) &&
          validateFieldValue(tblData.BLD_NO_UNITS) &&
          validateFieldValue(tblData.BLD_POST_CODE) &&
          validateFieldValue(tblData.BLD_MATRIAL) &&
          validateFieldValue(tblData.BLD_STATUS);
        if (isBuildingTblOk) flagObj.tblData = { bool: true, name: "tblData" };
        else flagObj.tblData = { bool: false, name: "tblData" };
        break;
      case 3: //tower tbl
        let isTowerTblOk =
          validateFieldValue(tblData.TOWER_LOCATION_CODE) &&
          validateFieldValue(tblData.TOWER_TYPE) &&
          validateFieldValue(tblData.TOWER_HEIGHT) &&
          validateFieldValue(tblData.TOWER_SERVICE_PROVIDER);

        if (isTowerTblOk) flagObj.tblData = { bool: true, name: "tblData" };
        else flagObj.tblData = { bool: false, name: "tblData" };
        break;

      case 5: //elec tbl
        let isElecTblOk =
          validateFieldValue(tblData.NAME) &&
          validateFieldValue(tblData.ELEC_TYPE);

        if (isElecTblOk) flagObj.tblData = { bool: true, name: "tblData" };
        else flagObj.tblData = { bool: false, name: "tblData" };
        break;

      case 6: //atm tbl
        let isTblAtmOk =
          validateFieldValue(tblData.NAME) && validateFieldValue(tblData.TYPE);
        if (isTblAtmOk) flagObj.tblData = { bool: true, name: "tblData" };
        else flagObj.tblData = { bool: false, name: "tblData" };
        break;
    }
  } else if (data.SITE_SUBTYPE == 4 || !data.SITE_SUBTYPE)
    flagObj.tblData = { bool: true, name: "tblData" };
  //lands
  else flagObj.tblData = { bool: false, name: "tblData" };

  return flagObj;
};

export const uploadLandFile = (result, _this, layername) => {
  LoadModules([
    "esri/geometry/projection",
    "esri/geometry/Polygon",
    "esri/geometry/Point",
    "esri/SpatialReference",
    "esri/tasks/query",
    "esri/graphic",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/Color",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/graphicsUtils",
  ]).then(
    ([
      projection,
      Polygon,
      Point,
      SpatialReference,
      Query,
      Graphic,
      SimpleFillSymbol,
      SimpleLineSymbol,
      Color,
      SimpleMarkerSymbol,
      graphicsUtils,
    ]) => {
      projection.load().then(() => {   
        _this.Formref.current.resetFields();
        _this.notificationByLoadingDataFromFile();
        _this.removeUploadedFile()
        let featutesInGeographicCoords = [];
        //if invest site polygon
        let resultFeatures = result.value.shapeFeatures;
        //**  First check if there is polygon data
        if (resultFeatures.Export_Output) {
          //1- get geographic geometry features
          resultFeatures = resultFeatures.Export_Output;
          let wgsGeographic = new SpatialReference(4326);
          resultFeatures.forEach((f) => {
            let oldFeat = new Polygon({
              rings: f.rings,
              spatialReference: {
                wkid: f.spatialReference.wkid ? f.spatialReference.wkid : 32639,
              },
            });
            let polygonAfterProjectionToXY = projection.project(
              oldFeat,
              wgsGeographic
            );

            featutesInGeographicCoords.push({
              feature: polygonAfterProjectionToXY,
              attributes: {
                SITE_AREA: f.area,
              },
            });
          });

          let promises = [];
          //2- check if file contains features or not
          if (featutesInGeographicCoords.length) {
            //3- check if all features in file within boundaries
            const projectionPromise = projection.load();
            projectionPromise
              .then(() => {
                let municipalityBoundLayer = "MUNICIPALITY_BOUNDARY";
                let municipalityBoundLayerIndex = getLayerIndex(
                  municipalityBoundLayer
                );
                featutesInGeographicCoords.forEach(async (feat) => {
                  await promises.push(
                    new Promise(async (resolveFunc, rejectFunc) => {
                      await queryTask({
                        returnGeometry: true,
                        url: `${window.__mapUrl__}/${municipalityBoundLayerIndex}`,
                        outFields: ["OBJECTID"],
                        geometry: new Polygon({
                          rings: feat.feature.rings,
                          spatialReference: {
                            wkid: feat.feature.spatialReference.wkid,
                          },
                        }),
                        spatialRelationship: Query.SPATIAL_REL_INTERSECTS,
                        callbackResult: ({ features }) => {
                          if (features.length)
                            resolveFunc({
                              feat,
                              isWithinBoundaries: true,
                            });
                          else
                            resolveFunc({
                              feat,
                              isWithinBoundaries: false,
                            });
                        },
                        callbackError: (err) => {
                          _this.notificationErrorDuringProcess();
                          _this.props.closeLoader();
                          rejectFunc(err);
                        },
                      });
                    })
                  );
                });

                return promises;
              })
              //get polygons with bool if polygon within boundaries or not
              .then((promisesFromCheckBounds) => {
                Promise.all(promisesFromCheckBounds)
                  .then((resultPolygons) => {
                    let isTherePolygonsWithinBounds = resultPolygons.length;
                    let newPromises = [];
                    if (isTherePolygonsWithinBounds) {
                      let featsOutBoundaries = resultPolygons.filter(
                        (f) => f.isWithinBoundaries === false
                      );
                      if (featsOutBoundaries.length) {
                        _this.notificatioWithOutOfAhsaa();
                        _this.props.closeLoader();
                        return newPromises;
                      }
                      //here all polygons within boundaries of Ahsaa
                      //4- check if they are intersected with previous invest lands or not
                      else {
                        let investLayer = "invest_site_polygon";
                        let investLayerIndex = getLayerIndex(investLayer);
                        let featuresInGeographicCoords = resultPolygons.map(
                          (f) => f.feat
                        );
                        //check step for intersecting with invest site polygon layer
                        featuresInGeographicCoords.forEach(async (feat) => {
                          await newPromises.push(
                            new Promise(async (resolveFunc, rejectFunc) => {
                              await queryTask({
                                returnGeometry: true,
                                url: `${window.__mapUrl__}/${investLayerIndex}`,
                                outFields: ["OBJECTID,SITE_GEOSPATIAL_ID"],
                                geometry: new Polygon({
                                  rings: feat.feature.rings,
                                  spatialReference: {
                                    wkid: feat.feature.spatialReference.wkid,
                                  },
                                }),
                                spatialRelationship:
                                  Query.SPATIAL_REL_INTERSECTS,
                                callbackResult: ({ features }) => {
                                  if (features.length) {
                                    let geographicCentriod =
                                      feat.feature.getCentroid();
                                    let long = geographicCentriod.x;
                                    let lat = geographicCentriod.y;
                                    let longWithoutDot = long
                                      .toString()
                                      .replace(".", "");
                                    let latWithoutDot = lat
                                      .toString()
                                      .replace(".", "");
                                    let geoSpatialIdInString =
                                      longWithoutDot.substring(0, 7) +
                                      latWithoutDot.substring(0, 7);
                                    if (
                                      features[0].attributes
                                        .SITE_GEOSPATIAL_ID !=
                                      geoSpatialIdInString
                                    )
                                      resolveFunc({
                                        layername: layername,
                                        feature: feat.feature,
                                        attributes: feat.attributes,
                                        isIntersectWithPolygon: true,
                                      });
                                    else {
                                      resolveFunc({
                                        layername: layername,
                                        feature: feat.feature,
                                        attributes: feat.attributes,
                                        isIntersectWithPolygon: true,
                                        case:"matchPrevLands"
                                      });
                                    }
                                  } else
                                    resolveFunc({
                                      layername: layername,
                                      feature: feat.feature,
                                      attributes: feat.attributes,
                                      isIntersectWithPolygon: false,
                                      case:"notMatched"
                                    });
                                },
                                callbackError: (err) => {
                                  // rejectFunc(err);
                                  _this.notificationErrorDuringProcess();
                                  _this.props.closeLoader();
                                  rejectFunc(err);
                                },
                              });
                            })
                          );
                        });
                      }
                      return newPromises;
                    } else {
                      _this.notificationErrorDuringProcess();
                      _this.props.closeLoader();
                      return newPromises;
                    }
                  })
                  .then((promisesOfCheckIntersection) => {
                    Promise.all(promisesOfCheckIntersection)
                      .then((resultAll) => {
                        let resultArray = [];
                        if (resultAll.find(f=>f.case==="matchPrevLands")) {
                          _this.props.closeLoader();
                          let UTMXY = new SpatialReference(3857);
                          resultAll.forEach(f=>{
                            let polygonAfterProjectionToXY =
                              projection.project(f.feature, UTMXY);
                          var sfs = new SimpleFillSymbol(
                            SimpleFillSymbol.STYLE_SOLID,
                            new SimpleLineSymbol(
                              SimpleLineSymbol.STYLE_SOLID,
                              new Color([255, 0, 0]),
                              1
                            ),
                            new Color([255, 0, 0, 0.25])
                          );
                          window.__map__.getLayer("Features_From_CAD").add(
                            new Graphic(polygonAfterProjectionToXY, sfs)
                          );
                        })
                        let feats =
                        window.__map__.getLayer(
                          "Features_From_CAD"
                        ).graphics;
                      let featsExtent =
                        graphicsUtils.graphicsExtent(feats);
                      window.__map__.setExtent(featsExtent.expand(3));
                          setTimeout(() => {
                            
                            _this.notificationByIntersecting(
                              "invest_site_polygon"
                            );
                            window.__map__.getLayer("Features_From_CAD").clear()
                          }, 2500);
                          return resultArray;
                        } else {
                          if (resultAll.length) {
                            let intesectedFeatsWithInvestPolygons =
                              resultAll.filter((f) => f.isIntersectWithPolygon);
                            //if there is intersection sites
                            // if (intesectedFeatsWithInvestPolygons.length) {
                            //   _this.notificationByIntersecting();
                            //   _this.props.closeLoader();
                            //   _this.setState({
                            //     showModal: true,
                            //     currentModal: "checkIntersection",
                            //     modalMsg:
                            //       "تتقاطع بعض الأراضي بالملف مع مواقع استثمارية موجودة. هل تريد الاستمرار ؟",
                            //   });
                            //   return resultArray;
                            // } else {
                            resultAll.forEach(async (item) => {
                              let UTMXY = new SpatialReference(3857);
                              let originCadUTM = new SpatialReference(32639);
                              let polygonAfterProjectionToXY =
                                projection.project(item.feature, UTMXY);
                              let polygonWithOriginSRS = projection.project(
                                item.feature,
                                originCadUTM
                              );
                              let projectedCentroid =
                                polygonWithOriginSRS.getCentroid();

                              let geographicCentriod =
                                item.feature.getCentroid();
                              let long = geographicCentriod.x;
                              let lat = geographicCentriod.y;
                              let longWithoutDot = long
                                .toString()
                                .replace(".", "");
                              let latWithoutDot = lat
                                .toString()
                                .replace(".", "");
                              let geoSpatialIdInString =
                                longWithoutDot.substring(0, 7) +
                                latWithoutDot.substring(0, 7);
                              let resultToAddToTable = {
                                geographicGeom: item.feature,
                                geometry: polygonWithOriginSRS,
                                layername: item.layername,
                                isChecked: false,
                                isIntersectWithPolygon:
                                  item.isIntersectWithPolygon,
                                investSiteDataAttributes: {
                                  SITE_SUBTYPE: 4,
                                  SITE_STATUS: 2,
                                  SITE_AREA: parseFloat(
                                    parseFloat(
                                      item.attributes.SITE_AREA
                                    ).toFixed(2)
                                  ),
                                  SITE_LAT_COORD: parseFloat(
                                    parseFloat(geographicCentriod.y).toFixed(4)
                                  ),
                                  SITE_LONG_COORD: parseFloat(
                                    parseFloat(geographicCentriod.x).toFixed(4)
                                  ),
                                  SITE_XUTM_COORD: parseFloat(
                                    parseFloat(projectedCentroid.x).toFixed(4)
                                  ),
                                  SITE_YUTM_COORD: parseFloat(
                                    parseFloat(projectedCentroid.y).toFixed(4)
                                  ),
                                  SITE_GEOSPATIAL_ID:
                                    parseFloat(geoSpatialIdInString),
                                },
                                id: parseFloat(geoSpatialIdInString),
                                isCompletedFilled: false,
                                // landNumber: landAttributes.PARCEL_NO,
                                //if not adverte board
                                bordersDescFromPlan: null,
                                tblData: null,
                                isCompletedFilled: {
                                  mainData: {
                                    bool: false,
                                    name: "layerData",
                                  },
                                  bordersData: {
                                    bool: false,
                                    name: "bordersData",
                                  },
                                  tblData: {
                                    bool: false,
                                    name: "tblData",
                                  },
                                },
                              };
                              var sfs = new SimpleFillSymbol(
                                SimpleFillSymbol.STYLE_SOLID,
                                new SimpleLineSymbol(
                                  SimpleLineSymbol.STYLE_SOLID,
                                  new Color([255, 0, 0]),
                                  1
                                ),
                                new Color([255, 0, 0, 0.25])
                              );
                              window.__map__.getLayer("Features_From_CAD").add(
                                new Graphic(polygonAfterProjectionToXY, sfs, {
                                  id: resultToAddToTable.id,
                                })
                              );

                              resultArray.push(resultToAddToTable);
                            });
                            return resultArray;
                            // }
                          } else return resultArray;
                        }
                      })
                      //------finish intersection check with prev invest site polygons----//
                      //4- get plan number from plan data layer
                      .then((resultArray) => {
                        let promisesToAddPlanNo = [];
                        let planDataLayer = "PLAN_DATA";
                        let planDataLayerIndex = getLayerIndex(planDataLayer);
                        if (resultArray.length) {
                          resultArray.forEach((feat) => {
                            promisesToAddPlanNo.push(
                              new Promise((resolveFunc, rejectFunc) => {
                                queryTask({
                                  returnGeometry: false,
                                  url: `${window.__mapUrl__}/${planDataLayerIndex}`,
                                  outFields: ["PLAN_NUMBER"],
                                  geometry: new Polygon({
                                    rings: feat.geographicGeom.rings,
                                    spatialReference: {
                                      wkid: feat.geographicGeom.spatialReference
                                        .wkid,
                                    },
                                  }), //success or will fail
                                  spatialRelationship:
                                    Query.SPATIAL_REL_INTERSECTS,
                                  callbackResult: ({ features }) => {
                                    if (features.length)
                                      resolveFunc({
                                        ...feat,
                                        investSiteDataAttributes: {
                                          ...feat.investSiteDataAttributes,
                                          PLAN_NO:
                                            features[0].attributes.PLAN_NUMBER,
                                        },
                                      });
                                    //in case of not intersection
                                    else
                                      resolveFunc({
                                        ...feat,
                                        investSiteDataAttributes: {
                                          ...feat.investSiteDataAttributes,
                                          PLAN_NO: "",
                                        },
                                      });
                                  },
                                  callbackError: (err) => {
                                    //in case there is an error in excution query
                                    // rejectFunc(err);
                                    _this.notificationErrorDuringProcess();
                                    _this.props.closeLoader();
                                    rejectFunc(err);
                                  },
                                });
                              })
                            );
                          });
                          return promisesToAddPlanNo;
                        } else {
                          return promisesToAddPlanNo;
                        }
                      })
                      //--finishing get all data and add plan number--//
                      .then((promisesWithResultFromAddPlanNo) => {
                        Promise.all(promisesWithResultFromAddPlanNo).then(
                          (resultArray) => {
                            if (resultArray.length) {
                              //zoom to features from uploading file
                              let feats =
                                window.__map__.getLayer(
                                  "Features_From_CAD"
                                ).graphics;
                              let featsExtent =
                                graphicsUtils.graphicsExtent(feats);
                              window.__map__.setExtent(featsExtent.expand(3));
                              //show message to user
                              _this.notificatioWithUploadingFile();
                              //close loader
                              _this.props.closeLoader();
                              _this.props.addSelectedFeaturesToTemp(
                                resultArray
                              ); //add to temp till choosing user yes or no

                              //show confirmation message to user
                              setTimeout(() => {
                                _this.setState({
                                  showModal: true,
                                  currentModal: "confirmation",
                                  modalMsg:
                                    "   هل تريد حفظ الرسم على الخريطة ؟؟",
                                    typeOfAddedData:""
                                });
                              }, 4500);
                            }
                          }
                        );
                      })
                      .catch((err) => {
                        _this.setState({typeOfAddedData:""})
                        _this.notificationErrorDuringProcess();
                        _this.props.closeLoader();
                        console.error(err);
                      });
                  })
                  .catch((err) => {
                    _this.setState({typeOfAddedData:""})
                    _this.notificationErrorDuringProcess();
                    _this.props.closeLoader();
                    console.error(err);
                  });
              });
          }
          //2- if there is no polygons in file
          else {
            _this.setState({typeOfAddedData:""})
            _this.notificationEmptyFile();
            _this.props.closeLoader();
          }
        }
        //*** if there is no polygon data in file
        else {
          _this.setState({typeOfAddedData:""})
          _this.notificationExpectedFeaturesInFile(layername.toLowerCase());
          _this.props.closeLoader();
        }
      });
    }
  );
};

export const uploadAdBoardFile = (result, _this, layername) => {
  LoadModules([
    "esri/geometry/projection",
    "esri/geometry/Polygon",
    "esri/geometry/Point",
    "esri/SpatialReference",
    "esri/tasks/query",
    "esri/graphic",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/Color",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/graphicsUtils",
  ]).then(
    ([
      projection,
      Polygon,
      Point,
      SpatialReference,
      Query,
      Graphic,
      SimpleFillSymbol,
      SimpleLineSymbol,
      Color,
      SimpleMarkerSymbol,
      graphicsUtils,
    ]) => {
      projection.load().then(() => {
        _this.Formref.current.resetFields();
        _this.removeUploadedFile()
        _this.notificationByLoadingDataFromFile();
        let featutesInGeographicCoords = [];
        let resultFeatures = result.value.pointFeatures;
        if (resultFeatures.length) {
          let wgsGeographic = new SpatialReference(4326);
          resultFeatures.forEach((f) => {
            // projectionPromise.then(() => {
            let oldFeat =
              result.fileFormat === "kmz"
                ? new Point(
                    f.geometry.x,
                    f.geometry.y,
                    new SpatialReference({
                      wkid: f.spatialReference.wkid
                        ? f.spatialReference.wkid
                        : 4326,
                    })
                  )
                : new Point(
                    f.x,
                    f.y,
                    new SpatialReference({
                      wkid: f.spatialReference.wkid
                        ? f.spatialReference.wkid
                        : 32639,
                    })
                  );

            let pointInGeographicCors =
              result.fileFormat !== "kmz"
                ? projection.project(oldFeat, wgsGeographic)
                : oldFeat;

            featutesInGeographicCoords.push({
              feature: pointInGeographicCors,
              attributes: {},
            });
          });

          //2- check if file contains features or not
          if (featutesInGeographicCoords.length) {
            //3- check if all features in file within boundaries
            const projectionPromise = projection.load();
            projectionPromise
            .then(() => {
                let promises = [];
                let municipalityBoundLayer = "MUNICIPALITY_BOUNDARY";
                let municipalityBoundLayerIndex = getLayerIndex(
                  municipalityBoundLayer
                );
                featutesInGeographicCoords.forEach( (feat) => {
                   promises.push(
                    new Promise(async (resolveFunc, rejectFunc) => {
                      await queryTask({
                        returnGeometry: true,
                        url: `${window.__mapUrl__}/${municipalityBoundLayerIndex}`,
                        outFields: ["OBJECTID"],
                        geometry: new Point(
                          feat.feature.x,
                          feat.feature.y,
                          new SpatialReference({
                            wkid: feat.feature.spatialReference.wkid,
                          })
                        ),
                        spatialRelationship: Query.SPATIAL_REL_INTERSECTS,
                        callbackResult: ({ features }) => {
                          if (features.length)
                            resolveFunc({
                              feat,
                              isWithinBoundaries: true,
                            });
                          else
                            resolveFunc({
                              feat,
                              isWithinBoundaries: false,
                            });
                        },
                        callbackError: (err) => {
                          _this.notificationErrorDuringProcess();
                          _this.props.closeLoader();
                          rejectFunc(err);
                        },
                      });
                    })
                  );
                });

                return promises;
              })
              //get ad boards with bool if ad board within boundaries or not
              .then((promisesFromCheckBounds) => {
                Promise.all(promisesFromCheckBounds)
                  .then((resultAdBoards) => {
                    let isTherePolygonsWithinBounds = resultAdBoards.length;
                    let newPromises = [];
                    if (isTherePolygonsWithinBounds) {
                      let featsOutBoundaries = resultAdBoards.filter(
                        (f) => f.isWithinBoundaries === false
                      );
                      if (featsOutBoundaries.length) {
                        let cadLayerOnMap = window.__map__.getLayer("Features_From_CAD");
      cadLayerOnMap.clear();
                        _this.notificatioWithOutOfAhsaa();
                        _this.props.closeLoader();
                        return newPromises;
                      }
                      //here all ad boards within boundaries of Ahsaa
                      //4- check if they are intersected with previous ad boards or not
                      else {
                        let adBoardsLayer = layername;
                        let adBoardsLayerIndex = getLayerIndex(adBoardsLayer);
                        let featutesInGeographicCoords = resultAdBoards.map(
                          (f) => f.feat
                        );
                        if (featutesInGeographicCoords.length) {
                          featutesInGeographicCoords.forEach((feat) => {
                            newPromises.push(
                              new Promise(async (resolveFunc, rejectFunc) => {
                                await queryTask({
                                  returnGeometry: true,
                                  url: `${window.__mapUrl__}/${adBoardsLayerIndex}`,
                                  outFields: ["OBJECTID"],
                                  geometry: new Point(
                                    feat.feature.x,
                                    feat.feature.y,

                                    new SpatialReference({
                                      wkid: feat.feature.spatialReference.wkid,
                                    })
                                  ),
                                  spatialRelationship:
                                    Query.SPATIAL_REL_INTERSECTS,
                                  callbackResult: ({ features }) => {
                                    if (features.length)
                                      resolveFunc({
                                        layername: layername,
                                        feature: feat.feature,
                                        attributes: feat.attributes,
                                        isIntersectWithAdBoards: true,
                                      });
                                    else
                                      resolveFunc({
                                        layername: layername,
                                        feature: feat.feature,
                                        attributes: feat.attributes,
                                        isIntersectWithAdBoards: false,
                                      });
                                  },
                                  callbackError: (err) => {
                                    _this.notificationErrorDuringProcess();
                                    _this.props.closeLoader();
                                    rejectFunc(err);
                                  },
                                });
                              })
                            );
                          });
                        }
                        return newPromises
                      }
                    } else return newPromises;
                  })
                  .then((promisesResultOfIntersection) => {
                    //if there is any intersection with prev ad boards cancel transaction
                    //if else check if there is an intersection with invest site polygon
                    Promise.all(promisesResultOfIntersection)
                      .then((resultAll) => {
                        let newPromises = [];
                        if (resultAll) {
                          let intersectedFeats = resultAll.filter(
                            (f) => f.isIntersectWithAdBoards
                          );
                          //if there is any intersection with prev ad boards cancel transaction
                          if (intersectedFeats.length) {
                           
                            let UTMXY = new SpatialReference(3857);
                            resultAll.forEach(f=>{
                              let adBoardsAfterProjectionToXY =
                                projection.project(f.feature, UTMXY);
                                var sfs = new SimpleMarkerSymbol(
                                  SimpleMarkerSymbol.STYLE_CIRCLE,
                                  15,
                                  new SimpleLineSymbol(
                                    SimpleLineSymbol.STYLE_SOLID,
                                    new Color([255, 0, 0]),
                                    1
                                  ),
                                  new Color([255, 0, 0, 0.25])
                                );
                            window.__map__.getLayer("Features_From_CAD").add(
                              new Graphic(adBoardsAfterProjectionToXY, sfs)
                            );
                          })
                          let feats =
                          window.__map__.getLayer(
                            "Features_From_CAD"
                          ).graphics;
                        let featsExtent =
                          graphicsUtils.graphicsExtent(feats);
                        window.__map__.setExtent(featsExtent.expand(3));
                        let cadLayerOnMap = window.__map__.getLayer("Features_From_CAD");
                        cadLayerOnMap.clear();
                            _this.notificationByIntersecting();
                            _this.props.closeLoader();
                            return newPromises;
                          }
                          //if else check if there is an intersection with invest site polygon
                          else {
                            let investLayer = "invest_site_polygon";
                            let investLayerIndex = getLayerIndex(investLayer);
                            let featutesInGeographicCoords = resultAll;
                            if (featutesInGeographicCoords.length) {
                              featutesInGeographicCoords.forEach((feat) => {
                                newPromises.push(
                                  new Promise(
                                    async (resolveFunc, rejectFunc) => {
                                      await queryTask({
                                        returnGeometry: true,
                                        url: `${window.__mapUrl__}/${investLayerIndex}`,
                                        outFields: ["OBJECTID"],
                                        // where:"1=1",
                                        // outSpatialReference:feat.spatialReference.wkid,
                                        geometry: new Point(
                                          feat.feature.x,
                                          feat.feature.y,
                                          new SpatialReference({
                                            wkid: feat.feature.spatialReference
                                              .wkid,
                                          })
                                        ),
                                        spatialRelationship:
                                          Query.SPATIAL_REL_INTERSECTS,
                                        callbackResult: ({ features }) => {
                                          if (features.length)
                                            resolveFunc({
                                              layername: layername,
                                              feature: feat.feature,
                                              attributes: feat.attributes,
                                              isIntersectWithPolygon: true,
                                            });
                                          else
                                            resolveFunc({
                                              layername: layername,
                                              feature: feat.feature,
                                              attributes: feat.attributes,
                                              isIntersectWithPolygon: false,
                                            });
                                        },
                                        callbackError: (err) => {
                                          // rejectFunc(err);
                                          resolveFunc({
                                            layername: layername,
                                            feature: feat.feature,
                                            attributes: feat.attributes,
                                            isIntersectWithPolygon: false,
                                          });
                                        },
                                      });
                                    }
                                  )
                                );
                              });
                              return newPromises;
                            }
                          }
                        }else return newPromises
                      })
                      
                      .then((promisesOfIntersectionWithInvest) => {
                        Promise.all(promisesOfIntersectionWithInvest)
                          .then((resultAll) => {
                            let resultArray = [];
                            if (resultAll.length) {
                              resultAll.forEach(async (item) => {
                                let UTMXY = new SpatialReference(3857);
                                let originCadUTM = new SpatialReference(32639);
                                let pointInXY = projection.project(
                                  item.feature,
                                  UTMXY
                                );
                                let pointInOriginSRS = projection.project(
                                  item.feature,
                                  originCadUTM
                                );

                                let long = item.feature.x;
                                let lat = item.feature.y;
                                let longWithoutDot = long
                                  .toString()
                                  .replace(".", "");
                                let latWithoutDot = lat
                                  .toString()
                                  .replace(".", "");
                                let geoSpatialIdInString =
                                  longWithoutDot.substring(0, 7) +
                                  latWithoutDot.substring(0, 7);
                                let resultToAddToTable = {
                                  geographicGeom:item.feature,
                                  geometry: pointInOriginSRS,
                                  layername: "ADVERTISING_BOARDS",
                                  isChecked: false,
                                  isIntersectWithPolygon:
                                    item.isIntersectWithPolygon,
                                  investSiteDataAttributes: {
                                    SITE_STATUS: 2,
                                    SITE_LAT_COORD: parseFloat(
                                      parseFloat(item.feature.y).toFixed(4)
                                    ),
                                    SITE_LONG_COORD: parseFloat(
                                      parseFloat(item.feature.x).toFixed(4)
                                    ),
                                    SITE_XUTM_COORD: parseFloat(
                                      parseFloat(pointInOriginSRS.x).toFixed(4)
                                    ),
                                    SITE_YUTM_COORD: parseFloat(
                                      parseFloat(pointInOriginSRS.y).toFixed(4)
                                    ),
                                    SITE_GEOSPATIAL_ID:
                                      parseFloat(geoSpatialIdInString),
                                  },
                                  id: parseFloat(geoSpatialIdInString),
                                  isCompletedFilled: false,
                                  // landNumber: landAttributes.PARCEL_NO,
                                  //if not adverte board
                                  tblData: null,
                                  isCompletedFilled: {
                                    mainData: {
                                      bool: false,
                                      name: "layerData",
                                    },
                                    bordersData: {
                                      bool: true,
                                      name: "bordersData",
                                    },
                                    tblData: {
                                      bool: false,
                                      name: "tblData",
                                    },
                                  },
                                };
                                var sfs = new SimpleMarkerSymbol(
                                  SimpleMarkerSymbol.STYLE_CIRCLE,
                                  15,
                                  new SimpleLineSymbol(
                                    SimpleLineSymbol.STYLE_SOLID,
                                    new Color([255, 0, 0]),
                                    1
                                  ),
                                  new Color([255, 0, 0, 0.25])
                                );
                                window.__map__
                                  .getLayer("Features_From_CAD")
                                  .add(
                                    new Graphic(pointInXY, sfs, {
                                      id: resultToAddToTable.id,
                                    })
                                  );

                                resultArray.push(resultToAddToTable);
                              });

                              let intesectedFeatsWithInvestPolygons =
                                resultAll.filter(
                                  (f) => f.isIntersectWithPolygon
                                );
                              if (intesectedFeatsWithInvestPolygons.length) {
                                _this.notificationByIntersecting();
                                _this.props.closeLoader();
                                _this.setState({ showModal: true, currentModal: "intersect_msg",
                                modalMsg:
                                "تتقاطع بعض اللوحات الاعلانية بالملف مع مواقع استثمارية موجودة. هل تريد الاستمرار ؟",
                                removeUploadedFile:""
                              });
                                return;
                              }
                              return resultArray;
                            } else {
                              return resultArray;
                            }
                          })
                          .then((resultArray) => {
                            let promisesToAddPlanNo = [];
                            let planDataLayer = "PLAN_DATA";
                            let planDataLayerIndex = getLayerIndex(planDataLayer);
                            if (resultArray.length) {
                              resultArray.forEach((feat) => {
                                promisesToAddPlanNo.push(
                                  new Promise((resolveFunc, rejectFunc) => {
                                    queryTask({
                                      returnGeometry: false,
                                      url: `${window.__mapUrl__}/${planDataLayerIndex}`,
                                      outFields: ["PLAN_NUMBER"],
                                      geometry:
                                        new Point(
                                          feat.geographicGeom.x,
                                          feat.geographicGeom.y,
                                          new SpatialReference({
                                            wkid: feat.geographicGeom.spatialReference
                                              .wkid,
                                          })
                                        ), //success or will fail
                                      spatialRelationship:
                                        Query.SPATIAL_REL_INTERSECTS,
                                      callbackResult: ({ features }) => {
                                        if (features.length)
                                          resolveFunc({
                                            ...feat,
                                            investSiteDataAttributes: {
                                              ...feat.investSiteDataAttributes,
                                              PLAN_NO:
                                                features[0].attributes.PLAN_NUMBER,
                                            },
                                          });
                                        //in case of not intersection
                                        else
                                          resolveFunc({
                                            ...feat,
                                            investSiteDataAttributes: {
                                              ...feat.investSiteDataAttributes,
                                              PLAN_NO: "",
                                            },
                                          });
                                      },
                                      callbackError: (err) => {
                                        //in case there is an error in excution query
                                        // rejectFunc(err);
                                        _this.setState({removeUploadedFile:""})
                                        _this.notificationErrorDuringProcess();
                                        _this.props.closeLoader();
                                        rejectFunc(err);
                                      },
                                    });
                                  })
                                );
                              });
                              return promisesToAddPlanNo;
                            } else {
                              return promisesToAddPlanNo;
                            }
                          })
                          .then((promises) => {
                            Promise.all(promises).then(resultArray=>{
                            if (resultArray.length) {
                              //zoom to features from uploading file
                              let feats =
                                window.__map__.getLayer("Features_From_CAD").graphics;
                              let featsExtent = graphicsUtils.graphicsExtent(feats);
                              window.__map__.setExtent(featsExtent.expand(3));
                              //show message to user
                              _this.notificatioWithUploadingFile();
                              //close loader
                              _this.props.closeLoader();
                              _this.props.addSelectedFeaturesToTemp(resultArray); //add to temp till choosing user yes or no
        
                              //show confirmation message to user
                              setTimeout(() => {
                                _this.setState({
                                  showModal: true,
                                  currentModal: "confirmation",
                                  modalMsg: "   هل تريد حفظ الرسم على الخريطة ؟؟",
                                  removeUploadedFile:""
                                });
                              }, 4500);
                            }
                          })
                        })
                         
                      });
                  })
                  
              })
              .catch((err) => {
                _this.setState({removeUploadedFile:""})
                _this.notificationErrorDuringProcess();
                _this.props.closeLoader();
                console.error(err);
              });
          }
          //2- if there is no adBoards in file
          else {
            _this.setState({removeUploadedFile:""})
            _this.notificationEmptyFile();
            _this.props.closeLoader();
          }
        }
        //*** if there is no adBoards data in file
        else {
          _this.setState({typeOfAddedData:""})
          let cadLayerOnMap = window.__map__.getLayer("Features_From_CAD");
          cadLayerOnMap.clear();
          _this.notificationExpectedFeaturesInFile(layername.toLowerCase());
          _this.props.closeLoader();
        }
      });
    }
  );
};


export const setSitesDataToRedux = async(
  whereCondition, 
  pushResultTableData,
  pushContentToModal,
  closeLoader,
  openLoader, 
  user,
  callBack)=>{
  const promises = ["INVEST_SITE_POLYGON", "ADVERTISING_BOARDS"].map((layername) => {
    const layerIndex = getLayerIndex(layername);
    return new Promise((resolve, reject) => {
      queryTask({
        returnGeometry: true,
        url: `${window.__mapUrl__}/${layerIndex}`,
        outFields: ["*"],
        where: whereCondition,
        callbackResult: ({ features }) => {
          // fix features
          if (features.length) {
            features =
            !user ||(user &&![1].includes(user.user_type_id))  
            // this.props.currentUser !== "Employee"
                ? features.map((feat) => {
                    delete feat.attributes["SITE_AREA"];
                    return feat;
                  })
                : features;
            // highlightFeature(features, window.__map__, {
            //   noclear: true,
            //   isZoom: true,
            //   layerName: "searchGraphicLayer",
            //   highlightWidth: 3,
            //   fillColor: [225, 225, 255, 0.25],
            //   strokeColor: "black",
            // });
          }
          resolve({ layername, data: features });
        },
        callbackError: (err) => {
          console.log(err);
          reject(err);
        },
      });
    });
  });

  Promise.all(promises)
    .then((result) => {
      // this.props.closeLoader(); //for loader in case of search process
      if (isResultEmpty(result)) {
        notificationMessage("لا توجد نتائج")
        window.__map__.getLayer("zoomGraphicLayer").clear();
        window.__map__.getLayer("searchGraphicLayer").clear();
        closeLoader(); //for stop loader in case there is no result
        return pushResultTableData(null);
      }
      
        let flagTechReportPromises = [];
        result.forEach((group) => {
          if (group.layername.toLocaleLowerCase() === "invest_site_polygon") {
            let indexLayer = getLayerIndex("TBL_BUILD_DETAILS"); //TBL_BUILD_DETAILS that includes TECHNIQUAL_REPORT to check yes or no
            flagTechReportPromises = group.data.map((feat) => {
              return new Promise((resolve, reject) =>
                queryTask({
                  returnGeometry: false,
                  url: `${window.__mapUrl__}/${indexLayer}`,
                  outFields: ["SITE_GEOSPATIAL_ID,TECHNIQUAL_REPORT"],
                  where: `SITE_GEOSPATIAL_ID=${feat.attributes.SITE_GEOSPATIAL_ID}`,
                  callbackResult: ({ features }) => {
                    if (features && features.length > 0) {
                      resolve({
                        flag: features[0].attributes.TECHNIQUAL_REPORT
                          ? true
                          : false,
                        id: features[0].attributes.SITE_GEOSPATIAL_ID,
                      });
                    } else
                      resolve({
                        flag: false,
                        id: feat.attributes.SITE_GEOSPATIAL_ID,
                      });
                  },
                  callbackError: (err) => {
                    console.error(err);
                    resolve({ flag: false });
                  },
                })
              );
            });
          } else
            flagTechReportPromises = [
              ...flagTechReportPromises,
              ...group.data.map((feat) => {
                return { flag: false };
              }),
            ];
        });
        let flagForTechReport = []
        Promise.all(flagTechReportPromises).then((resultOfFlagTech) => {
          flagForTechReport= resultOfFlagTech;
          closeLoader(); //for loader in case of search process
          // this.props.showTable(true);
          // this.props.generalOpenResultMenu(); //open search results (cards)
          pushResultTableData({
            result,
            columns: [
        { name: "SITE_COMMON_USE", alias: "النشاط الاستثماري" },
        { name: "SITE_STATUS", alias: "حالة الموقع" },
        { name: "SITE_SUB_STATUS", alias: "حالة الموقع التتفصيلية " },
        { name: "SITE_SUBTYPE", alias: "نوع الموقع" },
        { name: "SITE_AREA", alias: "المساحة" },
        { name: "STREET_NAME", alias: "اسم الشارع" },
        { name: "PARCEL_PLAN_NO", alias: "رقم قطعة الارض" },
        { name: "PLAN_NO", alias: "رقم المخطط" },
        { name: "MUNICIPALITY_NAME", alias: "البلدية" },
        { name: "DISTRICT_NAME", alias: "الحي" },
        { name: "SITE_LAT_COORD", alias: "احداثي دائرة العرض للمركز" },
        { name: "SITE_LONG_COORD", alias: "احداثي خط الطول للمركز" },
      ],
            actions: [
              //show all remarks - suggestions of selected site
              {
                name: (feature) => {
                  if (user && [1].includes(user.user_type_id)) {
                    if (
                      feature.attributes["حالة الموقع"] === "شاغرة" ||
                      feature.attributes["SITE_STATUS"] === 2
                    )
                      return "showAllsuggestions";
                    else return "showAllremarks";
                  }
                  return "";
                },
                alias: (feature) => {
                  if (user && [1].includes(user.user_type_id)) {
                    if (
                      feature.attributes["حالة الموقع"] === "شاغرة" ||
                      feature.attributes["SITE_STATUS"] === 2
                    )
                      return "عرض الاقتراحات";
                    else return "عرض الملاحظات";
                  }
                  return "";
                },
                icon: <AiOutlineFile fontSize="medium" />,
                canRender: (feature, layername) => {
                  if (
                    user &&
                    [1].includes(user.user_type_id) &&
                    layername.toLowerCase() === "invest_site_polygon"
                  )
                    return true;
                  else return false;
                },
                action: async (feature, layername) => {
                  openLoader(); //for loader
                  if (
                    feature.attributes["حالة الموقع"] === "شاغرة" ||
                    feature.attributes["SITE_STATUS"] === 2
                  ) {
                    // push the feature to the store
                    try {
                      let res = await axios.get(
                        window.API_URL + "api/Suggestion/getall",
                        {
                          headers: {
                            Authorization: `Bearer ${user.token}`,
                          },
                        }
                      );
    
                      let result = res.data.results;
                      if (result.length) {
                        let filteredRes = result.filter(
                          (item) =>
                            item.suggestion_investment &&
                            item.suggestion_investment.find(
                              (i) =>
                                i.investment_spatial_id ===
                                feature.attributes.SITE_GEOSPATIAL_ID
                            )
                        );
                        console.log(filteredRes);
                        pushContentToModal({
                          feature: filteredRes,
                          layername,
                          name: "showAllsuggestions",
                        });
                      } else {
                        pushContentToModal({
                          feature: [],
                          layername,
                          name: "showAllsuggestions",
                        });
                      }
                      closeLoader();
                      return true;
                    } catch (err) {
                      //put a notification message
                      console.log(err);
                      closeLoader();
                      return false;
                    }
                  } else {
                    try {
                      let res = await axios.get(
                        window.API_URL + "api/remark/getall",
                        {
                          headers: {
                            Authorization: `Bearer ${user.token}`,
                          },
                        }
                      );
                      let result = res.data.results;
                      if (result.length) {
                        let filteredRes = result.filter(
                          (item) =>
                            item.remark_investment &&
                            item.remark_investment.find(
                              (i) =>
                                i.invest_spatial_id ===
                                feature.attributes.SITE_GEOSPATIAL_ID
                            )
                        );
                        console.log(filteredRes);
                        pushContentToModal({
                          feature: filteredRes,
                          layername,
                          name: "showAllremarks",
                        });
                      } else {
                        pushContentToModal({
                          feature: [],
                          layername,
                          name: "showAllremarks",
                        });
                      }
                      closeLoader();
                      return true;
                    } catch (err) {
                      console.log(err);
                      closeLoader();
                      return false;
                    }
                  }
                },
              },
              ///
              // show remark modal to enter data
              {
                name: (feature) => {
                  if (
                    user &&
                    [
                      2, //investor
                      3, //eng office
                    ].includes(user.user_type_id)
                  ) {
                    if (
                      feature.attributes["حالة الموقع"] === "شاغرة" ||
                      feature.attributes["SITE_STATUS"] === 2
                    )
                      return "suggestion";
                    else return "remark";
                  }
                  return "";
                },
                alias: (feature) => {
                  if (
                    user &&
                    [
                      2, //investor
                      3, //eng office
                    ].includes(user.user_type_id)
                  ) {
                    if (
                      feature.attributes["حالة الموقع"] === "شاغرة" ||
                      feature.attributes["SITE_STATUS"] === 2
                    )
                      return "تقديم اقتراح";
                    else return "تقديم ملاحظة";
                  }
                  return "";
                },
                icon: <AiOutlineFile fontSize="medium" />,
                canRender: (feature, layername) => {
                  if (
                    user &&
                    [
                      // 2,    //investor
                      3, //eng office
                    ].includes(user.user_type_id) &&
                    layername.toLowerCase() === "invest_site_polygon"
                  )
                    return true;
                  else return false;
                },
                action: (feature, layername) => {
                  if (
                    feature.attributes["حالة الموقع"] === "شاغرة" ||
                    feature.attributes["SITE_STATUS"] === 2
                  )
                    // push the feature to the store
                    // so the borders modal can be opened
                    pushContentToModal({
                      feature,
                      layername,
                      name: "suggestion",
                    });
                  else
                    pushContentToModal({
                      feature,
                      layername,
                      name: "remark",
                    });
                },
              },
              ///
              // zoom
              {
                name: "zoom",
                alias: "تكبير",
                icon: <i className="fas fa-search-plus pl-1 fa-lg"></i>,
                canRender: () => true,
                action: (feature, layername) => {
                  openLoader(); //for loader in case of zooimng
                  const layerIndex = getLayerIndex(layername);
                  queryTask({
                    returnGeometry: true,
                    url: `${window.__mapUrl__}/${layerIndex}`,
                    outFields: ["OBJECTID", "SITE_GEOSPATIAL_ID"],
                    where: `SITE_GEOSPATIAL_ID=${feature.attributes["SITE_GEOSPATIAL_ID"]}`,
                    callbackResult: ({ features }) => {
                      window.__map__.getLayer("zoomGraphicLayer").clear();
                      highlightFeature(features, window.__map__, {
                        noclear: true,
                        isZoom: true,
                        layerName: "zoomGraphicLayer",
                        highlightWidth: 5,
                        fillColor: [225, 225, 0, 0.25],
                        strokeColor: "grey",
                        isDashStyle: true,
                      });
                      // setTimeout(() => {
                      //   let graphicLayerOfZooming = window.__map__.getLayer("zoomGraphicLayer");
                      //   graphicLayerOfZooming.clear()
                      //   }, 4000);
                      closeLoader(); //for loader in case of zooimng
                      // addToSelectedFeatures(features);
                    },
                  });
                },
              },
              ///
              // open google location
              {
                name: "OpenInGoogle",
                alias: "الذهاب إلى جوجل",
                icon: (
                  <img
                    src={GoogleIcon}
                    alt="go to google"
                    style={{ width: "16px" }}
                  />
                ),
                canRender: () => true,
                action: (data) => {
                  console.log(data);
                  let dataLat = data.attributes["SITE_LAT_COORD"];
                  let dataLong = data.attributes["SITE_LONG_COORD"];
    
                  window.open(
                    `http://maps.google.com/maps?q=${dataLat},${dataLong}`,
                    "_blank"
                  );
                },
              },
              //
              //Borders from field
              {
                name: "bordersFromField",
                alias: "حدود الموقع من الطبيعة",
                icon: <i className="far fa-map pl-1 fa-lg"></i>,
                canRender: (feature, layername) =>
                  layername.toLocaleLowerCase() ===
                    "Invest_Site_Polygon".toLocaleLowerCase() &&
                  feature.attributes["SITE_COMMON_USE"] !== 15131,
                action: (feature, layername) => {
                  // push the feature to the store
                  // so the borders modal can be opened
                  pushContentToModal({
                    feature,
                    layername,
                    name: "Border_Field_Info",
                  });
                },
              },
              //Borders from Plan --> employee just can see it
              {
                name: "bordersFromPlan",
                alias: "حدود الموقع من المخطط",
                icon: <BorderAllIcon />,
                canRender: (feature, layername) =>
                  layername.toLocaleLowerCase() ===
                    "Invest_Site_Polygon".toLocaleLowerCase() &&
                  feature.attributes["SITE_COMMON_USE"] !== 15131 &&
                  user && [1].includes(user.user_type_id),
                action: async (feature, layername) => {
                  openLoader();
                  let layerIndex = getLayerIndex("INVEST_SITE_BOUNDARY"); //INVEST_SITE_BOUNDARY
                  await queryTask({
                    returnGeometry: false,
                    url: `${window.__mapUrl__}/${layerIndex}`,
                    outFields: ["*"],
                    where: `SITE_GEOSPATIAL_ID=${feature.attributes["SITE_GEOSPATIAL_ID"]}`,
                    callbackResult: ({ features }) => {
                      closeLoader();
                      getFeatureDomainName(features, layerIndex).then((rf) => {
                        if (!rf.length) rf = [];
                        pushContentToModal({
                          features: rf,
                          layername,
                          name: "Border_Plan_Info",
                          borderDescirbtion: feature.attributes,
                        });
                      });
                    },
                    callbackError: (err) => {
                      closeLoader();
                      console.error(err);
                    },
                  });
                },
              },
              //advertise boards group
              {
                name: "AD borders",
                alias: "بيانات المجموعة الإعلانية",
                icon: <i className="fas fa-ad 5x fa-lg"></i>,
                canRender: (feature, layername) =>
                  getLayerIndex(layername) ===
                  getLayerIndex("ADVERTISING_BOARDS"),
                // &&feature.attributes["SITE_COMMON_USE"] === 15131
                action: async (feature, layername) => {
                  // push the feature to the store
                  // so the borders modal can be opened
                  openLoader();
                  let indexLayer = getLayerIndex("TBL_BOARDS_GROUP"); //TBL_BOARDS_GROUP
                  await queryTask({
                    returnGeometry: false,
                    url: `${window.__mapUrl__}/${indexLayer}`,
                    outFields: ["*"],
                    where: `GROUP_CODE=${feature.attributes["GROUP_CODE"]}`,
                    callbackResult: ({ features }) => {
                      closeLoader();
                      getFeatureDomainName(features, indexLayer).then((rf) => {
                        if (!rf.length) rf = [];
                        pushContentToModal({
                          feature: rf,
                          name: "ADGroup_Info",
                        });
                      });
                    },
                    callbackError: (err) => {
                      console.error(err);
                      closeLoader();
                    },
                  });
                },
              },
              //for contract info
              // {
              //   name: "contract",
              //   alias: "بيانات العقد",
              //   icon: <i className="fas fa-file-contract"></i>,
              //   canRender: (feature, layername) =>
              //     layername.toLocaleLowerCase() ===
              //       "Invest_Site_Polygon".toLocaleLowerCase() &&
              //     feature.attributes["SITE_STATUS"] === 4,
              //   action: async (feature, layername) => {
              //     // push the feature to the store
              //     // so the borders modal can be opened
              //     let layerIndex = 16;     //TBL_CONTRACTS
              //     await queryTask({
              //       returnGeometry: false,
              //       url: `${window.__mapUrl__}/${layerIndex}`,
              //       outFields: ["*"],
              //       where: `SITE_GEOSPATIAL_ID=${feature.attributes["SITE_GEOSPATIAL_ID"]}`,
              //       callbackResult: ({ features }) => {
              //           getFeatureDomainName(features, layerIndex).then((rf) => {
              //         // pushContentToModal({ feature:rf, name:"Contract_Info" });
              //           })
              //       },
              //       callbackError: (err) => {
              //         console.error(err);
              //       },
              //     });
              //   },
              // },
              //for ATM info
              {
                name: "atmInfo",
                alias: "بيانات الصراف الآلي",
                icon: (
                  <img
                    src={AtmIcon}
                    alt="atm icon"
                    style={{
                      width: "25px",
                      height: "25px",
                    }}
                  />
                ),
                // <AtmIcon />
                canRender: (feature, layername) =>
                  layername.toLocaleLowerCase() ===
                    "Invest_Site_Polygon".toLocaleLowerCase() &&
                  feature.attributes["SITE_SUBTYPE"] === 6,
                action: async (feature, layername) => {
                  // push the feature to the store
                  // so the borders modal can be opened
                  closeLoader();
                  let indexLayer = getLayerIndex("TBL_ATM"); //TBL_ATM
                  await queryTask({
                    returnGeometry: false,
                    url: `${window.__mapUrl__}/${indexLayer}`,
                    outFields: ["*"],
                    where: `SITE_GEOSPATIAL_ID=${feature.attributes["SITE_GEOSPATIAL_ID"]}`,
                    callbackResult: ({ features }) => {
                      closeLoader();
                      getFeatureDomainName(features, indexLayer).then((rf) => {
                        if (!rf.length) rf = [{ attributes: {} }];
                        pushContentToModal({
                          feature: rf[0],
                          name: "ATM_Info",
                        });
                      });
                    },
                    callbackError: (err) => {
                      closeLoader();
                      console.error(err);
                    },
                  });
                },
              },
              //for Building info
              {
                name: "BuildingDataInfo",
                alias: "بيانات المبني",
                icon: <i className="fas fa-city fa-lg"></i>,
                canRender: (feature, layername) =>
                  layername.toLocaleLowerCase() ===
                    "Invest_Site_Polygon".toLocaleLowerCase() &&
                  feature.attributes["SITE_SUBTYPE"] === 1,
                action: async (feature, layername) => {
                  // push the feature to the store
                  // so the borders modal can be opened
                  openLoader();
                  console.log(feature);
                  console.log(feature.attributes["SITE_GEOSPATIAL_ID"]);
                  let indexLayer = getLayerIndex("TBL_BUILDING_DATA"); //TBL_BUILDING_DATA
                  await queryTask({
                    returnGeometry: false,
                    url: `${window.__mapUrl__}/${indexLayer}`,
                    outFields: ["*"],
                    where: `SITE_GEOSPATIAL_ID=${feature.attributes["SITE_GEOSPATIAL_ID"]}`,
                    callbackResult: ({ features }) => {
                      closeLoader();
                      console.log(features);
                      getFeatureDomainName(features, indexLayer).then((rf) => {
                        if (!rf.length) rf = [{ attributes: {} }];
                        pushContentToModal({
                          feature: rf[0],
                          name: "Building_Data_Info",
                        });
                      });
                    },
                    callbackError: (err) => {
                      closeLoader();
                      console.error(err);
                    },
                  });
                },
              },
              //for Building details info --> show it only if there is TECHNIQUAL_REPORT value in TBL_BUILD_DETAILS
              {
                name: "BuildingDetailsInfo",
                alias: " بيانات تفاصيل المباني",
                icon: <EmojiTransportationIcon fontSize="medium" />,
                canRender: (feature, layername) => {
                  if (
                    layername.toLocaleLowerCase() ===
                      "Invest_Site_Polygon".toLocaleLowerCase() &&
                    flagForTechReport.length
                  ) {
                    flagForTechReport = flagForTechReport.find(
                      (item) => item.id === feature.attributes.SITE_GEOSPATIAL_ID
                    );
                    if (flagForTechReport) return flagForTechReport.flag;
                    else return false;
                  } else return false;  
                },
                action: async (feature, layername) => {
                  // push the feature to the
                  openLoader();
                  let featAttributes = { ...feature.attributes };
                  console.log(feature.attributes["SITE_GEOSPATIAL_ID"]);
                  let indexLayer = getLayerIndex("TBL_BUILD_DETAILS"); //TBL_BUILD_DETAILS that includes TECHNIQUAL_REPORT to check yes or no
                  await queryTask({
                    returnGeometry: false,
                    url: `${window.__mapUrl__}/${indexLayer}`,
                    outFields: ["*"],
                    where: `SITE_GEOSPATIAL_ID=${feature.attributes["SITE_GEOSPATIAL_ID"]}`,
                    callbackResult: ({ features }) => {
                      closeLoader();
                      let featureWithAllAttributes = [];
                      if (features.length > 0) {
                        featureWithAllAttributes = features.map((feat) => {
                          feat.attributes = {
                            ...feat.attributes,
                            ...featAttributes,
                          };
                          return feat;
                        });
                      } else
                        featureWithAllAttributes = [
                          { attributes: featAttributes },
                        ];
                      pushContentToModal({
                        feature: featureWithAllAttributes,
                        name: "Building_Details_Info",
                      });
                    },
                    callbackError: (err) => {
                      closeLoader();
                      console.error(err);
                    },
                  });
                },
              },
              //for Building images info
              {
                name: "BuildingImages",
                alias: "صور المباني",
                icon: <PhotoLibraryIcon />,
                canRender: (feature, layername) => {
                  if (
                    layername.toLocaleLowerCase() ===
                      "Invest_Site_Polygon".toLocaleLowerCase() &&
                    flagForTechReport.length
                  ) {
                    flagForTechReport = flagForTechReport.find(
                      (item) => item.id === feature.attributes.SITE_GEOSPATIAL_ID
                    );
                    if (flagForTechReport) return flagForTechReport.flag;
                    else return false;
                  } else return false;
                },
                action: async (feature, layername) => {
                  // push the feature to the store
                  // so the borders modal can be opened
                  openLoader();
                  let indexLayer = getLayerIndex("TBL_BUILD_DETAILS"); //TBL_BUILD_DETAILS that includes TECHNIQUAL_REPORT to check yes or no
                  await queryTask({
                    returnGeometry: false,
                    url: `${window.__mapUrl__}/${indexLayer}`,
                    outFields: ["IMAGE_URL"],
                    where: `SITE_GEOSPATIAL_ID=${feature.attributes["SITE_GEOSPATIAL_ID"]}`,
                    callbackResult: ({ features }) => {
                      closeLoader();
                      if (!features.length) features = [{ attributes: {} }];
                      pushContentToModal({
                        feature: features[0],
                        name: "Building_Images",
                      });
                    },
                    callbackError: (err) => {
                      closeLoader();
                      console.error(err);
                    },
                  });
                },
              },
              //for towers info
              {
                name: "towers info",
                alias: "بيانات الأبراج",
                icon: <i className="fas fa-broadcast-tower fa-lg"></i>,
                canRender: (feature, layername) =>
                  layername.toLocaleLowerCase() ===
                    "Invest_Site_Polygon".toLocaleLowerCase() &&
                  feature.attributes["SITE_SUBTYPE"] === 3,
                action: async (feature, layername) => {
                  // push the feature to the store
                  // so the borders modal can be opened
                  openLoader();
                  console.log(feature.attributes["SITE_GEOSPATIAL_ID"]);
                  let indexLayer = getLayerIndex("TBL_TOWERS"); //TBL_TOWERS
                  await queryTask({
                    returnGeometry: false,
                    url: `${window.__mapUrl__}/${indexLayer}`,
                    outFields: [
                      "TOWER_LOCATION_CODE,TOWER_TYPE,TOWER_HEIGHT,TOWER_SERVICE_PROVIDER",
                    ],
                    where: `SITE_GEOSPATIAL_ID=${feature.attributes["SITE_GEOSPATIAL_ID"]}`,
                    callbackResult: ({ features }) => {
                      closeLoader();
                      getFeatureDomainName(features, indexLayer).then((rf) => {
                        if (!rf.length) rf = [{ attributes: {} }];
                        pushContentToModal({
                          feature: rf[0],
                          name: "Tower_Info",
                        });
                      });
                    },
                    callbackError: (err) => {
                      closeLoader();
                      console.error(err);
                    },
                  });
                },
              },
              //for elec stations info
              {
                name: "elec stations info",
                alias: "بيانات  محطات الكهرباء",
                icon: <i className="fas fa-gopuram fa-lg"></i>,
                canRender: (feature, layername) =>
                  layername.toLocaleLowerCase() ===
                    "Invest_Site_Polygon".toLocaleLowerCase() &&
                  feature.attributes["SITE_SUBTYPE"] === 5,
                action: async (feature, layername) => {
                  // push the feature to the store
                  // so the borders modal can be opened
                  openLoader();
                  console.log(feature.attributes["SITE_GEOSPATIAL_ID"]);
                  let indexLayer = getLayerIndex("TBL_ELEC_STATION");
                  await queryTask({
                    returnGeometry: false,
                    url: `${window.__mapUrl__}/${indexLayer}`,
                    outFields: ["ELEC_TYPE,NAME"],
                    where: `SITE_GEOSPATIAL_ID=${feature.attributes["SITE_GEOSPATIAL_ID"]}`,
                    callbackResult: ({ features }) => {
                      closeLoader();
                      getFeatureDomainName(features, indexLayer).then((rf) => {
                        if (!rf.length) rf = [{ attributes: {} }];
                        pushContentToModal({
                          feature: rf[0],
                          name: "Elec_Stations_Info",
                        });
                      });
                    },
                    callbackError: (err) => {
                      closeLoader();
                      console.error(err);
                    },
                  });
                },
              },
              //for Site Coordinates info
              {
                name: "coordinates info",
                alias: "بيانات الاحداثيات",
                icon: <i className="fas fa-map-marked-alt fa-lg"></i>,
                canRender: (feature, layername) =>
                  getLayerIndex(layername) ===
                    getLayerIndex("Invest_Site_Polygon") &&
                  feature.attributes["SITE_SUBTYPE"] !== 2 &&
                  user && [1].includes(user.user_type_id),
                action: async (feature, layername) => {
                  // push the feature to the store
                  // so the borders modal can be opened
                  openLoader();
                  console.log(feature.attributes["SITE_GEOSPATIAL_ID"]);
                  let indexLayer = getLayerIndex("INVEST_SITE_CORNER");
                  await queryTask({
                    returnGeometry: false,
                    url: `${window.__mapUrl__}/${indexLayer}`,
                    outFields: ["XGCS_COORD,YGCS_COORD,CORNER_NO"],
                    where: `SITE_GEOSPATIAL_ID=${feature.attributes["SITE_GEOSPATIAL_ID"]}`,
                    callbackResult: ({ features }) => {
                      closeLoader();
                      if (!features.length) features = [];
                      pushContentToModal({
                        features: features,
                        name: "Coordinate_Info",
                      });
                    },
                    callbackError: (err) => {
                      closeLoader();
                      console.error(err);
                    },
                  });
                },
              },
            ],
          });
          callBack()
        });
      

      
     
    })
    .catch((err) => {
      console.log(err);
      notificationMessage("حدث خطأ برجاء المحاولة مرة أخرى");
      window.__map__.getLayer("zoomGraphicLayer").clear();
      window.__map__.getLayer("searchGraphicLayer").clear();
      closeLoader(); //for stop loader in case there is no result
      pushResultTableData(null);
    });
}
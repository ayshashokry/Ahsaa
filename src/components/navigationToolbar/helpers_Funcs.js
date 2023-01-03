import { difference, differenceBy } from "lodash";
import store from "../../redux/store";
import { checkIsDataComplete } from "../sidemenuSections/helpers/common_func";
import AtmIcon from "../../assets/images/atm-icon-for-form.svg";
import GoogleIcon from "../../assets/images/google-maps.svg";
import EmojiTransportationIcon from "@material-ui/icons/EmojiTransportation";
import PhotoLibraryIcon from "@material-ui/icons/PhotoLibrary";
import BorderAllIcon from "@material-ui/icons/BorderAll";
import { AiOutlineFile } from "react-icons/ai";
import {
  getFeatureDomainName,
  getLayerIndex,
  highlightFeature,
  queryTask,
} from "../common/mapviewer";
import axios from "axios";

export function callbackMultiSelectForNormalSelection(
  result,
  layername,
  _this
) {
  const {
    addToSelectedFeatures,
    selectedFeatures,
    openLoader,
    closeLoader,
    removeFeatFromSelectedFeats,
    showingDetailsViaMap,
  } = _this.props;
  openLoader();
  let graphicLayerName = "highLightGraphicLayer";
  var layerIndex = getLayerIndex(layername);
  if (!result?.data?.length) {
    closeLoader();
    return;
    // _this.confirmationSelect();
  }
  const featuresSelected = result.data;

  // the next line of code search the already selectedFeatures array
  // and finds out if the new selected feature is within the array
  // if it is not it will dispatch it to the store  ... tricky Yesss I know :)

  let fs = window.__map__.getLayer(graphicLayerName).graphics;
  let graphicLayer = window.__map__.getLayer(graphicLayerName);
  let pushedFeatures = [];
  featuresSelected.forEach((featureToSelect) => {
    // add the feature to the highlight layer
    let featureAddedBefore = fs.find(
      (feat) =>
        feat.attributes.SITE_GEOSPATIAL_ID ==
        featureToSelect.attributes.SITE_GEOSPATIAL_ID
    );
    if (featureAddedBefore) {
      graphicLayer.remove(featureAddedBefore);
      if (showingDetailsViaMap) {
        this.props.removeFromSearchTable(
          featureToSelect.attributes.SITE_GEOSPATIAL_ID
        );
        if (selectedFeatures.length === 1)
          this.props.handleShowingDetailsViaMap(false);
      }
      removeFeatFromSelectedFeats(
        featureAddedBefore.attributes.SITE_GEOSPATIAL_ID
      );
    } else {
      pushedFeatures.push(featureToSelect);
    }
  });
  if (pushedFeatures.length) {
    addToSelectedFeatures(pushedFeatures);
    highlightFeature([...selectedFeatures], window.__map__, {
      isZoom: true,
      layerName: graphicLayerName,
      highlightWidth: 5,
    });
  }
  closeLoader();
  return;
}
export function callBackMultiSelectFromMapForUpdate(result, layername, _this) {
  let promises = [];
  if (result.data.length) {
    result.data.forEach((feat) => {
      promises.push(
        new Promise((resolveFunc, rejectFunc) => {
          let tblIndex, tblName;
          if (layername.toLowerCase() == "invest_site_polygon")
            switch (feat.attributes.SITE_SUBTYPE) {
              case 1:
                tblIndex = getLayerIndex("TBL_BUILDING_DATA");
                tblName = "TBL_BUILDING_DATA";
                break;
              // case 2:
              //   tblIndex = getLayerIndex("TBL_BOARDS_GROUP");
              //   break;
              case 3:
                tblIndex = getLayerIndex("TBL_TOWERS");
                tblName = "TBL_TOWERS";
                break;
              case 5:
                tblIndex = getLayerIndex("TBL_ELEC_STATION");
                tblName = "TBL_ELEC_STATION";
                break;
              case 6:
                tblIndex = getLayerIndex("TBL_ATM");
                tblName = "TBL_ATM";
                break;
            }
          else {
            tblIndex = getLayerIndex("TBL_BOARDS_GROUP");
            tblName = "TBL_BOARDS_GROUP";
          }
          if (tblIndex)
            queryTask({
              returnGeometry: false,
              url: `${window.__mapUrl__}/${tblIndex}`,
              outFields: ["*"],
              where:
                tblName === "TBL_BOARDS_GROUP"
                  ? `GROUP_CODE=${feat.attributes.GROUP_CODE}`
                  : `SITE_GEOSPATIAL_ID=${feat.attributes.SITE_GEOSPATIAL_ID}`,
              callbackResult: ({ features }) => {
                if (features.length)
                  resolveFunc({
                    layername,
                    tblData: features[0].attributes,
                    data: feat.attributes,
                    // geometry: feat.geometry,
                    tblName,
                  });
                else
                  resolveFunc({
                    layername,
                    tblData: null,
                    tblName,
                    data: feat.attributes,
                    // geometry: feat.geometry,
                  });
                // });
              },
              callbackError: (err) => {
                // rejectFunc(err);
                resolveFunc({
                  layername,
                  tblData: null,
                  tblName,
                  data: feat.attributes,
                  // geometry: feat.geometry,
                });
              },
            });
          else
            resolveFunc({
              layername,
              tblName,
              tblData: null,
              data: feat.attributes,
              //  geometry: feat.geometry
            });
        })
      );
    });
  }
  if (promises.length)
    Promise.all(promises).then((resultAll) => {
      let resultArray = [];
      if (resultAll.length)
        resultAll.forEach((item) => {
          let featureAtrributes = item.data;

          let resultToAddToTable = {
            // geometry: item.geometry,
            layername: item.layername,
            fieldsBeforeEdit: featureAtrributes,
            fieldsForEdit: featureAtrributes,
            isChecked: false,
            isDeleted: false,
            isCompletedFilled: checkIsDataComplete(item),
            id: featureAtrributes.SITE_GEOSPATIAL_ID,
            landNumber: featureAtrributes.PARCEL_PLAN_NO,
            //if not adverte board
            bordersLengthFromPlanDataBefore:
              getLayerIndex(item.layername) ===
              getLayerIndex("invest_site_polygon")
                ? featureAtrributes
                : null, //from invest site Boundaries
            bordersLengthFromPlanDataAfter:
              getLayerIndex(item.layername) ===
              getLayerIndex("invest_site_polygon")
                ? featureAtrributes
                : null, //from invest site Boundaries

            //if ATM
            atmDataBefore:
              featureAtrributes.SITE_SUBTYPE == 6 ? item.tblData : null,
            atmDataAfter:
              featureAtrributes.SITE_SUBTYPE == 6 ? item.tblData : null,

            //if tower
            towerDataBefore:
              featureAtrributes.SITE_SUBTYPE == 3 ? item.tblData : null,
            towerDataAfter:
              featureAtrributes.SITE_SUBTYPE == 3 ? item.tblData : null,

            //if elec station
            elecStationDataBefore:
              featureAtrributes.SITE_SUBTYPE == 5 ? item.tblData : null,
            elecStationDataAfter:
              featureAtrributes.SITE_SUBTYPE == 5 ? item.tblData : null,

            //if building
            buildingDataBefore:
              featureAtrributes.SITE_SUBTYPE == 1 ? item.tblData : null,
            buildingDataAfter:
              featureAtrributes.SITE_SUBTYPE == 1 ? item.tblData : null,

            //if ads
            adBoardsDataBefore:
              item.layername.toUpperCase() == "ADVERTISING_BOARDS"
                ? item.tblData
                : null,
            adBoardsDataAfter:
              item.layername.toUpperCase() == "ADVERTISING_BOARDS"
                ? item.tblData
                : null,
          };
          resultArray.push(resultToAddToTable);
        });

      //if select one feature but is already added before --> show message
      if (
        valueToBoolean(resultArray.length === 1) &&
        valueToBoolean(_this.props.tableSettings) &&
        valueToBoolean(_this.props.tableSettings.result.length) &&
        _this.props.tableSettings.result.findIndex(
          (item) =>
            item.fieldsForEdit.SITE_GEOSPATIAL_ID ===
            resultArray[0].fieldsForEdit.SITE_GEOSPATIAL_ID
        ) !== -1
      ) {
        _this.notificationDuplicatedData();
        resultArray = [];
      }
      if (
        valueToBoolean(resultArray.length > 1) &&
        valueToBoolean(_this.props.tableSettings) &&
        valueToBoolean(_this.props.tableSettings.result.length)
      ) {
        console.log(
          resultArray,
          _this.props.tableSettings.result,
          difference(resultArray, _this.props.tableSettings.result)
        );
      }
      //if user selects many features --> remove all duplicated features that added before
      if (
        valueToBoolean(resultArray.length > 1) &&
        valueToBoolean(_this.props.tableSettings) &&
        valueToBoolean(_this.props.tableSettings.result.length) &&
        valueToBoolean(
          differenceBy(
            resultArray.map((feat) => feat.fieldsForEdit),
            _this.props.tableSettings.result.map((feat) => feat.fieldsForEdit),
            "SITE_GEOSPATIAL_ID"
          ).length
        )
      )
        resultArray = differenceBy(
          resultArray,
          _this.props.tableSettings.result,
          "id"
        );
      // if all selected assests are already existing before

      if (
        valueToBoolean(resultArray.length > 1) &&
        valueToBoolean(_this.props.tableSettings) &&
        valueToBoolean(_this.props.tableSettings.result.length) &&
        differenceBy(
          resultArray.map((feat) => feat.fieldsForEdit),
          _this.props.tableSettings.result.map((feat) => feat.fieldsForEdit),
          "SITE_GEOSPATIAL_ID"
        ).length == 0
      ) {
        _this.notificationDuplicatedData();
        resultArray = [];
      }
      if (resultArray.length) {
        _this.props.addSelectedFeaturesToTemp(resultArray); //add to temp till choosing user yes or no
        // _this.notificationByAdding();
      }
      // _this.setState({ loading: false });
      // if (
      //   valueToBoolean(resultArray.length) ||
      //   (valueToBoolean(_this.props.tableSettings) &&
      //     valueToBoolean(_this.props.tableSettings.result.length))
      // )
      //   _this.props.showTable(true);
      // _this.setState({ loading: false });
      _this.props.closeLoader();
      // window.__map__
      // .getLayer("graphicLayer_Multi_Select")
      // .clear();
    });
  else if (result.dublicated) {
    _this.notificationDuplicatedData();
    _this.props.closeLoader();
  } else {
    _this.notificationNoData();
    // window.__map__
    // .getLayer("graphicLayer_Multi_Select")
    // .clear();
    // _this.setState({ loading: false });
    _this.props.closeLoader();
    //remove multiselect handler after draw end
    // esriArray.forEach(eventListenersArr, function (handle) {
    //   handle.remove();
    // });
  }
}

export function callBackMultiSelectFromMapForAddLandsToInvestment(
  result,
  layername,
  _this,
  eventListenersArr,
  esriArray,
  Query,
  Polygon,
  projection,
  spatialRef,
  Point
) {
  const projectionPromise = projection.load();
  projectionPromise.then(() => {
    //result ={layername, data: features }
    let promises = [];
    let investSiteLayer = "invest_site_polygon";
    let investSiteLayerIndex = getLayerIndex(investSiteLayer);
    if (result.data.length) {
      result.data.forEach((feat) => {
        promises.push(
          new Promise((resolveFunc, rejectFunc) => {
            //to check is there any intersection bet. selected lands and existing invest lands
            queryTask({
              returnGeometry: true,
              url: `${window.__mapUrl__}/${investSiteLayerIndex}`,
              outFields: [""],
              geometry: feat.geometry,
              spatialRelationship: Query.SPATIAL_REL_INTERSECTS,
              callbackResult: ({ features }) => {
                if (features.length)
                  resolveFunc({
                    layername,
                    landFeature: feat,
                    isInvestitePolygon: true,
                  });
                else
                  resolveFunc({
                    layername,
                    landFeature: feat,
                    isInvestitePolygon: false,
                  });
              },
              callbackError: (err) => {
                // rejectFunc(err);
                resolveFunc({
                  layername,
                  landFeature: feat,
                  isInvestitePolygon: false,
                });
              },
            });
          })
        );
      });
    }
    if (promises.length)
      Promise.all(promises).then((resultAll) => {
        let resultArray = [];
        if (resultAll.length)
          resultAll.forEach(async (item) => {
            //load projection module first
            let wgsGeographic = new spatialRef(4326);
            let UTMXY = new spatialRef(3857);
            let centroidOfLandInProjectedXY, centroidOfLandInGeographic;
            let polygonObjOfLand = new Polygon(item.landFeature.geometry);
            centroidOfLandInProjectedXY = polygonObjOfLand.getCentroid();
            centroidOfLandInGeographic = projection.project(
              new Point(centroidOfLandInProjectedXY),
              wgsGeographic
              // projection.getTransformation(UTMXY,wgsGeographic)
            );

            let landAttributes = item.landFeature.attributes;
            let long = centroidOfLandInGeographic.x;
            let lat = centroidOfLandInGeographic.y;
            let longWithoutDot = long.toString().replace(".", "");
            let latWithoutDot = lat.toString().replace(".", "");
            let geoSpatialIdInString =
              longWithoutDot.substring(0, 7) + latWithoutDot.substring(0, 7);
            let resultToAddToTable = {
              geometry: item.landFeature.geometry,
              layername: "invest_site_polygon",
              // centroidOfLandInGeographic,
              // centroidOfLandInProjectedXY,
              isChecked: false,
              isInvestitePolygon: item.isInvestitePolygon,
              investSiteDataAttributes: {
                SITE_SUBTYPE: 4,
                SITE_STATUS: 2,
                PLAN_NO: landAttributes.PLAN_NO,
                PARCEL_PLAN_NO: landAttributes.PARCEL_NO,
                SITE_AREA: parseFloat(
                  parseFloat(landAttributes["SITE_AREA"]).toFixed(2)
                ),
                SITE_LAT_COORD: parseFloat(
                  parseFloat(centroidOfLandInGeographic.y).toFixed(4)
                ),
                SITE_LONG_COORD: parseFloat(
                  parseFloat(centroidOfLandInGeographic.x).toFixed(4)
                ),
                SITE_XUTM_COORD: parseFloat(
                  parseFloat(centroidOfLandInProjectedXY.x).toFixed(4)
                ),
                SITE_YUTM_COORD: parseFloat(
                  parseFloat(centroidOfLandInProjectedXY.y).toFixed(4)
                ),
                SITE_GEOSPATIAL_ID: parseFloat(geoSpatialIdInString),
              },
              // id: parseFloat(geoSpatialIdInString),
              landNumber: landAttributes.PARCEL_NO,
              id: landAttributes.OBJECTID,
              //if not adverte board
              bordersDescFromPlan: null,
              tblData: null,
              isCompletedFilled: {
                mainData: {
                  bool: false,
                  name: "layerData",
                },
                bordersData: { bool: false, name: "bordersData" },
                tblData: { bool: false, name: "tblData" },
              },
            };
            resultArray.push(resultToAddToTable);
          });
        //if select one feature but is already added before --> show message
        if (
          valueToBoolean(resultArray.length === 1) &&
          valueToBoolean(_this.props.tableSettings) &&
          valueToBoolean(_this.props.tableSettings.result.length) &&
          _this.props.tableSettings.result.findIndex(
            (item) =>
              item.investSiteDataAttributes.SITE_GEOSPATIAL_ID ===
              resultArray[0].investSiteDataAttributes.SITE_GEOSPATIAL_ID
          ) !== -1
        ) {
          _this.notificationDuplicatedData();
          resultArray = [];
        }
        if (
          valueToBoolean(resultArray.length > 1) &&
          valueToBoolean(_this.props.tableSettings) &&
          valueToBoolean(_this.props.tableSettings.result.length)
        ) {
          console.log(
            resultArray,
            _this.props.tableSettings.result,
            difference(resultArray, _this.props.tableSettings.result)
          );
        }
        //if user selects many features --> remove all duplicated features that added before
        if (
          valueToBoolean(resultArray.length > 1) &&
          valueToBoolean(_this.props.tableSettings) &&
          valueToBoolean(_this.props.tableSettings.result.length) &&
          valueToBoolean(
            differenceBy(
              resultArray.map((feat) => feat.investSiteDataAttributes),
              _this.props.tableSettings.result.map(
                (feat) => feat.investSiteDataAttributes
              ),
              "SITE_GEOSPATIAL_ID"
            ).length
          )
        )
          resultArray = differenceBy(
            resultArray,
            _this.props.tableSettings.result,
            "id"
          );
        // if all selected assests are already existing before

        if (
          valueToBoolean(resultArray.length > 1) &&
          valueToBoolean(_this.props.tableSettings) &&
          valueToBoolean(_this.props.tableSettings.result.length) &&
          differenceBy(
            resultArray.map((feat) => feat.investSiteDataAttributes),
            _this.props.tableSettings.result.map(
              (feat) => feat.investSiteDataAttributes
            ),
            "SITE_GEOSPATIAL_ID"
          ).length == 0
        ) {
          _this.notificationDuplicatedData();
          resultArray = [];
        }
        if (resultArray.length) {
          _this.props.addSelectedFeaturesToTemp(resultArray); //add to temp till choosing user yes or no
          // _this.notificationByAdding();
        }
        // _this.setState({ loading: false });
        // if (
        //   valueToBoolean(resultArray.length) ||
        //   (valueToBoolean(_this.props.tableSettings) &&
        //     valueToBoolean(_this.props.tableSettings.result.length))
        // )
        //   _this.props.showTable(true);
        // window.__map__
        // .getLayer("graphicLayer_Multi_Select")
        // .clear();
        // _this.setState({ loading: false });
        _this.props.closeLoader();
      });
    else if (result.dublicated) {
      _this.notificationDuplicatedData();
      _this.props.closeLoader();
    } else {
      _this.notificationNoData();
      // _this.setState({ loading: false });
      _this.props.closeLoader();

      // window.__map__
      // .getLayer("graphicLayer_Multi_Select")
      // .clear();
      //remove multiselect handler after draw end
      // esriArray.forEach(eventListenersArr, function (handle) {
      //   handle.remove();
      // });
    }
  });
}

export function callBackMultiSelectFromMapForPrintInvestReport(
  result,
  layername,
  _this,
  eventListenersArr,
  esriArray
) {
  if (result.data.length) {
    let resultArray = result.data.map((item) => {
      let feat = { ...item };
      feat.isChecked = false;
      feat.id = feat.attributes.SITE_GEOSPATIAL_ID;
      feat.SITE_GEOSPATIAL_ID = feat.attributes.SITE_GEOSPATIAL_ID;
      return feat;
    });

    //if select one feature but is already added before --> show message
    if (
      valueToBoolean(resultArray.length === 1) &&
      valueToBoolean(_this.props.tableSettings) &&
      valueToBoolean(_this.props.tableSettings.result.length) &&
      _this.props.tableSettings.result.findIndex(
        (item) =>
          item.attributes.SITE_GEOSPATIAL_ID ===
          resultArray[0].attributes.SITE_GEOSPATIAL_ID
      ) !== -1
    ) {
      _this.notificationDuplicatedData();
      resultArray = [];
    }

    //if user selects many features --> remove all duplicated features that added before
    if (
      valueToBoolean(resultArray.length > 1) &&
      valueToBoolean(_this.props.tableSettings) &&
      valueToBoolean(_this.props.tableSettings.result.length) &&
      valueToBoolean(
        differenceBy(
          resultArray.map((feat) => feat.attributes),
          _this.props.tableSettings.result.map((feat) => feat.attributes),
          "SITE_GEOSPATIAL_ID"
        ).length
      )
    )
      resultArray = differenceBy(
        resultArray,
        _this.props.tableSettings.result,
        "id"
      );
    // if all selected assests are already existing before

    if (
      valueToBoolean(resultArray.length > 1) &&
      valueToBoolean(_this.props.tableSettings) &&
      valueToBoolean(_this.props.tableSettings.result.length) &&
      differenceBy(
        resultArray.map((feat) => feat.attributes),
        _this.props.tableSettings.result.map((feat) => feat.attributes),
        "SITE_GEOSPATIAL_ID"
      ).length == 0
    ) {
      _this.notificationDuplicatedData();
      resultArray = [];
    }
    if (resultArray.length) {
      console.log({ resultArray });
      resultArray[0].boxGeometry = result.boxGeometry;
      _this.props.addSelectedFeaturesToTemp(resultArray); //add to temp till choosing user yes or no
    }

    _this.props.closeLoader();
  } else if (!result.data.length && result.isThereSelection) {
    _this.notificationDuplicatedData();
    _this.props.closeLoader();
  } else if (result.dublicated) {
    _this.notificationDuplicatedData();
    _this.props.closeLoader();
  } else {
    _this.notificationNoData();
    _this.props.closeLoader();
    //remove multiselect handler after draw end
    // esriArray.forEach(eventListenersArr, function (handle) {
    //   handle.remove();
    // });
  }
}

export function callBackMultiSelectFromMapForPricing(
  result,
  layername,
  _this,
  eventListenersArr,
  esriArray
) {
  if (result.data.length) {
    let resultArray = result.data.map((item) => {
      let feat = { ...item };
      feat.id = feat.attributes.SITE_GEOSPATIAL_ID;
      feat.SITE_GEOSPATIAL_ID = feat.attributes.SITE_GEOSPATIAL_ID;
      return feat;
    });

    //if select one feature but is already added before --> show message
    if (
      valueToBoolean(resultArray.length === 1) &&
      valueToBoolean(_this.props.tableSettings) &&
      valueToBoolean(_this.props.tableSettings.result.length) &&
      _this.props.tableSettings.result.findIndex(
        (item) =>
          item.attributes.SITE_GEOSPATIAL_ID ===
          resultArray[0].attributes.SITE_GEOSPATIAL_ID
      ) !== -1
    ) {
      _this.notificationDuplicatedData();
      resultArray = [];
    }

    //if user selects many features --> remove all duplicated features that added before
    if (
      valueToBoolean(resultArray.length > 1) &&
      valueToBoolean(_this.props.tableSettings) &&
      valueToBoolean(_this.props.tableSettings.result.length) &&
      valueToBoolean(
        differenceBy(
          resultArray.map((feat) => feat.attributes),
          _this.props.tableSettings.result.map((feat) => feat.attributes),
          "SITE_GEOSPATIAL_ID"
        ).length
      )
    )
      resultArray = differenceBy(
        resultArray,
        _this.props.tableSettings.result,
        "id"
      );
    // if all selected assests are already existing before

    if (
      valueToBoolean(resultArray.length > 1) &&
      valueToBoolean(_this.props.tableSettings) &&
      valueToBoolean(_this.props.tableSettings.result.length) &&
      differenceBy(
        resultArray.map((feat) => feat.attributes),
        _this.props.tableSettings.result.map((feat) => feat.attributes),
        "SITE_GEOSPATIAL_ID"
      ).length == 0
    ) {
      _this.notificationDuplicatedData();
      resultArray = [];
    }
    if (resultArray.length) {
      console.log({ resultArray });
      resultArray[0].boxGeometry = result.boxGeometry;
      _this.props.addSelectedFeaturesToTemp(resultArray); //add to temp till choosing user yes or no
    }

    _this.props.closeLoader();
  } else if (!result.data.length && result.isThereSelection) {
    _this.notificationDuplicatedData();
    _this.props.closeLoader();
  } else if (result.dublicated) {
    _this.notificationDuplicatedData();
    _this.props.closeLoader();
  } else {
    _this.notificationNoData();
    _this.props.closeLoader();
  }
}

export const valueToBoolean = (value) => {
  if (value) return true;
  else return false;
};

export const handleShowingDetails = async (
  gids,
  openLoader,
  closeLoader,
  showTable,
  isUpdateSearchTbl,
  callBack
) => {
  let currentUser = store.getState().mapUpdate.currentUser;
  let layernames = ["invest_site_polygon", "ADVERTISING_BOARDS"];
  const promises = layernames.map((layername) => {
    const layerIndex = getLayerIndex(layername);

    return new Promise((resolve, reject) => {
      let whereCondition = `SITE_GEOSPATIAL_ID IN (${gids.join(",")})`;
      openLoader(); //for loader in case of search process
      queryTask({
        returnGeometry: true,
        url: `${window.__mapUrl__}/${layerIndex}`,
        outFields: ["*"],
        where: whereCondition,
        callbackResult: ({ features }) => {
          // fix features
          if (features.length) {
            features =
              currentUser !== "Employee"
                ? features.map((feat) => {
                    delete feat.attributes["SITE_AREA"];
                    return feat;
                  })
                : features;
          }
          resolve({ layername, data: features });
        },
        callbackError: (err) => {
          reject(err);
        },
      });
    });
  });

  let result = await Promise.all(promises);
  //check for existing tech reports
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
                  flag: features[0].attributes.TECHNIQUAL_REPORT ? true : false,
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
  let resultOfFlagTech = await Promise.all(flagTechReportPromises);
  if (isUpdateSearchTbl === "add") {
    let data = getTableDataToShow(
      result,
      resultOfFlagTech,
      currentUser,
      openLoader,
      closeLoader
    );
    store.dispatch({ type: "RESULT_TABLE_DATA_SET", data });
  } else store.dispatch({ type: "UPDATE_RESULT_TABLE_DATA_SET", data: result });
  closeLoader(); //for loader in case of search process
  showTable(true);
  callBack && callBack();
};

function getTableDataToShow(
  result,
  flagForTechReport,
  currentUser,
  openLoader,
  closeLoader
) {
  let user = store.getState()?.mapUpdate?.auth?.user;
  return {
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
            layername.toLowerCase() == "invest_site_polygon"
          )
            return true;
          else return false;
        },
        action: async (feature, layername) => {
          openLoader(); //for loader
          if (
            feature.attributes["حالة الموقع"] == "شاغرة" ||
            feature.attributes["SITE_STATUS"] == 2
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
                store.dispatch({
                  type: "TABLE_ICON_MODAL_DATA_SET",
                  data: {
                    feature: filteredRes,
                    layername,
                    name: "showAllsuggestions",
                  },
                });
              } else {
                store.dispatch({
                  type: "TABLE_ICON_MODAL_DATA_SET",
                  data: {
                    feature: [],
                    layername,
                    name: "showAllsuggestions",
                  },
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
              let res = await axios.get(window.API_URL + "api/remark/getall", {
                headers: {
                  Authorization: `Bearer ${user.token}`,
                },
              });
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
                store.dispatch({
                  type: "TABLE_ICON_MODAL_DATA_SET",
                  data: {
                    feature: filteredRes,
                    layername,
                    name: "showAllremarks",
                  },
                });
              } else {
                store.dispatch({
                  type: "TABLE_ICON_MODAL_DATA_SET",
                  data: {
                    feature: [],
                    layername,
                    name: "showAllremarks",
                  },
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
            else return "تقديم ملاحظات";
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
            layername.toLowerCase() == "invest_site_polygon"
          )
            return true;
          else return false;
        },
        action: (feature, layername) => {
          if (
            feature.attributes["حالة الموقع"] == "شاغرة" ||
            feature.attributes["SITE_STATUS"] == 2
          )
            // push the feature to the store
            // so the borders modal can be opened
            store.dispatch({
              type: "TABLE_ICON_MODAL_DATA_SET",
              data: {
                feature,
                layername,
                name: "suggestion",
              },
            });
          else
            store.dispatch({
              type: "TABLE_ICON_MODAL_DATA_SET",
              data: {
                feature,
                layername,
                name: "remark",
              },
            });
        },
      },
      ///
      // zoom
      {
        name: "zoom",
        alias: "تكبير",
        icon: <i className="fas fa-search-plus pl-1"></i>,
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
          <img src={GoogleIcon} alt="go to google" style={{ width: "16px" }}
          className='svg'
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
        icon: <i className="far fa-map pl-1"></i>,
        canRender: (feature, layername) =>
          layername.toLocaleLowerCase() ==
            "Invest_Site_Polygon".toLocaleLowerCase() &&
          feature.attributes["SITE_COMMON_USE"] !== 15131,
        action: (feature, layername) => {
          // push the feature to the store
          // so the borders modal can be opened
          store.dispatch({
            type: "TABLE_ICON_MODAL_DATA_SET",
            data: {
              feature,
              layername,
              name: "Border_Field_Info",
            },
          });
        },
      },
      //Borders from Plan --> employee just can see it
      {
        name: "bordersFromPlan",
        alias: "حدود الموقع من المخطط",
        icon: <BorderAllIcon />,
        canRender: (feature, layername) =>
          layername.toLocaleLowerCase() ==
            "Invest_Site_Polygon".toLocaleLowerCase() &&
          feature.attributes["SITE_COMMON_USE"] !== 15131 &&
          currentUser === "Employee",
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
                store.dispatch({
                  type: "TABLE_ICON_MODAL_DATA_SET",
                  data: {
                    features: rf,
                    layername,
                    name: "Border_Plan_Info",
                    borderDescirbtion: feature.attributes,
                  },
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
        icon: <i className="fas fa-ad 5x"></i>,
        canRender: (feature, layername) =>
          getLayerIndex(layername) == getLayerIndex("ADVERTISING_BOARDS"),
        // &&feature.attributes["SITE_COMMON_USE"] == 15131
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
                store.dispatch({
                  type: "TABLE_ICON_MODAL_DATA_SET",
                  data: {
                    feature: rf,
                    name: "ADGroup_Info",
                  },
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
      //     layername.toLocaleLowerCase() ==
      //       "Invest_Site_Polygon".toLocaleLowerCase() &&
      //     feature.attributes["SITE_STATUS"] == 4,
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
      //         //  store.dispatch({type:"TABLE_ICON_MODAL_DATA_SET",data:{ feature:rf, name:"Contract_Info" });
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
            className='svg'
            alt="atm icon"
            style={{
              width: "25px",
              height: "25px",
            }}
          />
        ),
        // <AtmIcon />
        canRender: (feature, layername) =>
          layername.toLocaleLowerCase() ==
            "Invest_Site_Polygon".toLocaleLowerCase() &&
          feature.attributes["SITE_SUBTYPE"] == 6,
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
                store.dispatch({
                  type: "TABLE_ICON_MODAL_DATA_SET",
                  data: {
                    feature: rf[0],
                    name: "ATM_Info",
                  },
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
        icon: <i className="fas fa-city"></i>,
        canRender: (feature, layername) =>
          layername.toLocaleLowerCase() ==
            "Invest_Site_Polygon".toLocaleLowerCase() &&
          feature.attributes["SITE_SUBTYPE"] == 1,
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
                store.dispatch({
                  type: "TABLE_ICON_MODAL_DATA_SET",
                  data: {
                    feature: rf[0],
                    name: "Building_Data_Info",
                  },
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
            layername.toLocaleLowerCase() ==
              "Invest_Site_Polygon".toLocaleLowerCase() &&
            flagForTechReport.length
          ) {
            let flagForTechReportFlag = flagForTechReport.find(
              (item) => item.id === feature.attributes.SITE_GEOSPATIAL_ID
            );
            if (flagForTechReportFlag) return flagForTechReportFlag.flag;
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
                featureWithAllAttributes = [{ attributes: featAttributes }];
              store.dispatch({
                type: "TABLE_ICON_MODAL_DATA_SET",
                data: {
                  feature: featureWithAllAttributes,
                  name: "Building_Details_Info",
                },
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
            layername.toLocaleLowerCase() ==
              "Invest_Site_Polygon".toLocaleLowerCase() &&
            flagForTechReport.length
          ) {
            let flagForTechReportFlag = flagForTechReport.find(
              (item) => item.id === feature.attributes.SITE_GEOSPATIAL_ID
            );
            if (flagForTechReportFlag) return flagForTechReportFlag.flag;
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
              store.dispatch({
                type: "TABLE_ICON_MODAL_DATA_SET",
                data: {
                  feature: features[0],
                  name: "Building_Images",
                },
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
        icon: <i className="fas fa-broadcast-tower"></i>,
        canRender: (feature, layername) =>
          layername.toLocaleLowerCase() ==
            "Invest_Site_Polygon".toLocaleLowerCase() &&
          feature.attributes["SITE_SUBTYPE"] == 3,
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
                store.dispatch({
                  type: "TABLE_ICON_MODAL_DATA_SET",
                  data: {
                    feature: rf[0],
                    name: "Tower_Info",
                  },
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
        icon: <i className="fas fa-gopuram"></i>,
        canRender: (feature, layername) =>
          layername.toLocaleLowerCase() ==
            "Invest_Site_Polygon".toLocaleLowerCase() &&
          feature.attributes["SITE_SUBTYPE"] == 5,
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
                store.dispatch({
                  type: "TABLE_ICON_MODAL_DATA_SET",
                  data: {
                    feature: rf[0],
                    name: "Elec_Stations_Info",
                  },
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
        icon: <i className="fas fa-map-marked-alt"></i>,
        canRender: (feature, layername) =>
          getLayerIndex(layername) == getLayerIndex("Invest_Site_Polygon") &&
          feature.attributes["SITE_SUBTYPE"] !== 2 &&
          currentUser === "Employee",
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
              store.dispatch({
                type: "TABLE_ICON_MODAL_DATA_SET",
                data: {
                  features: features,
                  name: "Coordinate_Info",
                },
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
  };
}
function isResultEmpty(result) {
  return result.every((resultSet) => resultSet.data.length === 0);
}

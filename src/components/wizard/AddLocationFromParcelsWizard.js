import React, { Component } from "react";
import { Container } from "react-bootstrap";
import { Steps, Button, Input, notification } from "antd";

import { connect } from "react-redux";
import FinalStepAddLocFromParcelsTable from "./AddLocFromParcelsForm/FinalStepAddLocFromParcelsTable";
import FirstStepAddLocFromParcelsTable from "./AddLocFromParcelsForm/FirstStepAddLocFromParcelsTable";
import { request } from "@esri/arcgis-rest-request";
import { UserSession } from "@esri/arcgis-rest-auth";
import {
  convertNumbersToEnglish,
  getLayerIndex,
  getLayerIndexFromFeatService,
  LoadModules,
  queryTask,
} from "../common/mapviewer";
import { flatMap } from "lodash";
import { withRouter } from "react-router";
import { checkTokenExpiration } from "../../redux/reducers/map";
import { notificationMessage } from "../../helpers/utlis/notifications_Func";

class AddLocationFromParcelsWizard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      wizardDisplay: "UpdateTableHidden",
      current: 0,
      notes: "",
    };
  }
  componentWillUnmount() {
    this.props.clearUpdateTable();
    // let graphicLayerOfMultiSelect = window.__map__.getLayer(
    //   "graphicLayer_Multi_Select"
    // );
    // graphicLayerOfMultiSelect.clear();
    // let mapExtent = window.__map__.extent;
    // window.__map__.setExtent(mapExtent.expand(1.5));
    let zoomGraphicLayer = window.__map__.getLayer("zoomGraphicLayer");
    zoomGraphicLayer.clear();
    window.__map__._fixedPan(0, window.__map__.height * -0.01);

    this.setState(null);
  }
  next() {
    const current = this.state.current + 1;
    this.setState({ current });
  }
  prev() {
    const current = this.state.current - 1;
    this.setState({ current });
  }

  openWizard = (e) => {
    this.setState({ wizardDisplay: "UpdateTableShown" });
  };
  closeWizard = (e) => {
    this.setState({ wizardDisplay: "UpdateTableHidden" });
  };
  onChangeNotes = (e) => {
    this.setState({ notes: e.target.value });
  };

  finishProcess = async (e) => {
    this.props.openLoader();
    checkTokenExpiration(this.props.user, true).then((res) => {
      if (!res) {
        setTimeout(() => {
          notificationMessage("يجب إعادة تسجيل الدخول");
          this.props.closeLoader();
          this.props.history.replace("/Login");
          this.props.removeUserFromApp();
        }, 1000);
      } else {
        this.props.showTable(false);
        const argsDone = {
          description: "تم إنهاء العملية",
          duration: 3,
        };
        const argsCancel = {
          description: "عفواً لقد تم إلغاء العملية نتيجة خطأ أثناء الحفظ",
          duration: 3,
        };
        this.setState({ wizardDisplay: "UpdateTableHidden" });
        LoadModules([
          "esri/geometry/Polyline",
          "esri/geometry/Polygon",
          "esri/geometry/Point",
          "esri/geometry/projection",
          "esri/SpatialReference",
          "esri/geometry/mathUtils",
          "esri/request",
        ]).then(
          ([
            Polyline,
            Polygon,
            Point,
            projection,
            SpatialReference,
            mathUtils,
            esriRequest,
          ]) => {
            const projectionPromise = projection.load();
            projectionPromise.then(() => {
              let urlOfFeatureService = window.__applyEditsUrl__;
              let token = this.props.user.esriToken;
              let promises = [],
                helperPromises = [];
              let investSiteIndex = getLayerIndexFromFeatService(
                  "INVEST_SITE_POLYGON"
                ),
                advertisingBoardsIndex =
                  getLayerIndexFromFeatService("ADVERTISING_BOARDS"),
                cornersIndex =
                  getLayerIndexFromFeatService("INVEST_SITE_CORNER"),
                boundIndex = getLayerIndexFromFeatService(
                  "INVEST_SITE_BOUNDARY"
                ),
                adBoardsGroupIndex =
                  getLayerIndexFromFeatService("TBL_BOARDS_GROUP");
              let requestObj = {};
              //logic of update data
              let featuresToInsert = this.props.tableSettings.result;
              if (featuresToInsert.length) {
                featuresToInsert.forEach(async (feature) => {
                  let f = { ...feature };
                  f.investSiteDataAttributes.PARCEL_PLAN_NO &&
                    (f.investSiteDataAttributes.PARCEL_PLAN_NO =
                      convertNumbersToEnglish(
                        f.investSiteDataAttributes.PARCEL_PLAN_NO
                      ));

                  f.investSiteDataAttributes.PLAN_NO &&
                    (f.investSiteDataAttributes.PLAN_NO =
                      convertNumbersToEnglish(
                        f.investSiteDataAttributes.PLAN_NO
                      ));

                  f.investSiteDataAttributes.CONTRACT_NUMBER &&
                    (f.investSiteDataAttributes.CONTRACT_NUMBER =
                      convertNumbersToEnglish(
                        f.investSiteDataAttributes.CONTRACT_NUMBER
                      ));

                  f.investSiteDataAttributes.AUCTION_NO &&
                    (f.investSiteDataAttributes.AUCTION_NO =
                      convertNumbersToEnglish(
                        f.investSiteDataAttributes.AUCTION_NO
                      ));
                  //logic of insert maindata to invest_site_polygon
                  if (
                    f.layername.toLowerCase() === "invest_site_polygon" &&
                    f.investSiteDataAttributes
                  ) {
                    //add invest site data in layer
                    !requestObj[investSiteIndex]
                      ? (requestObj[investSiteIndex] = {
                          id: investSiteIndex,
                          adds: [
                            {
                              geometry: f.geometry,
                              attributes: f.investSiteDataAttributes,
                            },
                          ],
                        })
                      : requestObj[investSiteIndex].adds.push({
                          geometry: f.geometry,
                          attributes: f.investSiteDataAttributes,
                        });
                    let dataOfCornersAndLength = this.getCornersAndLength(
                      f,
                      Polyline,
                      Polygon,
                      Point,
                      projection,
                      SpatialReference,
                      mathUtils
                    );
                    console.log(f);
                    //add corners data
                    let corners = dataOfCornersAndLength.corners.map((c) => {
                      if (c.geometry.cashe) delete c.geometry.cashe;
                      return c;
                    });
                    !requestObj[cornersIndex]
                      ? (requestObj[cornersIndex] = {
                          id: cornersIndex,
                          adds: corners,
                        })
                      : requestObj[cornersIndex].adds.push(...corners);
                    //add Boundaries data
                    let boundaries = dataOfCornersAndLength.boundaries.map(
                      (b) => {
                        if (b.geometry.cashe) delete b.geometry.cashe;
                        switch (b.attributes.BOUNDARY_DIRECTION) {
                          case 1:
                            if (
                              f.bordersDescFromPlan &&
                              f.bordersDescFromPlan.NORTH_BOUNDARY_DESCRIPTION
                            )
                              b.attributes.BOUNDARY_DESCRIPTION =
                                f.bordersDescFromPlan.NORTH_BOUNDARY_DESCRIPTION;
                            // else b.attributes.BOUNDARY_DESCRIPTION = ""
                            break;
                          case 2:
                            if (
                              f.bordersDescFromPlan &&
                              f.bordersDescFromPlan.EAST_BOUNDARY_DESCRIPTION
                            )
                              b.attributes.BOUNDARY_DESCRIPTION =
                                f.bordersDescFromPlan.EAST_BOUNDARY_DESCRIPTION;
                            // else b.attributes.BOUNDARY_DESCRIPTION=""
                            break;
                          case 3:
                            if (
                              f.bordersDescFromPlan &&
                              f.bordersDescFromPlan.SOUTH_BOUNDARY_DESCRIPTION
                            )
                              b.attributes.BOUNDARY_DESCRIPTION =
                                f.bordersDescFromPlan.SOUTH_BOUNDARY_DESCRIPTION;
                            // else b.attributes.BOUNDARY_DESCRIPTION=""
                            break;
                          case 4:
                            if (
                              f.bordersDescFromPlan &&
                              f.bordersDescFromPlan.WEST_BOUNDARY_DESCRIPTION
                            )
                              b.attributes.BOUNDARY_DESCRIPTION =
                                f.bordersDescFromPlan.WEST_BOUNDARY_DESCRIPTION;
                            // else b.attributes.BOUNDARY_DESCRIPTION=""
                            break;
                          default:
                            // b.attributes.BOUNDARY_DESCRIPTION = "";
                            break;
                        }
                        return b;
                      }
                    );

                    !requestObj[boundIndex]
                      ? (requestObj[boundIndex] = {
                          id: boundIndex,
                          adds: boundaries,
                        })
                      : requestObj[boundIndex].adds.push(...boundaries);
                  }
                  //logic of insert tblData related to invest_site_polygon
                  if (
                    f.layername.toLowerCase() === "invest_site_polygon" &&
                    f.tblData
                  ) {
                    let tblIndex;
                    switch (f.investSiteDataAttributes.SITE_SUBTYPE) {
                      case 1:
                        tblIndex =
                          getLayerIndexFromFeatService("TBL_BUILDING_DATA");
                        break;
                      case 3:
                        tblIndex = getLayerIndexFromFeatService("TBL_TOWERS");
                        break;
                      case 5:
                        tblIndex =
                          getLayerIndexFromFeatService("TBL_ELEC_STATION");
                        break;
                      case 6:
                        tblIndex = getLayerIndexFromFeatService("TBL_ATM");
                        break;
                      default:
                        break;
                    }
                    if (tblIndex) {
                      let tblDataToStore = {
                        ...f.tblData,
                        SITE_GEOSPATIAL_ID:
                          f.investSiteDataAttributes.SITE_GEOSPATIAL_ID,
                      };
                      //add tbl data
                      !requestObj[tblIndex]
                        ? (requestObj[tblIndex] = {
                            id: tblIndex,
                            deletes: [],
                            updates: [],
                            adds: [{ attributes: tblDataToStore }],
                          })
                        : requestObj[tblIndex].adds.push({
                            attributes: tblDataToStore,
                          });
                    }
                  }

                  //logic of insert maindata to ADVERTISING_BOARDS
                  if (f.layername.toUpperCase() === "ADVERTISING_BOARDS") {
                    //add ad boards data to layer
                    !requestObj[advertisingBoardsIndex]
                      ? (requestObj[advertisingBoardsIndex] = {
                          id: advertisingBoardsIndex,
                          deletes: [],
                          updates: [],
                          adds: [
                            {
                              geometry: f.geometry,
                              attributes: f.investSiteDataAttributes,
                            },
                          ],
                        })
                      : requestObj[advertisingBoardsIndex].adds.push({
                          geometry: f.geometry,
                          attributes: f.investSiteDataAttributes,
                        });
                  }
                });
              }
              //logic of update or insert tblData to ad boards group
              /************************************ */
              let adBoardsGroups = this.props.tableSettings.result.filter(
                (f) => f.layername.toUpperCase() === "ADVERTISING_BOARDS"
              );
              if (adBoardsGroups.length) {
                adBoardsGroups = adBoardsGroups
                  .filter((f) => f.tblData)
                  .map((f) => f.tblData)
                  .reduce((all, item) => {
                    if (!all.length) all.push(item);
                    else {
                      if (
                        all.findIndex(
                          (i) => i.GROUP_CODE === item.GROUP_CODE
                        ) == -1
                      ) {
                        all.push(item);
                      }
                    }
                    return all;
                  }, []);

                adBoardsGroups.forEach((tblData) => {
                  let tblIndex = getLayerIndex("TBL_BOARDS_GROUP");
                  if (tblData.GROUP_CODE)
                    helperPromises.push(
                      new Promise((resolve, reject) => {
                        queryTask({
                          returnGeometry: false,
                          url: `${window.__mapUrl__}/${tblIndex}`,
                          outFields: ["*"],
                          where: `GROUP_CODE=${tblData.GROUP_CODE}`,
                          callbackResult: ({ features }) => {
                            if (features.length) {
                              !requestObj[adBoardsGroupIndex]
                                ? (requestObj[adBoardsGroupIndex] = {
                                    id: adBoardsGroupIndex,
                                    deletes: [],
                                    updates: [
                                      {
                                        attributes: {
                                          ...tblData,
                                          OBJECTID:
                                            features[0].attributes.OBJECTID,
                                        },
                                      },
                                    ],
                                    adds: [],
                                  })
                                : requestObj[adBoardsGroupIndex].updates.push({
                                    attributes: {
                                      ...tblData,
                                      OBJECTID: features[0].attributes.OBJECTID,
                                    },
                                  });
                            } else {
                              !requestObj[adBoardsGroupIndex]
                                ? (requestObj[adBoardsGroupIndex] = {
                                    id: adBoardsGroupIndex,
                                    deletes: [],
                                    updates: [],
                                    adds: [
                                      {
                                        attributes: tblData,
                                      },
                                    ],
                                  })
                                : requestObj[adBoardsGroupIndex].adds.push({
                                    attributes: tblData,
                                  });
                            }
                            resolve(true);
                          },
                          callbackError: (err) => {
                            if (err) {
                              resolve(false);
                              console.error(err);
                            }
                          },
                        });
                      })
                    );
                });
              }
              /******************************** */
              console.log(requestObj);
              console.log(Object.values(requestObj));
              promises.push(
                new Promise((resolve, reject) => {
                  var formData = new FormData();
                  formData.append(
                    "edits",
                    JSON.stringify(Object.values(requestObj))
                  );
                  formData.append("rollbackOnFailure", true);
                  formData.append("returnEditMoment", true);

                  esriRequest(
                    {
                      url: urlOfFeatureService + "applyEdits",
                      content: {
                        f: "json",
                        token: token,
                        method: "post",
                        handleAs: "json",
                      },
                      handleAs: "json",
                      timeout: 600000,
                      form: formData,
                      callbackParamName: "callback",
                    },
                    {
                      handleAs: "json",
                      usePost: true,
                      returnProgress: true,
                    }
                  )
                    // request(urlOfFeatureService + "applyEdits?token=" + token, {
                    //   httpMethod: "POST",
                    //   authentication: new UserSession({
                    //     token: token,
                    //     // username: "gis",
                    //     // password: "GIS@2017gis",
                    //   }),
                    //   params: {
                    //     f: "json",
                    //     rollbackOnFailure: true,
                    //     usePreviousEditMoment:true,
                    //     returnEditMoment:true,
                    //     edits: Object.values(requestObj),
                    // timeout:600000,

                    //   },
                    // })
                    .then((res) => {
                      resolve(res);
                    })
                    .catch((err) => {
                      reject(err);
                      // console.log(err);
                      // this.props.closeLoader();
                      // notification.open(argsCancel);
                      // let mapService = window.__map__.getLayer("baseMap");
                      // mapService.refresh();
                      // let cadLayerOnMap =
                      //   window.__map__.getLayer("Features_From_CAD");
                      // cadLayerOnMap.clear();
                      // this.props.clearUpdateTable();
                    });
                })
              );

              Promise.all(promises)
                .then((result) => {
                  console.log(result);
                  this.props.closeLoader();
                  notification.open(argsDone);
                  this.props.clearUpdateTable();
                  return true;
                })
                .then((bool) => {
                  setTimeout(() => {
                    console.log(bool);
                    let mapService = window.__map__.getLayer("baseMap");
                    mapService.refresh();
                    // let mapExtent = window.__map__.extent;
                    // window.__map__.setExtent(mapExtent.expand(1.5));
                    window.__map__._fixedPan(0, window.__map__.height * 0.01);
                  }, 1500);
                  let cadLayerOnMap =
                    window.__map__.getLayer("Features_From_CAD");
                  cadLayerOnMap.clear();
                  let graphicLayerOfMultiSelect = window.__map__.getLayer(
                    "graphicLayer_Multi_Select"
                  );
                  graphicLayerOfMultiSelect.clear();
                })
                .catch((err) => {
                  console.log(err);
                  this.props.closeLoader();
                  notification.open(argsCancel);
                  let mapService = window.__map__.getLayer("baseMap");
                  mapService.refresh();
                  let cadLayerOnMap =
                    window.__map__.getLayer("Features_From_CAD");
                  cadLayerOnMap.clear();
                  let graphicLayerOfMultiSelect = window.__map__.getLayer(
                    "graphicLayer_Multi_Select"
                  );
                  graphicLayerOfMultiSelect.clear();
                  this.props.clearUpdateTable();
                });
            });
          }
        );
      }
    });
  };
  getCornersAndLength(
    resultGraphic,
    Polyline,
    Polygon,
    Point,
    projection,
    SpatialReference,
    mathUtils
  ) {
    let max = 0,
      min,
      maxPoint,
      minPoint;
    let wgsGeographic = new SpatialReference({ wkid: 4326 });
    let UTMXY = new SpatialReference({ wkid: 3857 });
    let UTN39 = new SpatialReference(32639);
    let polygonInWithOriginCoords = new Polygon(
      resultGraphic.geometry,
      resultGraphic.geometry.spatialReference
    );
    let polygonInXYCoords = projection.project(
      polygonInWithOriginCoords,
      UTN39
    );
    let cornersArray = [],
      boundriesArray = [];
    for (let i = 0; i < resultGraphic.geometry.rings.length; i++) {
      for (let j = 0; j < resultGraphic.geometry.rings[i].length - 1; j++) {
        let ringPoint = resultGraphic.geometry.rings[i][j];
        let boundry = {
          attributes: {},
        };
        var UTM39fromPoint, UTM39toPoint, originFromPoint, originToPoint;
        originFromPoint = new Point(
          ringPoint[0],
          ringPoint[1],
          resultGraphic.geometry.spatialReference
        );
        UTM39fromPoint = projection.project(originFromPoint, UTN39);
        var GCSfromPoint = projection.project(UTM39fromPoint, wgsGeographic);

        boundry.attributes.FROM_CORNER = j + 1;
        cornersArray.push({
          geometry: UTM39fromPoint,
          attributes: {
            XUTM_COORD: UTM39fromPoint.x,
            YUTM_COORD: UTM39fromPoint.y,
            XGCS_COORD: GCSfromPoint.x.toString(),
            YGCS_COORD: GCSfromPoint.y.toString(),
            CORNER_NO: j + 1,
            SITE_GEOSPATIAL_ID:
              resultGraphic.investSiteDataAttributes.SITE_GEOSPATIAL_ID,
          },
        });
        originToPoint = new Point(
          resultGraphic.geometry.rings[i][j + 1],
          resultGraphic.geometry.spatialReference
        );
        UTM39toPoint = projection.project(originToPoint, UTN39);

        boundry.attributes.TO_CORNER =
          j + 2 == resultGraphic.geometry.rings[i].length ? 1 : j + 2;

        boundry.attributes.BOUNDARY_NO = j + 1;
        boundry.attributes.SITE_GEOSPATIAL_ID =
          resultGraphic.investSiteDataAttributes.SITE_GEOSPATIAL_ID;
        boundry.attributes.BOUNDARY_DIRECTION = null;

        if (UTM39fromPoint.x > max) {
          max = UTM39fromPoint.x;
          maxPoint = UTM39fromPoint;
        }

        if (!min || UTM39fromPoint.x < min) {
          min = UTM39fromPoint.x;
          minPoint = UTM39fromPoint;
        }

        if (UTM39toPoint.x > max) {
          max = UTM39toPoint.x;
          maxPoint = UTM39toPoint;
        }

        if (!min || UTM39toPoint.x < min) {
          min = UTM39toPoint.x;
          minPoint = UTM39toPoint;
        }

        var paths = [
          [UTM39fromPoint.x, UTM39fromPoint.y],
          [UTM39toPoint.x, UTM39toPoint.y],
        ];

        var polyLine = new Polyline({
          paths: [paths],
          spatialReference: UTN39,
        });

        boundry.geometry = polyLine;
        boundriesArray.push(boundry);

        boundriesArray[j].attributes.BOUNDARY_LENGTH = mathUtils.getLength(
          UTM39fromPoint,
          UTM39toPoint
        );
        console.log(cornersArray, boundriesArray);
      }
    }
    //handle boundries' directions
    let boundriesWithDirect = [];
    let polygonCenterPoint = polygonInXYCoords.getExtent().getCenter();
    boundriesArray.forEach((boundry, key) => {
      var centerPointofLine = boundry.geometry.getExtent().getCenter();

      var diffrenceInXWithMaxPoint = Math.abs(centerPointofLine.x - maxPoint.x);
      var diffrenceWithPolygonCenterPoint = Math.abs(
        centerPointofLine.x - polygonCenterPoint.x
      );

      if (diffrenceInXWithMaxPoint < diffrenceWithPolygonCenterPoint) {
        // boundry.attributes.BOUNDARY_DIRECTION = 2       //east
        this.checkDirectionAndGetFinalBoundaryObj(
          2,
          boundriesArray,
          boundriesWithDirect,
          boundry,
          cornersArray,
          Polyline
        );
      } else {
        var diffrenceInXWithMinPoint = Math.abs(
          centerPointofLine.x - minPoint.x
        );
        if (diffrenceInXWithMinPoint < diffrenceWithPolygonCenterPoint) {
          // boundry.attributes.BOUNDARY_DIRECTION = 4       //west
          this.checkDirectionAndGetFinalBoundaryObj(
            4,
            boundriesArray,
            boundriesWithDirect,
            boundry,
            cornersArray,
            Polyline
          );
        } else if (centerPointofLine.y > polygonCenterPoint.y) {
          // boundry.attributes.BOUNDARY_DIRECTION = 3       //north
          this.checkDirectionAndGetFinalBoundaryObj(
            3,
            boundriesArray,
            boundriesWithDirect,
            boundry,
            cornersArray,
            Polyline
          );
        } else {
          // boundry.attributes.BOUNDARY_DIRECTION = 1       //south
          this.checkDirectionAndGetFinalBoundaryObj(
            1,
            boundriesArray,
            boundriesWithDirect,
            boundry,
            cornersArray,
            Polyline
          );
        }
      }
    });
    let boundsFinal = [];
    boundriesWithDirect.reduce((acc, currentValue) => {
      if (acc) {
        currentValue.attributes.BOUNDARY_NO = acc.BOUNDARY_NO + 1;
        currentValue.attributes.FROM_CORNER = acc.TO_CORNER;
        currentValue.attributes.TO_CORNER = acc.TO_CORNER + 1;
      }
      boundsFinal.push(currentValue);
      return {
        BOUNDARY_NO: currentValue.attributes.BOUNDARY_NO,
        FROM_CORNER: currentValue.attributes.FROM_CORNER,
        TO_CORNER: currentValue.attributes.TO_CORNER,
      };
    }, null);
    return {
      corners: cornersArray,
      boundaries: boundsFinal,
    };
  }
  checkDirectionAndGetFinalBoundaryObj(
    direction,
    oldBoundriesArray,
    newBoundriesArray,
    currentBoundary,
    cornersArray,
    Polyline
  ) {
    // let direction = currentBoundary.attributes.BOUNDARY_DIRECTION;
    let prevBoundary = newBoundriesArray.find(
      (b) => b.attributes.BOUNDARY_DIRECTION == direction
    );
    if (prevBoundary) {
      let finalBoundary = {
        attributes: {},
      };
      let cornerPoint3 = cornersArray[currentBoundary.attributes.TO_CORNER - 1];
      finalBoundary.attributes.FROM_CORNER =
        prevBoundary.attributes.FROM_CORNER;
      finalBoundary.attributes.TO_CORNER = prevBoundary.attributes.TO_CORNER;
      finalBoundary.attributes.BOUNDARY_NO =
        prevBoundary.attributes.BOUNDARY_NO;
      finalBoundary.attributes.SITE_GEOSPATIAL_ID =
        prevBoundary.attributes.SITE_GEOSPATIAL_ID;
      finalBoundary.attributes.BOUNDARY_DIRECTION = direction;
      finalBoundary.attributes.BOUNDARY_LENGTH =
        parseFloat(prevBoundary.attributes.BOUNDARY_LENGTH) +
        parseFloat(currentBoundary.attributes.BOUNDARY_LENGTH);
      let paths = [...prevBoundary.geometry.paths[0]];
      console.log(paths);
      paths.push([cornerPoint3.geometry.x, cornerPoint3.geometry.y]);

      let polyLine = new Polyline({
        paths: [paths],
        spatialReference: prevBoundary.geometry.spatialReference,
      });
      finalBoundary.geometry = polyLine;
      newBoundriesArray.splice(
        newBoundriesArray.findIndex(
          (b) => b.attributes.BOUNDARY_DIRECTION == direction
        ),
        1,
        finalBoundary
      );
    } else {
      currentBoundary.attributes.BOUNDARY_DIRECTION = direction;
      newBoundriesArray.push(currentBoundary);
    }
  }
  render() {
    const { Step } = Steps;
    const { current, notes } = this.state;
    const steps = [
      {
        title: "إضافة موقع  من طبقة الأراضي",
        content: (
          <FirstStepAddLocFromParcelsTable
            openLoader={this.props.openLoader}
            closeLoader={this.props.closeLoader}
            showTable={this.props.showTable}
          />
        ),
      },
      {
        title: "ملاحظات",
        content: (
          <div className="notesText">
            {/* <LocationDataTabs /> */}
            <p className="notesPlease "> : من فضلك أدخل الملاحظات</p>
            <Input.TextArea
              name="notes"
              onChange={this.onChangeNotes}
              value={notes}
            />
          </div>
        ),
      },
      {
        title: "إنهاء",
        content: <FinalStepAddLocFromParcelsTable />,
      },
    ];

    const { tableSettings } = this.props;
    let isAllRowsCompletedData = false;
    if (tableSettings && tableSettings.result) {
      let tableData = tableSettings.result;
      let allRowsInTableCompleted = tableData.filter((f) => {
        let completedFlag =
          f.isCompletedFilled.mainData.bool &&
          f.isCompletedFilled.tblData.bool &&
          f.isCompletedFilled.bordersData.bool;
        if (completedFlag) return true;
      });
      isAllRowsCompletedData =
        allRowsInTableCompleted.length === tableData.length ? true : false;
    }
    return (
      <div className={this.state.wizardDisplay}>
        <div className="tableHeaderIconsDiv">
          {this.state.wizardDisplay == "UpdateTableHidden" ? (
            // <i
            //
            //   className="fas fa-arrow-up tableArrow"

            // ></i>
            <i
              onClick={this.openWizard}
              className="fas fa-chevron-up tableArrow"
            ></i>
          ) : (
            <i
              onClick={this.closeWizard}
              className="fas fa-chevron-down tableArrow"
            ></i>
          )}
        </div>
        <Container fluid className="pt-5">
          <Steps current={current} className="stepsClass">
            {steps.map((item) => (
              <Step key={item.title} title={item.title} />
            ))}
          </Steps>
          <Container fluid className="steps-content ">
            {steps[current].content}
          </Container>
          <div className="steps-action">
            {current < steps.length - 1 && (
              <Button
                className="nextBtn"
                // disabled={!isAllRowsCompletedData}
                onClick={() => this.next()}
              >
                التالي
              </Button>
            )}
            {current === steps.length - 1 && (
              <Button className="finishBtn" onClick={this.finishProcess}>
                إنهاء
              </Button>
            )}
            {current > 0 && (
              <Button
                className="prevBtn"
                style={{ margin: "0 8px" }}
                onClick={() => this.prev()}
              >
                السابق
              </Button>
            )}
          </div>
        </Container>
      </div>
    );
  }
}

const mapStateToProps = ({ mapUpdate }) => {
  const { tableSettings, auth } = mapUpdate;
  return {
    tableSettings,
    user: auth.user,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    clearUpdateTable: () => dispatch({ type: "CLEAR_RESULT_TABLE_DATA_SET" }),
    removeUserFromApp: () => dispatch({ type: "LOGOUT" }),
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(AddLocationFromParcelsWizard)
);

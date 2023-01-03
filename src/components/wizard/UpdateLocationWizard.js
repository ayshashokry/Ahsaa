import React, { Component } from "react";
import { Table, Container, Modal } from "react-bootstrap";
import { Steps, message, Button, Input, Tooltip, notification } from "antd";

import { connect } from "react-redux";
import FinalStepTable from "./FinalStepTable";
import FirstStepReportTable from "./FirstStepReportTable";
import FirstStepLocationTable from "./FirstStepLocationTable";
import {
  convertNumbersToEnglish,
  getLayerIndex,
  getLayerIndexFromFeatService,
} from "../common/mapviewer";

import { UserSession } from "@esri/arcgis-rest-auth";
import { request } from "@esri/arcgis-rest-request";
import { withRouter } from "react-router";
import { checkTokenExpiration } from "../../redux/reducers/map";
import { notificationMessage } from "../../helpers/utlis/notifications_Func";

//url of feature layer =--> https://37.224.12.211:6443/arcgis/rest/services/InvestmentAhsaa_edit/FeatureServer

class UpdateLocationWizard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      wizardDisplay: "UpdateTableHidden",
      current: 0,
      notes: "",
      loading: false,
    };
  }
  componentWillUnmount() {
    setTimeout(() => {
      let mapInstance = window.__map__;
      //  mapInstance.setExtent(mapInstance.extent.expand(2));
      mapInstance.getLayer("baseMap").refresh();
    }, 1500);
    window.__map__._fixedPan(0, window.__map__.height * 0.01);

    this.props.showTable(false);
    let graphicLayerOfMultiSelect = window.__map__.getLayer(
      "graphicLayer_Multi_Select"
    );
    let zoomGraphicLayer = window.__map__.getLayer("zoomGraphicLayer");
    zoomGraphicLayer.clear();
    graphicLayerOfMultiSelect.clear();
    this.props.clearUpdateTable();
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
          // this.props.removeUserFromApp();
          notificationMessage("يجب إعادة تسجيل الدخول");
          this.props.closeLoader();
          this.props.history.replace("/Login");
        }, 1000);
      } else {
        this.props.showTable(false);
        const valueToBoolean = (value) => {
          if (value) return true;
          else return false;
        };
        const argsDone = {
          description: "تم إنهاء العملية",
          duration: 3,
        };
        const argsCancel = {
          description: "عفواً لقد تم إلغاء العملية نتيجة خطأ أثناء الحفظ",
          duration: 3,
        };
        const argsNoChanges = {
          description: "لم يتم إدخال بيانات جديدة للحفظ",
          duration: 3,
        };
        this.setState({ wizardDisplay: "UpdateTableHidden" });
        let urlOfFeatureService = window.__applyEditsUrl__;
        let token = this.props.user.esriToken;
        let promises = [];
        let investSiteIndex = getLayerIndexFromFeatService(
            "INVEST_SITE_POLYGON"
          ),
          advertisingBoardsIndex =
            getLayerIndexFromFeatService("ADVERTISING_BOARDS"),
          cornersIndex = getLayerIndexFromFeatService("INVEST_SITE_CORNER"),
          boundIndex = getLayerIndexFromFeatService("INVEST_SITE_BOUNDARY"),
          buildingDetailsIndex =
            getLayerIndexFromFeatService("TBL_BUILD_DETAILS");
        let requestObj = {};
        let isThereDeletedFeatures = this.props.tableSettings.result.filter(
          (item) => {
            if (item.isDeleted) return item;
          }
        );
        /******************************************************************************************* */
        //logic of delete data
        //delete features and all related tbls
        if (isThereDeletedFeatures.length) {
          isThereDeletedFeatures.forEach((item) => {
            if (item.layername.toLowerCase() == "invest_site_polygon") {
              //logic for delete all corners , boundaries related to site
              if (item.cornersBoundsDeleteObj.length) {
                item.cornersBoundsDeleteObj.forEach((t) => {
                  if (
                    requestObj[
                      t.id == getLayerIndex("INVEST_SITE_CORNER")
                        ? cornersIndex
                        : boundIndex
                    ] &&
                    requestObj[
                      t.id == getLayerIndex("INVEST_SITE_CORNER")
                        ? cornersIndex
                        : boundIndex
                    ].deletes
                  )
                    requestObj[
                      t.id == getLayerIndex("INVEST_SITE_CORNER")
                        ? cornersIndex
                        : boundIndex
                    ].deletes = [
                      ...requestObj[
                        t.id == getLayerIndex("INVEST_SITE_CORNER")
                          ? cornersIndex
                          : boundIndex
                      ].deletes,
                      ...t.deletes,
                    ];
                  else
                    requestObj[
                      t.id == getLayerIndex("INVEST_SITE_CORNER")
                        ? cornersIndex
                        : boundIndex
                    ] = {
                      ...t,
                      id:
                        t.id == getLayerIndex("INVEST_SITE_CORNER")
                          ? cornersIndex
                          : boundIndex,
                    };
                });
              }
              //logic to delete building details records in tbl_building_details
              if (item.buildingDetailsDeleteObj.length) {
                item.buildingDetailsDeleteObj.forEach((t) => {
                  requestObj[buildingDetailsIndex] = {
                    ...t,
                    id: buildingDetailsIndex,
                  };
                });
              }
            }
            let tblIndex, tblObjectID;
            /**
             * todo: make logic for ad tbl boards
             */
            //logic for delete all related tbls
            switch (item.fieldsBeforeEdit.SITE_SUBTYPE) {
              case 1: //building
                tblIndex = getLayerIndexFromFeatService("TBL_BUILDING_DATA");
                tblObjectID = item.buildingDataBefore
                  ? item.buildingDataBefore.OBJECTID
                  : null;
                break;
              case 5: // elec station
                tblIndex = getLayerIndexFromFeatService("TBL_ELEC_STATION");
                tblObjectID = item.elecStationDataBefore
                  ? item.elecStationDataBefore.OBJECTID
                  : null;

                break;

              case 3: //tower
                tblIndex = getLayerIndexFromFeatService("TBL_TOWERS");
                tblObjectID = item.towerDataBefore
                  ? item.towerDataBefore.OBJECTID
                  : null;

                break;

              case 6: //atm
                tblIndex = getLayerIndexFromFeatService("TBL_ATM");
                tblObjectID = item.atmDataBefore
                  ? item.atmDataBefore.OBJECTID
                  : null;

                break;
            }
            let layerIndex;
            item.layername.toLowerCase() == "invest_site_polygon"
              ? (layerIndex = investSiteIndex)
              : (layerIndex = advertisingBoardsIndex);
            if (tblObjectID) {
              //means there related tbls
              //--add objectID of tbl to delete
              !requestObj[tblIndex]
                ? (requestObj[tblIndex] = {
                    id: tblIndex,
                    deletes: [tblObjectID],
                    updates: [],
                    adds: [],
                  })
                : requestObj[tblIndex].deletes.push(tblObjectID);
              //--add objectID of site from layer to delete
              !requestObj[layerIndex]
                ? (requestObj[layerIndex] = {
                    id: layerIndex,
                    deletes: [item.fieldsBeforeEdit.OBJECTID],
                    updates: [],
                    adds: [],
                  })
                : requestObj[layerIndex].deletes.push(
                    item.fieldsBeforeEdit.OBJECTID
                  );
            }
            //--add objectID of site from layer to delete
            else
              !requestObj[layerIndex]
                ? (requestObj[layerIndex] = {
                    id: layerIndex,
                    deletes: [item.fieldsBeforeEdit.OBJECTID],
                    updates: [],
                    adds: [],
                  })
                : requestObj[layerIndex].deletes.push(
                    item.fieldsBeforeEdit.OBJECTID
                  );
          });
        }
        /******************************************************************************************* */
        //logic of update data
        /********************************************************************************************** */
        //update tables
        let tableDataToEdit = this.props.shownData.filter((f) => f.tableData);
        if (tableDataToEdit.length) {
          // let promises = [];
          tableDataToEdit.forEach((f) => {
            let tblIndex;
            switch (f.tableData.tblName) {
              case "TBL_BUILDING_DATA":
                tblIndex = getLayerIndexFromFeatService("TBL_BUILDING_DATA");
                break;
              case "TBL_BOARDS_GROUP":
                tblIndex = getLayerIndexFromFeatService("TBL_BOARDS_GROUP");
                break;
              case "TBL_ELEC_STATION":
                tblIndex = getLayerIndexFromFeatService("TBL_ELEC_STATION");
                break;

              case "TBL_TOWERS":
                tblIndex = getLayerIndexFromFeatService("TBL_TOWERS");
                break;

              case "TBL_ATM":
                tblIndex = getLayerIndexFromFeatService("TBL_ATM");
                break;
            }
            let isThereTblBeforeEdit =
              valueToBoolean(f.allData.atmDataBefore) ||
              valueToBoolean(f.allData.towerDataBefore) ||
              valueToBoolean(f.allData.elecStationDataBefore) ||
              valueToBoolean(f.allData.buildingDataBefore) ||
              valueToBoolean(f.allData.adBoardsDataBefore);
            if (
              !isThereTblBeforeEdit ||
              (valueToBoolean(f.newMainData) &&
                valueToBoolean(f.newMainData.SITE_SUBTYPE) &&
                f.layername.toLowerCase() === "invest_site_polygon" &&
                isThereTblBeforeEdit &&
                f.mainData.SITE_SUBTYPE != f.newMainData.SITE_SUBTYPE)
            ) {
              let tblData = { ...f.tableData.newData };
              delete tblData["OBJECTID"];
              if (f.layername.toLowerCase() === "invest_site_polygon")
                tblData.SITE_GEOSPATIAL_ID = f.mainData.SITE_GEOSPATIAL_ID;
              else {
                tblData.GROUP_CODE =
                  valueToBoolean(f.tableData) &&
                  valueToBoolean(f.tableData.newData) &&
                  valueToBoolean(f.tableData.newData.GROUP_CODE)
                    ? f.tableData.newData.GROUP_CODE
                    : f.mainData.GROUP_CODE;
                // tblData.GROUP_BOARD_PERPDATE="1442/8/6"
              }

              !requestObj[tblIndex]
                ? (requestObj[tblIndex] = {
                    id: tblIndex,
                    updates: [],
                    adds: [{ attributes: tblData }],
                    deletes: [],
                  })
                : requestObj[tblIndex].adds.push({ attributes: tblData });
            } else if (isThereTblBeforeEdit)
              !requestObj[tblIndex]
                ? (requestObj[tblIndex] = {
                    id: tblIndex,
                    updates: [{ attributes: f.tableData.newData }],
                    adds: [],
                    deletes: [],
                  })
                : requestObj[tblIndex].updates.push({
                    attributes: f.tableData.newData,
                  });

            //for delete old table
            if (
              valueToBoolean(f.newMainData) &&
              isThereTblBeforeEdit &&
              f.mainData.SITE_SUBTYPE != f.newMainData.SITE_SUBTYPE
            ) {
              let oldTblIndex, oldTblObjectID;
              switch (f.mainData.SITE_SUBTYPE) {
                case 1: //building
                  oldTblIndex =
                    getLayerIndexFromFeatService("TBL_BUILDING_DATA");
                  oldTblObjectID = f.allData.buildingDataBefore
                    ? f.allData.buildingDataBefore.OBJECTID
                    : null;
                  break;
                case 5: // elec station
                  oldTblIndex =
                    getLayerIndexFromFeatService("TBL_ELEC_STATION");
                  oldTblObjectID = f.allData.elecStationDataBefore
                    ? f.allData.elecStationDataBefore.OBJECTID
                    : null;

                  break;

                case 3: //tower
                  oldTblIndex = getLayerIndexFromFeatService("TBL_TOWERS");
                  oldTblObjectID = f.allData.towerDataBefore
                    ? f.allData.towerDataBefore.OBJECTID
                    : null;

                  break;

                case 6: //atm
                  oldTblIndex = getLayerIndexFromFeatService("TBL_ATM");
                  oldTblObjectID = f.allData.atmDataBefore
                    ? f.allData.atmDataBefore.OBJECTID
                    : null;

                  break;
              }
              !requestObj[oldTblIndex]
                ? (requestObj[oldTblIndex] = {
                    id: oldTblIndex,
                    updates: [],
                    adds: [],
                    deletes: [oldTblObjectID],
                  })
                : requestObj[oldTblIndex].deletes.push(oldTblObjectID);
            }
          });
        }
        //updates of sites in layers
        let featuresToUpdate = this.props.shownData;
        if (featuresToUpdate.length) {
          featuresToUpdate.forEach(async (feature) => {
            let f = { ...feature };
            if (f.newMainData) {
              f.newMainData.PARCEL_PLAN_NO &&
                (f.newMainData.PARCEL_PLAN_NO = convertNumbersToEnglish(
                  f.newMainData.PARCEL_PLAN_NO
                ));

              f.newMainData.PLAN_NO &&
                (f.newMainData.PLAN_NO = convertNumbersToEnglish(
                  f.newMainData.PLAN_NO
                ));

              f.newMainData.CONTRACT_NUMBER &&
                (f.newMainData.CONTRACT_NUMBER = convertNumbersToEnglish(
                  f.newMainData.CONTRACT_NUMBER
                ));
              f.newMainData.AUCTION_NO &&
                (f.newMainData.AUCTION_NO = convertNumbersToEnglish(
                  f.newMainData.AUCTION_NO
                ));

              let layerIndex =
                f.layername.toLowerCase() === "invest_site_polygon"
                  ? investSiteIndex
                  : advertisingBoardsIndex;

              if (
                f.newMainData.SITE_SUBTYPE === f.mainData.SITE_SUBTYPE &&
                f.newMainData.SITE_SUBTYPE
              )
                delete f.newMainData.SITE_SUBTYPE;
              !requestObj[layerIndex]
                ? (requestObj[layerIndex] = {
                    id: layerIndex,
                    updates: [{ attributes: f.newMainData }],
                    adds: [],
                    deletes: [],
                  })
                : requestObj[layerIndex].updates.push({
                    attributes: f.newMainData,
                  });
            }
          });
        }
        /********************************************************************* */
        console.log(requestObj);
        if(Object.keys(requestObj).length){
        promises.push(
          new Promise((resolve, reject) => {
            request(urlOfFeatureService + "applyEdits?token=" + token, {
              httpMethod: "POST",
              authentication: new UserSession({
                token: token,
              }),
              params: {
                f: "json",
                rollbackOnFailure: true,
                edits: Object.values(requestObj),
              },
            })
              .then((res) => {
                resolve(res);
              })
              .catch((err) => {
                this.props.closeLoader();
                notification.open(argsCancel);
                let mapService = window.__map__.getLayer("baseMap");
                mapService.refresh();
                let cadLayerOnMap =
                  window.__map__.getLayer("Features_From_CAD");
                cadLayerOnMap.clear();
                this.props.clearUpdateTable();
                // window.__map__.setExtent(window.__map__.extent.expand(1.5));
                window.__map__._fixedPan(0, window.__map__.height * 0.01);
              });
          })
        );

        if (promises.length)
          Promise.all(promises)
            .then((result) => {
              console.log(result);
              this.props.closeLoader();
              notification.open(argsDone);
              this.props.clearUpdateTable();
            })
            .then(() => {
              let cadLayerOnMap = window.__map__.getLayer("Features_From_CAD");
              cadLayerOnMap.clear();
              let mapInstance = window.__map__;
              // mapInstance.setExtent(mapInstance.extent.expand(1.5));

              window.__map__._fixedPan(0, window.__map__.height * 0.01);
            });
        else {
          this.props.closeLoader();
          notification.open(argsCancel);
          let mapService = window.__map__.getLayer("baseMap");
          mapService.refresh();
          let cadLayerOnMap = window.__map__.getLayer("Features_From_CAD");
          cadLayerOnMap.clear();
          this.props.clearUpdateTable();
          // window.__map__.setExtent(window.__map__.extent.expand(1.5));
          window.__map__._fixedPan(0, window.__map__.height * 0.01);
        }
      }else{
        this.props.closeLoader();
        notification.open(argsNoChanges);
        let mapService = window.__map__.getLayer("baseMap");
        mapService.refresh();
        let cadLayerOnMap = window.__map__.getLayer("Features_From_CAD");
        cadLayerOnMap.clear();
        this.props.clearUpdateTable();
        // window.__map__.setExtent(window.__map__.extent.expand(1.5));
        window.__map__._fixedPan(0, window.__map__.height * 0.01);
      
      }
    }
    });
  };
  render() {
    const { Step } = Steps;
    const { current, notes } = this.state;
    const { reportWizard } = this.props;
    console.log(this.props.isAllRowsCompletedData);
    const steps = reportWizard
      ? [
          {
            title: "بيانات قطع الأرض",
            content: <FirstStepReportTable />,
          },
        ]
      : [
          {
            title: "تحديث البيانات الوصفية",
            content: (
              <FirstStepLocationTable
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
            content: <FinalStepTable />,
          },
        ];
    // if (!tableSettings) return <Fragment></Fragment>;
    // const { result, columns, actions } = tableSettings;
    const { tableSettings } = this.props;
    let isAllRowsCompletedData;
    if (tableSettings && tableSettings.result) {
      let tableData1 = tableSettings.result.filter((item) => !item.isDeleted);
      let allRowsInTableCompleted = tableData1.filter((f) => {
        let completedFlag =
          f.isCompletedFilled.mainData.bool &&
          f.isCompletedFilled.tblData.bool &&
          f.isCompletedFilled.bordersData.bool;
        if (completedFlag) return true;
      });
      isAllRowsCompletedData =
        allRowsInTableCompleted.length === tableData1.length ? true : false;
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
  if (tableSettings) {
    let { result } = tableSettings;
    let notDeletedFeaturesInTable = result.filter((f) => !f.isDeleted);
    let difference1 = (obj1, obj2) => {
      let keyFound = {};
      if (obj1)
        Object.entries(obj1).forEach((item) => {
          if (obj1[item[0]] !== obj2[item[0]]) {
            let oldValue = obj2[item[0]];
            keyFound[item[0]] = item[1];
          }
        });
      return Object.values(keyFound).length
        ? { ...keyFound, OBJECTID: obj2["OBJECTID"] }
        : -1;
    };
    let shownData = notDeletedFeaturesInTable.map((land) => {
      let data = {};
      data.allData = land;
      data.mainData = land.fieldsBeforeEdit;
      if (difference1(land.fieldsForEdit, land.fieldsBeforeEdit) != -1)
        data.newMainData = difference1(
          land.fieldsForEdit,
          land.fieldsBeforeEdit
        );
      else data.newMainData = null;
      if (data.newMainData && !data.newMainData.SITE_SUBTYPE)
        data.newMainData.SITE_SUBTYPE = land.fieldsBeforeEdit.SITE_SUBTYPE;
      //tbl data
      if (
        getLayerIndex(land.layername) == getLayerIndex("Invest_Site_Polygon")
      ) {
        switch (land.fieldsForEdit.SITE_SUBTYPE) {
          case 1:
            //buildings
            if (
              difference1(
                land.buildingDataAfter,
                land.buildingDataBefore ? land.buildingDataBefore : {}
              ) != -1
            )
              data.tableData = {
                newData: difference1(
                  land.buildingDataAfter,
                  land.buildingDataBefore ? land.buildingDataBefore : {}
                ),
                tblName: "TBL_BUILDING_DATA",
              };
            else data.tableData = null;

            break;
          case 2:
            //ad boards
            //
            if (
              difference1(
                land.adBoardsDataAfter,
                land.adBoardsDataBefore ? land.adBoardsDataBefore : {}
              ) != -1
            )
              data.tableData = {
                newData: difference1(
                  land.adBoardsDataAfter,
                  land.adBoardsDataBefore ? land.adBoardsDataBefore : {}
                ),
                tblName: "TBL_BOARDS_GROUP",
              };
            else data.tableData = null;
            break;
          case 3:
            //mobile towers
            if (
              difference1(
                land.towerDataAfter,
                land.towerDataBefore ? land.towerDataBefore : {}
              ) != -1
            )
              data.tableData = {
                newData: difference1(
                  land.towerDataAfter,
                  land.towerDataBefore ? land.towerDataBefore : {}
                ),
                tblName: "TBL_TOWERS",
              };
            else data.tableData = null;
            break;
          case 5:
            //elec stations
            if (
              difference1(
                land.elecStationDataAfter,
                land.elecStationDataBefore ? land.elecStationDataBefore : {}
              ) != -1
            )
              data.tableData = {
                newData: difference1(
                  land.elecStationDataAfter,
                  land.elecStationDataBefore ? land.elecStationDataBefore : {}
                ),
                tblName: "TBL_ELEC_STATION",
              };
            else data.tableData = null;
            break;
          case 6:
            //atm
            if (
              difference1(
                land.atmDataAfter,
                land.atmDataBefore ? land.atmDataBefore : {}
              ) != -1
            )
              data.tableData = {
                newData: difference1(
                  land.atmDataAfter,
                  land.atmDataBefore ? land.atmDataBefore : {}
                ),
                tblName: "TBL_ATM",
              };
            else data.tableData = null;
            break;
          default:
            break;
        }
      } else {
        if (
          difference1(
            land.adBoardsDataAfter,
            land.adBoardsDataBefore ? land.adBoardsDataBefore : {}
          ) != -1
        )
          data.tableData = {
            newData: difference1(
              land.adBoardsDataAfter,
              land.adBoardsDataBefore ? land.adBoardsDataBefore : {}
            ),
            tblName: "TBL_BOARDS_GROUP",
          };
        else data.tableData = null;
      }
      data.layername = land.layername;
      data.geometry = land.geometry;
      data.cornersBoundsDeleteObj = land.cornersBoundsDeleteObj;
      return data;
    });
    return {
      tableSettings,
      shownData,
      user: auth.user,
    };
  } else
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
  connect(mapStateToProps, mapDispatchToProps)(UpdateLocationWizard)
);

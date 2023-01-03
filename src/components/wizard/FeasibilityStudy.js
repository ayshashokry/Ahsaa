import React, { Component } from "react";
import { Table, Container, Modal } from "react-bootstrap";
import { Steps, message, Button, Input, Tooltip, notification } from "antd";

import { connect } from "react-redux";
import FinalStepTable from "./FinalStepTable";
import FirstStepReportTable from "./FirstStepReportTable";
import FirstStepLocationTable from "./FirstStepLocationTable";
import { convertNumbersToEnglish, getLayerIndex } from "../common/mapviewer";


class FeasibilityStudyWizard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      wizardDisplay: "FeasibilityStudyHidden",
      current: 0,
      notes: "",
      loading: false,
    };
  }
  componentWillUnmount() {
    setTimeout(() => {
      let mapInstance = window.__map__;
      mapInstance.getLayer("baseMap").refresh();
    }, 1500);
    window.__map__._fixedPan(0, window.__map__.height * 0.01);

    this.props.showTable(false);
    let graphicLayerOfMultiSelect = window.__map__.getLayer(
      "graphicLayer_Multi_Select"
    );
    let zoomGraphicLayer = window.__map__.getLayer(
      "zoomGraphicLayer"
    );
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
    this.setState({ wizardDisplay: "FeasibilityStudyHidden" });
  };
  onChangeNotes = (e) => {
    this.setState({ notes: e.target.value });
  };

  finishProcess = async (e) => {
    this.props.showTable(false);
    this.props.openLoader();
 
  };
  render() {
    const { Step } = Steps;
    const { current, notes } = this.state;
    const { reportWizard } = this.props;
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
          {this.state.wizardDisplay == "FeasibilityStudyHidden" ? (
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
      if(data.newMainData&&!data.newMainData.SITE_SUBTYPE) data.newMainData.SITE_SUBTYPE = land.fieldsBeforeEdit.SITE_SUBTYPE;
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
      user:auth.user
    };
  } else
    return {
      tableSettings,
      user:auth.user
    };
};

const mapDispatchToProps = (dispatch) => {
  return {
    clearUpdateTable: () => dispatch({ type: "CLEAR_RESULT_TABLE_DATA_SET" }),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FeasibilityStudyWizard);

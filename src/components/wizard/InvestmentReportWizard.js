import React, { Component } from "react";
import { Container } from "react-bootstrap";
import { Steps, Button } from "antd";

import { connect } from "react-redux";

import FirstStepReportTable from "./FirstStepReportTable";

class InvestmentReportWizard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      wizardDisplay: "SearchTableHidden",
      current: 0,
      notes: "",
      loading: false,
    };
  }
  componentWillUnmount() {
    if(!this.props.multiSelectActive.isActive)
    this.callBackAfterCloseWizard()
  }
  openWizard = (e) => {
    this.setState({ wizardDisplay: "SearchTableShown" });
  };
  closeWizard = (e) => {
    this.setState({ wizardDisplay: "SearchTableHidden" });
  };
  onChangeNotes = (e) => {
    this.setState({ notes: e.target.value });
  };

  finishProcess = async (e) => {
    this.props.showTable(false);
    this.props.openLoader();
    const argsDone = {
      description: "تم إنهاء العملية",
      duration: 3,
    };
    const argsCancel = {
      description: "عفواً لقد تم إلغاء العملية نتيجة خطأ أثناء الحفظ",
      duration: 3,
    };
    this.setState({ wizardDisplay: "SearchTableHidden" });
    // this.props.handleFinishButtonToPrint()
    this.openReports();
    this.props.closeLoader();
    this.props.clearReportTable();
  };
  openReports = () => {
    this.callBackAfterCloseWizard()
    let featuresIDs = this.props.tableSettings.result.map(
      (f) => f.attributes.SITE_GEOSPATIAL_ID
    );
    let reportType = this.props.tableSettings.result.find(
      (feat) => feat.reportType
    ).reportType;
    let where = `SITE_GEOSPATIAL_ID IN (${featuresIDs.join(',')})`
    switch (reportType) {
      case "investment":
        localStorage.setItem("investmentQueryCondition", where);
        break;
      case "tech":
        localStorage.setItem("techReportQueryCondition", where);
        break;

      case "feasibilityReport":
        localStorage.setItem("feasibilityStudyQueryCondition", where);
        break;
    }
    this.props.handleFinishButtonToPrint(true);
    const win = window.open(
      reportType === "investment"
        ? "investmentreports"
        : reportType === "tech"
        ? "investmenttechreports"
        : reportType ==="feasibilityReport"?
         "feasibilityStudyreports":"",
      "_blank"
    );
    win.focus();
  };
  callBackAfterCloseWizard(){
    this.props.emptyTempSelectedFeats();
    this.props.clearReportTable();
    this.props.diActivateMultiSelectButton();

    let selectionToolbar = window.__MultiSelect__;
    selectionToolbar.onDrawEnd = null;        //remove drawend handler ==> important
    selectionToolbar.deactivate();
    window.__map__.enablePan();
    window.__map__.enableMapNavigation();
  }
  render() {
    const { Step } = Steps;
    const { current, notes } = this.state;
    const steps = [
      {
        title: "بيانات قطع الأرض",
        content: (
          <FirstStepReportTable
            openLoader={this.props.openLoader}
            closeLoader={this.props.closeLoader}
            showTable={this.props.showTable}
            finishProcess={this.finishProcess}
          />
        ),
      },
    ];

    return (
      <>
      {this.props.tableSettings&&this.props.tableSettings.result.length&&
      <div className={this.state.wizardDisplay}>
        <div className="tableHeaderIconsDiv">
          {this.state.wizardDisplay == "SearchTableHidden" ? (
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
      </div>}
      </>
    );
  }
}

const mapStateToProps = ({ mapUpdate }) => {
  const { tableSettings,multiSelectActive } = mapUpdate;

  return {
    tableSettings,
    multiSelectActive
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    clearReportTable: () => dispatch({ type: "CLEAR_RESULT_TABLE_DATA_SET" }),
    emptyTempSelectedFeats: () => dispatch({ type: "EMPTY_DATA_FROM_TEMP" }),
    diActivateMultiSelectButton: () =>
      dispatch({ type: "DIACTIVATE_MULTI_SELECT" }),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(InvestmentReportWizard);

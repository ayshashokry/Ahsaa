import React, { Component } from "react";
import { Container } from "react-bootstrap";
import { Steps, Button } from "antd";

import { connect } from "react-redux";

import DashboardTableContent from "./DashboardTableContent";

class DashboardWizard extends Component {
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
    this.props.clearDataToDashboard();
  };
  openReports = () => {
    this.callBackAfterCloseWizard()
    localStorage.setItem("dashboardQueryCondition", this.props.dashboardData?
    JSON.stringify(this.props.dashboardData.queryParams):""); 
    this.props.handleFinishButtonToPrint(true);
    const win = window.open(
         "mainDashboard",
      "_blank"
    );
    win.focus();
  };
  callBackAfterCloseWizard(){
    let dashboardGraphicLayer = window.__map__.getLayer("graphicLayer_Dashboard");
    dashboardGraphicLayer.clear();
    this.props.clearDataToDashboard();
    this.props.showTable(false)
  }
  render() {
    const { Step } = Steps;
    const { current } = this.state;
    const steps = [
      {
        title: "الإحصائيات",
        content: (
          <DashboardTableContent
            openLoader={this.props.openLoader}
            closeLoader={this.props.closeLoader}
            showTable={this.props.showTable}
            finishProcess={this.finishProcess}
            wizardDisplay={this.state.wizardDisplay}
          />
        ),
      },
    ];

    return (
      <>
      {this.props.dashboardData&&
      <div className={this.state.wizardDisplay}>
        <div className="tableHeaderIconsDiv">
          {this.state.wizardDisplay == "SearchTableHidden" ? (
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
            {steps.map((item,index) => (
              <Step key={index} title={item.title} />
            ))}
          </Steps>
          <Container fluid className="steps-content ">
            {steps[current].content}
          </Container>
        </Container>
      </div>}
      </>
    );
  }
}

const mapStateToProps = ({ mapUpdate }) => {
  const { tableSettings,multiSelectActive,dashboardData } = mapUpdate;
  return {
    tableSettings,
    multiSelectActive,
    dashboardData
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    clearReportTable: () => dispatch({ type: "CLEAR_RESULT_TABLE_DATA_SET" }),
    emptyTempSelectedFeats: () => dispatch({ type: "EMPTY_DATA_FROM_TEMP" }),
    diActivateMultiSelectButton: () =>
      dispatch({ type: "DIACTIVATE_MULTI_SELECT" }),
    clearDataToDashboard:()=>dispatch({type:"CLEAR_DASHBOARD_DATA"}),

  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DashboardWizard);

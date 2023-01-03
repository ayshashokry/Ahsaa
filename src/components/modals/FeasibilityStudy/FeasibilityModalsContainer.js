import { Component } from "react";
import { connect } from "react-redux";
import { Fragment } from "react";
import SuggestionModal from "../FeasibilityStudy/Modals/SuggestionModal";
import RemarkModal from "../FeasibilityStudy/Modals/RemarkModal";
import SuggestionsChart from "../FeasibilityStudy/Modals/SuggestionsChart";
import PricingEstimateModal from "./Modals/PricingEstimateModal";

class FeasibilityModalContainer extends Component {
  render() {
    const {
      selectedFeatureOnSearchTable,
      closeModal,
      openLoader,
      closeLoader,
      goToPrintSuggestionReportPage,
      printSuggestionReport,
      multiSelectActive,
      selectedFeatures
    } = this.props;
    if(selectedFeatures.length && multiSelectActive.typeUse==="PricingEstimate"){
       return <PricingEstimateModal 
       closeModal={closeModal}
       openLoader={openLoader}
       closeLoader={closeLoader}
       />
     }    
    else if (!selectedFeatureOnSearchTable) return <Fragment></Fragment>;
    //for feasibility study features (suggestion - remark)
    // else if (selectedFeatureOnSearchTable.name === "suggestion") {
    //   return (
    //     <SuggestionModal
    //       selectedFeatureOnSearchTable={selectedFeatureOnSearchTable}
    //       closeModal={closeModal}
    //       openLoader={openLoader}
    //       closeLoader={closeLoader}
    //     />
    //   );
    // } else if (selectedFeatureOnSearchTable.name === "remark") {
    //   return (
    //     <RemarkModal
    //       selectedFeatureOnSearchTable={selectedFeatureOnSearchTable}
    //       closeModal={closeModal}
    //       openLoader={openLoader}
    //       closeLoader={closeLoader}
    //     />
    //   );
    // } 
    else if (
      ["suggestionsCharts"].includes(selectedFeatureOnSearchTable.name)
    ) {
      return (
        <SuggestionsChart
          selectedFeatureOnSearchTable={selectedFeatureOnSearchTable}
          closeModal={closeModal}
          openLoader={openLoader}
          closeLoader={closeLoader}
          goToPrintSuggestionReportPage={goToPrintSuggestionReportPage}
          printSuggestionReport={printSuggestionReport}
        />
      );
    } 
    else return null;
  }
}

const mapStateToProps = ({ mapUpdate }) => {
  const { selectedFeatureOnSearchTable,auth,multiSelectActive,selectedFeatures } = mapUpdate;
  return {
    selectedFeatureOnSearchTable,
    user: auth.user,
    multiSelectActive,
    selectedFeatures
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    closeModal: () => dispatch({ type: "CLOSE_TABLE_ICON_MODAL" }),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FeasibilityModalContainer);

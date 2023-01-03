import React, { useEffect, useRef, useState } from "react";
import { Container } from "react-bootstrap";
import { connect } from "react-redux";
import { Button } from "antd";
import { notificationMessage } from "../../../helpers/utlis/notifications_Func";
import { clearAllGraphicLayers } from "../../common/mapviewer";

function PlanningEconomicStudy(props) {
  const [singleSelect, setSingleSelect] = useState(false);
  const [multiSelect, setMultiSelect] = useState(false);
  const [selectedBtn, setSelectedBtn] = useState("");
  useEffect(() => {
    notificationMessage("حدد الموقع المراد عمل دراسة له من الخريطة باستخدام أداة التحديد",5)
    props.activateSingleSelect("INVEST_SITE_POLYGON","planningStudy");
    return () => {
      props.disactivateSingleSelect();
      window.__map__.getLayer("highLightGraphicLayer").clear();
      props.emptyTempSelectedFeats();
      props.clearTableData();
    };
  }, []);
  const handleConfirmation =()=>{

   //add temp to selected
    props.addToSelectedFeatures(props.tempSelectedFeaturesData);
    //clear temp data
    props.emptyTempSelectedFeats();
  }
  return (
    <div className="coordinates mb-4">
      <h3 className="mb-2">الدراسة التخطيطية والاقتصادية </h3>
      <Container className="pt-2">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
    
        
            <>
              <span
                className="row p-2"
                style={{
                  // textAlign: "right",
                  width: "90%",
                  whiteSpace: "pre-wrap",
                  textAlign: "start",
                  margin: "auto",
                  marginTop: "15px",
                  direction: "rtl",
                  display: "flow-root",
                }}
              >
                * حدد {"موقع واحد"} من الخريطة من خلال
                الزر يسار الخريطة
                <i
                  className="fas fa-1x fa-expand"
                  style={{
                    marginRight: "15px",
                    background: "black",
                    color: "white",
                    padding: "6px",
                  }}
                ></i>
                &nbsp;
                ثم اضغط تأكيد
              </span>
              <Button
                onClick={handleConfirmation}
                className="SearchBtn mt-4"
                size="large"
                disabled={
                  props.singleSelectActive.isActive && props.tempSelectedFeaturesData.length === 1
                    ? false
                    : true
                }
              >
                تأكيد
              </Button>
        </>
        </div>
      </Container>
    </div>
  );
}

const mapDispatchToProps = (dispatch) => {
  return {
    addToSelectedFeatures: (features) =>
      dispatch({ type: "ADD_TO_SELECTED_FEATURES", features }),
    pushResultTableData: (data) =>
      dispatch({ type: "RESULT_TABLE_DATA_SET", data }),
    handleMapClickEvent: ({ cursor, handler }) =>
      dispatch({ type: "MAP_CLICK_EVENT", cursor, handler }),
    // pushToBordersModal: (data) => dispatch({ type: "BORDERS_TABLE_DATA_SET", data }),
    pushContentToModal: (data) =>
      dispatch({ type: "TABLE_ICON_MODAL_DATA_SET", data }),
    clearTableData: () => dispatch({ type: "CLEAR_RESULT_TABLE_DATA_SET" }),
    activateSingleSelect: (layerName, purposeOfSelect) =>
      dispatch({
        type: "ACTIVATE_SINGLE_SELECT",
        layerName,
        purposeOfSelect,
      }),
    disactivateSingleSelect: () =>
      dispatch({ type: "DIACTIVATE_SINGLE_SELECT" }),
    emptyTempSelectedFeats: () => dispatch({ type: "EMPTY_DATA_FROM_TEMP" }),
    clearSelection: () => dispatch({ type: "CLEAR_SELECTED" }),
  };
};

const mapStateToProps = ({ mapUpdate }) => {
  const {
    fields,
    currentUser,
    auth,
    selectedFeatures,
    tempSelectedFeaturesData,
    singleSelectActive
  } = mapUpdate;
  return {
    fields,
    currentUser,
    user: auth.user,
    selectedFeatures,
    tempSelectedFeaturesData,
    singleSelectActive
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PlanningEconomicStudy);

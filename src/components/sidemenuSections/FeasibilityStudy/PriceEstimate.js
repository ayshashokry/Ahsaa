import React, { useEffect, useRef, useState } from "react";
import { Container } from "react-bootstrap";
import { connect } from "react-redux";
import { Button } from "antd";
import { notificationMessage } from "../../../helpers/utlis/notifications_Func";
import { clearAllGraphicLayers } from "../../common/mapviewer";

function PriceEstimate(props) {
  const [singleSelect, setSingleSelect] = useState(false);
  const [multiSelect, setMultiSelect] = useState(false);
  const [selectedBtn, setSelectedBtn] = useState("");
  useEffect(() => {
    return () => {
      props.disactivateSingleSelect();
      props.diActivateMultiSelectButton();
      window.__map__.getLayer("highLightGraphicLayer").clear();
      window.__map__.getLayer("graphicLayer_Multi_Select").clear();
      props.emptyTempSelectedFeats();
      props.clearTableData();
      setMultiSelect(false);
      setSingleSelect(false);
    };
  }, []);
  const removeGraphics =(layerName)=>{
    let graphicLayer = window.__map__.getLayer(layerName);
    graphicLayer.clear();
  }
  const handleSingleSelectForShowPrice = () => {
    if (singleSelect) return;
    else {
      if (multiSelect) setMultiSelect(false);
      //in case of existing selection for fav or something else
      props.clearSelection();
      clearAllGraphicLayers(window.__map__);
      //in case of the 1st scenario or select for maulti sites to enter price
      props.disactivateSingleSelect();
      props.diActivateMultiSelectButton();
      removeGraphics("graphicLayer_Multi_Select");
      //////
      setSingleSelect(true);
      props.emptyTempSelectedFeats();
      props.clearTableData();
      notificationMessage("حدد الموقع من الخريطة لعرض بيانات السعر");
      props.activateSingleSelect("INVEST_SITE_POLYGON");
    }
  };
  const handleMultiSelectForEnterPrice = () => {
    if (multiSelect) return;
    else {
      if (singleSelect) setSingleSelect(false);
      setMultiSelect(true);
      //in case of existing selection for fav or something else
      props.clearSelection();
      clearAllGraphicLayers(window.__map__);
      //in case of the 1st scenario or select for maulti sites to enter price
      props.disactivateSingleSelect();
      //////
      props.emptyTempSelectedFeats();
      props.clearTableData();
      notificationMessage("حدد الموقع/المواقع من الخريطة لإدخال بيانات السعر");
      props.activateMultiSelectButton("INVEST_SITE_POLYGON");
    }
  };
  const handleConfirmation = () => {
    // setMultiSelect(false);
    // setSingleSelect(false);
    //add temp to selected
    props.addToSelectedFeatures(props.tempSelectedFeaturesData);
    //clear temp data
    props.emptyTempSelectedFeats();
  };
  return (
    <div className="coordinates mb-4">
      <h3 className="mb-2">تسعير المواقع الاستثمارية </h3>
      <Container className="pt-2">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Button
            onClick={handleSingleSelectForShowPrice}
            className={singleSelect ? "DarkBtn mt-4" : "SearchBtn mt-4"}
            size="large"
          >
            عرض أسعار الموقع الاستثماري
          </Button>
          <Button
            onClick={handleMultiSelectForEnterPrice}
            className={multiSelect ? "DarkBtn mt-4" : "SearchBtn mt-4"}
            size="large"
          >
            إدخال السعر للموقع الاستثماري
          </Button>

          {singleSelect || multiSelect ? (
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
                * حدد {singleSelect ? "موقع واحد" : "الموقع/المواقع"} من الخريطة من خلال
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
                  singleSelect && props.tempSelectedFeaturesData.length === 1
                    ? false
                    : multiSelect && props.tempSelectedFeaturesData.length
                    ? false
                    : true
                }
              >
                تأكيد
              </Button>
            </>
          ) : null}
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
    activateMultiSelectButton: (layerName) =>
      dispatch({
        type: "ACTIVATE_MULTI_SELECT",
        layerName,
        typeUse: "PricingEstimate",
      }),
    diActivateMultiSelectButton: () =>
      dispatch({ type: "DIACTIVATE_MULTI_SELECT" }),
    activateSingleSelect: (layerName) =>
      dispatch({
        type: "ACTIVATE_SINGLE_SELECT",
        layerName,
        purposeOfSelect: "showPricing",
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
  } = mapUpdate;
  return {
    fields,
    currentUser,
    user: auth.user,
    selectedFeatures,
    tempSelectedFeaturesData,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PriceEstimate);

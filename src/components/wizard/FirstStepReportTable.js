import React, { useState, useRef, useEffect } from "react";
import { Table, Modal } from "react-bootstrap";
import { Button, Tooltip, Checkbox, notification } from "antd";
import { connect } from "react-redux";
import { highlightFeature } from "../common/mapviewer";

function FirstStepReportTable(props) {
  const [showDeleteModal, setDeletShow] = useState(null);
  const [showCancelModal, setCancelShow] = useState(null);

  const [allChecked, setAllChecked] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [showCancelAllModal, setShowCancelAllModal] = useState(null);
  const [tableData, setTableData] = useState(() => {
    if (props.tableSettings && props.tableSettings.result.length)
      return props.tableSettings.result;
  });
  useEffect(() => {
    return () => {
      console.log("unmount");
      props.closeLoader();
      props.showTable(false);
      let graphicLayerOfMultiSelect = window.__map__.getLayer(
        "graphicLayer_Multi_Select"
      );
      graphicLayerOfMultiSelect.clear();
      props.clearUpdateTable();
      return null;
    };
  }, []);

  const openCancelModal = (id) => {
    if (id === "showCancelAllModal") setShowCancelAllModal(id);
    else setCancelShow(id);
  };
  const closeCancelModal = () => {
    setCancelShow(null);
  };
  const cancelLand = (id) => {    //id=OBJECTID
    let graphicLayer = window.__map__.getLayer("graphicLayer_Multi_Select");    
    if (id) {
      let allGraphicFeatures = graphicLayer.graphics;
      let reqFeature = props.tableSettings.result.find((f) => f.attributes.OBJECTID == id);
      let canceledGraphic = allGraphicFeatures.find(
        (f) =>
          f.attributes.id === reqFeature.id
      );
      graphicLayer.remove(canceledGraphic);
      props.removeItemFromTable(reqFeature.id);
      let selectedFeaturesCopy = [...selectedFeatures];
      if (selectedFeaturesCopy.find((f) => f.attributes.OBJECTID === id)) {
        selectedFeaturesCopy = selectedFeaturesCopy.filter(
          (f) => f.attributes.OBJECTID !== id
        );
      }
      //check if there is no rows in table grid --> close the grid
      setCancelShow(null);
      if (props.tableSettings.result.length === 1) props.showTable(false);
      setSelectedFeatures(selectedFeaturesCopy);
      // setState({ showCancelModal: null, selectedFeatures,countedTableLength:state.countedTableLength?state.countedTableLength-1:0 });
    } else {
      let selectedFeaturesObjectIDs = [...selectedFeatures].map(
        (f) => f.attributes.OBJECTID
      );
      let allGraphicFeatures = graphicLayer.graphics;
      if (allGraphicFeatures.length)
        selectedFeaturesObjectIDs.forEach((id) => {
          graphicLayer.remove(
            allGraphicFeatures.find((g) => g.attributes.id === id)
          );
        });
      if (props.tableSettings.result.length === selectedFeatures.length)
        props.showTable(false);
      props.cancelAllSelected();
      setShowCancelAllModal(null);
      setSelectedFeatures(selectedFeatures);
      // setState({ showCancelAllModal: null, selectedFeatures:[], countedTableLength:state.countedTableLength?state.countedTableLength-selectedFeaturesObjectIDs.length:0 });
    }
    notificationWithCanceling();
  };
  const notificationWithCanceling = () => {
    const args = {
      description: "تم الإلغاء بنجاح وإزالة الموقع الاستثماري من الجدول",
      duration: 3,
    };
    notification.open(args);
  };
  const zoomToLand = (id) => {
    let graphicLayerOfMultiSelect = window.__map__.getLayer(
      "graphicLayer_Multi_Select"
    );
    let feature = graphicLayerOfMultiSelect.graphics.find(
      (g) => g.attributes.id === id
    );
    highlightFeature(feature, window.__map__, {
      noclear: true,
      isZoom: true,
      layerName: "zoomGraphicLayer",
      strokeColor: "darkgray",
      highlightWidth: 5,
    });
    setTimeout(() => {
      let graphicLayerOfZooming = window.__map__.getLayer("zoomGraphicLayer");
      graphicLayerOfZooming.clear();
    }, 4000);
  };

  const handleCheck = (e) => {
    let itemID = e.target.id;
    let checked = e.target.checked;
    let { tableSettings } = props;
    let tableData = [...props.tableSettings.result];
    tableData = tableData.map((item) =>
      item.attributes.OBJECTID === itemID
        ? { ...item, isChecked: checked }
        : item
    );
    let allChecked = tableData.every((item) => item.isChecked);
    let selectedFeatures = tableData.filter((f) => f.isChecked);
    props.editReportsData({ ...tableSettings, result: tableData });
    setAllChecked(allChecked);
    setSelectedFeatures(selectedFeatures);
    // });
  };
  const handleCheckAll = (e) => {
    let checked = e.target.checked;
    let { tableSettings } = props;
    let tableData = [...tableSettings.result];
    tableData = tableData.map((item) => ({ ...item, isChecked: checked }));
    let selectedFeatures = tableData.filter((f) => f.isChecked);
    setAllChecked(checked);
    setSelectedFeatures(selectedFeatures);
    props.editReportsData({ ...tableSettings, result: tableData });
  };
  const openDetailsOfTechRepoer = (id)=>{
    localStorage.setItem('techReportSiteDetail',id);
    const win = window.open(
     'investTechReportDetails',
      "_blank"
    );
    win.focus();
  }
  let allCheckdFromProps = false;
  if (props.tableSettings && props.tableSettings.result.length)
    allCheckdFromProps = props.tableSettings.result.reduce((total, feat) => {
      if (total == 1) return feat.isChecked;
      else return feat.isChecked && total;
    }, 1);
  return (
    <Table striped responsive className="firstStepTable">
      <div className="tableIcons">
        <Button
          style={{ width: "fit-content" }}
          className="finishBtn mr-2"
          onClick={props.finishProcess}
        >
          طباعة الصحيفة
        </Button>
        <span className="checkAllSpan"> اختيار الكل</span>
        <Checkbox
          id="checkAll"
          checked={allCheckdFromProps}
          onChange={handleCheckAll}
          className="ml-2 mb-2 pr-2"
          style={{
            lineHeight: "32px",
            borderRight: "1px solid #d4d4d4",
          }}
        />
        {selectedFeatures.length ? (
          <>
            <Tooltip
              className="mx-3"
              placement="top"
              title=" إلغاء المحدد من الجدول"
            >
              <i
                className="fas fa-times"
                style={{
                  padding: "0.5em",
                  background: "#b54447",
                  color: "white",
                  borderRadius: "0.3em",
                }}
                onClick={() => openCancelModal("showCancelAllModal")}
              ></i>
            </Tooltip>
            <Modal
              style={{ textAlign: "right" }}
              show={showCancelAllModal === "showCancelAllModal"}
              onHide={() => closeCancelModal("showCancelAllModal")}
              backdrop="static"
              size="lg"
              aria-labelledby="contained-modal-title-vcenter"
              centered
            >
              <Modal.Header>
                <Modal.Title>
                  هل أنت متأكد من إلغاء جميع الأراضي المحددة بالجدول ؟
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Button
                  className="cancelbtn"
                  onClick={() => closeCancelModal("showCancelAllModal")}
                >
                  لا
                </Button>
                <Button className="addbtn" onClick={() => cancelLand(null)}>
                  نعم
                </Button>
              </Modal.Body>
            </Modal>
          </>
        ) : null}
      </div>
      <thead>
        <tr className="resultsHeader">
          <th>إجراءات</th>
          <th>رقم المخطط</th>
          <th>رقم الأرض</th>
        </tr>
      </thead>
      <tbody>
        {props.tableSettings &&
          props.tableSettings.result.map((land, index) => (
            <tr key={index}>
              <td className="updateActions">
                <ul>
                  <li>
                    <Tooltip className="mx-3" placement="top" title="تكبير">
                      <i
                        className="fas fa-search-plus pl-1"
                        onClick={(id) => zoomToLand(land.id)}
                        id={land.id}
                      ></i>
                    </Tooltip>
                  </li>
                  <li>
                    <Tooltip className="mx-3" placement="top" title="إلغاء">
                      <i
                        className="fas fa-times"
                        onClick={() =>
                          openCancelModal(land.attributes.OBJECTID)
                        }
                        id={land.attributes.OBJECTID}
                      ></i>
                      <Modal
                        style={{ textAlign: "right" }}
                        show={showCancelModal === land.attributes.OBJECTID}
                        onHide={closeCancelModal}
                        backdrop="static"
                        size="lg"
                        aria-labelledby="contained-modal-title-vcenter"
                        centered
                      >
                        <Modal.Header>
                          <Modal.Title>
                            هل أنت متأكد من إلغاء هذه الأرض؟
                          </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                          <Button
                            className="cancelbtn"
                            onClick={closeCancelModal}
                          >
                            لا
                          </Button>
                          <Button
                            className="addbtn"
                            id={land.id}
                            onClick={() => cancelLand(land.attributes.OBJECTID)}
                          >
                            نعم
                          </Button>
                        </Modal.Body>
                      </Modal>
                    </Tooltip>
                  </li>
                  <li>
                    <Tooltip className="mx-3" placement="top" title="التقرير الفني التفصيلي">
                      <i
                      className="fas fa-clipboard-list"
                        onClick={(id) => openDetailsOfTechRepoer(land.id)}
                        id={land.id}
                      ></i>
                    </Tooltip>
                  </li>
                </ul>
              </td>
              <td>
                {land.attributes.PLAN_NO &&
                !["", "<Null>"].includes(land.attributes.PLAN_NO)
                  ? land.attributes.PLAN_NO
                  : "بدون"}
              </td>
              <td>
                {land.attributes.PARCEL_PLAN_NO
                  ? land.attributes.PARCEL_PLAN_NO
                  : "بدون"}
                <Checkbox
                  id={land.attributes.OBJECTID}
                  key={land.attributes.OBJECTID}
                  name={land.attributes.PARCEL_PLAN_NO}
                  value={land.attributes.PARCEL_PLAN_NO}
                  checked={land.isChecked}
                  onChange={handleCheck}
                  className="ml-3"
                  style={{
                    lineHeight: "32px",
                  }}
                />
              </td>
            </tr>
          ))}
          
      </tbody>
    </Table>
  );
}
const mapStateToProps = ({ mapUpdate }) => {
  const { fields, currentUser, tableSettings } = mapUpdate;
  return {
    fields,
    currentUser,
    tableSettings,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    editReportsData: (data) =>
      dispatch({ type: "EDIT_ITEM_FROM_RESULT_COUNTED_TABLE_DATA_SET", data }),
    removeItemFromTable: (id) =>
      dispatch({ type: "REMOVE_ITEM_FROM_RESULT_COUNTED_TABLE_DATA_SET", id }),
    deleteFeatureFromMap: (id) =>
      dispatch({
        type: "DELTE_FEATURE_FROM_COUNTED_TABLE_DATA_SET_AND_MAP",
        id,
      }),
    cancelAllSelected: () =>
      dispatch({
        type: "CANCEL_SELECTED_ROWS_FROM_TABLE",
      }),
    clearUpdateTable: () => dispatch({ type: "CLEAR_RESULT_TABLE_DATA_SET" }),
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FirstStepReportTable);

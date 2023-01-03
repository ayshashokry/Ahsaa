import React, { useEffect,useState } from "react";
import { connect } from "react-redux";
import { Container, Modal } from "react-bootstrap";
import { Row, Col, Form, Button, Select, notification } from "antd";
import Loader from "../loader/index";
import {
  catchPlans,
  catchDistricts,
  catchLands,
  zoomToParticularArea,
} from "./helpers/common_func";

import {
  clearAllGraphicLayers,
  convertEngNumbersToArabic,
  convertNumbersToEnglish,
} from "../common/mapviewer";
import { sortAlphabets } from "../../helpers/utlis/utilzFunc";

function AddLocationFromCharts(props) {
  // constructor(props) {
  // super(props);
  const [state, setState] = useState({
    city: null,
    district: null,
    planNumber: 0,
    landNumber: 0,
    wayOfChooseingInvestSite: null,
    loading: false,
    showMsgModal: false,
  });
  const [plans, setPlans] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [lands, setLands] = useState([]);
  const [form] = Form.useForm();
  // }

  useEffect(() => {
    console.log("trace componentDidUpdate in add sites comp");
  });

  // componentWillUnmount(){
  useEffect(() => {
    return () => {
      console.log("un mount from add lands");
      setPlans([]);
      setDistricts([]);
      setLands([]);
      setState({
        loading: false,
        showMsgModal: false,
        district: "",
        wayOfChooseingInvestSite: "",
        landNumber: "",
        planNumber: "",
        city: "",
      });
      diactivateMultiSelect();
      props.showTable(false);
      props.emptyTempSelectedFeats();
      props.closeLoader();
      window.__map__.getLayer("graphicLayer_Multi_Select").clear();
      return null;
    };
  }, []);

  const diactivateMultiSelect = (e) => {
    props.diActivateMultiSelectButton();
    let selectionToolbar = window.__MultiSelect__;
    selectionToolbar.deactivate();
    window.__map__.enablePan();
    window.__map__.enableMapNavigation();
  };
  const deSelectCity = (e) => {
    setPlans([]);
    setDistricts([]);
    setLands([]);
    setState({
      // plans: [],
      // districts: [],
      loading: false,
      showMsgModal: false,
      district: "",
      wayOfChooseingInvestSite: "",
      landNumber: "",
      planNumber: "",
      city: "",
    });
    form.resetFields();
  };
  const handleSelect = (name) => (e) => {
    let whereCondition;
    switch (name) {
      case "city":
        if (e) {
          form.setFieldsValue({
            city: e,
            district: null,
            planNumber: null,
            landNumber: null,
            // wayOfChooseingInvestSite: null,
          });

          setState({
            ...state,
            city: e,
            district: null,
            planNumber: null,
            landNumber: null,
            // wayOfChooseingInvestSite:""
          });
          zoomToParticularArea(`MUNICIPALITY_NAME=${e}`, props);
          catchPlans(e, setPlans);
          catchDistricts(e, setDistricts);
          catchLands(e, setLands);
        }
        break;
      case "planNumber":
        setState({ ...state, [name]: e });
        if (e && state.city) {
          whereCondition = `MUNICIPALITY_NAME=${state.city} AND PLAN_NO='${e}'`;
        } else if (state.city && state.district) {
          whereCondition = `MUNICIPALITY_NAME=${state.city} AND DISTRICT_NAME=${state.district}`;
        } else if (state.city) {
          whereCondition = `MUNICIPALITY_NAME=${state.city}`;
        } else whereCondition = "";
        if (whereCondition) zoomToParticularArea(whereCondition, props);
        break;
      case "district":
        setState({ ...state, [name]: e });
        if (e && state.city) {
          whereCondition = `MUNICIPALITY_NAME=${state.city} AND DISTRICT_NAME=${e}`;
        } else if (state.city && state.planNumber) {
          whereCondition = `MUNICIPALITY_NAME=${state.city} AND PLAN_NO='${state.planNumber}'`;
        } else if (state.city) {
          whereCondition = `MUNICIPALITY_NAME=${state.city}`;
        } else whereCondition = "";
        if (whereCondition) zoomToParticularArea(whereCondition, props);
        break;
      case "landNumber":
        setState({ ...state, [name]: e });
        if (e && state.city) {
          whereCondition = `MUNICIPALITY_NAME=${state.city} AND PARCEL_PLAN_NO='${e}'`;
        } else if (state.city && state.district) {
          whereCondition = `MUNICIPALITY_NAME=${state.city} AND DISTRICT_NAME=${state.district}`;
        } else if (state.city) {
          whereCondition = `MUNICIPALITY_NAME=${state.city}`;
        } else whereCondition = "";
        if (whereCondition) zoomToParticularArea(whereCondition, props);
        break;

      case "wayOfChooseingInvestSite":
        if (e !== state.wayOfChooseingInvestSite) {
          if (!state.wayOfChooseingInvestSite) {
            props.disactivateSingleSelect();
            props.clearSelection();
            clearAllGraphicLayers(window.__map__);
            setState({ ...state, [name]: e });
          } else {
            setState({
              ...state,
              [name]: e,
              city: null,
              district: null,
              planNumber: null,
              landNumber: null,
            });
            form.setFieldsValue({
              landNumber: null,
              city: null,
              district: null,
              planNumber: null,
            });
          }
          if (e === "selectFromMap") {
            props.disactivateSingleSelect();
            props.clearSelection();
            clearAllGraphicLayers(window.__map__);
            props.activateMultiSelectButton("PARCELS");
            form.validateFields();
            
          } else {
            diactivateMultiSelect();
            props.emptyTempSelectedFeats();
            removeAllTempGraphics("graphicLayer_Multi_Select");
          }
        } else {
          return;
        }
        break;
    }
  };

  const renderDomainSelect = (fieldname) => {
    const { fields } = props;
    if (!fields) return null;

    var layername = "INVEST_SITE_POLYGON".toLocaleLowerCase();
    var domain = fields[layername].find((field) => field.name == fieldname)
      .domain.codedValues;
    if (fieldname === "MUNICIPALITY_NAME")
      domain = sortAlphabets(domain, "name");
    return domain.map((cv) => (
      <Select.Option key={cv.code} className="text-right" value={cv.code}>
        {cv.name}
      </Select.Option>
    ));
  };
  const renderPlans = () => {
    // const { plans } = state;
    return plans.map((p) => (
      <Select.Option
        key={p.attributes.PLAN_NO}
        className="text-right"
        value={p.attributes.PLAN_NO}
      >
        {p.attributes.PLAN_NO}
      </Select.Option>
    ));
  };

  const renderDistricts = () => {
    // const { districts } = state;
    return districts.map((d) => (
      <Select.Option
        key={d.attributes.DISTRICT_NAME_Code}
        className="text-right"
        value={d.attributes.DISTRICT_NAME_Code}
      >
        {d.attributes.DISTRICT_NAME}
      </Select.Option>
    ));
  };
  const renderLands = () => {
    // const { lands } = state;
    return lands.map((land) => (
      <Select.Option
        key={land.PARCEL_PLAN_NO}
        className="text-right"
        value={land.PARCEL_PLAN_NO}
      >
        {land.PARCEL_PLAN_NO}
      </Select.Option>
    ));
  };
  const notificationNoData = () => {
    const args = {
      description: "لم يتم اختيار موقع استثماري",
      duration: 3,
    };
    notification.open(args);
  };

  const notificationDuplicatedData = () => {
    const args = {
      description: "تم اختيار هذه الأرض من قبل",
      duration: 3,
    };
    notification.open(args);
  };

  const notificationByAdding = () => {
    const args = {
      description: "تم الإضافة بنجاح بجدول الإضافة",
      duration: 3,
    };
    notification.open(args);
  };

  const notificationOfIntesectExistingInvest = () => {
    const args = {
      description:
        "الموقع الاستثماري المراد اضافته يتقاطع مع مواقع استثمارية مستغلة" +
        " هل تريد الاستمرار في إضافة الموقع مع وجود تداخل مع موقع استثماري ",
      duration: 3,
    };
    notification.open(args);
  };

  const approveIntesectedInvestSites = () => {
    let selectedFeats = props.tempSelectedFeaturesData;
    props.addLandToAddLandsTable(selectedFeats);
    props.showTable(true);
    notificationByAdding();
    setState({ showMsgModal: false });
  };
  const rejectIntesectedInvestSites = () => {
    props.emptyTempSelectedFeats();
    let graphicLayerOfAddedFeats = window.__map__.getLayer(
      "graphicLayer_Multi_Select"
    );
    graphicLayerOfAddedFeats.clear();
    if (props.tableSettings && props.tableSettings.result.length)
      props.showTable(true);
    else props.showTable(false);
    setState({ showMsgModal: false });
  };

  const addLocationFromCharts = () => {
    let selectedFeats = props.tempSelectedFeaturesData;
    //adding land fron parcel layer is disable now> just selecting from map
    if (state.city !== "" && state.landNumber !== 0 && state.landNumber) {
      // props.showTable(true);
      props.emptyTempSelectedFeats();
    } else {
      if (selectedFeats.length) {
        //if there are some lands intesect with invest site polygons --> show msg
        let landsIntesectedWithInvestPolygons = selectedFeats.filter(
          (f) => f.isInvestitePolygon
        );
        if (landsIntesectedWithInvestPolygons.length) {
          setState({ showMsgModal: true });
        } else {
          props.addLandToAddLandsTable(selectedFeats);
          props.showTable(true);
          notificationByAdding();
          props.emptyTempSelectedFeats();
        }
      }
    }
  };
  const handleDeselect = (e) => {
    setState({ ...state, landNumber: "" });
  };
  function removeAllTempGraphics(graphicLayerName) {
    //1- remove all temp graphics from map
    let graphicLayerOfMultiSelect = window.__map__.getLayer(graphicLayerName);
    let allGraphics = graphicLayerOfMultiSelect.graphics;
    let prevSelectedFeatures = props.tempSelectedFeaturesData;
    //remove selected temp graphics
    if (prevSelectedFeatures.length) {
      for (let i = 0; i < prevSelectedFeatures.length; i++) {
        const selectedFeat = prevSelectedFeatures[i];
        for (let j = 0; j < allGraphics.length; j++) {
          const graphic = allGraphics[j];
          if (graphic.attributes.id === selectedFeat.id)
            graphicLayerOfMultiSelect.remove(graphic);
        }
      }
    }
  }
  // render() {
  return (
    <>
      <div className="coordinates mb-4">
        {state.loading == true ? <Loader /> : null}
        <h3 className="mb-2">إضافة موقع من طبقة الأراضي </h3>
        <Container>
          <div className="row">
            <span
              style={{
                width: "90%",
                whiteSpace: "pre-wrap",
                textAlign: "start",
                margin: "auto",
                direction: "rtl",
                margin: "1vw",
                padding: "0.5vw",
                background: "antiquewhite",
              }}
            >
              ** إدخالك للبلدية والحي ورقم المخطط هنا فقط لتسهيل ابحارك على
              الخريطة
            </span>
          </div>
          <Form
            form={form}
            className="GeneralForm"
            layout="vertical"
            name="validate_other"
          >
            <Form.Item
              hasFeedback={state.wayOfChooseingInvestSite ? true : false}
              name="wayOfChooseingInvestSite"
              rules={[
                {
                  message: "من فضلك اختر طريقة اختيار الموقع الاستثماري",
                  required: true,
                },
              ]}
            >
              <Select
                allowClear
                showSearch
                onDeselect={diactivateMultiSelect}
                onClear={() => {
                  setState({ ...state, wayOfChooseingInvestSite: "" });
                  diactivateMultiSelect();
                }}
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
                className="dont-show"
                onSelect={handleSelect("wayOfChooseingInvestSite")}
                value={state.wayOfChooseingInvestSite}
                placeholder=" طريقة اختيار الموقع الاستثماري"
                getPopupContainer={(trigger) => trigger.parentNode}
              >
                <Select.Option
                  key="landNo"
                  className="text-right"
                  value="landNo"
                  disabled
                >
                  ادخال رقم قطعة الأرض
                </Select.Option>
                <Select.Option
                  key="selectFromMap"
                  className="text-right"
                  value="selectFromMap"
                >
                  التحديد من الخريطة مباشرة
                </Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              hasFeedback={state.city ? true : false}
              name="city"
              rules={
                state.wayOfChooseingInvestSite !== "selectFromMap"
                  ? [
                      {
                        message: "من فضلك ادخل البلدية",
                        required: true,
                      },
                    ]
                  : null
              }
            >
              <Select
                allowClear
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
                className="dont-show"
                onChange={handleSelect("city")}
                onDeselect={deSelectCity}
                onClear={deSelectCity}
                value={state.city}
                placeholder="البلدية"
                getPopupContainer={(trigger) => trigger.parentNode}
              >
                {renderDomainSelect("MUNICIPALITY_NAME")}
              </Select>
            </Form.Item>
            <Form.Item
              // hasFeedback
              name="district"
            >
              <Select
                allowClear
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
                className="dont-show"
                onChange={handleSelect("district")}
                value={state.district}
                placeholder="الحي"
                getPopupContainer={(trigger) => trigger.parentNode}
              >
                {renderDistricts()}
              </Select>
            </Form.Item>{" "}
            <Form.Item
              // hasFeedback
              name="planNumber"
            >
              <Select
                name="planNumberSelect"
                allowClear
                showSearch
                filterOption={(input, option) => {
                  return (
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0 ||
                    option.children
                      .toLowerCase()
                      .indexOf(convertNumbersToEnglish(input.toLowerCase())) >=
                      0 ||
                    option.children
                      .toLowerCase()
                      .indexOf(
                        convertEngNumbersToArabic(input.toLowerCase())
                      ) >= 0
                  );
                }}
                className="dont-show"
                onChange={handleSelect("planNumber")}
                value={state.planNumber}
                placeholder="رقم المخطط"
                getPopupContainer={(trigger) => trigger.parentNode}
              >
                {renderPlans()}
              </Select>
            </Form.Item>
            {state.wayOfChooseingInvestSite === "landNo" && state.city ? (
              <>
                <Form.Item
                  hasFeedback={state.landNumber ? true : false}
                  name="landNumber"
                  rules={[
                    {
                      message: "من فضلك ادخل رقم الأرض",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    allowClear
                    onClear={handleDeselect}
                    showSearch
                    filterOption={(input, option) => {
                      return (
                        option.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0 ||
                        option.children
                          .toLowerCase()
                          .indexOf(
                            convertNumbersToEnglish(input.toLowerCase())
                          ) >= 0 ||
                        option.children
                          .toLowerCase()
                          .indexOf(
                            convertEngNumbersToArabic(input.toLowerCase())
                          ) >= 0
                      );
                    }}
                    className="dont-show"
                    onSelect={handleSelect("landNumber")}
                    value={state.landNumber}
                    placeholder="رقم الأرض"
                    getPopupContainer={(trigger) => trigger.parentNode}
                  >
                    {renderLands()}
                  </Select>
                </Form.Item>
              </>
            ) : state.wayOfChooseingInvestSite === "selectFromMap" ? (
              <>
                <span
                  className="row p-2"
                  style={{
                    // textAlign: "right",
                    width: "90%",
                    whiteSpace: "pre-wrap",
                    textAlign: "start",
                    margin: "auto",
                    direction: "rtl",
                    display: "flow-root",
                  }}
                >
                  * حدد قطعة الأرض من الخريطة من خلال زر التحديد يسار الخريطة
                  <i
                    className="fas fa-1x fa-expand ml-2"
                    style={{
                      marginRight: "15px",
                      background: "black",
                      color: "white",
                      padding: "6px",
                    }}
                  ></i>
                  ثم اضغط اضافة
                </span>
                <span
                  className="row p-2"
                  style={{
                    // textAlign: "right",
                    width: "90%",
                    whiteSpace: "pre-wrap",
                    textAlign: "start",
                    margin: "auto",
                    direction: "rtl",
                    display: "flow-root",
                  }}
                >
                  * ولإلغاء التحديد من الخريطة من زر التحديد
                  بالضغط على الموقع المحدد
                </span>
              </>
            ) : null}
            <Row>
              <Col span={24}>
                <Button
                  disabled={
                       state.wayOfChooseingInvestSite === "selectFromMap" &&
                        props.tempSelectedFeaturesData.length > 0
                      ? false
                      : true
                  }
                  onClick={addLocationFromCharts}
                  className="SearchBtn mt-3"
                  size="large"
                  htmlType="submit"
                >
                  إضافة
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>
      {/* Modal to show intersect with invest sites */}
      <Modal
        style={{ textAlign: "right" }}
        show={state.showMsgModal}
        onHide={() => setState({ showMsgModal: false })}
        backdrop="static"
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header>
          <Modal.Title>!! انتبه</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col span={24} className="px-3 m-3">
              <strong style={{ fontSize: "18px" }}>
                {" "}
                بعض الأراضي تتقاطع مع مواقع استثمارية موجودة هل تريد الاستمرار؟؟
              </strong>
            </Col>
          </Row>
          <Button
            className="cancelbtn"
            onClick={() => rejectIntesectedInvestSites()}
          >
            لا
          </Button>
          <Button
            className="addbtn"
            onClick={() => approveIntesectedInvestSites()}
          >
            نعم
          </Button>
        </Modal.Body>
      </Modal>
    </>
  );
  // }
}
const mapDispatchToProps = (dispatch) => {
  return {
    addLandToAddLandsTable: (data) =>
      dispatch({ type: "ADD_TO_TABLE_DATA_SET", data }),
    pushContentToModal: (data) =>
      dispatch({ type: "TABLE_ICON_MODAL_DATA_SET", data }),
    clearTableData: () => dispatch({ type: "CLEAR_RESULT_TABLE_DATA_SET" }),
    activateMultiSelectButton: (layerName) =>
      dispatch({
        type: "ACTIVATE_MULTI_SELECT",
        layerName,
        typeUse: "addSites",
      }),
    diActivateMultiSelectButton: () =>
      dispatch({ type: "DIACTIVATE_MULTI_SELECT" }),
    emptyTempSelectedFeats: () => dispatch({ type: "EMPTY_DATA_FROM_TEMP" }),
    clearSelection: () => dispatch({ type: "CLEAR_SELECTED" }),
    disactivateSingleSelect: () =>
    dispatch({ type: "DIACTIVATE_SINGLE_SELECT" }),
  };
};

const mapStateToProps = ({ mapUpdate }) => {
  const { fields, currentUser, tableSettings, tempSelectedFeaturesData } =
    mapUpdate;
  return {
    fields,
    currentUser,
    tableSettings,
    tempSelectedFeaturesData,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddLocationFromCharts);

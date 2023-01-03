import React, { Component } from "react";
import { connect } from "react-redux";
import { Container } from "react-bootstrap";
import { Row, Col, Input, Form, Button, Select, notification } from "antd";
import {
  catchPlans,
  catchDistricts,
  zoomToParticularArea,
  catchLands,
  checkIsDataComplete,
} from "./helpers/common_func";
import {
  clearAllGraphicLayers,
  convertEngNumbersToArabic,
  convertNumbersToEnglish,
  getLayerIndex,
  LoadModules,
  queryTask,
} from "../common/mapviewer";
import { useState } from "react";
import { useEffect } from "react";
import { sortAlphabets } from "../../helpers/utlis/utilzFunc";

function UpdateLocationInfo (props){
  const [form] = Form.useForm()
  // constructor(props) {
    // super(props);
    // state = {
     const [state, setState]=useState({
      city: "",
      typeOfEditedData: "",
      wayOfChooseingInvestSite: "",
      district: "",
      planNumber: 0,
      landNumber: 0,
      loading: false,
      // plans: [],
      // districts: [],
      // lands: [],
    })
    const [plans, setPlans] = useState([])
    const [lands, setLands] = useState([])
    const [districts, setDistricts] = useState([])
  // } 
 const deSelectCity = (e) => {
    form.setFieldsValue({
      // city: null,
      typeOfEditedData: null,
      wayOfChooseingInvestSite: null,
      district: null,
      planNumber: null,
      landNumber: null,
    })
    setPlans([]);
    setDistricts([]);
    setLands([]);
    setState({
      city: "",
      typeOfEditedData: "",
      wayOfChooseingInvestSite: "",
      district: "",
      planNumber: 0,
      landNumber: 0,
      loading: false,

    });
  };
  const handleDeselect = (e) =>{
    setState({...state,landNumber:"" })
  }
 const deSelectTypeOfEditedData = (e) => {
    props.diActivateMultiSelectButton();
    // setState({...state, landNumber:''})
  };
  const handleSelect = (name) => (e) => {
    if(name==="typeOfEditedData"&&e==="ADVERTISING_BOARDS"){
      setState({...state, [name]: e ,"landNumber":'',"wayOfChooseingInvestSite":""})
      form.setFieldsValue({landNumber:null, wayOfChooseingInvestSite:null })
    }
    else if(name==="typeOfEditedData"&&e.toLowerCase()==="invest_site_polygon"){
      form.setFieldsValue({ landNumber:null, wayOfChooseingInvestSite:null  })
      setState({...state, [name]: e ,"landNumber":'', wayOfChooseingInvestSite:""})
    }
    else if(name==="landNumber"){
      setState({...state,[name]: convertNumbersToEnglish(e) })
    }
    else
    setState({ ...state ,[name]: e });

    let whereCondition;
    switch (name) {
      case "city":
        // form.resetFields();
        form.setFieldsValue({city:e,district:null, planNumber:null, landNumber:null,
          // wayOfChooseingInvestSite:null, 
          // typeOfEditedData:null
        })
        if (e) {
              setState({ ...state,
                city: e,
                district: "",
                planNumber: "",
                landNumber: "", 
              });
              zoomToParticularArea(`MUNICIPALITY_NAME=${e}`, props);
              catchPlans(e, setPlans);
              catchDistricts(e, setDistricts);
              catchLands(e, setLands);
        }
        break;
      case "planNumber":
        if (e && state.city) {
          whereCondition = `MUNICIPALITY_NAME=${state.city} AND PLAN_NO='${e}'`;
        } else if (state.city && state.district) {
          whereCondition = `MUNICIPALITY_NAME=${state.city} AND DISTRICT_NAME=${state.district}`;
        } else if (state.city) {
          whereCondition = `MUNICIPALITY_NAME=${state.city}`;
        } else whereCondition = "";
        if (whereCondition) {
        
          zoomToParticularArea(whereCondition, props);
        }
        break;
      case "district":
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
        let landNo = convertNumbersToEnglish(e)
        if (e && state.city) {
          whereCondition = `MUNICIPALITY_NAME=${state.city} AND (PARCEL_PLAN_NO='${landNo}' OR PARCEL_PLAN_NO='${convertEngNumbersToArabic(landNo)}')`;
        } else if (state.city && state.district) {
          whereCondition = `MUNICIPALITY_NAME=${state.city} AND DISTRICT_NAME=${state.district}`;
        } else if (state.city) {
          whereCondition = `MUNICIPALITY_NAME=${state.city}`;
        } else whereCondition = "";
        console.log(whereCondition);
        if (whereCondition) zoomToParticularArea(whereCondition, props);
        break;
      case "wayOfChooseingInvestSite":
          form.setFieldsValue({city:null,district:null, planNumber:null, landNumber:null,
            wayOfChooseingInvestSite:e, 
            // typeOfEditedData:null
          })
          props.emptyTempSelectedFeats()
          if(!state.wayOfChooseingInvestSite){
            props.disactivateSingleSelect();
                props.clearSelection();
                clearAllGraphicLayers(window.__map__);
          }
          if (e) {
                setState({ ...state,
                  city: null,
                  district: null,
                  planNumber: null,
                  landNumber: null, 
                  wayOfChooseingInvestSite:e
                  // typeOfEditedData:null
                });
              if(e==="selectFromMap") {
                props.disactivateSingleSelect();
                props.clearSelection();
                clearAllGraphicLayers(window.__map__);
                props.activateMultiSelectButton(state.typeOfEditedData);
                form.validateFields()
              }
              else {
                deSelectTypeOfEditedData();
                  //first remove all temp graphics 
                  removeAllTempGraphics("graphicLayer_Multi_Select");     
              }
            }
        else return;
        break;
        case "typeOfEditedData":
          if(e==="ADVERTISING_BOARDS") {
            //1- remove all temp graphics from map
            removeAllTempGraphics("graphicLayer_Multi_Select");
            props.emptyTempSelectedFeats();
            deSelectTypeOfEditedData()
            // props.activateMultiSelectButton(e);
          }
      else {
        deSelectTypeOfEditedData()
          //first remove all temp graphics 
        removeAllTempGraphics("graphicLayer_Multi_Select");
        props.emptyTempSelectedFeats()
      }
          break;
    }
  };
function removeAllTempGraphics(graphicLayerName){
     //1- remove all temp graphics from map
     let graphicLayerOfMultiSelect = window.__map__.getLayer(
      graphicLayerName
    );
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
  useEffect(()=>{
    console.log("trace componentDidUpdate in update sites comp");
  })

  // componentWillUnmount() {
  useEffect(() => {
    
    return () => {
      console.log("un mount from add lands");
      // setState(null)
      setPlans([]);
      setDistricts([]);
      setLands([]);
      setState({
        city: "",
        typeOfEditedData: "",
        wayOfChooseingInvestSite: "",
        district: "",
        planNumber: 0,
        landNumber: 0,
        loading: false,
      });  
      
      props.clearTableData();
      props.diActivateMultiSelectButton();
      props.emptyTempSelectedFeats();
      let selectionToolbar = window.__MultiSelect__;
      selectionToolbar.deactivate();
      window.__map__.enablePan();
      window.__map__.enableMapNavigation();
      props.showTable(false);
      props.closeLoader();
      window.__map__.getLayer("graphicLayer_Multi_Select").clear();
   return null
    }
  },[])  
  // }

  const renderDomainSelect=(fieldname)=> {
    const { fields } = props;
    if (!fields) return null;

    var layername = "INVEST_SITE_POLYGON".toLocaleLowerCase();
    var domain = fields[layername].find((field) => field.name == fieldname)
      .domain.codedValues;
    if(fieldname==="MUNICIPALITY_NAME") domain = sortAlphabets(domain,"name");
    return domain.map((cv) => (
      <Select.Option key={cv.code} className="text-right" value={cv.code}>
      {cv.name}
      {fieldname === "SITE_COMMON_USE" ? (
        <img
          className="server-img-icon"
          src={`${window.imagesServerUrl}/${
            cv.code || cv.SITE_COMMON_USE_Code
          }.png`}
          alt="img"
        />
      ) :fieldname==="SITE_STATUS"?(
        <img
        className="server-img-icon-svg"
        src={`${window.imagesServerUrl}/SITE_MAIN_ACTIVITY_FORAS/${
          cv.code==2?"222":cv.code==3?"111":cv.code==4?"333":""
        }.svg`}
        alt="img"
      />
      ): (
        ""
      )}
    </Select.Option>
    ));
  }
const renderPlans=()=> {
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
  }

 const renderDistricts=()=> {
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
  }

const  renderLands=()=> {
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
  }
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
      description: "تم الإضافة بنجاح بجدول التحديث",
      duration: 3,
    };
    notification.open(args);
  };

 const notificationOfWrongLandNo = () => {
    const args = {
      description: "رقم الأرض غير صحيح. أدخل رقم صحيح لقطعة الأرض ",
      duration: 3,
    };
    notification.open(args);
  };

 const updateLocationInfo =async () => {
    if (state.city && state.landNumber&& state.landNumber) {
      props.openLoader();
     await LoadModules([   "esri/graphic",
     "esri/symbols/SimpleFillSymbol",
     "esri/symbols/SimpleLineSymbol",
     "esri/Color",
     "esri/graphicsUtils",]).then(async(
       [ Graphic,SimpleFillSymbol,SimpleLineSymbol,Color,graphicsUtils]
      )=>{
      let layername = "Invest_Site_Polygon".toLowerCase();
      const layerIndex = getLayerIndex(layername);
      let getDataFromLayerPromise = new Promise((resolve, reject) => {
        queryTask({
          returnGeometry: true,
          url: `${window.__mapUrl__}/${layerIndex}`,
          outFields: ["*"],
          where: `MUNICIPALITY_NAME=${state.city} AND (PARCEL_PLAN_NO='${state.landNumber}' OR PARCEL_PLAN_NO='${convertEngNumbersToArabic(state.landNumber)}')`,
          callbackResult: async({ features }) => {
            console.log(features);
            // getFeatureDomainName(features, layerIndex).then((rf) => {
            if (features.length) {
              let graphicLayer = window.__map__.getLayer("graphicLayer_Multi_Select");
        
              if (features.length)
             {
             

              await  features.forEach(async (feat) => {
              var sfs =await new SimpleFillSymbol(
                  SimpleFillSymbol.STYLE_SOLID,
                  new SimpleLineSymbol(
                    SimpleLineSymbol.STYLE_SOLID,
                    new Color([255, 120, 125]),
                    5
                    ),
                    new Color([255,224,0,0.7])
                    );
                    let graphic = new Graphic(feat.geometry, sfs,
                      layername.toLowerCase()==="parcels"?
                      {
                        id:feat.attributes.OBJECTID
                      }:{
                        id:feat.attributes.SITE_GEOSPATIAL_ID
                      });
                graphicLayer.add(graphic);
      
              });
              let feats =
              window.__map__.getLayer(
                "graphicLayer_Multi_Select"
              ).graphics;
            let featsExtent =
              graphicsUtils.graphicsExtent(feats);
            window.__map__.setExtent(
              featsExtent.expand(3)
            );
       

          }
              resolve({ layername, data: features });}
            else resolve({ layername, data: [] });
            // });
          },
          callbackError: (err) => {
            props.closeLoader();
            notificationOfWrongLandNo()
            reject(err)
          },
        });
      });
      getDataFromLayerPromise
        .then((result) => {
          let promises = [];
          if (result.data.length) {
            result.data.forEach((feat) => {
              promises.push(
                new Promise((resolveFunc, rejectFunc) => {
                  let tblIndex, tblName;
                  switch (feat.attributes.SITE_SUBTYPE) {
                    case 1:
                      tblIndex = getLayerIndex("TBL_BUILDING_DATA");
                      tblName = "TBL_BUILDING_DATA";
                      break;
                    case 2:
                      tblIndex = getLayerIndex("TBL_BOARDS_GROUP");
                      tblName = "TBL_BOARDS_GROUP";
                      break;
                    case 3:
                      tblIndex = getLayerIndex("TBL_TOWERS");
                      tblName = "TBL_TOWERS";
                      break;
                    case 5:
                      tblIndex = getLayerIndex("TBL_ELEC_STATION");
                      tblName = "TBL_ELEC_STATION";
                      break;
                    case 6:
                      tblIndex = getLayerIndex("TBL_ATM");
                      tblName = "TBL_ATM";
                      break;
                  }
                  if(tblIndex)
                  queryTask({
                    returnGeometry: false,
                    url: `${window.__mapUrl__}/${tblIndex}`,
                    outFields: ["*"],
                    where: `SITE_GEOSPATIAL_ID=${feat.attributes.SITE_GEOSPATIAL_ID}`,
                    callbackResult: ({ features }) => {
                      console.log(features);
                      // getFeatureDomainName(features, layerIndex).then((rf) => {
                      if (features.length)
                        resolveFunc({
                          layername,
                          tblData: features[0].attributes,
                          data: feat.attributes,
                          // geometry: feat.geometry,
                          tblName,
                        });
                      else
                        resolveFunc({
                          layername,
                          tblName,
                          tblData: null,
                          data: feat.attributes,
                          //  geometry: feat.geometry
                        });
                      // });
                    },
                    callbackError: (err) => {
                      // rejectFunc(err);
                      resolveFunc({
                        layername,
                        tblData: null,
                        tblName,
                        data: feat.attributes,
                        // geometry: feat.geometry,
                      });
                    },
                  });
                  else   resolveFunc({
                    layername,
                    tblName,
                    tblData: null,
                    data: feat.attributes,
                    //  geometry: feat.geometry
                  });
                })
              );
            });
          }
          return promises;
        })
        .then((promises) => {
          let { tableSettings } = props;
          if (promises.length)
            Promise.all(promises).then((resultAll) => {
              console.log(resultAll);
              let resultArray = [];
              resultAll.forEach((item) => {
                let featureAtrributes = item.data;

                let resultToAddToTable = {
                  // geometry:item.geometry,
                  layername: item.layername,
                  fieldsBeforeEdit: featureAtrributes,
                  fieldsForEdit: featureAtrributes,
                  isChecked: false,
                  isDeleted: false,
                  isCompletedFilled: checkIsDataComplete(item),
                  id: featureAtrributes.SITE_GEOSPATIAL_ID,
                  landNumber: featureAtrributes.PARCEL_PLAN_NO,
                  //if not adverte board
                  bordersLengthFromPlanDataBefore:
                    getLayerIndex(item.layername) ===
                    getLayerIndex("invest_site_polygon")
                      ? featureAtrributes
                      : null, //from invest site Boundaries
                  bordersLengthFromPlanDataAfter:
                    getLayerIndex(item.layername) ===
                    getLayerIndex("invest_site_polygon")
                      ? featureAtrributes
                      : null, //from invest site Boundaries

                  //if ATM
                  atmDataBefore:
                    featureAtrributes.SITE_SUBTYPE == 6 ? item.tblData : null,
                  atmDataAfter:
                    featureAtrributes.SITE_SUBTYPE == 6 ? item.tblData : null,

                  //if tower
                  towerDataBefore:
                    featureAtrributes.SITE_SUBTYPE == 3 ? item.tblData : null,
                  towerDataAfter:
                    featureAtrributes.SITE_SUBTYPE == 3 ? item.tblData : null,

                  //if elec station
                  elecStationDataBefore:
                    featureAtrributes.SITE_SUBTYPE == 5 ? item.tblData : null,
                  elecStationDataAfter:
                    featureAtrributes.SITE_SUBTYPE == 5 ? item.tblData : null,

                  //if building
                  buildingDataBefore:
                    featureAtrributes.SITE_SUBTYPE == 1 ? item.tblData : null,
                  buildingDataAfter:
                    featureAtrributes.SITE_SUBTYPE == 1 ? item.tblData : null,

                  //if ads
                  adBoardsDataBefore:
                    featureAtrributes.SITE_SUBTYPE == 2 ? item.tblData : null,
                  adBoardsDataAfter:
                    featureAtrributes.SITE_SUBTYPE == 2 ? item.tblData : null,
                };

                if (
                  tableSettings &&
                  tableSettings.result.findIndex(
                    (item) =>
                      item.fieldsForEdit.SITE_GEOSPATIAL_ID ===
                      featureAtrributes.SITE_GEOSPATIAL_ID
                  ) !== -1
                ) {
                  notificationDuplicatedData();
                } else resultArray.push(resultToAddToTable);
              });
              if (resultArray.length) {
                props.addLandToCountedTable(resultArray);
                notificationByAdding();
                props.showTable(true);
              }

              props.closeLoader();
              // deSelectCity();
            });
        });
      })
    } else if (props.tempSelectedFeaturesData.length) {
      props.addLandToCountedTable(props.tempSelectedFeaturesData);
      notificationByAdding();
      props.showTable(true);
      props.emptyTempSelectedFeats();
      props.closeLoader();
      // deSelectCity()
    }
 
  };
 
  // render() {
    return (
      <div className="coordinates mb-4">
        {/* {state.loading == true ? <Loader /> : null} */}
        <h3 className="mb-2">تحديث بيانات المواقع الإستثمارية </h3>
        <Container>
          <Form 
          className="GeneralForm" 
          layout="vertical" 
          name="validate_other" 
          form={form}
          >
   <>
                <Form.Item
                  hasFeedback={state.typeOfEditedData?true:false}
                  name="typeOfEditedData"
                  rules={[
                    {
                      message:
                        "من فضلك اختر نوع المواقع الاستثمارية المراد تحديثها",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    allowClear
                    onDeselect={deSelectTypeOfEditedData}
                    onClear={deSelectTypeOfEditedData}
                    showSearch
                    filterOption={(input, option) =>{
                      if (
                        typeof option.children === "object"
                      )
                        return (
                          option.children[0]
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        );
                      else return -1;
                      }
                    }
                    className="dont-show"
                    onChange={handleSelect("typeOfEditedData")}
                    value={state.district}
                    placeholder=" نوع المواقع الاستثمارية المراد تحديثها"
                    getPopupContainer={(trigger) => trigger.parentNode}
                  >
                    <Select.Option
                      key="Invest_Site_Polygon"
                      className="text-right"
                      value="Invest_Site_Polygon"
                    >
                      أراضي المواقع الاستثمارية
                      <img
                        className="server-img-icon-svg"
                        src={`${window.imagesServerUrl}/SITE_MAIN_ACTIVITY_FORAS/555.svg`}
                        alt="img"
                      />
                    </Select.Option>
                    <Select.Option
                      key="ADVERTISING_BOARDS"
                      className="text-right"
                      value="ADVERTISING_BOARDS"
                    >
                      اللوحات الإعلانية
                      <img
                        className="server-img-icon-svg m-2 ad-boards"
                        src={`${window.imagesServerUrl}/SITE_MAIN_ACTIVITY_FORAS/444.svg`}
                        alt="img"
                      />
                    </Select.Option>
                  </Select>
                </Form.Item>
              </>
            {
            (state.typeOfEditedData
              // &&state.typeOfEditedData!=="ADVERTISING_BOARDS"
              )&&
            <Form.Item
                  hasFeedback={state.wayOfChooseingInvestSite?true:false}
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
                    onDeselect={deSelectTypeOfEditedData}
                    onClear={deSelectTypeOfEditedData}
                    filterOption={(input, option) =>{
                      if (
                        typeof option.children === "object"
                      )
                        return (
                          option.children[0]
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        );
                      else return -1;
                      }
                    }
                    className="dont-show"
                    onSelect={handleSelect("wayOfChooseingInvestSite")}
                    value={state.district}
                    placeholder=" طريقة اختيار الموقع الاستثماري"
                    getPopupContainer={(trigger) => trigger.parentNode}
                  >
                  {state.typeOfEditedData!=="ADVERTISING_BOARDS"&&  <Select.Option
                      key="landNo"
                      className="text-right"
                      value="landNo"
                    >
                      ادخال رقم قطعة الأرض
                    </Select.Option>
                    }
                    <Select.Option
                      key="selectFromMap"
                      className="text-right"
                      value="selectFromMap"
                    >
                      التحديد من الخريطة مباشرة
                    </Select.Option>
                  </Select>
                </Form.Item>
}
            <Form.Item
              hasFeedback={ state.city?true:false}
              name="city"
              
              rules={state.wayOfChooseingInvestSite!=="selectFromMap"&&state.typeOfEditedData!=="ADVERTISING_BOARDS"?[
                {
                  message: "من فضلك ادخل البلدية",
                  required: true,
                }
              ]:null}
            >
              <Select
              name="city"
              allowClear
                showSearch
                filterOption={(input, option) =>{
                  if (
                    typeof option.children === "object"
                  )
                    return (
                      option.children[0]
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    );
                  else return -1;
                  }
                }
                className="dont-show"
                onChange={handleSelect("city")}
                value={state.city}
                onDeselect={deSelectCity}
                onClear={deSelectCity}
                placeholder="البلدية"
                getPopupContainer={(trigger) => trigger.parentNode}
              >
                {renderDomainSelect("MUNICIPALITY_NAME")}
              </Select>
            </Form.Item>
            <Form.Item 
            // hasFeedback
             name="district">
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
            </Form.Item>
            
            <Form.Item 
            // hasFeedback
             name="planNumber">
              <Select
                name="planNumberSelect"
                allowClear
                showSearch
                filterOption={(input, option) =>
                  {
                    return option.children
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0 ||
                    option.children
                    .toLowerCase()
                    .indexOf(convertNumbersToEnglish(input.toLowerCase())) >= 0
                    ||
                    option.children
                    .toLowerCase()
                    .indexOf(convertEngNumbersToArabic(input.toLowerCase())) >= 0
                  }
                }
                className="dont-show"
                onChange={handleSelect("planNumber")}
                value={state.planNumber}
                placeholder="رقم المخطط"
                getPopupContainer={(trigger) => trigger.parentNode}
              >
                {renderPlans()}
              </Select>
            </Form.Item>{" "}
          
            {state.typeOfEditedData === "Invest_Site_Polygon" &&state.city&&
            state.wayOfChooseingInvestSite === "landNo" ? (
              <>
                <Form.Item
                  hasFeedback={state.landNumber?true:false}
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
                    filterOption={(input, option) =>
                      {
                        return option.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0 ||
                        option.children
                        .toLowerCase()
                        .indexOf(convertNumbersToEnglish(input.toLowerCase())) >= 0
                        ||
                        option.children
                        .toLowerCase()
                        .indexOf(convertEngNumbersToArabic(input.toLowerCase())) >= 0
                      }
                    }
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
            ) :(state.wayOfChooseingInvestSite==="selectFromMap"|| state.typeOfEditedData==="ADVERTISING_BOARDS") ? (
              <>
                <span
                  className="row p-2"
                  style={{ 
                    // textAlign: "right",
                    width: '90%',
                    whiteSpace: 'pre-wrap',
                    textAlign: 'start',
                    margin: "auto",
                    direction: 'rtl',
                    display: 'flow-root'
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
                    (state.wayOfChooseingInvestSite==="selectFromMap")&&props.tempSelectedFeaturesData.length
                      ? false:
                      (state.wayOfChooseingInvestSite==="selectFromMap")&&props.tempSelectedFeaturesData.length===0 ?
                      true:false
                  }
                  onClick={updateLocationInfo}
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
    );
  }
// }

const mapDispatchToProps = (dispatch) => {
  return {
    addLandToCountedTable: (data) =>
      dispatch({ type: "ADD_TO_TABLE_DATA_SET", data }),
    pushContentToModal: (data) =>
      dispatch({ type: "TABLE_ICON_MODAL_DATA_SET", data }),
    clearTableData: () => dispatch({ type: "CLEAR_RESULT_TABLE_DATA_SET" }),
    activateMultiSelectButton: (layerName) =>
      dispatch({ type: "ACTIVATE_MULTI_SELECT", layerName, typeUse:"updateSites" }),
    diActivateMultiSelectButton: () =>
      dispatch({ type: "DIACTIVATE_MULTI_SELECT" }),
    emptyTempSelectedFeats: () => dispatch({ type: "EMPTY_DATA_FROM_TEMP" }),
    clearSelection: () => dispatch({ type: "CLEAR_SELECTED" }),
    disactivateSingleSelect: () =>
    dispatch({ type: "DIACTIVATE_SINGLE_SELECT" }),
  };
};

const mapStateToProps = ({ mapUpdate }) => {
  const {
    fields,
    currentUser,
    tableSettings,
    tempSelectedFeaturesData,
  } = mapUpdate;
  return {
    fields,
    currentUser,
    tableSettings,
    tempSelectedFeaturesData,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UpdateLocationInfo);

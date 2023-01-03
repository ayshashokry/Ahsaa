import React, { useState, useRef, useEffect } from "react";
import { Container, Modal } from "react-bootstrap";
import { Row, Col, Input, Form, Button, Tag, Tooltip, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { connect } from "react-redux";
import { notificationMessage } from "../../../../helpers/utlis/notifications_Func";
import {
  getLayerIndex,
  getLayerIndexFromFeatService,
  LoadModules,
  queryTask,
} from "../../../common/mapviewer";
import { TagInput } from "../helpers/Taginput";
import { makeFlashOnAssetsWithSameAuctionNo } from "../../../map/actions";
import { checkTokenExpiration } from "../../../../redux/reducers/map";
import { withRouter } from "react-router-dom";
import { getMapInfo } from "../../../reportMapViewer/common/esriRequest_Func";
function PlanningStudy(props) {
  const {
    singleSelectActive,
    selectedFeatures,
    clearSelection,
    disactivateSingleSelect,
  } = props;
  const formRef = useRef();
  const [surroundActivValidate, setSurroundActivValidate] = useState(true);
  const saveInputRef = (input, ref) => {
    ref.current = input;
  };

  const saveEditInputRef = (input, ref) => {
    ref.current = input;
  };
  const [tagsDataActivities, setTagsDataActivities] = useState({
    tags: [],
    inputVisible: false,
    inputValue: "",
    editInputIndex: -1,
    editInputValue: "",
  });
  const saveInputRecommendationRef = useRef();
  const saveEditInputRecommendationRef = useRef();
  const [tagsDataRecommendation, setTagsDataRecommendation] = useState({
    tags: [],
    inputVisible: false,
    inputValue: "",
    editInputIndex: -1,
    editInputValue: "",
  });
  const saveInputPlanStudyRef = useRef();
  const saveEditInputPlanStudyRef = useRef();
  const [tagsDataPlanStudy, setTagsDataPlanStudy] = useState({
    tags: [],
    inputVisible: false,
    inputValue: "",
    editInputIndex: -1,
    editInputValue: "",
  });
  const saveInputEconomicStudyRef = useRef();
  const saveEditInputEconomicStudyRef = useRef();
  const [tagsDataEconomicStudy, setTagsDataEconomicStudy] = useState({
    tags: [],
    inputVisible: false,
    inputValue: "",
    editInputIndex: -1,
    editInputValue: "",
  });

  const [surroundedActivStates, setSurroundedActivStates] = useState([
    // "distanceFarAwayDistrict":
    {
      key: "distanceFarAwayDistrict",
      value: {
        number: "",
      },
      text: "بعد الموقع عن الحاضرة __ كم",
      type: ["number"],
      displayedText: "بعد الموقع عن الحاضرة",
      active: false,
      edit: false,
    },
    // "facadeOnStreet":
    {
      key: "facadeOnStreet",
      value: {
        number: "",
      },
      text: "طول الواجهة المطلة على الشارع __ م",
      type: ["number"],
      displayedText: "طول الواجهة على الشارع",
      active: false,
      edit: false,
    },
    // "siteNature":
    {
      key: "siteNature",
      value: {
        select: "",
      },
      text: "طبيعة الموقع __",
      type: ["select"],
      displayedText: "طبيعة الموقع",
      dropDownItems: ["جيدة", "متوسطة", "رديئة"],
      active: false,
      edit: false,
    },
    // "numOfStreets":
    {
      key: "numOfStreets",
      value: {
        select: "",
      },
      text: "عدد الشوارع المطلة بالموقع __",
      type: ["select"],
      displayedText: "عدد الشوارع المطلة بالموقع",
      dropDownItems: ["1", "2", "3", "4"],
      active: false,
      edit: false,
    },
    // "highwayType":
    {
      key: "highwayType",
      value: {
        select: "",
      },
      text: "يطل الموقع على طريق __",
      type: ["select"],
      displayedText: "نوع الطريق المطل عليه الموقع",
      dropDownItems: ["فرعي", "رئيسي", "شرياني", "دائري"],
      active: false,
      edit: false,
    },
    // "distanceOfLandmarks":
    {
      key: "distanceOfLandmarks",
      value: {
        select: "",
        number: "",
      },
      text: "يبعد __ عن الموقع بـ __ كم",
      type: ["select", "number"],
      displayedText: "بُعد المعالم المهمة عن الموقع",
      placeholder: ["اختر المعلم", "ادخل المسافة"],
      active: false,
      edit: false,
      dropDownItems: ["المطار", "السكة الحديد"],
    },
    // "surroundActivities":
    {
      key: "surroundActivities",
      value: {
        "multi-select": "",
      },
      text: "الأنشطة المحيطة بالموقع __",
      type: ["multi-select"],
      displayedText: "اختر الأنشطة المحيطة بالموقع",
      dropDownItems: [],
      active: false,
      edit: false,
    },
    // "infastructureServices":
    {
      key: "infastructureServices",
      value: {
        select: "",
      },
      text: "__ خدمات البنية التحتية يالموقع",
      type: ["select"],
      displayedText: "توافر خدمات البنية التحتية",
      dropDownItems: ["لا تتوافر", "تتوافر"],
      active: false,
      edit: false,
    },
    // "buildingDensity":
    {
      key: "buildingDensity",
      value: {
        select: "",
      },
      text: "الكثافة البنائية للمنطقة المحيطة بالموقع __",
      type: ["select"],
      displayedText: "الكثافة البنائية للمنطقة المحيطة",
      dropDownItems: ["عالية", "متوسطة", "ضعيفة"],
      active: false,
    },
  ]);
  const [formData, setFormData] = useState({
    SURROND_ACTIVITIES: {
      mainValue: {
        distanceFarAwayDistrict: "",
        facadeOnStreet: "",
        siteNature: "",
        numOfStreets: "",
        highwayType: "",
        distanceOfLandmarks: "",
        surroundActivities: "",
        infastructureServices: "",
        buildingDensity: "",
      },
      selectValue: "", //of drop down list
    },
    GENERAL_RECOMMANDITION: "",
    PLANNING_STUDY: "",
    PLANNING_STUDY_NOTES: "",
    ECONOMIC_STUDY: "",
    ECONOMIC_STUDY_NOTES: "",
    OBJECTID: "",
  });
  const [surroundedActivStateError, setSurroundedActivStateError] =
    useState("");
  const [editedData, setEditedData] = useState(false); //is tbl data already existing and just edit (true) -> not exitsting and add new data -(false)
  // useEffect(() => {
  //   if(surroundActivValidate)
  //   formRef.current.validateFields(['SURROND_ACTIVITIES']);
  // }, [surroundActivValidate]);
  useEffect(() => {
    //make formRef.current as a dependency to check form loaded first to set values to is if there stored data before
    // if (formRef && formRef.current) {
      props.openLoader();
      let tblIndex = getLayerIndex("TBL_INVEST_STUDY");
      let parcelsIndex = getLayerIndex("PARCELS");
      let promises = [];
      promises.push(
        new Promise((resolve, reject) => {
          queryTask({
            returnGeometry: false,
            url: `${window.__mapUrl__}/${tblIndex}`,
            outFields: ["*"],
            where: `SITE_GEOSPATIAL_ID=${selectedFeatures[0].attributes.SITE_GEOSPATIAL_ID}`,
            callbackResult: ({ features }) => {
              if (features.length) {
                setEditedData(true);
                let formDataToSetToForm = { ...features[0].attributes };
                // delete formDataToSetToForm.OBJECTID;
                delete formDataToSetToForm.SITE_GEOSPATIAL_ID;
                formRef.current.setFieldsValue(formDataToSetToForm);
                // let formData =features[0].attributes;
                let surrActivs =
                  formDataToSetToForm["SURROND_ACTIVITIES"].split(",");
                  formDataToSetToForm["SURROND_ACTIVITIES"]= formData["SURROND_ACTIVITIES"];
                Object.keys(formData.SURROND_ACTIVITIES.mainValue).forEach(
                  (item, index) => {
                    formDataToSetToForm.SURROND_ACTIVITIES.mainValue[item] =
                      surrActivs[index];
                  }
                );
                setSurroundActivValidate(false)
                setFormData({ ...formDataToSetToForm });
                setTagsDataActivities({
                  ...tagsDataActivities,
                  tags: features[0].attributes.SURROND_ACTIVITIES
                    ? features[0].attributes.SURROND_ACTIVITIES.split(",")
                    : [],
                });
                setTagsDataRecommendation({
                  ...tagsDataRecommendation,
                  tags: features[0].attributes.GENERAL_RECOMMANDITION
                    ? features[0].attributes.GENERAL_RECOMMANDITION.split(",")
                    : [],
                });
                setTagsDataPlanStudy({
                  ...tagsDataPlanStudy,
                  tags: features[0].attributes.PLANNING_STUDY
                    ? features[0].attributes.PLANNING_STUDY.split(",")
                    : [],
                });

                setTagsDataEconomicStudy({
                  ...tagsDataEconomicStudy,
                  tags: features[0].attributes.ECONOMIC_STUDY
                    ? features[0].attributes.ECONOMIC_STUDY.split(",")
                    : [],
                });
                resolve(true);
              }
            },
            callbackError: (err) => {
              if (err) {
                props.closeLoader();
                notificationMessage("حدث خطأ ", 4);
                console.error(err);
                resolve(false);
              }
            },
          });
        })
      );
      getMapInfo(window.__mapUrl__).then((res) => {
        console.log(res);
        let parcelsLayersFields = res.info.$layers.layers.find(layer=>layer.id===parcelsIndex)?.fields;
        if(parcelsLayersFields){
          let planUseTypesDomain = parcelsLayersFields.find(d=>d.name==="PLANLANDUSECODE").domain.codedValues;
          let surroundedActivStatesClone = [...surroundedActivStates];
          let activitiesSurrounded = surroundedActivStatesClone.find(s=>s.key==="surroundActivities");
          activitiesSurrounded.dropDownItems=planUseTypesDomain;
          setSurroundedActivStates(surroundedActivStatesClone)
          props.closeLoader();
        }
      });
    // }
    return ()=>{
      setEditedData(false);
      setFormData(null)
      setTagsDataActivities(null)
      setTagsDataRecommendation(null)
      setTagsDataPlanStudy(null)
      setTagsDataEconomicStudy(null)
      props.closeLoader();
    }
  }, [
    // formRef.current
  ]);
  //form func
  const onSubmit = () => {
    let { user, openLoader, closeLoader } = props;
    let formDataClone = { ...formData };
    formDataClone.SURROND_ACTIVITIES = Object.values(
      formDataClone.SURROND_ACTIVITIES.mainValue
    )
      // filter(i=>i).
      .join(",");
    if (!editedData) delete formDataClone.OBJECTID;
    let error;
    // let validates = formRef.current.getFieldsError();
    Object.values(formDataClone).forEach((item) => {
      if (item) return;
      else error = true;
    });
    if(!formDataClone.SURROND_ACTIVITIES.replaceAll(",",'')) error = true
    formRef.current.validateFields(['SURROND_ACTIVITIES']);
    if (error) return;
    openLoader();
    checkTokenExpiration(user, true).then((res) => {
      if (!res) {
        setTimeout(() => {
          notificationMessage("يجب إعادة تسجيل الدخول");
          closeLoader();
          props.history.replace("/Login");
          props.removeUserFromApp();
        }, 1000);
      } else {
        let urlOfFeatureService = window.__applyEditsUrl__;
        let tblIndex = getLayerIndexFromFeatService("TBL_INVEST_STUDY");
        let requestObj = {};
        if (!editedData) {
          requestObj[tblIndex] = {
            id: tblIndex,
            adds: [
              {
                attributes: {
                  ...formDataClone,
                  SITE_GEOSPATIAL_ID:
                    selectedFeatures[0].attributes.SITE_GEOSPATIAL_ID,
                },
              },
            ],
          };
        } else
          requestObj[tblIndex] = {
            id: tblIndex,
            updates: [{ attributes: formDataClone }],
          };
        LoadModules(["esri/request"]).then(([esriRequest]) => {
          console.log("send form data", formDataClone);
          var formmData = new FormData();
          formmData.append("edits", JSON.stringify(Object.values(requestObj)));
          formmData.append("rollbackOnFailure", true);
          formmData.append("returnEditMoment", true);
          esriRequest(
            {
              url: urlOfFeatureService + "applyEdits",
              content: {
                f: "json",
                token: user.esriToken,
                method: "post",
                handleAs: "json",
              },
              handleAs: "json",
              timeout: 600000,
              form: formmData,
              callbackParamName: "callback",
            },
            {
              handleAs: "json",
              usePost: true,
              returnProgress: true,
            }
          )
            .then((res) => {
              formRef.current.resetFields();
              notificationMessage("تم الحفظ بنجاح", 4);
              closeLoader();
              handleCloseModal();
            })
            .catch((err) => {
              console.log(err);
              notificationMessage("حدث خطأ اثناء الارسال", 4);
              closeLoader();
              handleCloseModal();
            });
        });
      }
    });
  };
  const handleCloseModal = () => {
    window.__map__.getLayer("highLightGraphicLayer").clear();
    window.__map__.getLayer("graphicLayer2").clear();
    clearSelection();
    setFormData({
      SURROND_ACTIVITIES: "",
      GENERAL_RECOMMANDITION: "",
      PLANNING_STUDY: "",
      PLANNING_STUDY_NOTES: "",
      ECONOMIC_STUDY: "",
      ECONOMIC_STUDY_NOTES: "",
    });

    // props.disactivateSingleSelect();
    // props.handleMapClickEvent({
    //   cursor: "default",
    //   handler: ({ mapPoint }) => makeFlashOnAssetsWithSameAuctionNo(mapPoint),
    // });
  };
  const onChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;
    setFormData({ ...formData, [name]: value });
  };
  //tag input func
  const handleClose = (setTagsFunc, allDataTags, removedTag, fieldName) => {
    const tags = allDataTags.tags.filter((tag) => tag !== removedTag);
    console.log(tags);
    setTagsFunc({ ...allDataTags, tags });
    setFormData({ ...formData, [fieldName]: tags.join(",") });
    formRef.current.setFieldsValue({ [fieldName]: tags.join(",") });
    formRef.current.validateFields([fieldName]);
  };

  const showInput = (setTagsFunc, allDataTags, saveInput) => {
    setTagsFunc({ ...allDataTags, inputVisible: true });
    console.log(saveInput.current);
    // saveInput.current.focus();
  };
  const handleInputChange = (e, setTagsFunc, allTagsData) => {
    setTagsFunc({ ...allTagsData, inputValue: e.target.value });
  };

  const handleInputConfirm = (setTagsFunc, allTagsData, fieldName) => {
    let { inputValue, tags } = allTagsData;
    if (inputValue && tags.indexOf(inputValue) === -1) {
      tags = [...tags, inputValue];
    }
    console.log(tags);
    formRef.current.setFieldsValue({ [fieldName]: tags.join(",") });
    setFormData({ ...formData, [fieldName]: tags.join(",") });
    setTagsFunc({
      ...allTagsData,
      tags,
      inputVisible: false,
      inputValue: "",
    });
  };
  const handleEditInputChange = (e, setTagsFunc, allTagsData) => {
    setTagsFunc({ ...allTagsData, editInputValue: e.target.value });
  };
  const handleEditInputConfirm = (setTagsFunc, allTagsData, fieldName) => {
    let { tags, editInputIndex, editInputValue } = allTagsData;
    const newTags = [...tags];
    newTags[editInputIndex] = editInputValue;
    formRef.current.setFieldsValue({ [fieldName]: newTags.join(",") });
    setFormData({ ...formData, [fieldName]: newTags.join(",") });
    setTagsFunc({
      ...allTagsData,
      tags: newTags,
      editInputIndex: -1,
      editInputValue: "",
    });
  };
  const renderSurroundActivities = () => {
    return surroundedActivStates.map((d) => (
      <Select.Option key={d.text} className="text-right" value={d.key}>
        {d.displayedText}
      </Select.Option>
    ));
  };
  const handleSelect = (name) => (value) => {
    let formDataClone = { ...formData };
    formDataClone[name].selectValue = value;
    setFormData(formDataClone);
    setSurroundedActivStateError("");
  };
  const handleSelectSurroundActiv = (name, inputType) => (value) => {
    let surroundedActivStatesClone = [...surroundedActivStates];
    surroundedActivStatesClone.forEach((item) => {
      if (item.key === name) {
        item.value[inputType] = ["select", "multi-select"].includes(inputType)
          ? value
          : value.target.value;
          //remove error message
          ["select", "multi-select"].includes(inputType)
          ? value && setSurroundedActivStateError("")
          : value.target.value && setSurroundedActivStateError("")
        item.active = true;
      } else {
        // item.value="";
        item.active = false;
      }
    });
    setSurroundedActivStates(surroundedActivStatesClone);
  };
  const getInputSurroundActiv = () => {
    let input = surroundedActivStates.find(
      (item) => item.key === formData["SURROND_ACTIVITIES"].selectValue
    );
    let inputParts = input.text.split("__");
    let renderedElements = [];
    if (input.type.length - 1 == 0 && inputParts.length == 2 && !inputParts[1]) {
      renderedElements.push(getInputBasedOnType(input.type[0], input));
      return renderedElements.map((elm) => (
        <>
          <Col className="mb-3" span={20}>{elm}</Col>
          <span
          className="px-2 py-1 mb-1 btn btn-success"
          style={{height:'fit-content'}}
            onClick={() => handleSaveSurroundActiv(input.key)}
          >
            <i className="far fa-save"></i>
          </span>
        </>
      ));
    } else 
    // if (input.type.length > 1) 
    {
      //more than 1 ==> 2
      input.type.forEach((type) =>
        renderedElements.push(getInputBasedOnType(type, input))
      );
      let elems = [];
      inputParts.forEach((txt, index) => {
        if (index <= renderedElements.length - 1) {
          elems.push(<span style={{
            minWidth: 'max-content',
            display: 'flex',
            margin:'0 0.2em',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>{txt}</span>);
          elems.push(renderedElements[index]);
        } else {
          elems.push(<span 
            style={{
              minWidth: 'max-content',
              display: 'flex',
              margin:'0 0.2em',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >{txt}</span>);
          elems.push(
            <span
              className="px-2 py-1 mb-1 btn btn-success"
              style={{height:'fit-content'}}
              onClick={() => handleSaveSurroundActiv(input.key)}
            >
              <i className="far fa-save"></i>
            </span>
          );
        }
      });
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around",
            width:'100%'
          }}
          className="mb-3"
        >
          {elems.map((elm, index) => (
            <>{elm}</>
          ))}
        </div>
      );
    }
  };
  const handleDeleteSurroundActiv = (key) => {
    let surroundedActivStatesClone = [...surroundedActivStates];
    let reqItem = surroundedActivStatesClone.find((item) => item.key === key);
    reqItem.type.forEach((i) => (reqItem.value[i] = ""));

    let formDataClone = { ...formData };
    formDataClone.SURROND_ACTIVITIES.mainValue[key] = "";
      //if there is a value in surroundActivStates make surroundActiv input not required
    let isSurroundActivInputReq = Object.values(formDataClone.SURROND_ACTIVITIES.mainValue).find(i=>i);
    if(isSurroundActivInputReq && surroundActivValidate) setSurroundActivValidate(false);
    else if(!isSurroundActivInputReq&&!surroundActivValidate) setSurroundActivValidate(true)
     //set form values
  let surroundActivFormValue = Object.values(
    formDataClone.SURROND_ACTIVITIES.mainValue
  ).join(",");
  if(!surroundActivFormValue.replaceAll(',','')) surroundActivFormValue=""
  formRef.current.setFieldsValue({...formDataClone, SURROND_ACTIVITIES:surroundActivFormValue});
    /////////////////
    setFormData(formDataClone);
    setSurroundedActivStates(surroundedActivStatesClone);
  };
  const handleSaveSurroundActiv = (surroundStateKey) => {
    let surroundedActivStatesClone = [...surroundedActivStates];
    let reqItem = surroundedActivStatesClone.find(
      (item) => item.key === surroundStateKey
    );
    let formDataClone = { ...formData };
    let values = Object.values(reqItem.value).filter((ite) => ite);
    if (values.length === reqItem.text.split("__").length - 1) {
      reqItem.active = false;
      let currentValue = "";
      reqItem.text.split("__").forEach((item, index) => {
        if (index <= values.length - 1)
          currentValue += item + " " + reqItem.value[reqItem.type[index]] + " ";
        else currentValue += item;
      });
      if (reqItem.type[0] == "multi-select")
        currentValue = currentValue.replaceAll(",", " و ");
      formDataClone["SURROND_ACTIVITIES"].selectValue = "";
      formDataClone["SURROND_ACTIVITIES"].mainValue[reqItem.key] = currentValue;
    
  //if there is a value in surroundActivStates make surroundActiv input not required
  let isSurroundActivInputReq = Object.values(formDataClone.SURROND_ACTIVITIES.mainValue).find(i=>i);
  if(isSurroundActivInputReq && surroundActivValidate) setSurroundActivValidate(false);
  else if(!isSurroundActivInputReq&&!surroundActivValidate) setSurroundActivValidate(true)
  //set form values
  let surroundActivFormValue = Object.values(
    formDataClone.SURROND_ACTIVITIES.mainValue
  ).join(",");
  if(!surroundActivFormValue.replaceAll(',','')) surroundActivFormValue=""
  formRef.current.setFieldsValue({...formDataClone, SURROND_ACTIVITIES:surroundActivFormValue});
  /////////////////
      setFormData(formDataClone);
      setSurroundedActivStates(surroundedActivStatesClone);
    } else
      setSurroundedActivStateError(
        "من فضلك ادخل كافة بيانات " + `${reqItem.displayedText}`
      );
  };
  const getInputBasedOnType = (type, input) => {
    switch (type) {
      case "select":
        return (
          <Select
            name={input.key}
            allowClear
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            className="dont-show"
            onChange={handleSelectSurroundActiv(input.key, "select")}
            // onClear={()=>this.handleClearSelect('planNumber')}
            value={input.value["select"] ? input.value["select"] : null}
            placeholder={
              input.placeholder ? input.placeholder[0] : input.displayedText
            }
            getPopupContainer={(trigger) => trigger.parentNode}
          >
            {input.dropDownItems.map((d) => (
              <Select.Option key={d} className="text-right" value={d}>
                {d}
              </Select.Option>
            ))}
          </Select>
        );

      case "text":
        return (
          <Input
            type="string"
            name={input.key}
            placeholder={
              input.placeholder ? input.placeholder[1] : input.displayedText
            }
            onChange={handleSelectSurroundActiv(input.key, "text")}
            value={input.value["text"]}
            placeholder={input.displayedText}
          />
        );
      case "multi-select":
        return (
          <Select
            name={input.key}
            allowClear
            showSearch
            mode={"multiple"}
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            className="dont-show"
            onChange={handleSelectSurroundActiv(input.key, "multi-select")}
            // onClear={()=>this.handleClearSelect('planNumber')}
            value={
              input.value["multi-select"]
                ? input.value["multi-select"]
                : undefined
            }
            placeholder={
              input.placeholder ? input.placeholder[0] : input.displayedText
            }
            getPopupContainer={(trigger) => trigger.parentNode}
          >
            {input.dropDownItems.map((d) => (
              <Select.Option key={d.code} className="text-right" value={d.name}>
                {d.name}
              </Select.Option>
            ))}
          </Select>
        );
      case "number":
        return (
          <Input
            type="number"
            name={input.key}
            placeholder={
              input.placeholder ? input.placeholder[1] : input.displayedText
            }
            onChange={handleSelectSurroundActiv(input.key, "number")}
            value={input.value["number"]}
            placeholder={input.displayedText}
          />
        );
    }
  };
  return (
    <Modal
      keyboard={false}
      onHide={handleCloseModal}
      show={
        singleSelectActive.isActive &&
        singleSelectActive.purposeOfSelect === "planningStudy" &&
        selectedFeatures.length === 1
      }
      backdrop="static"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      size="lg"
    >
      <Modal.Header className="red-modal-header">
        <Modal.Title id="contained-modal-title-vcenter">
          الدراسة التخطيطية والاقتصادية
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container className="RemarkForm">
          <Form
          scrollToFirstError={true}
            layout="vertical"
            name="validate_other"
            className="planStudy-form"
            ref={formRef}
            //   onFinish={onFinish}
          >
            {/** الانشطة المحيطة */}
            {/* <Row> */}
            <div style={{ display: "flex", flexDirection: "column" }} className=" ant-row ant-row-rtl ant-form-item tag-container ant-form-item-has-feedback ant-form-item-has-success">
              <div className="ant-col ant-form-item-label ant-col-rtl">
                <label
                  htmlFor="validate_other_SURROND_ACTIVITIES"
                  title="الأنشطة المحيطة"
                  className="ant-form-item-required"
                >
                  الأنشطة المحيطة
                </label>
              </div>
              <div
                className="px-3 ant-col ant-form-item-label ant-col-rtl"
                style={{ display: "flex", flexDirection: "column" }}
              >
                {Object.entries(formData.SURROND_ACTIVITIES.mainValue)
                  .filter((item) => item[1])
                  .map((item) => {
                    return (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>
                          {/* <strong> */}
                            {/* *{" "}
                            {
                              surroundedActivStates.find(
                                (i) => i.key === item[0]
                              ).displayedText
                            }
                            :{" "} */}
                          {item[1]}
                          {/* </strong> */}
                        </span>
                        <span
                          className="px-2 py-1 mb-1 btn btn-danger"
                          onClick={() => handleDeleteSurroundActiv(item[0])}
                        >
                          <i className="fas fa-minus-circle"></i>
                        </span>
                      </div>
                    );
                  })}
        
              </div>
            </div>
            {/* </Row> */}
            <Row>
              <Col span={24} className="px-3">
                <Form.Item
                  // hasFeedback
                  // label="الأنشطة المحيطة"
                  name="SURROND_ACTIVITIES"
                  className="tag-container SURROND_ACTIVITIES"
                  rules={[
                    {
                      message: "من فضلك أدخل الأنشطة المحيطة  ",
                      required: surroundActivValidate,
                    },
                  ]}
                >
                  <>
                    <Select
                      name="SURROND_ACTIVITIES"
                      allowClear
                      showSearch
                      filterOption={(input, option) =>
                        option.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                      className="dont-show"
                      onChange={handleSelect("SURROND_ACTIVITIES")}
                      // onClear={()=>this.handleClearSelect('planNumber')}
                      value={
                        formData.SURROND_ACTIVITIES.selectValue
                          ? formData.SURROND_ACTIVITIES.selectValue
                          : null
                      }
                      placeholder="اختر من القائمة"
                      getPopupContainer={(trigger) => trigger.parentNode}
                    >
                      {renderSurroundActivities()}
                    </Select>
                  </>
                </Form.Item>
              </Col>
            </Row>
            {/****   Inputs of surrounding activities   ************* */}
            <div style={{display:'flex',flexDirection:'column'}}>
            <div
              style={{
                rowGap: "0px",
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
              }}
              className="px-3"
            >
              {formData["SURROND_ACTIVITIES"].selectValue
                ? getInputSurroundActiv()
                : null}
</div>
              {surroundedActivStateError ? (
                <>
                <div 
                  className='ant-form-item-explain ant-form-item-explain-error px-3'
                
                >
                  <div role="alert"
                    style={{
                      // color: "darkred",
                      // fontSize: "15px",
                      // fontWeight: "bold",
                      display:'flex'
                    }}
                  >
                    ** {surroundedActivStateError}
                  </div>
                  </div>
                </>
              ) : null}
            </div>
            {/** التوصيات العامة */}
            <Row>
              <Col span={24} className="px-3">
                <Form.Item
                  hasFeedback
                  className="tag-container"
                  label="التوصيات العامة"
                  name="GENERAL_RECOMMANDITION"
                  rules={[
                    {
                      message: "من فضلك أدخل التوصيات العامة  ",
                      required: true,
                    },
                  ]}
                  // required={true}
                  // initialValue={formData.SITE_SUBTYPE?formData.SITE_SUBTYPE:null}
                >
                  <>
                    {tagsDataRecommendation.tags.map((tag, index) => {
                      if (tagsDataRecommendation.editInputIndex === index) {
                        return (
                          <Input
                            ref={(e) =>
                              saveEditInputRef(
                                e,
                                saveEditInputRecommendationRef
                              )
                            }
                            key={tagsDataRecommendation.editInputValue}
                            name={"GENERAL_RECOMMANDITION"}
                            size="large"
                            style={{ minWidth: "500px" }}
                            className="tag-input"
                            value={tagsDataRecommendation.editInputValue}
                            onChange={(e) =>
                              handleEditInputChange(
                                e,
                                setTagsDataRecommendation,
                                tagsDataRecommendation
                              )
                            }
                            onBlur={() =>
                              handleEditInputConfirm(
                                setTagsDataRecommendation,
                                tagsDataRecommendation,
                                "GENERAL_RECOMMANDITION"
                              )
                            }
                            onPressEnter={() =>
                              handleEditInputConfirm(
                                setTagsDataRecommendation,
                                tagsDataRecommendation,
                                "GENERAL_RECOMMANDITION"
                              )
                            }
                          />
                        );
                      }

                      const isLongTag = tag.length > 150;

                      const tagElem = (
                        <Tag
                          className="edit-tag"
                          key={tag}
                          closable
                          onClose={() =>
                            handleClose(
                              setTagsDataRecommendation,
                              tagsDataRecommendation,
                              tag,
                              "GENERAL_RECOMMANDITION"
                            )
                          }
                        >
                          <span
                            onDoubleClick={(e) => {
                              //   if (index !== 0) {
                              setTagsDataRecommendation(
                                {
                                  ...tagsDataRecommendation,
                                  editInputIndex: index,
                                  editInputValue: tag,
                                }
                                // () => {
                                //   saveInputRecommendationRef.current.focus();
                                // }
                              );
                              e.preventDefault();
                              //   }
                            }}
                          >
                            {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                          </span>
                        </Tag>
                      );
                      return isLongTag ? (
                        <Tooltip title={tag} key={tag}>
                          {tagElem}
                        </Tooltip>
                      ) : (
                        tagElem
                      );
                    })}
                    {tagsDataRecommendation.inputVisible && (
                      <Input
                        ref={(e) => saveInputRef(e, saveInputRecommendationRef)}
                        type="text"
                        size="large"
                        className="tag-input"
                        name={"GENERAL_RECOMMANDITION"}
                        value={tagsDataRecommendation.inputValue}
                        onChange={(e) =>
                          handleInputChange(
                            e,
                            setTagsDataRecommendation,
                            tagsDataRecommendation
                          )
                        }
                        onBlur={() =>
                          handleInputConfirm(
                            setTagsDataRecommendation,
                            tagsDataRecommendation,
                            "GENERAL_RECOMMANDITION"
                          )
                        }
                        onPressEnter={() =>
                          handleInputConfirm(
                            setTagsDataRecommendation,
                            tagsDataRecommendation,
                            "GENERAL_RECOMMANDITION"
                          )
                        }
                      />
                    )}
                    {!tagsDataRecommendation.inputVisible && (
                      <Tag
                        className="site-tag-plus"
                        onClick={() =>
                          showInput(
                            setTagsDataRecommendation,
                            tagsDataRecommendation,
                            saveInputRecommendationRef
                          )
                        }
                      >
                        <PlusOutlined /> إضافة توصية
                      </Tag>
                    )}
                  </>
                </Form.Item>
              </Col>
            </Row>
            {/** الدراسة التخطيطية */}
            <Row>
              <Col span={24} className="px-3">
                <Form.Item
                  hasFeedback
                  label="الدراسة التخطيطية"
                  name="PLANNING_STUDY"
                  className="tag-container"
                  rules={[
                    {
                      message: "من فضلك أدخل الدراسة التخطيطية  ",
                      required: true,
                    },
                  ]}
                  // required={true}
                  // initialValue={formData.SITE_SUBTYPE?formData.SITE_SUBTYPE:null}
                >
                  <>
                    {tagsDataPlanStudy.tags.map((tag, index) => {
                      if (tagsDataPlanStudy.editInputIndex === index) {
                        return (
                          <Input
                            ref={(e) =>
                              saveEditInputRef(e, saveEditInputPlanStudyRef)
                            }
                            key={tagsDataPlanStudy.editInputValue}
                            size="large"
                            style={{ minWidth: "500px" }}
                            className="tag-input"
                            name={"PLANNING_STUDY"}
                            value={tagsDataPlanStudy.editInputValue}
                            onChange={(e) =>
                              handleEditInputChange(
                                e,
                                setTagsDataPlanStudy,
                                tagsDataPlanStudy
                              )
                            }
                            onBlur={() =>
                              handleEditInputConfirm(
                                setTagsDataPlanStudy,
                                tagsDataPlanStudy,
                                "PLANNING_STUDY"
                              )
                            }
                            onPressEnter={() =>
                              handleEditInputConfirm(
                                setTagsDataPlanStudy,
                                tagsDataPlanStudy,
                                "PLANNING_STUDY"
                              )
                            }
                          />
                        );
                      }

                      const isLongTag = tag.length > 150;

                      const tagElem = (
                        <Tag
                          className="edit-tag"
                          key={tag}
                          closable
                          onClose={() =>
                            handleClose(
                              setTagsDataPlanStudy,
                              tagsDataPlanStudy,
                              tag,
                              "PLANNING_STUDY"
                            )
                          }
                        >
                          <span
                            onDoubleClick={(e) => {
                              //   if (index !== 0) {
                              setTagsDataPlanStudy(
                                {
                                  ...tagsDataPlanStudy,
                                  editInputIndex: index,
                                  editInputValue: tag,
                                }
                                // () => {
                                //   saveInputPlanStudyRef.current.focus();
                                // }
                              );
                              e.preventDefault();
                              //   }
                            }}
                          >
                            {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                          </span>
                        </Tag>
                      );
                      return isLongTag ? (
                        <Tooltip title={tag} key={tag}>
                          {tagElem}
                        </Tooltip>
                      ) : (
                        tagElem
                      );
                    })}
                    {tagsDataPlanStudy.inputVisible && (
                      <Input
                        ref={(e) => saveInputRef(e, saveInputPlanStudyRef)}
                        type="text"
                        size="large"
                        name={"PLANNING_STUDY"}
                        className="tag-input"
                        value={tagsDataPlanStudy.inputValue}
                        onChange={(e) =>
                          handleInputChange(
                            e,
                            setTagsDataPlanStudy,
                            tagsDataPlanStudy
                          )
                        }
                        onBlur={() =>
                          handleInputConfirm(
                            setTagsDataPlanStudy,
                            tagsDataPlanStudy,
                            "PLANNING_STUDY"
                          )
                        }
                        onPressEnter={() =>
                          handleInputConfirm(
                            setTagsDataPlanStudy,
                            tagsDataPlanStudy,
                            "PLANNING_STUDY"
                          )
                        }
                      />
                    )}
                    {!tagsDataPlanStudy.inputVisible && (
                      <Tag
                        className="site-tag-plus"
                        onClick={() =>
                          showInput(
                            setTagsDataPlanStudy,
                            tagsDataPlanStudy,
                            saveInputPlanStudyRef
                          )
                        }
                      >
                        <PlusOutlined /> إضافة دراسة تخطيطية
                      </Tag>
                    )}
                  </>
                </Form.Item>
              </Col>
            </Row>
            {/** ملاحظات الدراسة التخطيطية */}
            <Row>
              <Col span={24} className="px-3">
                <Form.Item
                  hasFeedback
                  label="ملاحظات الدراسة التخطيطية"
                  name="PLANNING_STUDY_NOTES"
                  rules={[
                    {
                      message: "من فضلك أدخل ملاحظات الدراسة التخطيطية  ",
                      required: true,
                    },
                  ]}
                  // required={true}
                  // initialValue={formData.SITE_SUBTYPE?formData.SITE_SUBTYPE:null}
                >
                  <Input.TextArea
                    name="PLANNING_STUDY_NOTES"
                    row={3}
                    maxLength={500}
                    onChange={onChange}
                    value={formData.PLANNING_STUDY_NOTES}
                    placeholder="ادخل ملاحظات الدراسة التخطيطية"
                  />
                </Form.Item>
              </Col>
            </Row>
            {/** الدراسة الاقتصادية */}
            <Row>
              <Col span={24} className="px-3">
                <Form.Item
                  hasFeedback
                  label="الدراسة الاقتصادية"
                  name="ECONOMIC_STUDY"
                  className="tag-container"
                  rules={[
                    {
                      message: "من فضلك أدخل الدراسة الاقتصادية  ",
                      required: true,
                    },
                  ]}
                  // required={true}
                  // initialValue={formData.SITE_SUBTYPE?formData.SITE_SUBTYPE:null}
                >
                  <>
                    {tagsDataEconomicStudy.tags.map((tag, index) => {
                      if (tagsDataEconomicStudy.editInputIndex === index) {
                        return (
                          <Input
                            ref={(e) =>
                              saveEditInputRef(e, saveEditInputEconomicStudyRef)
                            }
                            key={setTagsDataEconomicStudy.editInputValue}
                            size="large"
                            name={"ECONOMIC_STUDY"}
                            style={{ minWidth: "500px" }}
                            className="tag-input"
                            value={tagsDataEconomicStudy.editInputValue}
                            onChange={(e) =>
                              handleEditInputChange(
                                e,
                                setTagsDataEconomicStudy,
                                tagsDataEconomicStudy
                              )
                            }
                            onBlur={() =>
                              handleEditInputConfirm(
                                setTagsDataEconomicStudy,
                                tagsDataEconomicStudy,
                                "ECONOMIC_STUDY"
                              )
                            }
                            onPressEnter={() =>
                              handleEditInputConfirm(
                                setTagsDataEconomicStudy,
                                tagsDataEconomicStudy,
                                "ECONOMIC_STUDY"
                              )
                            }
                          />
                        );
                      }

                      const isLongTag = tag.length > 150;

                      const tagElem = (
                        <Tag
                          className="edit-tag"
                          key={tag}
                          closable
                          onClose={() =>
                            handleClose(
                              setTagsDataEconomicStudy,
                              tagsDataEconomicStudy,
                              tag,
                              "ECONOMIC_STUDY"
                            )
                          }
                        >
                          <span
                            onDoubleClick={(e) => {
                              //   if (index !== 0) {
                              setTagsDataEconomicStudy(
                                {
                                  ...tagsDataEconomicStudy,
                                  editInputIndex: index,
                                  editInputValue: tag,
                                }
                                // () => {
                                //   saveInputEconomicStudyRef.current.focus();
                                // }
                              );
                              e.preventDefault();
                              //   }
                            }}
                          >
                            {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                          </span>
                        </Tag>
                      );
                      return isLongTag ? (
                        <Tooltip title={tag} key={tag}>
                          {tagElem}
                        </Tooltip>
                      ) : (
                        tagElem
                      );
                    })}
                    {tagsDataEconomicStudy.inputVisible && (
                      <Input
                        ref={(e) => saveInputRef(e, saveInputEconomicStudyRef)}
                        type="text"
                        size="large"
                        name={"ECONOMIC_STUDY"}
                        className="tag-input"
                        value={tagsDataEconomicStudy.inputValue}
                        onChange={(e) =>
                          handleInputChange(
                            e,
                            setTagsDataEconomicStudy,
                            tagsDataEconomicStudy
                          )
                        }
                        onBlur={() =>
                          handleInputConfirm(
                            setTagsDataEconomicStudy,
                            tagsDataEconomicStudy,
                            "ECONOMIC_STUDY"
                          )
                        }
                        onPressEnter={() =>
                          handleInputConfirm(
                            setTagsDataEconomicStudy,
                            tagsDataEconomicStudy,
                            "ECONOMIC_STUDY"
                          )
                        }
                      />
                    )}
                    {!tagsDataEconomicStudy.inputVisible && (
                      <Tag
                        className="site-tag-plus"
                        onClick={() =>
                          showInput(
                            setTagsDataEconomicStudy,
                            tagsDataEconomicStudy,
                            saveInputEconomicStudyRef
                          )
                        }
                      >
                        <PlusOutlined /> إضافة دراسة اقتصادية
                      </Tag>
                    )}
                  </>
                </Form.Item>
              </Col>
            </Row>
            {/** ملاحظات الدراسة الاقتصادية */}
            <Row>
              <Col span={24} className="px-3">
                <Form.Item
                  hasFeedback
                  label="ملاحظات الدراسة الاقتصادية"
                  name="ECONOMIC_STUDY_NOTES"
                  rules={[
                    {
                      message: "من فضلك أدخل ملاحظات الدراسة الاقتصادية  ",
                      required: true,
                    },
                  ]}
                  // required={true}
                  // initialValue={formData.SITE_SUBTYPE?formData.SITE_SUBTYPE:null}
                >
                  <Input.TextArea
                    name="ECONOMIC_STUDY_NOTES"
                    row={3}
                    maxLength={500}
                    onChange={onChange}
                    value={formData.ECONOMIC_STUDY_NOTES}
                    placeholder="ادخل ملاحظات الدراسة الاقتصادية"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              {" "}
              <Button
                onClick={onSubmit}
                className="addbtn mb-3"
                size="large"
                htmlType="submit"
              >
                حفظ
              </Button>{" "}
              <Button
                className="addbtn"
                onClick={handleCloseModal}
                size="large"
              >
                إلغاء
              </Button>
            </Row>
          </Form>
        </Container>
      </Modal.Body>
    </Modal>
  );
}
const mapStateToProps = ({ mapUpdate }) => {
  const { selectedFeatures, singleSelectActive } = mapUpdate;
  return {
    selectedFeatures,
    singleSelectActive,
    user: mapUpdate.auth.user,
    isAuth: mapUpdate.auth.isAuth,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    clearSelection: () => dispatch({ type: "CLEAR_SELECTED" }),
    disactivateSingleSelect: () =>
      dispatch({ type: "DIACTIVATE_SINGLE_SELECT" }),
    handleMapClickEvent: ({ cursor, handler }) =>
      dispatch({ type: "MAP_CLICK_EVENT", cursor, handler }),
    removeUserFromApp: () => dispatch({ type: "LOGOUT" }),
  };
};
export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(PlanningStudy)
);

import React, { useState, useEffect } from "react";
import { Row, Col, Select, Form, Input, Button, notification } from "antd";
import { queryTask, getLayerIndex } from "../../common/mapviewer";
import { connect } from "react-redux";
import Loader from "../../loader";
function BuildingDataForm(props) {
  const [loading, setLoading] = useState(false);
  const [formData, onSetForm] = useState(() => {
    let buildingData = props.isOneLand?{
      BLD_CODE: "",
      BLD_AREA: "",
      BLD_NO_FLOORS: "",
      BLD_NO_UNITS: "",
      BLD_POST_CODE: "",
      BLD_MATRIAL: "",
      BLD_STATUS: "",
    }:{
      BLD_AREA: "",
      BLD_NO_FLOORS: "",
      BLD_NO_UNITS: "",
      BLD_POST_CODE: "",
      BLD_MATRIAL: "",
      BLD_STATUS: "",
    };
    if(props.isOneLand){
    let layerIndex = getLayerIndex("TBL_BUILDING_DATA"); //TBL_BUILDING_DATA
    if (props.data) {
      Object.keys(buildingData).forEach((item) => {
        buildingData[item] = props.data[item];
      });
    } else
      queryTask({
        where: `SITE_GEOSPATIAL_ID=${props.landGeoID}`,
        returnGeometry: false,
        url: `${window.__mapUrl__}/${layerIndex}`,
        // returnDistinctValues: true,
        outFields: [
          "BLD_AREA,BLD_AREA,BLD_MATRIAL,BLD_STATUS,BLD_NO_FLOORS,BLD_NO_UNITS,BLD_POST_CODE",
        ],
        callbackResult: ({ features }) => {
          // fix features
          if (features.length) {
            console.log(features);
            features.forEach((item) => {
              let attributes = item.data[0].attributes;
              Object.keys(buildingData).forEach((itemForm) => {
                buildingData[itemForm] = attributes[itemForm];
              });
            });
            props.addValuesBeforeEdit(
              props.landGeoID,
              "buildingDataBefore",
              buildingData
            );
          }
        },
      });
    }
    return buildingData;
  });
  useEffect(() => {
  
    return () =>{
      console.log("will mount");
      return null
      }
  }, [])
  // useEffect(()=>{
  //   let layerIndex = 11;  //TBL_BUILDING_DATA
  //   let buildingData = {}
  //   if (props.data) {
  //     Object.keys(formData).forEach((item) => {
  //       buildingData[item] = props.data[item];
  //     });
  //     setLoading(false);
  //     onSetForm({ ...formData, ...buildingData });
  //   } else
  //   queryTask({
  //     where:`SITE_GEOSPATIAL_ID=${props.landGeoID}`,
  //     returnGeometry: false,
  //     url: `${window.__mapUrl__}/${layerIndex}`,
  //     // returnDistinctValues: true,
  //     outFields: ["BLD_AREA,BLD_AREA,BLD_MATRIAL,BLD_STATUS,BLD_NO_FLOORS,BLD_NO_UNITS,BLD_POST_CODE"],
  //     callbackResult: ({ features }) => {
  //       // fix features
  //       if (features.length) {
  //         console.log(features);
  //         features.forEach((item) => {
  //           let attributes = item.data[0].attributes;
  //           Object.keys(formData).forEach((itemForm) => {
  //             buildingData[itemForm] = attributes[itemForm];
  //           });
  //         });
  //         props.addValuesBeforeEdit(
  //           props.landGeoID,
  //           "buildingDataBefore",
  //           buildingData
  //         );
  //         onSetForm({ ...formData, ...buildingData });
  //       }
  //       setLoading(false);
  //     },
  //     callbackError: (err) => {
  //       console.error(err);
  //     },
  //   })
  //   return ()=> null
  // },[])
  const onChange = (e) => {
    let numberFieldsFloat = ["BLD_AREA" ]
    let numberFieldsInteger = ["BLD_MATRIAL","BLD_STATUS","BLD_NO_FLOORS","BLD_NO_UNITS","BLD_SERVICE"]
    if(numberFieldsFloat.includes(e.target.name)) 
    onSetForm({ ...formData, [e.target.name]: parseFloat(e.target.value) });
    else if(numberFieldsInteger.includes(e.target.name))
    onSetForm({ ...formData, [e.target.name]: parseInt(e.target.value) });
    else
    onSetForm({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSelect = (name) => (e) => {
    onSetForm({ ...formData, [name]: e });
  };

  const renderDomainSelect = (fieldname) => {
    const { fields } = props;
    if (!fields) return null;

    var layername = "TBL_BUILDING_DATA".toLocaleLowerCase();
    var domain = fields[layername].find((field) => field.name == fieldname)
      .domain.codedValues;
    return domain.map((cv) => (
      <Select.Option key={cv.code} className="text-right" value={cv.code}>
        {cv.name}
      </Select.Option>
    ));
  };
  const notificationNoData = () => {
    const args = {
      description: "تم التعديل بنجاح",
      duration: 3,
    };
    notification.open(args);
  };
  const validateFieldValue=(value)=>{
    if(value) return true
    else return false
  }
  const onSubmit = (e) => {
    let validationCodition =true
    //  props.isOneLand?
    // validateFieldValue(formData.BLD_CODE) &&
    //   validateFieldValue(formData.BLD_AREA) &&
    //   validateFieldValue(formData.BLD_NO_FLOORS) &&
    //   validateFieldValue(formData.BLD_NO_UNITS) &&
    //   validateFieldValue(formData.BLD_POST_CODE) &&
    //   validateFieldValue(formData.BLD_MATRIAL) &&
    //   validateFieldValue(formData.BLD_STATUS):
    //   validateFieldValue(formData.BLD_AREA) &&
    //   validateFieldValue(formData.BLD_NO_FLOORS) &&
    //   validateFieldValue(formData.BLD_NO_UNITS) &&
    //   validateFieldValue(formData.BLD_POST_CODE) &&
    //   validateFieldValue(formData.BLD_MATRIAL) &&
    //   validateFieldValue(formData.BLD_STATUS);

    if (validationCodition) {
      if (!props.isOneLand) {
        let dataOfTbl = {};
        Object.entries(formData).forEach(item=>{
          if(item[1]) dataOfTbl[item[0]]=item[1];
          });
        for (let i = 0; i < props.landIDsInTable.length; i++) {
          const element = props.landIDsInTable[i];
          props.editAttributes(element, "buildingDataAfter", dataOfTbl);
        }
      } else {
        let dataOfTbl = {};
        Object.entries(formData).forEach(item=>{
          if(item[1]) dataOfTbl[item[0]]=item[1];
          });
        props.editAttributes(props.id, "buildingDataAfter", dataOfTbl);
        //mark main data as completed
        let tableSettingsClone = { ...props.tableSettings };
        let currentFeature = tableSettingsClone.result.find(
          (f) => f.id === props.id
        );
        currentFeature.isCompletedFilled.tblData.bool = true;
        props.markMainDataAsCompleted(tableSettingsClone);
      }
  /*****************/
      onSetForm({
        BLD_CODE: "",
        BLD_AREA: "",
        BLD_NO_FLOORS: "",
        BLD_NO_UNITS: "",
        BLD_POST_CODE: "",
        BLD_MATRIAL: "",
        BLD_STATUS: "",
      });
      notificationNoData();
      props.closeModal("showBuildingData");
    }
  };

  return (
    <>
      {loading ? <Loader /> : null}
      <Form
        layout="vertical"
        name="validate_other"
        //   onFinish={onFinish}
        initialValues={{
          BLD_CODE: formData.BLD_CODE ? formData.BLD_CODE : null,
          BLD_AREA: formData.BLD_AREA ? formData.BLD_AREA : null,
          BLD_NO_FLOORS: formData.BLD_NO_FLOORS ? formData.BLD_NO_FLOORS : null,
          BLD_NO_UNITS: formData.BLD_NO_UNITS ? formData.BLD_NO_UNITS : null,
          BLD_POST_CODE: formData.BLD_POST_CODE ? formData.BLD_POST_CODE : null,
          BLD_MATRIAL: formData.BLD_MATRIAL ? formData.BLD_MATRIAL : null,
          BLD_STATUS: formData.BLD_STATUS ? formData.BLD_STATUS : null,
        }}
      >
        <Row>
          <Col span={12} className="px-3">
            <Form.Item
              // rules={props.isOneLand?[
              //   {
              //     message: "من فضلك ادخل كود المبني",
              //     required: true,
              //   },
              // ]:[]}
              name={props.isOneLand?"BLD_CODE":""}
              hasFeedback
              label="كود المبني"
            >
              <Input
                name="BLD_CODE"
                onChange={onChange}
                value={formData.BLD_CODE}
                placeholder="إدخل كود المبني"
                disabled={!props.isOneLand}
              />
            </Form.Item>
          </Col>
          <Col span={12} className="px-3">
            <Form.Item
              // rules={[
              //   {
              //     message: "من فضلك ادخل مساحة المبنى",
              //     required: true,
              //   },
              // ]}
              name="BLD_AREA"
              hasFeedback
              label="مساحة المبني"
            >
              <Input
                name="BLD_AREA"
                type='number'
                onChange={onChange}
                value={formData.BLD_AREA}
                placeholder="إدخل مساحة المبني "
              />
            </Form.Item>
          </Col>
          <Col span={12} className="px-3">
            <Form.Item
              hasFeedback
              label="مادة البناء "
              // rules={[
              //   {
              //     message: "أختر مادة البناء",
              //     required: true,
              //   },
              // ]}
              name="BLD_MATRIAL"
            >
              <Select
                virtual={false}
                showSearch
                value={formData.BLD_MATRIAL ? formData.BLD_MATRIAL : null}
                allowClear
                onChange={handleSelect("BLD_MATRIAL")}
                placeholder="اختر مادة البناء"
                getPopupContainer={(trigger) => trigger.parentNode}
              >
                {renderDomainSelect("BLD_MATRIAL")}
              </Select>
            </Form.Item>
          </Col>{" "}
          <Col span={12} className="px-3">
            <Form.Item
              hasFeedback
              label=" حالة المبني"
              // rules={[
              //   {
              //     message: "أختر حالة المبنى",
              //     required: true,
              //   },
              // ]}
              name="BLD_STATUS"
            >
              <Select
                virtual={false}
                showSearch
                allowClear
                value={formData.BLD_STATUS ? formData.BLD_STATUS : null}
                className="dont-show"
                onChange={handleSelect("BLD_STATUS")}
                placeholder="اختر حالة المبني"
                getPopupContainer={(trigger) => trigger.parentNode}
              >
                {renderDomainSelect("BLD_STATUS")}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12} className="px-3">
            <Form.Item
              // rules={[
              //   {
              //     message: "من فضلك ادخل عددالأدوار",
              //     required: true,
              //   },
              // ]}
              name="BLD_NO_FLOORS"
              hasFeedback
              label="عدد الأدوار"
            >
              <Input
                name="BLD_NO_FLOORS"
                onChange={onChange}
                type='number'
                value={formData.BLD_NO_FLOORS}
                placeholder="إدخل عدد الأدوار"
              />
            </Form.Item>
          </Col>{" "}
          <Col span={12} className="px-3">
            <Form.Item
              // rules={[
              //   {
              //     message: "من فضلك ادخل عدد الوحدات",
              //     required: true,
              //   },
              // ]}
              name="BLD_NO_UNITS"
              hasFeedback
              label="عدد الوحدات"
            >
              <Input
                name="BLD_NO_UNITS"
                type='number'
                onChange={onChange}
                value={formData.BLD_NO_UNITS}
                placeholder="إدخل عدد الوحدات"
              />
            </Form.Item>
          </Col>{" "}
          <Col span={12} className="px-3">
            <Form.Item
              // rules={[
              //   {
              //     message: "من فضلك ادخل الرمز البريدي",
              //     required: true,
              //   },
              // ]}
              name="BLD_POST_CODE"
              hasFeedback
              label="الرمز البريدي"
            >
              <Input.TextArea
                name="BLD_POST_CODE"
                onChange={onChange}
                value={formData.BLD_POST_CODE}
                placeholder="إدخل الرمز البريدي "
              />
            </Form.Item>
          </Col>
        </Row>
        <Button
          id={props.id}
          onClick={onSubmit}
          className="addbtn mb-3"
          size="large"
          htmlType="submit"
        >
          حفظ
        </Button>{" "}
        <Button
          className="addbtn"
          onClick={() => props.closeModal("showBuildingData")}
          size="large"
        >
          إلغاء
        </Button>
      </Form>
    </>
  );
}
const mapDispatchToProps = (dispatch) => {
  return {
    editAttributes: (id, nameOfProperty, data) =>
      dispatch({
        type: "EDIT_ATTRIBUTES_FOR_FEATURE_IN_COUNTED_TABLE_DATA_SET",
        id,
        nameOfProperty,
        data,
      }),
    addValuesBeforeEdit: (id, nameOfProperty, data) =>
      dispatch({
        type: "SET_VALUES_BEFORE_EDIT_IN_COUNTED_TABLE",
        id,
        nameOfProperty,
        data,
      }),
      markMainDataAsCompleted: (data) =>
      dispatch({
        type: "EDIT_ITEM_FROM_RESULT_COUNTED_TABLE_DATA_SET",
        data,
      }),
  };
};
const mapStateToProps = ({ mapUpdate }) => {
  const { fields, tableSettings } = mapUpdate;
  let { result } = tableSettings;
  let landIDsInTable = result.filter(f=>f.isChecked).map((land) => {
    return land.id;
  });
  return {
    fields,
    landIDsInTable,
    tableSettings
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(BuildingDataForm);

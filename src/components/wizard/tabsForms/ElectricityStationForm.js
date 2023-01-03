import React, { useState, useEffect } from "react";
import { Container, Modal } from "react-bootstrap";
import { Row, Col, Select, Form, Input, Button, notification } from "antd";
import { getLayerIndex, queryTask } from "../../common/mapviewer";
import { connect } from "react-redux";
import Loader from "../../loader";
function ElectricityStationForm(props) {
  const [loading, setLoading] = useState(false);
  const [formData, onSetFormData] = useState(() => {
    let elecStationData = { NAME: "", ELEC_TYPE: "" };
    let layerIndex = getLayerIndex("TBL_ELEC_STATION"); //TBL_ELEC_STATION
    if(props.isOneLand){
    if (props.data) {
      Object.keys(elecStationData).forEach((item) => {
        elecStationData[item] = props.data[item];
      });
    } else
      queryTask({
        where: `SITE_GEOSPATIAL_ID=${props.landGeoID}`,
        returnGeometry: false,
        url: `${window.__mapUrl__}/${layerIndex}`,
        // returnDistinctValues: true,
        outFields: ["NAME,ELEC_TYPE"],
        callbackResult: ({ features }) => {
          // fix features
          // getFeatureDomainName(features, layerIndex).then((features) => {
          console.log(features);
          // });
          if (features.length) {
            // getFeatureDomainName(features, layerIndex).then((features) => {
            console.log(features);
            features.forEach((item) => {
              let attributes = item.data[0].attributes;
              Object.keys(elecStationData).forEach((itemForm) => {
                elecStationData[itemForm] = attributes[itemForm];
              });
            });
            props.addValuesBeforeEdit(
              props.landGeoID,
              "elecStationDataBefore",
              elecStationData
            );
          }
        },
      });
    }
    return elecStationData;
  });
  useEffect(() => {
  
    return () =>{
      console.log("will mount");
      return null
      }
  }, [])
  // useEffect(() => {
  //   let elecStationData = {};
  //   setLoading(true);
  //   let layerIndex = 12; //TBL_ELEC_STATION
  //   if (props.data) {
  //     Object.keys(formData).forEach((item) => {
  //       elecStationData[item] = props.data[item];
  //     });
  //     setLoading(false);
  //     onSetFormData({ ...formData, ...elecStationData });
  //   } else
  //     queryTask({
  //       where: `SITE_GEOSPATIAL_ID=${props.landGeoID}`,
  //       returnGeometry: false,
  //       url: `${window.__mapUrl__}/${layerIndex}`,
  //       // returnDistinctValues: true,
  //       outFields: ["NAME,ELEC_TYPE"],
  //       callbackResult: ({ features }) => {
  //         // fix features
  //         // getFeatureDomainName(features, layerIndex).then((features) => {
  //         console.log(features);
  //         // });
  //         if (features.length) {
  //           // getFeatureDomainName(features, layerIndex).then((features) => {
  //           console.log(features);
  //           features.forEach((item) => {
  //             let attributes = item.data[0].attributes;
  //             Object.keys(formData).forEach((itemForm) => {
  //               elecStationData[itemForm] = attributes[itemForm];
  //             });
  //           });
  //           props.addValuesBeforeEdit(
  //             props.landGeoID,
  //             "elecStationDataBefore",
  //             elecStationData
  //           );
  //           onSetFormData({ ...formData, ...elecStationData });
  //         }
  //         setLoading(false);
  //       },
  //       callbackError: (err) => {
  //         console.error(err);
  //       },
  //     });
  //   return null;
  // }, []);
  const onChange = (e) => {
    onSetFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSelect = (name) => (e) => {
    onSetFormData({ ...formData, [name]: e });
  };

  const renderDomainSelect = (fieldname) => {
    const { fields } = props;
    if (!fields) return null;

    var layername = "TBL_ELEC_STATION".toLocaleLowerCase();
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
    let tableSettingsClone = { ...props.tableSettings };
      let currentFeature = tableSettingsClone.result.find(
        (f) => f.id === props.id
      );
    let validationCodition =true
    //  validateFieldValue(formData.NAME) && validateFieldValue(formData.ELEC_TYPE);

    if (validationCodition) {
    if (!props.isOneLand) {
      let dataOfTbl = {};
      Object.entries(formData).forEach(item=>{
        if(item[1]) dataOfTbl[item[0]]=item[1];
        });
      for (let i = 0; i < props.landIDsInTable.length; i++) {
        const id = props.landIDsInTable[i];
        tableSettingsClone.result.find(f=>f.id===id).isCompletedFilled.tblData.bool=true;  
        props.editAttributes(id, "elecStationDataAfter", dataOfTbl);
      }
      // tableSettingsClone.result.forEach(f=>{
      //   f.isCompletedFilled.tblData.bool=true
      // })
      props.editCountedData(tableSettingsClone);
      
    } else {
      let dataOfTbl = {};
      Object.entries(formData).forEach(item=>{
        if(item[1]) dataOfTbl[item[0]]=item[1];
        });
      props.editAttributes(props.id, "elecStationDataAfter", dataOfTbl);
      //mark main data as completed
      
      currentFeature.isCompletedFilled.tblData.bool = true;
      props.markMainDataAsCompleted(tableSettingsClone);
    }
/*****************/
    notificationNoData();
    onSetFormData({
      NAME: "",
      ELEC_TYPE: "",
    });
    props.closeModal("showElectrictyStation");
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
          NAME:formData.NAME?formData.NAME:null,
          ELEC_TYPE:formData.ELEC_TYPE ? formData.ELEC_TYPE : null
        }}
      >
        <Row>
          <Col span={12} className="px-3">
            <Form.Item
              // rules={[
              //   {
              //     message: "من فضلك ادخل اسم المهمة",
              //     required: true,
              //   },
              // ]}
              name="NAME"
              hasFeedback
              label="اسم محطة الكهرباء"
            >
              <Input
                name="NAME"
                onChange={onChange}
                value={formData.NAME}
                placeholder="إدخل اسم محطة الكهرباء"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              hasFeedback
              label="نوع محطة الكهرباء"
                // rules={[
                //   {
                //     message: "أختر نوع المحطة",
                //     // type: "array",
                //     required: true,
                //   },
                // ]}
                name="ELEC_TYPE"
            >
              <Select
                virtual={false}
                showSearch
                allowClear
                value={formData.ELEC_TYPE ? formData.ELEC_TYPE : null}
                className="dont-show"
                onChange={handleSelect("ELEC_TYPE")}
                placeholder="اختر نوع المحطة"
                getPopupContainer={(trigger) => trigger.parentNode}
              >
                {renderDomainSelect("ELEC_TYPE")}
              </Select>
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
          onClick={() => props.closeModal("showElectrictyStation")}
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
    editCountedData: (data) =>
    dispatch({ type: "EDIT_ITEM_FROM_RESULT_COUNTED_TABLE_DATA_SET", data }),
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ElectricityStationForm);

import React, { useState, useEffect } from "react";
import { Row, Col, Select, Form, Input, Button, notification } from "antd";
import { getLayerIndex, queryTask } from "../../common/mapviewer";
import { connect } from "react-redux";
import Loader from "../../loader";
function MobileTowerForm(props) {
  const [loading, setLoading] = useState(false);
  const [formData, onSetFormData] = useState(() => {
    let mobTowerData = props.isOneLand? {
      TOWER_LOCATION_CODE: "",
      TOWER_TYPE: "",
      TOWER_HEIGHT: "",
      TOWER_SERVICE_PROVIDER: "",
    }:{
      TOWER_TYPE: "",
      TOWER_HEIGHT: "",
      TOWER_SERVICE_PROVIDER: "",
    };
    let layerIndex = getLayerIndex("TBL_TOWERS");
    
    if(props.isOneLand){
    if (props.data) {
      Object.keys(mobTowerData).forEach((item) => {
        mobTowerData[item] = props.data[item];
      });
    } else
      queryTask({
        where: `SITE_GEOSPATIAL_ID=${props.landGeoID}`,
        returnGeometry: false,
        url: `${window.__mapUrl__}/${layerIndex}`,
        outFields: [
          "TOWER_LOCATION_CODE,TOWER_TYPE,TOWER_HEIGHT,TOWER_SERVICE_PROVIDER",
        ],
        callbackResult: ({ features }) => {
          if (features.length) {
            console.log(features);
            features.forEach((item) => {
              let attributes = item.data[0].attributes;
              Object.keys(mobTowerData).forEach((itemForm) => {
                mobTowerData[itemForm] = attributes[itemForm];
              });
            });
            props.addValuesBeforeEdit(
              props.landGeoID,
              "towerDataBefore",
              mobTowerData
            );
          }
        },
        callbackError: (err) => {
          console.error(err);
        },
      });
    }
    return mobTowerData;
  });
  useEffect(() => {
  
    return () =>{
      console.log("will mount");
      return null
      }
  }, [])
  // useEffect(() => {
  //   setLoading(true);
  //   let layerIndex = 15;
  //   let mobTowerData = {};
  //   if (props.data) {
  //     Object.keys(formData).forEach((item) => {
  //       mobTowerData[item] = props.data[item];
  //     });
  //     setLoading(false);
  //     onSetFormData({ ...formData, ...mobTowerData });
  //   } else
  //     queryTask({
  //       where: `SITE_GEOSPATIAL_ID=${props.landGeoID}`,
  //       returnGeometry: false,
  //       url: `${window.__mapUrl__}/${layerIndex}`,
  //       // returnDistinctValues: true,
  //       outFields: [
  //         "TOWER_LOCATION_CODE,TOWER_TYPE,TOWER_HEIGHT,TOWER_SERVICE_PROVIDER",
  //       ],
  //       callbackResult: ({ features }) => {
  //         // fix features
  //         // getFeatureDomainName(features, layerIndex).then((feat) => {
  //         // console.log(feat);

  //         // });
  //         if (features.length) {
  //           console.log(features);
  //           features.forEach((item) => {
  //             let attributes = item.data[0].attributes;
  //             Object.keys(formData).forEach((itemForm) => {
  //               mobTowerData[itemForm] = attributes[itemForm];
  //             });
  //           });
  //           props.addValuesBeforeEdit(
  //             props.landGeoID,
  //             "towerDataBefore",
  //             mobTowerData
  //           );
  //           onSetFormData({ ...formData, ...mobTowerData });
  //         }
  //         setLoading(false);
  //         // if(props.data)
  //         // Object.keys(formData).forEach(item=>{
  //         //   mobTowerData[item]=props.data[item]
  //         //     })
  //         // });
  //       },
  //       callbackError: (err) => {
  //         console.error(err);
  //       },
  //     });
  //     return null
  // }, []);
  const onChange = (e) => {
    let name = e.target.name;
    let numberFieldsDouble = ["TOWER_HEIGHT"];
    if(numberFieldsDouble.includes(name)) onSetFormData({ ...formData, [name]: parseFloat(e.target.value) });
    onSetFormData({ ...formData, [name]: e.target.value });
  };
  const handleSelect = (name) => (e) => {
    onSetFormData({ ...formData, [name]: e });
  };

  const renderDomainSelect = (fieldname) => {
    const { fields } = props;
    if (!fields) return null;

    var layername = "TBL_TOWERS".toLocaleLowerCase();
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
      description: "???? ?????????????? ??????????",
      duration: 3,
    };
    notification.open(args);
  };
  const onSubmit = (e) => {
    const validateFieldValue=(value)=>{
      if(value) return true
      else return false
    }
    let validationCodition =true
    //  props.isOneLand?
    // validateFieldValue(formData.TOWER_LOCATION_CODE) &&
    // validateFieldValue(formData.TOWER_TYPE) &&
    //   validateFieldValue(formData.TOWER_HEIGHT) &&
    //   validateFieldValue(formData.TOWER_SERVICE_PROVIDER): validateFieldValue(formData.TOWER_TYPE) &&
    //   validateFieldValue(formData.TOWER_HEIGHT) &&
    //   validateFieldValue(formData.TOWER_SERVICE_PROVIDER);
     
    if (validationCodition) {
      if (!props.isOneLand) {
        for (let i = 0; i < props.landIDsInTable.length; i++) {
          const id = props.landIDsInTable[i];
          let land = {};
          if (props.result.find((item) => item.towerDataAfter))
            land = props.result.find((item) => item.towerDataAfter);
            let dataOfTbl = {};
        Object.entries(formData).forEach(item=>{
          if(item[1]) dataOfTbl[item[0]]=item[1];
          });
          props.editAttributes(id, "towerDataAfter", { ...dataOfTbl, ...land });
        }
      } else {
        let dataOfTbl = {};
        Object.entries(formData).forEach(item=>{
          if(item[1]) dataOfTbl[item[0]]=item[1];
          });
        props.editAttributes(props.id, "towerDataAfter", dataOfTbl);
        //mark main data as completed
        let tableSettingsClone = { ...props.tableSettings };
        let currentFeature = tableSettingsClone.result.find(
          (f) => f.id === props.id
        );
        currentFeature.isCompletedFilled.tblData.bool = true;
        props.markMainDataAsCompleted(tableSettingsClone);
      }
  /*****************/
      notificationNoData();
      onSetFormData({
        TOWER_LOCATION_CODE: "",
        TOWER_TYPE: "",
        TOWER_HEIGHT: "",
        TOWER_SERVICE_PROVIDER: "",
      });
      props.closeModal("showMobileTower");
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
          TOWER_LOCATION_CODE: formData.TOWER_LOCATION_CODE
            ? formData.TOWER_LOCATION_CODE
            : null,
          TOWER_TYPE: formData.TOWER_TYPE ? formData.TOWER_TYPE : null,
          TOWER_HEIGHT: formData.TOWER_HEIGHT ? formData.TOWER_HEIGHT : null,
          TOWER_SERVICE_PROVIDER: formData.TOWER_SERVICE_PROVIDER
            ? formData.TOWER_SERVICE_PROVIDER
            : null,
        }}
      >
        <Row>
          <Col span={12} className="px-3">
            <Form.Item
              // rules={props.isOneLand?[
              //   {
              //     message: "???? ???????? ???????? ?????? ??????????",
              //     required: true,
              //     type: "string",
              //   },
              // ]:[]}
              name= {props.isOneLand? "TOWER_LOCATION_CODE":""}
              hasFeedback
              label="?????? ??????????"
            >
              <Input
                name="TOWER_LOCATION_CODE"
                onChange={onChange}
                value={formData.TOWER_LOCATION_CODE}
                disabled={!props.isOneLand}
                placeholder="???????? ?????? ??????????"
              />
            </Form.Item>
          </Col>
          <Col span={12} className="px-3">
            <Form.Item
              // rules={[
              //   {
              //     message: "???? ???????? ???????? ?????? ??????????",
              //     required: true,
              //   },
              // ]}
              name="TOWER_TYPE"
              hasFeedback
              label="?????? ??????????"
            >
              <Select
                virtual={false}
                showSearch
                getPopupContainer={(trigger) => trigger.parentNode}
                style={{ width: "100%" }}
                placeholder="???????? ?????? ?????????? "
                value={formData.TOWER_TYPE ? formData.TOWER_TYPE : null}
                onChange={handleSelect("TOWER_TYPE")}
              >
                {renderDomainSelect("TOWER_TYPE")}
              </Select>{" "}
            </Form.Item>
          </Col>
          <Col span={12} className="px-3">
            <Form.Item
              // rules={[
              //   {
              //     message: "???? ???????? ???????? ???????????? ??????????",
              //     required: true,
              //   },
              // ]}
              name="TOWER_HEIGHT"
              hasFeedback
              label="???????????? ??????????"
            >
              <Input
                name="TOWER_HEIGHT"
                onChange={onChange}
                type='number'
                value={formData.TOWER_HEIGHT}
                placeholder="???????? ???????????? ??????????"
              />
            </Form.Item>
          </Col>
          <Col span={12} className="px-3">
            <Form.Item
              hasFeedback
              label="???????? ???????????? "
              // rules={[
              //   {
              //     message: "???? ???????? ???????? ???????? ????????????",
              //     required: true,
              //   },
              // ]}
              name="TOWER_SERVICE_PROVIDER"
            >
              <Select
                virtual={false}
                showSearch
                getPopupContainer={(trigger) => trigger.parentNode}
                style={{ width: "100%" }}
                placeholder="???????? ???????? ????????????"
                value={
                  formData.TOWER_SERVICE_PROVIDER
                    ? formData.TOWER_SERVICE_PROVIDER
                    : null
                }
                onChange={handleSelect("TOWER_SERVICE_PROVIDER")}
              >
                {renderDomainSelect("TOWER_SERVICE_PROVIDER")}
              </Select>{" "}
            </Form.Item>
          </Col>{" "}
        </Row>
        <Button
          id={props.id}
          onClick={onSubmit}
          className="addbtn mb-3"
          size="large"
          htmlType="submit"
        >
          ??????
        </Button>{" "}
        <Button
          className="addbtn"
          onClick={() => props.closeModal("showMobileTower")}
          size="large"
        >
          ??????????
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
    result,
    tableSettings
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MobileTowerForm);

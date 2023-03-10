import React, { useState } from "react";
import { Row, Col, Select, Form, Input, Button, notification } from "antd";
import { useEffect } from "react";
import Loader from "../../loader";
import { connect } from "react-redux";

function AtmForm(props) {
  const [loading, setLoading] = useState(false);
  const [formData, onSetFormData] = useState(() => {
    let atmData = { NAME: "", TYPE: "" };
    if(props.isOneLand){
    if (props.data) {
      Object.keys(atmData).forEach((item) => {
        atmData[item] = props.data[item];
      });
    } 
      
    }
    return atmData;
  });

  useEffect(() => {
  
    return () =>{
      console.log("will mount");
      return null
      }
  }, [])
  const onChange = (e) => {
    onSetFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const renderDomainSelect = (fieldname) => {
    const { fields } = props;
    if (!fields) return null;

    var layername = "TBL_ATM".toLocaleLowerCase();
    var domain = fields[layername].find((field) => field.name == fieldname)
      .domain.codedValues;
    return domain.map((cv) => (
      <Select.Option key={cv.code} className="text-right" value={cv.code}>
        {cv.name}
      </Select.Option>
    ));
  };

  const handleSelect = (name) => (e) => {
    onSetFormData({ ...formData, [name]: e });
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
    let validationCodition = true;
    // validateFieldValue(formData.NAME) && validateFieldValue(formData.TYPE);

    if (validationCodition) {  
      //in case of selecting all ATM lands in update table
      if (!props.isOneLand) {
        let dataOfTbl = {};
        Object.entries(formData).forEach(item=>{
          if(item[1]) dataOfTbl[item[0]]=item[1];
          });
        for (let i = 0; i < props.landIDsInTable.length; i++) {
          const element = props.landIDsInTable[i];
          props.editAttributes(element, "tblData", dataOfTbl);
        }
        tableSettingsClone.result.forEach(f=>{
          f.isCompletedFilled.tblData.bool=true
        })
        props.editCountedData(tableSettingsClone);
      }
      //in case open atm form of one row in update table
      else {
        let dataOfTbl = {};
        Object.entries(formData).forEach(item=>{
          if(item[1]) dataOfTbl[item[0]]=item[1];
          });
        props.editAttributes(props.id, "tblData", dataOfTbl);
        //mark main data as completed
       
        currentFeature.isCompletedFilled.tblData.bool = true;
        props.markMainDataAsCompleted(tableSettingsClone);
      }
  /*****************/
      notificationNoData();
      onSetFormData(
        {
        NAME: null,
        TYPE: null,
      }
      );
      props.closeModal("showATMmodal");
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
          NAME: formData.NAME ? formData.NAME : null,
          TYPE: formData.TYPE ? formData.TYPE : null,
        }}
      >
        <Row>
          <Col md={{ span: 12 }} sm={{ span: 24 }} className="px-3">
            <Form.Item
              // rules={[
              //   {
              //     message: "من فضلك ادخل اسم الصراف",
              //     required: true,
              //   },
              // ]}
              name="NAME"
              hasFeedback
              label="اسم الصراف"
            >
              <Input
                name="NAME"
                onChange={onChange}
                value={formData.NAME}
                placeholder="إدخل اسم الصراف"
              />
            </Form.Item>
          </Col>
          <Col md={{ span: 12 }} sm={{ span: 24 }}>
            <Form.Item
              hasFeedback
              label="نوع الصراف"
              // rules={[
              //   {
              //     message: "من فضلك ادخل نوع الصراف",
              //     required: true,
              //   },
              // ]}
              name="TYPE"
            >
              <Select
                virtual={false}
                showSearch
                allowClear
                value={formData.TYPE ? formData.TYPE : null}
                className="dont-show"
                onChange={handleSelect("TYPE")}
                placeholder="اختر نوع الصراف"
                getPopupContainer={(trigger) => trigger.parentNode}
              >
                {renderDomainSelect("TYPE")}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row>
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
            onClick={() => props.closeModal("showATMmodal")}
            size="large"
          >
            إلغاء
          </Button>
        </Row>
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

export default connect(mapStateToProps, mapDispatchToProps)(AtmForm);

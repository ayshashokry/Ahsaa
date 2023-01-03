// for date in form :https://www.npmjs.com/package/moment-hijri, https://stackoverflow.com/questions/5619202/converting-a-string-to-a-date-in-javascript
//https://github.com/shanky15158888/blockchain/blob/919e9c1d605317f7d550df92e66f18e522f518b5/src/calendarComponent.js
//https://github.com/abdullah-bl/tiny/blob/c49cb21bea8c485b132c31924f044c79d8b5e5d6/src/renderer/components/CheckIn.js
import React, { useState, useEffect } from "react";
import "@deskpro/react-datepicker-hijri/dist/react-datepicker.css";
import DatePicker from "@deskpro/react-datepicker-hijri";
import moment from "moment-hijri";
import { Row, Col, Select, Form, Input, Button, notification } from "antd";
import { getLayerIndex, queryTask } from "../../common/mapviewer";
import { connect } from "react-redux";
import Loader from "../../loader";

function AdvertisingForm(props) {
  const [loading, setLoading] = useState(false);
  const [formData, onSetForm] = useState(() => {
    let adBoardData = {
      GROUP_CODE: "",
      BOARD_TYPE: "",
      SITE_NO: "",
      BOARD_NO: "",
      FRONTBOARD_NO: "",
      LIGHT_STATUS: "",
      GROUP_BOARD_PERPDATE: new Date().getTime(),
      GROUP_BOARD_LENGTH: "",
      GROUP_BOARD_WIDTH: "",
      GROUP_BOARD_AREA: "", //it will be calculated width*height
      GROUP_DESCRIPTION: "",
    };
    let layerIndex = getLayerIndex("TBL_BOARDS_GROUP"); //TBL_BOARDS_GROUP
    if (props.isOneLand) {
      if (props.data) {
        Object.keys(adBoardData).forEach((item) => {
          if(item==="GROUP_BOARD_PERPDATE")  adBoardData[item] =  new Date(props.data[item]).getTime();
          adBoardData[item] = props.data[item];
        });
      } 
      else   adBoardData["GROUP_CODE"]= props.mainData.GROUP_CODE;
      //   queryTask({
      //     returnGeometry: false,
      //     url: `${window.__mapUrl__}/${layerIndex}`,
      //     outFields: [
      //       "GROUP_CODE,BOARD_TYPE,SITE_NO,BOARD_NO,FRONTBOARD_NO,LIGHT_STATUS,GROUP_BOARD_PERPDATE,GROUP_BOARD_LENGTH,GROUP_BOARD_WIDTH,GROUP_BOARD_AREA,GROUP_DESCRIPTION",
      //     ],
      //     where: `GROUP_CODE=${props.mainData.GROUP_CODE}`,
      //     callbackResult: ({ features }) => {
      //       console.log(features);
      //       if (features.length) {
      //         console.log(features);
      //         features.forEach((item) => {
      //           let attributes = item.data[0].attributes;
      //           Object.keys(adBoardData).forEach((itemForm) => {
      //             adBoardData[itemForm] = attributes[itemForm];
      //           });
      //         });
      //         props.addValuesBeforeEdit(
      //           props.landGeoID,
      //           "adBoardsDataBefore",
      //           adBoardData
      //         );
      //       }
      //     },
      //   });
    }else{
      if (props.tblData&&props.tblData.tblData) {
        Object.keys(adBoardData).forEach((item) => {
          if(item==="GROUP_BOARD_PERPDATE") adBoardData[item] = new Date(props.tblData.tblData[item]).getTime()
          adBoardData[item] = props.tblData.tblData[item];
        });
      } else {
        adBoardData["GROUP_CODE"]=!props.isOneLand?props.selectedAdBoards[0]: props.mainData.GROUP_CODE
      }
      // queryTask({
      //   returnGeometry: false,
      //   url: `${window.__mapUrl__}/${layerIndex}`,
      //   outFields: [
      //     "GROUP_CODE,BOARD_TYPE,SITE_NO,BOARD_NO,FRONTBOARD_NO,LIGHT_STATUS,GROUP_BOARD_PERPDATE,GROUP_BOARD_LENGTH,GROUP_BOARD_WIDTH,GROUP_BOARD_AREA,GROUP_DESCRIPTION",
      //   ],
      //   where: `GROUP_CODE=${props.gbCode}`,
      //   callbackResult: ({ features }) => {
      //     console.log(features);
      //     if (features.length) {
      //       console.log(features);
      //       features.forEach((item) => {
      //         let attributes = item.data[0].attributes;
      //         Object.keys(adBoardData).forEach((itemForm) => {
      //           adBoardData[itemForm] = attributes[itemForm];
      //         });
      //       });
      //       //   props.addValuesBeforeEdit(
      //       //   props.landGeoID,
      //       //   "adBoardsDataBefore",
      //       //   adBoardData
      //       // );
      //     }else{
      //       adBoardData["GROUP_CODE"]=props.gbCode;
      //     }
      //   },
      // });
    }
    // if(!props.data) adBoardData["GROUP_CODE"] = props.mainData.GROUP_CODE;
    return adBoardData;
  });
  useEffect(() => {
    return () => {
      console.log("will mount");
      return null;
    };
  }, []);
  // useEffect(() => {
  //   const getADBoardsData = async () => {
  //     let adBoardData = {};
  //     setLoading(true);
  //     let layerIndex = 10; //TBL_BOARDS_GROUP
  //     if (props.data) {
  //       Object.keys(formData).forEach((item) => {
  //         adBoardData[item] = props.data[item];
  //       });
  //       setLoading(false);
  //       onSetForm({ ...formData, ...adBoardData });
  //     } else
  //       await queryTask({
  //         returnGeometry: false,
  //         url: `${window.__mapUrl__}/${layerIndex}`,
  //         outFields: [
  //           "GROUP_CODE,BOARD_TYPE,SITE_NO,BOARD_NO,FRONTBOARD_NO,LIGHT_STATUS,GROUP_BOARD_PERPDATE,GROUP_BOARD_LENGTH,GROUP_BOARD_WIDTH,GROUP_BOARD_AREA,GROUP_DESCRIPTION",
  //         ],
  //         where: `SITE_GEOSPATIAL_ID=${props.landGeoID}`,
  //         callbackResult: ({ features }) => {
  //           console.log(features);
  //           if (features.length) {
  //             console.log(features);
  //             features.forEach((item) => {
  //               let attributes = item.data[0].attributes;
  //               Object.keys(formData).forEach((itemForm) => {
  //                 adBoardData[itemForm] = attributes[itemForm];
  //               });
  //             });
  //             props.addValuesBeforeEdit(
  //               props.landGeoID,
  //               "adBoardsDataBefore",
  //               adBoardData
  //             );
  //             onSetForm({ ...formData, ...adBoardData });
  //           }
  //           setLoading(false);
  //         },
  //         callbackError: (err) => {
  //           console.error(err);
  //         },
  //       });
  //   };
  //   // getADBoardsData();
  //   return null
  // }, []);

  const handleDateChangeRaw = (e) => {
    e.preventDefault();
    console.log(e);
  };

  const onChange = (e) => {
    console.log(e);
    let value = e.target.value;
    onSetForm({ ...formData, [e.target.name]: value });
  };
  const handleChangeDate = (date, e) => {
    console.log(date, e, moment, moment(new Date()));
    onSetForm({ ...formData, ["GROUP_BOARD_PERPDATE"]: new Date(date._d).getTime() });
  };
  const handleSelect = (name) => (e) => {
    onSetForm({ ...formData, [name]: e });
  };

  const renderDomainSelect = (fieldname) => {
    const { fields } = props;
    if (!fields) return null;

    var layername = "TBL_BOARDS_GROUP".toLocaleLowerCase();
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
  const validateFieldValue = (value) => {
    if (value) return true;
    else return false;
  };
  const onSubmit = (e) => {
    let validationCodition =true
      // validateFieldValue(formData.GROUP_CODE)&&
      // validateFieldValue(formData.BOARD_TYPE !== "") &&
      // validateFieldValue(formData.SITE_NO) &&
      // validateFieldValue(formData.BOARD_NO) &&
      // validateFieldValue(formData.FRONTBOARD_NO) &&
      // validateFieldValue(formData.LIGHT_STATUS) &&
      // validateFieldValue(formData.GROUP_BOARD_PERPDATE)&&
      // validateFieldValue(formData.GROUP_BOARD_LENGTH) &&
      // validateFieldValue(formData.GROUP_BOARD_WIDTH) &&
      // validateFieldValue(formData.GROUP_BOARD_AREA) &&
      // validateFieldValue(formData.GROUP_DESCRIPTION);

    if (validationCodition) {
      let tableSettingsClone = { ...props.tableSettings };
      if (!props.isOneLand) {
        let dataOfBoards = {};
        Object.entries(formData).forEach(item=>{
          if(item[1]) dataOfBoards[item[0]]=item[1];
          else if(item[0]==="BOARD_TYPE"&&item[1]!=="") dataOfBoards[item[0]]=item[1];
          else if(item[0]==="LIGHT_STATUS"&&item[1]!=="")  dataOfBoards[item[0]]=item[1];
          });
        for (let i = 0; i < props.selectedAdBoardsIds.length; i++) {
          const adID = props.selectedAdBoardsIds[i];
          props.editAttributes(adID, "tblData", dataOfBoards);
          let currentFeature = tableSettingsClone.result.find(
            (f) => f.id === adID
            );
          currentFeature.isCompletedFilled.tblData.bool = true;
          props.editAttributes(adID, 
            "isCompletedFilled", {...currentFeature.isCompletedFilled,
          tblData:{...currentFeature.isCompletedFilled.tblData, bool:true}
          });
          
        }
      } else {
        let adBoardsRows = tableSettingsClone.result.filter(feat=>feat.layername.toLocaleLowerCase()
        !=="invest_site_polygon").filter(feat=>feat.investSiteDataAttributes.GROUP_CODE===formData.GROUP_CODE);
        let dataOfBoards = {};
        Object.entries(formData).forEach(item=>{
          if(item[1]) dataOfBoards[item[0]]=item[1];
          else if(item[0]==="BOARD_TYPE"&&item[1]!=="") dataOfBoards[item[0]]=item[1];
          else if(item[0]==="LIGHT_STATUS"&&item[1]!=="")  dataOfBoards[item[0]]=item[1];
          });
        adBoardsRows.forEach(feat=>{

          props.editAttributes(feat.investSiteDataAttributes.SITE_GEOSPATIAL_ID, "tblData", dataOfBoards);
        //mark main data as completed
        let currentFeature = tableSettingsClone.result.find(
          (f) => f.id === props.id
          );
          currentFeature.isCompletedFilled.tblData.bool = true;
          props.editAttributes(feat.investSiteDataAttributes.SITE_GEOSPATIAL_ID, 
            "isCompletedFilled", {...currentFeature.isCompletedFilled,
          tblData:{...currentFeature.isCompletedFilled.tblData, bool:true}
          });
          
          // props.markMainDataAsCompleted(tableSettingsClone);
        })
      }
      /*****************/
      notificationNoData();
      onSetForm({
        GROUP_CODE: "",
        BOARD_TYPE: "",
        SITE_NO: "",
        BOARD_NO: "",
        FRONTBOARD_NO: "",
        LIGHT_STATUS: "",
        GROUP_BOARD_PERPDATE: "",
        GROUP_BOARD_LENGTH: "",
        GROUP_BOARD_WIDTH: "",
        GROUP_BOARD_AREA: "",
        GROUP_DESCRIPTION: "",
      });
      props.closeModal("showAdvertinsing");
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
          GROUP_CODE: !props.isOneLand?props.selectedAdBoards[0]: props.mainData.GROUP_CODE,
          BOARD_TYPE: formData.BOARD_TYPE !== "" ? formData.BOARD_TYPE : null,
          SITE_NO: formData.SITE_NO ? formData.SITE_NO : null,
          BOARD_NO: formData.BOARD_NO ? formData.BOARD_NO : null,
          FRONTBOARD_NO: formData.FRONTBOARD_NO ? formData.FRONTBOARD_NO : null,
          LIGHT_STATUS: formData.LIGHT_STATUS||formData.LIGHT_STATUS==0 ? formData.LIGHT_STATUS : null,
          GROUP_BOARD_PERPDATE:(formData.GROUP_BOARD_PERPDATE)?new Date(formData.GROUP_BOARD_PERPDATE):new Date(),

          GROUP_BOARD_LENGTH: formData.GROUP_BOARD_LENGTH
            ? formData.GROUP_BOARD_LENGTH
            : null,
          GROUP_BOARD_WIDTH: formData.GROUP_BOARD_WIDTH
            ? formData.GROUP_BOARD_WIDTH
            : null,
          GROUP_BOARD_AREA: formData.GROUP_BOARD_AREA
            ? formData.GROUP_BOARD_AREA
            : null,
          GROUP_DESCRIPTION: formData.GROUP_DESCRIPTION
            ? formData.GROUP_DESCRIPTION
            : null,
        }}
      >
        <Row>
          <Col
            md={{ span: 12 }}
            sm={{ span: 24 }}
            xs={{ span: 24 }}
            className="px-3"
          >
            <Form.Item
              // rules={[
              //   {
              //     message: "من فضلك ادخل كود المجموعة",
              //     required: true,
              //   },
              // ]}
              name="GROUP_CODE"
              hasFeedback
              label="كود المجموعة"
            >
              <Input
                name="GROUP_CODE"
                disabled={true}
                // onChange={onChange}
                value={ !props.isOneLand?props.selectedAdBoards[0]: props.mainData.GROUP_CODE}
                placeholder="إدخل كود المجموعة"
              />
            </Form.Item>
          </Col>{" "}
          <Col
            md={{ span: 12 }}
            sm={{ span: 24 }}
            xs={{ span: 24 }}
            className="px-3"
          >
            <Form.Item
              hasFeedback
              label="نوع اللوحة"
              // rules={[
              //   {
              //     message: "أختر نوع اللوحة",
              //     required: true,
              //   },
              // ]}
              name="BOARD_TYPE"
            >
              <Select
                virtual={false}
                showSearch
                allowClear
                className="dont-show"
                value={formData.BOARD_TYPE ? formData.BOARD_TYPE : null}
                onChange={handleSelect("BOARD_TYPE")}
                placeholder="اختر نوع اللوحة"
                getPopupContainer={(trigger) => trigger.parentNode}
              >
                {renderDomainSelect("BOARD_TYPE")}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col
            md={{ span: 12 }}
            sm={{ span: 24 }}
            xs={{ span: 24 }}
            className="px-3"
          >
            <Form.Item
              // rules={[
              //   {
              //     message: "من فضلك ادخل عدد المواقع",
              //     required: true,
              //   },
              // ]}
              name="SITE_NO"
              hasFeedback
              label="عدد المواقع"
            >
              <Input
                name="SITE_NO"
                onChange={onChange}
                type='number'
                value={formData.SITE_NO}
                placeholder="إدخل عدد المواقع"
              />
            </Form.Item>
          </Col>{" "}
          <Col
            md={{ span: 12 }}
            sm={{ span: 24 }}
            xs={{ span: 24 }}
            className="px-3"
          >
            <Form.Item
              // rules={[
              //   {
              //     message: "من فضلك ادخل عدد اللوحات",
              //     required: true,
              //   },
              // ]}
              name="BOARD_NO"
              hasFeedback
              label="عدد اللوحات"
            >
              <Input
                name="BOARD_NO"
                type='number'
                onChange={onChange}
                value={formData.BOARD_NO}
                placeholder="إدخل عدد اللوحات"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col
            md={{ span: 12 }}
            sm={{ span: 24 }}
            xs={{ span: 24 }}
            className="px-3"
          >
            <Form.Item
              // rules={[
              //   {
              //     message: "من فضلك ادخل عدد الأوجه",
              //     required: true,
              //   },
              // ]}
              name="FRONTBOARD_NO"
              hasFeedback
              label="عدد الأوجه"
            >
              <Input
                name="FRONTBOARD_NO"
                onChange={onChange}
                type='number'
                value={formData.FRONTBOARD_NO}
                placeholder="إدخل عدد الأوجه"
              />
            </Form.Item>
          </Col>{" "}
          <Col
            md={{ span: 12 }}
            sm={{ span: 24 }}
            xs={{ span: 24 }}
            className="px-3"
          >
            <Form.Item
              // rules={[
              //   {
              //     message: "من فضلك ادخل حالة الإضاءة",
              //     required: true,
              //   },
              // ]}
              name="LIGHT_STATUS"
              hasFeedback
              label="حالة الإضاءة"
            >
              <Input
                name="LIGHT_STATUS"
                type='number'
                onChange={onChange}
                value={formData.LIGHT_STATUS}
                placeholder="إدخل حالة الإضاءة"
              />
            </Form.Item>
          </Col>{" "}
        </Row>
        <Row>
          <Col
            md={{ span: 12 }}
            sm={{ span: 24 }}
            xs={{ span: 24 }}
            className="px-3"
          >
            <Form.Item
              // rules={[
              //   {
              //     message: "من فضلك ادخل تاريخ إعداد المجموعة الدعائية",
              //     required: true,
              //   },
              // ]}
              name="GROUP_BOARD_PERPDATE"
              hasFeedback
              label="تاريخ إعداد المجموعة الدعائية"
              className="DateContainer"
              style={{ width: "100%" }}
            >
              <DatePicker
                placeholderText="&#xF073; --/--/----  "
                onChangeRaw={handleDateChangeRaw}
                selected={moment(
                  formData.GROUP_BOARD_PERPDATE
                    ? new Date(formData.GROUP_BOARD_PERPDATE)
                    : new Date()
                )}
                value={formData.GROUP_BOARD_PERPDATE?new Date(formData.GROUP_BOARD_PERPDATE):new Date()}
                onChange={handleChangeDate}
                calendar="hijri"
                id="GROUP_BOARD_PERPDATE"
                name="GROUP_BOARD_PERPDATE"
                // dateFormatCalendar= "iDD/iMM/iYYYY h:mm"
                locale="ar-SA"
              />{" "}
            </Form.Item>
          </Col>{" "}
          <Col
            md={{ span: 12 }}
            sm={{ span: 24 }}
            xs={{ span: 24 }}
            className="px-3"
          >
            <Form.Item
              // rules={[
              //   {
              //     message: "من فضلك ادخل طول اللوحة داخل المجموعة",
              //     required: true,
              //   },
              // ]}
              name="GROUP_BOARD_LENGTH"
              hasFeedback
              label="طول اللوحة داخل المجموعة"
            >
              <Input
                name="GROUP_BOARD_LENGTH"
                onChange={onChange}
                type='number'
                value={formData.GROUP_BOARD_LENGTH}
                placeholder="أدخل طول اللوحة داخل المجموعة"
              />
            </Form.Item>
          </Col>{" "}
        </Row>
        <Row>
          <Col
            md={{ span: 12 }}
            sm={{ span: 24 }}
            xs={{ span: 24 }}
            className="px-3"
          >
            <Form.Item
              // rules={[
              //   {
              //     message: "من فضلك ادخل عرض اللوحة داخل المجموعة",
              //     required: true,
              //   },
              // ]}
              name="GROUP_BOARD_WIDTH"
              hasFeedback
              label="عرض اللوحة داخل المجموعة"
            >
              <Input
                name="GROUP_BOARD_WIDTH"
                onChange={onChange}
                type='number'
                value={formData.GROUP_BOARD_WIDTH}
                placeholder="أدخل عرض اللوحة داخل المجموعة"
              />
            </Form.Item>
          </Col>{" "}
          <Col
            md={{ span: 12 }}
            sm={{ span: 24 }}
            xs={{ span: 24 }}
            className="px-3"
          >
            <Form.Item
              // rules={[
              //   {
              //     message: "من فضلك ادخل اسم المهمة",
              //     required: true,
              //   },
              // ]}
              name="GROUP_BOARD_AREA"
              hasFeedback
              label="مساحة اللوحة داخل المجموعة"
            >
              <Input
                name="GROUP_BOARD_AREA"
                onChange={onChange}
                type='number'
                value={formData.GROUP_BOARD_AREA}
                placeholder=" مساحة اللوحة داخل المجموعة"
              />
            </Form.Item>
          </Col>{" "}
        </Row>
        <Row>
          <Col
            md={{ span: 12 }}
            sm={{ span: 24 }}
            xs={{ span: 24 }}
            className="px-3"
          >
            <Form.Item
              // rules={[
              //   {
              //     message: "من فضلك ادخل وصف المجموعة",
              //     required: true,
              //   },
              // ]}
              name="GROUP_DESCRIPTION"
              hasFeedback
              label="وصف المجموعة"
            >
              <Input.TextArea
                name="GROUP_DESCRIPTION"
                onChange={onChange}
                value={formData.GROUP_DESCRIPTION}
                placeholder="إدخل وصف المجموعة "
              />
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
          حفظ
        </Button>{" "}
        <Button
          className="addbtn"
          onClick={() => props.closeModal("showAdvertinsing")}
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
  let selectedAdBoardsIds = result
    .filter((f) => f.isChecked)
    .map((adBoard) => {
      return adBoard.id;
    });
  return {
    fields,
    selectedAdBoardsIds,
    tableSettings,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AdvertisingForm);

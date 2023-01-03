import React, { useState, useRef, useEffect } from "react";
import { Row, Col, Input, Form, Button, Select, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";

import { Container, Modal } from "react-bootstrap";
import moment from "moment-hijri";
import { connect } from "react-redux";
import { notificationMessage } from "../../../../helpers/utlis/notifications_Func";
import {
  getLayerIndexFromFeatService,
  LoadModules,
} from "../../../common/mapviewer";
import { makeFlashOnAssetsWithSameAuctionNo } from "../../../map/actions";
import { HIJRI_MONTHS } from "../../../../helpers/utlis/Constants";
import { withRouter } from "react-router";
import { checkTokenExpiration } from "../../../../redux/reducers/map";

function PricingEstimateForm(props) {
  const {
    multiSelectActive,
    selectedFeatures,
    clearSelection,
    diActivateMultiSelectButton,
    emptyTempSelectedFeats,
    user,
  } = props;
  const formRef = useRef();
  const [geospatialIDs, setGeoSpatialIDs] = useState([]);
  const [formData, setFormData] = useState({
    UNIT_PRICE: "", //سعر المتر
    PRICE: "", //السعر الاجمالي
    ATTACHMENT: "", //محضر التسعير
    COMMITTEE_PRICING_DATE: "", //تاريخ محضر لجنة تقدير السعر
    NOTES: "", //الملاحظات
  });
  const [fileList, setFileList] = useState([]);
  const [attachDay, setAttachDay] = useState({
    day: "",
    month: "",
    year: "",
  });
  useEffect(() => {
    console.log({ moment });
    let geoIDs = selectedFeatures.map(
      (item) => item.attributes.SITE_GEOSPATIAL_ID
    );
    setGeoSpatialIDs(geoIDs);
    return () => {
      handleCloseModal();
    };
  }, []);

  //form func
  const onSubmit = () => {
    let { user, openLoader, closeLoader } = props;
    let errors = formRef.current.getFieldsError().filter(item=>item.errors.length);
    if(!errors.length){
        console.log(Object.values(formData).find((d) => !d));
        let formDataClone = { ...formData };
        let hijriDate = moment(
          attachDay.day + "/" + attachDay.month + "/" + attachDay.year,
          "iDD/iMM/iYYYY"
        );
        formDataClone.COMMITTEE_PRICING_DATE = new Date(hijriDate._d).getTime();
        formDataClone.ATTACHMENT = fileList.length
          ? fileList[0].response[0].data
          : "";
        let error;
        Object.values(formDataClone).forEach((item) => {
          if (item) return;
          else error = true;
        });
        if (error) return;
        else {
          openLoader();
          checkTokenExpiration(user).then((res) => {
            if (!res) {
              setTimeout(() => {
                notificationMessage("يجب إعادة تسجيل الدخول");
                closeLoader();
                props.history.replace("/Login");
                props.removeUserFromApp();
              }, 1000);
            } else {
          let urlOfFeatureService = window.__applyEditsUrl__;
          let tblIndex = getLayerIndexFromFeatService("TBL_PRICING");
          let requestObj = {};
          // geospatialIDs.forEach(gID=>{
          requestObj[tblIndex] = {
            id: tblIndex,
            adds: geospatialIDs.map((id) => {
              return {
                attributes: {
                  ...formDataClone,
                  SITE_GEOSPATIAL_ID: id,
                },
              };
            }),
          };
          // })
          console.log(requestObj);
          console.log(JSON.stringify(Object.values(requestObj)));
          LoadModules(["esri/request"]).then(([esriRequest]) => {
            console.log("send form data", formDataClone);
            var formmData = new FormData();
            formmData.append(
              "edits",
              JSON.stringify(Object.values(requestObj))
            );
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
    }
    }else return
  };
  const handleCloseModal = () => {
    window.__map__.getLayer("highLightGraphicLayer").clear();
    window.__map__.getLayer("graphicLayer_Multi_Select").clear();
    clearSelection();
    // diActivateMultiSelectButton();
    emptyTempSelectedFeats();
    setFormData({
      UNIT_PRICE: "", //سعر المتر
      PRICE: "", //السعر الاجمالي
      ATTACHMENT: "", //محضر التسعير
      COMMITTEE_PRICING_DATE: "", //تاريخ محضر لجنة تقدير السعر
      NOTES: "", //الملاحظات
    });
    setAttachDay({
      day: "",
      month: "",
      year: "",
    });
    // props.handleMapClickEvent({
    //   cursor: "default",
    //   handler: ({ mapPoint }) => makeFlashOnAssetsWithSameAuctionNo(mapPoint),
    // });
  };
  const onChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;
    if (["UNIT_PRICE", "PRICE"].includes(name))
      setFormData({ ...formData, [name]: parseFloat(value) });
    else setFormData({ ...formData, [name]: value });
  };
  const handleSelect = (value, name) => {
    let attachDayClone = { ...attachDay };
    if (!value) setAttachDay({ ...attachDayClone, [name]: "" });
    else setAttachDay({ ...attachDayClone, [name]: value });
  };
  const handleUploadFile = ({ file, fileList }) => {
    if (file.status === "uploading") {
      props.openLoader();
      // notificationMessage("جاري رفع ملف محضر التسعير",3)
    }

    if (file.status === "done") {
      setFileList(fileList);
      props.closeLoader();
    }
  };
  const handleRemoveFile = (file) => {
    setFileList([]);
  };
  const uploadProps = {
    action: window.API_URL + "uploadMultifiles",
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  };
  return (
    <Modal
      keyboard={false}
      onHide={handleCloseModal}
      show={
        multiSelectActive.isActive &&
        multiSelectActive.typeUse === "PricingEstimate" &&
        selectedFeatures.length
      }
      backdrop="static"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      size="lg"
    >
      <Modal.Header className="red-modal-header">
        <Modal.Title id="contained-modal-title-vcenter">
          إدخال السعر للموقع الاستثماري
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container className="RemarkForm">
          <Form
            layout="vertical"
            name="validate_other"
            className="pricingEstimate-form"
            ref={formRef}
            //   onFinish={onFinish}
          >
            {/** سعر المتر بالريال السعودي */}
            <Row>
              <Col span={24} className="px-3">
                <Form.Item
                  hasFeedback
                  label="سعر المتر (ريال سعودي)"
                  name="UNIT_PRICE"
                  className="tag-container"
                  type="float"
                  rules={[
                    {
                      message: "من فضلك أدخل سعر المتر (ريال سعودي)  ",
                      required: true,
                    },
                    {
                      max:15,
                      message:"ادخل اقل من 15 ارقام"
                    }
                    // {
                    // pattern:new RegExp("^[\u0621-\u064A0-9]|[\u0621-\u064A\u0660-\u0669]+$"),
                    // message: "من فضلك أدخل سعر المتر (رقم)  ",
                    // required:true
                    // }
                  ]}
                >
                  <Input
                    name="UNIT_PRICE"
                    value={formData.UNIT_PRICE}
                    onChange={onChange}
                    placeholder="سعر المتر (ريال سعودي)"
                  />
                </Form.Item>
              </Col>
            </Row>

            {/** القيمة الاجمالية للايجار السنوي (ريال سعودي) */}
            <Row>
              <Col span={24} className="px-3">
                <Form.Item
                  hasFeedback
                  label="القيمة الاجمالية للايجار السنوي (ريال سعودي)"
                  name="PRICE"
                  className="tag-container"
                  type="float"
                  rules={[
                    {
                      message:
                        "من فضلك أدخل القيمة الاجمالية للايجار السنوي (ريال سعودي)  ",
                      required: true,
                    },
                     {
                      max:15,
                      message:"ادخل اقل من 15 ارقام"
                    }
                  ]}
                >
                  <Input
                    name="PRICE"
                    value={formData.PRICE}
                    onChange={onChange}
                    placeholder="القيمة الاجمالية للايجار السنوي (ريال سعودي)"
                  />
                </Form.Item>
              </Col>
            </Row>
            {/** ارفاق محضر التسعير */}

            <Row span={24}>
              <Col className="px-3">
                <Form.Item
                  name="ATTACHMENT"
                  label="إرفاق محضر التسعير"
                  rules={[
                    {
                      message: "من فضلك أرفق محضر التسعير  ",
                      required: true,
                    },
                  ]}
                >
                  <Upload
                    {...uploadProps}
                    name="ATTACHMENT"
                    showUploadList={true}
                    fileList={fileList}
                    listType="picture-card"
                    maxCount={1}
                    onChange={handleUploadFile}
                    accept="image/*, .pdf"
                    type="file"
                    multiple={false}
                    onRemove={handleRemoveFile}
                    className="uploadBtn-pic-card"
                  >
                    {fileList && fileList.length >= 1 ? null : (
                      <div>
                        <Button block className="attachImgBtn">
                          إرفاق محضر التسعير
                          <UploadOutlined />
                        </Button>
                      </div>
                    )}
                  </Upload>
                </Form.Item>
              </Col>
            </Row>
            {/*** تاريخ محضر لجنة تقدير السعر *** */}
            <div
              className="ant-col ant-form-item-label ant-col-rtl px-3"
              style={{ display: "flex" }}
            >
              <label className="ant-form-item-required">
                تاريخ محضر لجنة تقدير السعر
              </label>
            </div>
            <Row className="justify-content-around">
              <Col className="gutter-row" span={6}>
                <Form.Item
                  hasFeedback
                  name="day"
                  rules={[
                    {
                      message: "من فضلك ادخل اليوم",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    allowClear
                    showSearch
                    filterOption={(input, option) => {
                      return (
                        option.value
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      );
                    }}
                    className="dont-show"
                    // onDeselect={()=>handleDeSelect("day")}
                    // onClear={()=>handleDeSelect("day")}
                    name="day"
                    value={attachDay.day}
                    onChange={(e) => handleSelect(e, "day")}
                    placeholder=" اليوم"
                    getPopupContainer={(trigger) => trigger.parentNode}
                  >
                    {Array(30)
                      .fill(1)
                      .map((i, index) => {
                        return (
                          <Select.Option
                            key={index}
                            className="text-right"
                            value={
                              index + 1 < 10
                                ? String("0" + (+index + 1))
                                : String(+index + 1)
                            }
                          >
                            {index + 1}
                          </Select.Option>
                        );
                      })}
                  </Select>
                </Form.Item>
              </Col>
              {/* month */}
              <Col className="gutter-row ml-1 mr-1" span={8}>
                <Form.Item
                  hasFeedback
                  name="month"
                  rules={[
                    {
                      message: "من فضلك ادخل الشهر",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    allowClear
                    showSearch
                    filterOption={(input, option) => {
                      return (
                        option.key.toLowerCase().indexOf(input.toLowerCase()) >=
                        0
                      );
                    }}
                    className="dont-show"
                    value={attachDay.month}
                    // onDeselect={()=>handleDeSelect("month")}
                    // onClear={()=>handleDeSelect("month")}
                    name="month"
                    onChange={(e) => handleSelect(e, "month")}
                    placeholder=" الشهر"
                    getPopupContainer={(trigger) => trigger.parentNode}
                  >
                    {HIJRI_MONTHS.map((month, index) => {
                      return (
                        <Select.Option
                          key={month}
                          className="text-right"
                          value={
                            index + 1 < 10
                              ? String("0" + (+index + 1))
                              : String(+index + 1)
                          }
                        >
                          {month}
                        </Select.Option>
                      );
                    })}
                  </Select>
                </Form.Item>
              </Col>
              {/* year */}
              <Col className="gutter-row" span={6}>
                <Form.Item
                  hasFeedback
                  name="year"
                  rules={[
                    {
                      message: "من فضلك ادخل السنة",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    allowClear
                    showSearch
                    filterOption={(input, option) => {
                      return (
                        option.value
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      );
                    }}
                    className="dont-show"
                    // onDeselect={()=>handleDeSelect("year")}
                    // onClear={()=>handleDeSelect("year")}
                    name="year"
                    value={attachDay.year}
                    onChange={(e) => handleSelect(e, "year")}
                    placeholder=" السنة"
                    getPopupContainer={(trigger) => trigger.parentNode}
                  >
                    {Array(11)
                      .fill(moment().format("iYYYY") - 10)
                      .reduce((all, item, index) => {
                        if (!all.length) all = [String(item)];
                        else all.push(String(item + index));
                        return all;
                      }, [])
                      .map((item, key) => (
                        <Select.Option
                          key={key}
                          className="text-right"
                          value={item}
                        >
                          {item}
                        </Select.Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            {/** الملاحظات */}
            <Row>
              <Col span={24} className="px-3">
                <Form.Item
                  hasFeedback
                  label="الملاحظات"
                  name="NOTES"
                  rules={[
                    {
                      message: "من فضلك أدخل الملاحظات  ",
                      required: true,
                    },
                    {
                      max:50,
                      message:"ادخل اقل من 50 حرف "
                    }
                  ]}
                  // required={true}
                  // initialValue={formData.SITE_SUBTYPE?formData.SITE_SUBTYPE:null}
                >
                  <Input.TextArea
                    name="NOTES"
                    row={3}
                    maxLength={500}
                    onChange={onChange}
                    value={formData.NOTES}
                    placeholder="ادخل الملاحظات"
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
  const { selectedFeatures, multiSelectActive } = mapUpdate;
  return {
    selectedFeatures,
    multiSelectActive,
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
    diActivateMultiSelectButton: () =>
      dispatch({ type: "DIACTIVATE_MULTI_SELECT" }),
    emptyTempSelectedFeats: () => dispatch({ type: "EMPTY_DATA_FROM_TEMP" }),
    removeUserFromApp: () => dispatch({ type: "LOGOUT" }),
  };
};
export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(PricingEstimateForm)
);
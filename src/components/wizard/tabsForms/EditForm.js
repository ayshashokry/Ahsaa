import React, { useState } from "react";
import { Container, Modal } from "react-bootstrap";
import { Row, Col, Select, Form, Input, Button, notification } from "antd";
import "@deskpro/react-datepicker-hijri/dist/react-datepicker.css";
import DatePicker from "@deskpro/react-datepicker-hijri";
import { useEffect } from "react";
import { connect } from "react-redux";
import { getFeatureDomainName, getLayerIndex, queryTask } from "../../common/mapviewer";

function EditForm(props) {
  const [commonUse, setCommonUse] = useState([]);

  const [formData, onSetForm] = useState(() => {
    console.log(props);
    let initState =
      props.multiSelectActive.layerName !== "ADVERTISING_BOARDS"
        ? {
            SITE_SUBTYPE: "",
            PARCEL_PLAN_NO: "",
            SITE_STATUS: "",
            SITE_COMMON_USE: "",
            STREET_WIDTH: "",
            STREET_NAME: "",
            REMARKS: "",
            USING_SYMBOL: "",
            SITE_INVEST_TYPE: "",
            FILE_NUMBER: "",
            CONTRACT_NUMBER: "",
            AUCTION_NO: "",
            SOURCE_TYPE: "",
            SERIAL: "",
            SITE_LANDUSE: "",
            SECTION_NO: "",
            SITE_PART_ID: "",
          }
        : {
            PLAN_NO: "",
            STREET_WIDTH: "",
            STREET_NAME: "",
            SITE_STATUS: "",
            SITE_FIELD_SERIAL: "",
            REMARKS: "",
            CONTRACT_NUMBER: "",
            FILE_NUMBER: "",
            GROUP_CODE: "",
            REASON_INFRACTION: "",
            SOURCE_TYPE: "",
            AUCTION_NO: "",
            SITE_CONFORM_SPECIFICATIONS: "",
            SITE_COMMON_USE: "",
            SITE_XUTM_COORD: "",
            SITE_YUTM_COORD: "",
            SITE_ACTIVITY_ISIC: "",
          };
    let formDataFilled = {};
    Object.keys(initState).forEach((item) => {
      if(item=="SITE_CONFORM_SPECIFICATIONS"&&item!=="") formDataFilled[item] = props.data[item]; 
      if(item=="REASON_INFRACTION"&&item!=="") formDataFilled[item] = props.data[item]; 
     else formDataFilled[item] = props.data[item];
    });
    return formDataFilled;
  });
  useEffect(() => {
    if(props.layername)
    catchCommonUses(props.layername);

    return () => {
      console.log("will mount");
      props.closeLoader();
      return null;
    };
  }, []);

  const validateFieldValue = (value) => {
    if (value) return true;
    else return false;
  };

  const onChange = (e) => {
    const value = e.target.value;
    const name = e.target.name;
    if (name === "SITE_FIELD_SERIAL")
      onSetForm({ ...formData, [name]: parseFloat(value) });
    else onSetForm({ ...formData, [name]: value });
  };

  const handleSelect = (name) => (e) => {
    onSetForm({ ...formData, [name]: e });
  };

  const notificationNoData = () => {
    const args = {
      description: "تم التعديل بنجاح",
      duration: 3,
    };
    notification.open(args);
  };

  const onSubmit = (e) => {
    let layerNameOfCurrentRow = props.tableSettings.result.find(
      (item) => item.id === props.id
    ).layername;
    let isCurrentLayerInvestSitePolygon =
      layerNameOfCurrentRow.toLocaleLowerCase() === "invest_site_polygon";
    let validationCodition = true;
    //  isCurrentLayerInvestSitePolygon
    //   ? validateFieldValue(formData.PARCEL_PLAN_NO) &&
    //     validateFieldValue(formData.SITE_SUBTYPE) &&
    //     validateFieldValue(formData.SITE_STATUS) &&
    //     validateFieldValue(formData.SITE_COMMON_USE)
    //   : validateFieldValue(formData.SITE_STATUS) &&
    //     validateFieldValue(formData.PLAN_NO) &&
    //     validateFieldValue(formData.GROUP_CODE) &&
    //     validateFieldValue(formData.SITE_COMMON_USE) &&
    //     validateFieldValue(formData.SITE_ACTIVITY_ISIC);
    if (validationCodition) {
      /*****************/
      // if there is a change in group code in ad boards layer
      let tableSettingsClone = { ...props.tableSettings };
      let currentFeature = tableSettingsClone.result.find(
        (f) => f.id === props.id
      );
      if (props.layername.toUpperCase() == "ADVERTISING_BOARDS") {
        let originGroupCode = currentFeature.fieldsBeforeEdit.GROUP_CODE;
        let isGroupCodeChanged = formData.GROUP_CODE == originGroupCode;
        if (!isGroupCodeChanged) {
          props.openLoader();
          let tblIndex = getLayerIndex("TBL_BOARDS_GROUP");
          //check first is this ad board group is already existed before if so get it from redux
          let isAdBoardGroupExistingBefore = props.existingAdBoardsGroup.find(
            (ad) => ad.GROUP_CODE === formData.GROUP_CODE
          );
          if (isAdBoardGroupExistingBefore) {
            let adAttributes = isAdBoardGroupExistingBefore;
            let validationCoditionForTblDataOfAdBoardsGroup =
              validateFieldValue(adAttributes.GROUP_CODE) &&
              validateFieldValue(adAttributes.BOARD_TYPE !== "") &&
              validateFieldValue(adAttributes.SITE_NO) &&
              validateFieldValue(adAttributes.BOARD_NO) &&
              validateFieldValue(adAttributes.FRONTBOARD_NO) &&
              validateFieldValue(adAttributes.LIGHT_STATUS) &&
              validateFieldValue(adAttributes.GROUP_BOARD_PERPDATE) &&
              validateFieldValue(adAttributes.GROUP_BOARD_LENGTH) &&
              validateFieldValue(adAttributes.GROUP_BOARD_WIDTH) &&
              validateFieldValue(adAttributes.GROUP_BOARD_AREA) &&
              validateFieldValue(adAttributes.GROUP_DESCRIPTION);
            currentFeature.adBoardsDataAfter = adAttributes;

            if (validationCoditionForTblDataOfAdBoardsGroup) {
              currentFeature.isCompletedFilled.tblData = {
                bool: true,
                name: "tblData",
              };
              // currentFeature.adBoardsDataAfter = attributes
            } else {
              currentFeature.isCompletedFilled.tblData = {
                bool: false,
                name: "tblData",
              };
            }
            props.closeLoader();
            // notificationNoData();
            props.editIsFeatureCompletedFilled(tableSettingsClone);
          } else
            queryTask({
              returnGeometry: false,
              url: `${window.__mapUrl__}/${tblIndex}`,
              outFields: ["*"],
              where: `GROUP_CODE=${formData.GROUP_CODE}`,
              callbackResult: ({ features }) => {
                let attributes = features[0].attributes;
                let validationCoditionForTblDataOfAdBoardsGroup =
                  validateFieldValue(attributes.GROUP_CODE) &&
                  validateFieldValue(attributes.BOARD_TYPE !== "") &&
                  validateFieldValue(attributes.SITE_NO) &&
                  validateFieldValue(attributes.BOARD_NO) &&
                  validateFieldValue(attributes.FRONTBOARD_NO) &&
                  validateFieldValue(attributes.LIGHT_STATUS) &&
                  validateFieldValue(attributes.GROUP_BOARD_PERPDATE) &&
                  validateFieldValue(attributes.GROUP_BOARD_LENGTH) &&
                  validateFieldValue(attributes.GROUP_BOARD_WIDTH) &&
                  validateFieldValue(attributes.GROUP_BOARD_AREA) &&
                  validateFieldValue(attributes.GROUP_DESCRIPTION);
                if (validationCoditionForTblDataOfAdBoardsGroup) {
                  currentFeature.isCompletedFilled.tblData = {
                    bool: true,
                    name: "tblData",
                  };
                  currentFeature.adBoardsDataAfter = attributes;
                } else
                  currentFeature.isCompletedFilled.tblData = {
                    bool: false,
                    name: "tblData",
                  };
                props.closeLoader();
                // notificationNoData();
                props.editIsFeatureCompletedFilled(tableSettingsClone);
              },
              callbackError: (err) => {
                if (err) {
                  currentFeature.isCompletedFilled.tblData = {
                    bool: false,
                    name: "tblData",
                  };
                  props.closeLoader();
                  // notificationNoData();
                  props.editIsFeatureCompletedFilled(tableSettingsClone);
                }
              },
            });
        } else {
          let attributes = currentFeature.adBoardsDataAfter;
          let validationCoditionForTblDataOfAdBoardsGroup = true;
          // validateFieldValue(attributes.GROUP_CODE) &&
          // validateFieldValue(attributes.BOARD_TYPE !== "") &&
          // validateFieldValue(attributes.SITE_NO) &&
          // validateFieldValue(attributes.BOARD_NO) &&
          // validateFieldValue(attributes.FRONTBOARD_NO) &&
          // validateFieldValue(attributes.LIGHT_STATUS) &&
          // validateFieldValue(attributes.GROUP_BOARD_PERPDATE) &&
          // validateFieldValue(attributes.GROUP_BOARD_LENGTH) &&
          // validateFieldValue(attributes.GROUP_BOARD_WIDTH) &&
          // validateFieldValue(attributes.GROUP_BOARD_AREA) &&
          // validateFieldValue(attributes.GROUP_DESCRIPTION);
          if (validationCoditionForTblDataOfAdBoardsGroup) {
            currentFeature.isCompletedFilled.tblData = {
              bool: true,
              name: "tblData",
            };
          } else
            currentFeature.isCompletedFilled.tblData = {
              bool: false,
              name: "tblData",
            };
          currentFeature.adBoardsDataAfter = attributes;
        }
      }
      //check if user change subType
      else if (props.layername.toUpperCase() == "INVEST_SITE_POLYGON") {
        let originSubType = currentFeature.fieldsBeforeEdit.SITE_SUBTYPE;
        let isSubTypeChanged = formData.SITE_SUBTYPE == originSubType;
        if (!isSubTypeChanged && formData.SITE_SUBTYPE != 4) {
          currentFeature.isCompletedFilled.tblData = {
            bool: false,
            name: "tblData",
          };
          props.editIsFeatureCompletedFilled(tableSettingsClone);
        } else if (!isSubTypeChanged && formData.SITE_SUBTYPE == 4) {
          currentFeature.isCompletedFilled.tblData = {
            bool: true,
            name: "tblData",
          };
          props.editIsFeatureCompletedFilled(tableSettingsClone);
        }
      }
      /***** */
      notificationNoData();
      let dataOfMainData = {};
      Object.entries(formData).forEach(item=>{
        if(item[1]) dataOfMainData[item[0]]=item[1];
        else if(item[0]==="SITE_CONFORM_SPECIFICATIONS"&&item[1]!=="") dataOfMainData[item[0]]=item[1];
        else if(item[0]==="REASON_INFRACTION"&&item[1]!=="")dataOfMainData[item[0]]=item[1];
        });
      //edit main data
      props.editAttributes(props.id, "fieldsForEdit", dataOfMainData);
      //mark main data as completed

      currentFeature.isCompletedFilled.mainData.bool = true;
      props.markMainDataAsCompleted(tableSettingsClone);

      /************ */
      onSetForm({
        SITE_SUBTYPE: "",
        PARCEL_PLAN_NO: "",
        SITE_STATUS: "",
        SITE_COMMON_USE: "",
        STREET_WIDTH: "",
        STREET_NAME: "",
        REMARKS: "",
        USING_SYMBOL: "",
        SITE_INVEST_TYPE: "",
        FILE_NUMBER: "",
        CONTRACT_NUMBER: "",
        AUCTION_NO: "",
        SOURCE_TYPE: "",
        SERIAL: "",
        SITE_LANDUSE: "",
        SECTION_NO: "",
        SITE_PART_ID: "",
      });
      props.closeModal("showEditModal");
    }
  };

  const renderDomainSelect = (fieldname) => {
    const { fields } = props;
    if (!fields) return null;
    let layername = props.layername.toLocaleLowerCase();
    let domain = fields[layername].find((field) => field.name == fieldname)
      .domain.codedValues;
    if (
      fieldname == "SITE_SUBTYPE" &&
      layername == "Invest_Site_Polygon".toLocaleLowerCase()
    )
      domain = domain.filter((item) => item.code !== 2);
    else if (
      fieldname == "SITE_SUBTYPE" &&
      layername == "ADVERTISING_BOARDS".toLocaleLowerCase()
    )
      domain = domain.filter((item) => item.code === 2);
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
        ) :fieldname==="SITE_STATUS"&&cv.code!==1?(
          <img
          className="server-img-icon-svg"
          src={`${window.imagesServerUrl}/SITE_MAIN_ACTIVITY_FORAS/${
            cv.code==2?"222":cv.code==3?"111":"333"
          }.svg`}
          alt="img"
        />
        ): (
          ""
        )}
      </Select.Option>
    ));
  };
  const catchCommonUses = (layername) => {
    var layerIndex = getLayerIndex(layername);
    queryTask({
      returnGeometry: false,
      url: `${window.__mapUrl__}/${layerIndex}`,
      returnDistinctValues: true,
      outFields: ["SITE_COMMON_USE"],
      where: `1=1`,
      callbackResult: ({ features }) => {
        console.log({features});
        if(features.length)
        getFeatureDomainName(features, layerIndex).then((commonuses) => {
          console.log({commonuses});
          setCommonUse(commonuses.filter(f=>f.attributes.SITE_COMMON_USE_Code).map(f=>f.attributes.SITE_COMMON_USE_Code))
        });
      },
    });
  };
  return (
    <Form
      layout="vertical"
      name="validate_other"
      //   onFinish={onFinish}
      initialValues={{
        SITE_SUBTYPE: formData.SITE_SUBTYPE ? formData.SITE_SUBTYPE : null,
        PARCEL_PLAN_NO: formData.PARCEL_PLAN_NO
          ? formData.PARCEL_PLAN_NO
          : null,
        SECTION_NO: formData.SECTION_NO ? formData.SECTION_NO : null,
        SITE_FIELD_SERIAL: formData.SITE_FIELD_SERIAL
          ? formData.SITE_FIELD_SERIAL
          : null,
        SITE_COMMON_USE: formData.SITE_COMMON_USE
          ? formData.SITE_COMMON_USE
          : null,
        PLAN_NO: formData.PLAN_NO ? formData.PLAN_NO : null,
        GROUP_CODE: formData.GROUP_CODE ? formData.GROUP_CODE : null,
        STREET_WIDTH: formData.STREET_WIDTH ? formData.STREET_WIDTH : null,
        STREET_NAME: formData.STREET_NAME ? formData.STREET_NAME : null,
        USING_SYMBOL: formData.USING_SYMBOL ? formData.USING_SYMBOL : null,
        SITE_INVEST_TYPE: formData.SITE_INVEST_TYPE
          ? formData.SITE_INVEST_TYPE
          : null,
        FILE_NUMBER: formData.FILE_NUMBER ? formData.FILE_NUMBER : null,
        CONTRACT_NUMBER: formData.CONTRACT_NUMBER
          ? formData.CONTRACT_NUMBER
          : null,
        AUCTION_NO: formData.AUCTION_NO ? formData.AUCTION_NO : null,
        SOURCE_TYPE: formData.SOURCE_TYPE ? formData.SOURCE_TYPE : null,
        SERIAL: formData.SERIAL ? formData.SERIAL : null,
        SITE_LANDUSE: formData.SITE_LANDUSE ? formData.SITE_LANDUSE : null,
        REASON_INFRACTION: formData.REASON_INFRACTION
          ? formData.REASON_INFRACTION
          : null,
        SITE_CONFORM_SPECIFICATIONS: formData.SITE_CONFORM_SPECIFICATIONS
          ? formData.SITE_CONFORM_SPECIFICATIONS
          : null,
        SITE_XUTM_COORD: formData.SITE_XUTM_COORD
          ? formData.SITE_XUTM_COORD
          : null,
        SITE_YUTM_COORD: formData.SITE_YUTM_COORD
          ? formData.SITE_YUTM_COORD
          : null,
        SITE_STATUS: formData.SITE_STATUS ? formData.SITE_STATUS : null,
        SITE_PART_ID: formData.SITE_PART_ID ? formData.SITE_PART_ID : null,
        SITE_ACTIVITY_ISIC: formData.SITE_ACTIVITY_ISIC
          ? formData.SITE_ACTIVITY_ISIC
          : null,
        REMARKS: formData.REMARKS ? formData.REMARKS : null,
      }}
    >
      {props.multiSelectActive.layerName !== "ADVERTISING_BOARDS" && (
        <>
          <Row>
            <Col
              md={{ span: 12 }}
              sm={{ span: 24 }}
              xs={{ span: 24 }}
              className="px-3"
            >
              <Form.Item
                hasFeedback
                label="نوع الموقع الإستثماري"
                name="SITE_SUBTYPE"
                // rules={[
                //   {
                //     message: "من فضلك أختر موقع  ",
                //     required: true,
                //   },
                // ]}
                // required={true}
                // initialValue={formData.SITE_SUBTYPE?formData.SITE_SUBTYPE:null}
              >
                <Select
                  value={formData.SITE_SUBTYPE}
                  virtual={false}
                  showSearch
                  allowClear
                  onChange={handleSelect("SITE_SUBTYPE")}
                  placeholder="اختر نوع الموقع الإستثماري"
                  getPopupContainer={(trigger) => trigger.parentNode}
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
                >
                  {renderDomainSelect("SITE_SUBTYPE")}
                </Select>
              </Form.Item>
            </Col>
            <Col
              md={{ span: 12 }}
              sm={{ span: 24 }}
              xs={{ span: 24 }}
              className="px-3"
            >
              <Form.Item
                // rules={[
                //   {
                //     message: "من فضلك ادخل رقم قطعة الأرض بالمخطط",
                //     required: true,
                //   },
                // ]}
                name="PARCEL_PLAN_NO"
                hasFeedback
                label="رقم قطعة الأرض بالمخطط"
                // initialValue={
                //   formData.PARCEL_PLAN_NO ? formData.PARCEL_PLAN_NO : null
                // }
              >
                <Input
                  name="PARCEL_PLAN_NO"
                  onChange={onChange}
                  value={formData.PARCEL_PLAN_NO}
                  placeholder="إدخل رقم قطعة الأرض بالمخطط"
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
              <Form.Item name="SECTION_NO" label="رقم التقسيم">
                <Input
                  name="SECTION_NO"
                  onChange={onChange}
                  value={formData.SECTION_NO}
                  placeholder="إدخل رقم التقسيم"
                />
              </Form.Item>
            </Col>
            <Col
              md={{ span: 12 }}
              sm={{ span: 24 }}
              xs={{ span: 24 }}
              className="px-3"
            >
              <Form.Item
                hasFeedback
                name="SITE_COMMON_USE"
                label="الاستخدام الشائع"
                // rules={[
                //   {
                //     message: "أختر الاستخدام الشائع",
                //     required: true,
                //   },
                // ]}
              >
                <Select
                  name="SITE_COMMON_USE"
                  value={formData.SITE_COMMON_USE}
                  virtual={false}
                  showSearch
                  allowClear
                  className="dont-show"
                  onChange={handleSelect("SITE_COMMON_USE")}
                  placeholder="اختر الاستخدام الشائع"
                  getPopupContainer={(trigger) => trigger.parentNode}
                  filterOption={(input, option) => {
                    if (
                      typeof option.children === "object"
                      )
                      return (
                        option.children[0]
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      );
                    else return -1;
                  }}
                >
                  {renderDomainSelect("SITE_COMMON_USE")}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </>
      )}
      {/* plan_no, Group Code */}
      {props.multiSelectActive.layerName == "ADVERTISING_BOARDS" && (
        <Row>
          <Col
            md={{ span: 12 }}
            sm={{ span: 24 }}
            xs={{ span: 24 }}
            className="px-3"
          >
            <Form.Item
              name="PLAN_NO"
              label="رقم المخطط"
              // rules={[
              //   {
              //     message: "إدخل رقم المخطط",
              //     required: true,
              //   },
              // ]}
            >
              <Input
                name="PLAN_NO"
                onChange={onChange}
                value={formData.PLAN_NO}
                placeholder="إدخل رقم المخطط"
              />
            </Form.Item>
          </Col>
          <Col
            md={{ span: 12 }}
            sm={{ span: 24 }}
            xs={{ span: 24 }}
            className="px-3"
          >
            <Form.Item
              name="GROUP_CODE"
              label="كود المجموعة الاعلانية"
              // rules={[
              //   {
              //     message: "إدخل كود المجموعة الاعلانية",
              //     required: true,
              //   },
              // ]}
            >
              <Input
                name="GROUP_CODE"
                onChange={onChange}
                value={formData.GROUP_CODE}
                placeholder="إدخل كود المجموعة الاعلانية"
              />
            </Form.Item>
          </Col>
        </Row>
      )}
      <Row>
        <Col
          md={{ span: 12 }}
          sm={{ span: 24 }}
          xs={{ span: 24 }}
          className="px-3"
        >
          <Form.Item name="STREET_WIDTH" label="عرض الشارع">
            <Input
              name="STREET_WIDTH"
              onChange={onChange}
              type="number"
              value={formData.STREET_WIDTH}
              placeholder="إدخل عرض الشارع"
            />
          </Form.Item>
        </Col>{" "}
        <Col
          md={{ span: 12 }}
          sm={{ span: 24 }}
          xs={{ span: 24 }}
          className="px-3"
        >
          <Form.Item name="STREET_NAME" label="إسم الشارع">
            <Input
              name="STREET_NAME"
              type="string"
              onChange={onChange}
              value={formData.STREET_NAME}
              placeholder="إدخل إسم الشارع"
            />
          </Form.Item>
        </Col>
      </Row>
      {props.multiSelectActive.layerName !== "ADVERTISING_BOARDS" && (
        <Row>
          <Col
            md={{ span: 12 }}
            sm={{ span: 24 }}
            xs={{ span: 24 }}
            className="px-3"
          >
            <Form.Item name="USING_SYMBOL" label="رمز الإستخدام">
              <Select
                name="USING_SYMBOL"
                value={formData.USING_SYMBOL}
                virtual={false}
                showSearch
                allowClear
                className="dont-show"
                onChange={handleSelect("USING_SYMBOL")}
                placeholder="اختر رمز الإستخدام"
                getPopupContainer={(trigger) => trigger.parentNode}
              >
                {renderDomainSelect("USING_SYMBOL")}
              </Select>
            </Form.Item>
          </Col>
          <Col
            md={{ span: 12 }}
            sm={{ span: 24 }}
            xs={{ span: 24 }}
            className="px-3"
          >
            <Form.Item name="SITE_INVEST_TYPE" label="نوع الإستثمار">
              <Select
                name="SITE_INVEST_TYPE"
                value={formData.SITE_INVEST_TYPE}
                virtual={false}
                showSearch
                allowClear
                className="dont-show"
                onChange={handleSelect("SITE_INVEST_TYPE")}
                placeholder="اختر نوع الإستثمار"
                getPopupContainer={(trigger) => trigger.parentNode}
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
              >
                {renderDomainSelect("SITE_INVEST_TYPE")}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      )}

      <Row>
        <Col
          md={{ span: 12 }}
          sm={{ span: 24 }}
          xs={{ span: 24 }}
          className="px-3"
        >
          <Form.Item name="FILE_NUMBER" label="رقم الملف">
            <Input
              name="FILE_NUMBER"
              onChange={onChange}
              value={formData.FILE_NUMBER}
              placeholder="إدخل رقم الملف"
            />
          </Form.Item>
        </Col>{" "}
        <Col
          md={{ span: 12 }}
          sm={{ span: 24 }}
          xs={{ span: 24 }}
          className="px-3"
        >
          <Form.Item name="CONTRACT_NUMBER" label="رقم العقد">
            <Input
              name="CONTRACT_NUMBER"
              onChange={onChange}
              value={formData.CONTRACT_NUMBER}
              placeholder="إدخل رقم العقد"
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
          <Form.Item name="AUCTION_NO" label="رقم المنافسة">
            <Input
              name="AUCTION_NO"
              onChange={onChange}
              value={formData.AUCTION_NO}
              placeholder="إدخل رقم المنافسة"
            />
          </Form.Item>
        </Col>
        <Col
          md={{ span: 12 }}
          sm={{ span: 24 }}
          xs={{ span: 24 }}
          className="px-3"
        >
          <Form.Item name="SOURCE_TYPE" label="نوع الأصل">
            <Select
              name="SOURCE_TYPE"
              value={formData.SOURCE_TYPE}
              virtual={false}
              showSearch
              allowClear
              className="dont-show"
              onChange={handleSelect("SOURCE_TYPE")}
              placeholder="اختر نوع الأصل"
              getPopupContainer={(trigger) => trigger.parentNode}
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
            >
              {renderDomainSelect("SOURCE_TYPE")}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      {props.multiSelectActive.layerName !== "ADVERTISING_BOARDS" && (
        <Row>
          <Col
            md={{ span: 12 }}
            sm={{ span: 24 }}
            xs={{ span: 24 }}
            className="px-3"
          >
            <Form.Item name="SERIAL" label="التسلسل">
              <Input
                type="number"
                name="SERIAL"
                onChange={onChange}
                value={formData.SERIAL}
                placeholder="إدخل التسلسل"
              />
            </Form.Item>
          </Col>
          <Col
            md={{ span: 12 }}
            sm={{ span: 24 }}
            xs={{ span: 24 }}
            className="px-3"
          >
            <Form.Item name="SITE_LANDUSE" label="استخدام قطعة الأرض بالمخطط">
              <Input
                name="SITE_LANDUSE"
                onChange={onChange}
                value={formData.SITE_LANDUSE}
                placeholder="إدخل استخدام قطعة الأرض بالمخطط"
              />
            </Form.Item>
          </Col>{" "}
        </Row>
      )}

      {/* REASON_INFRACTION , SITE_CONFORM_SPECIFICATIONS  */}
      {props.multiSelectActive.layerName == "ADVERTISING_BOARDS" && (
        <Row>
          <Col
            md={{ span: 12 }}
            sm={{ span: 24 }}
            xs={{ span: 24 }}
            className="px-3"
          >
            <Form.Item name="REASON_INFRACTION" label="نوع المخالفة الميدانية">
              <Select
                name="REASON_INFRACTION"
                value={formData.REASON_INFRACTION}
                virtual={false}
                showSearch
                allowClear
                className="dont-show"
                onChange={handleSelect("REASON_INFRACTION")}
                placeholder="اختر نوع المخالفة الميدانية"
                getPopupContainer={(trigger) => trigger.parentNode}
                filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                }
              >
                {renderDomainSelect("REASON_INFRACTION")}
              </Select>
            </Form.Item>
          </Col>
          <Col
            md={{ span: 12 }}
            sm={{ span: 24 }}
            xs={{ span: 24 }}
            className="px-3"
          >
            <Form.Item
              name="SITE_CONFORM_SPECIFICATIONS"
              label="مطابقة اللوحة للمواصفات"
            >
              <Select
                name="SITE_CONFORM_SPECIFICATIONS"
                value={formData.SITE_CONFORM_SPECIFICATIONS}
                virtual={false}
                showSearch
                allowClear
                className="dont-show"
                onChange={handleSelect("SITE_CONFORM_SPECIFICATIONS")}
                placeholder="اختر مطابقة اللوحة للمواصفات"
                getPopupContainer={(trigger) => trigger.parentNode}
                filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                }
              >
                {renderDomainSelect("SITE_CONFORM_SPECIFICATIONS")}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      )}
      {/* SITE_XUTM_COORD , SITE_YUTM_COORD */}
      {props.multiSelectActive.layerName == "ADVERTISING_BOARDS" && (
        <Row>
          <Col
            md={{ span: 12 }}
            sm={{ span: 24 }}
            xs={{ span: 24 }}
            className="px-3"
          >
            <Form.Item name="SITE_XUTM_COORD" label="الإحداثي السيني ">
              <Input
                name="SITE_XUTM_COORD"
                onChange={onChange}
                value={formData.SITE_XUTM_COORD}
                placeholder="إدخل الإحداثي السيني "
              />
            </Form.Item>
          </Col>
          <Col
            md={{ span: 12 }}
            sm={{ span: 24 }}
            xs={{ span: 24 }}
            className="px-3"
          >
            <Form.Item name="SITE_YUTM_COORD" label="الإحداثي الصادي ">
              <Input
                name="SITE_YUTM_COORD"
                onChange={onChange}
                value={formData.SITE_YUTM_COORD}
                placeholder="إدخل الإحداثي الصادي "
              />
            </Form.Item>
          </Col>
        </Row>
      )}
      {/* SITE_ACTIVITY_ISIC  */}

      <Row>
        <Col
          md={{ span: 12 }}
          sm={{ span: 24 }}
          xs={{ span: 24 }}
          className="px-3"
        >
          <Form.Item
            hasFeedback
            name="SITE_STATUS"
            label="حالة الموقع"
            // rules={[
            //   {
            //     message: "أختر حالة الموقع",
            //     required: true,
            //   },
            // ]}
            // initialValue={formData.SITE_STATUS ? formData.SITE_STATUS : null}
          >
            <Select
              name="SITE_STATUS"
              value={formData.SITE_STATUS}
              virtual={false}
              showSearch
              allowClear
              className="dont-show"
              onChange={handleSelect("SITE_STATUS")}
              placeholder="اختر حالة الموقع"
              getPopupContainer={(trigger) => trigger.parentNode}
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
            >
              {renderDomainSelect("SITE_STATUS")}
            </Select>
          </Form.Item>
        </Col>

        <Col
          md={{ span: 12 }}
          sm={{ span: 24 }}
          xs={{ span: 24 }}
          className="px-3"
        >
          <Form.Item name="SITE_PART_ID" label="رقم الأرض بمنظومة الأمانة">
            <Input
              name="SITE_PART_ID"
              type="number"
              onChange={onChange}
              value={formData.SITE_PART_ID}
              placeholder="إدخل رقم الأرض بمنظومة الأمانة"
            />
          </Form.Item>
        </Col>
      </Row>
      {/* // */}
      {props.multiSelectActive.layerName == "ADVERTISING_BOARDS" && (
        <>
          <Row>
            <Col span={24} className="px-3">
              <Form.Item
                hasFeedback
                name="SITE_COMMON_USE"
                label=" الاستخدام الشائع "
                // rules={[
                //   {
                //     message: "أختر  الاستخدام الشائع ",
                //     required: true,
                //   },
                // ]}
                // initialValue={formData.SITE_COMMON_USE ? formData.SITE_COMMON_USE : null}
              >
                <Select
                  name="SITE_COMMON_USE"
                  value={formData.SITE_COMMON_USE}
                  virtual={false}
                  showSearch
                  allowClear
                  className="dont-show"
                  onChange={handleSelect("SITE_COMMON_USE")}
                  placeholder="اختر  الاستخدام الشائع "
                  getPopupContainer={(trigger) => trigger.parentNode}
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
                >
                  {renderDomainSelect("SITE_COMMON_USE")}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24} className="px-3">
              <Form.Item
                hasFeedback
                name="SITE_ACTIVITY_ISIC"
                label="نشاط من isic"
                // rules={[
                //   {
                //     message: "أختر نشاط من isic",
                //     required: true,
                //   },
                // ]}
                // initialValue={formData.SITE_ACTIVITY_ISIC ? formData.SITE_ACTIVITY_ISIC : null}
              >
                <Select
                  name="SITE_ACTIVITY_ISIC"
                  value={formData.SITE_ACTIVITY_ISIC}
                  virtual={false}
                  showSearch
                  allowClear
                  className="dont-show"
                  onChange={handleSelect("SITE_ACTIVITY_ISIC")}
                  placeholder="اختر نشاط من isic"
                  getPopupContainer={(trigger) => trigger.parentNode}
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
                >
                  {renderDomainSelect("SITE_ACTIVITY_ISIC")}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24} className="px-3">
              <Form.Item name="SITE_FIELD_SERIAL" label="رقم اللوحة بالموقع">
                <Input
                  name="SITE_FIELD_SERIAL"
                  onChange={onChange}
                  type="number"
                  value={formData.SITE_FIELD_SERIAL}
                  placeholder="إدخل رقم اللوحة بالموقع"
                />
              </Form.Item>
            </Col>
          </Row>
        </>
      )}
      <Row>
        <Col span={12} className="px-3">
          <Form.Item name="FILE_NUMBER" hasFeedback label="رقم الملف">
            <Input
              name="FILE_NUMBER"
              onChange={onChange}
              value={formData.FILE_NUMBER}
              placeholder="إدخل رقم الملف "
            />
          </Form.Item>
        </Col>
        <Col span={12} className="px-3">
          <Form.Item name="REMARKS" hasFeedback label="ملاحظات">
            <Input.TextArea
              name="REMARKS"
              onChange={onChange}
              value={formData.REMARKS}
              placeholder="إدخل ملاحظات "
            />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        {" "}
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
          onClick={() => props.closeModal("showEditModal")}
          size="large"
        >
          إلغاء
        </Button>
      </Row>
    </Form>
  );
}
const mapStateToProps = ({ mapUpdate }) => {
  const { fields, currentUser, tableSettings, multiSelectActive } = mapUpdate;
  //for ad boards group only
  let existingAdBoardsGroup = [];
  if (tableSettings && tableSettings.result.length) {
    for (let i = 0; i < tableSettings.result.length; i++) {
      const element = tableSettings.result[i];
      if (element.adBoardsDataAfter) {
        existingAdBoardsGroup.push(element.adBoardsDataAfter);
      }
    }
  }
  return {
    fields,
    currentUser,
    tableSettings,
    multiSelectActive,
    existingAdBoardsGroup,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    editAttributes: (id, nameOfProperty, data) =>
      dispatch({
        type: "EDIT_ATTRIBUTES_FOR_FEATURE_IN_COUNTED_TABLE_DATA_SET",
        id,
        nameOfProperty,
        data,
      }),
    markMainDataAsCompleted: (data) =>
      dispatch({
        type: "EDIT_ITEM_FROM_RESULT_COUNTED_TABLE_DATA_SET",
        data,
      }),
    editIsFeatureCompletedFilled: (data) =>
      dispatch({ type: "EDIT_ITEM_FROM_RESULT_COUNTED_TABLE_DATA_SET", data }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EditForm);

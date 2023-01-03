import React, { Component } from "react";
import { connect } from "react-redux";
import { Container } from "react-bootstrap";
import { Row, Col, Form, Select, notification, message, Button } from "antd";
import {
  clearAllGraphicLayers,
  convertEngNumbersToArabic,
  convertNumbersToEnglish,
  getFeatureDomainName,
  getLayerIndex,
  highLight,
  LoadModules,
  queryTask,
  zoomToFeature,
} from "../../common/mapviewer";
import { valueToBoolean } from "../../navigationToolbar/helpers_Funcs";
import { differenceBy } from "lodash";
import { sortAlphabets } from "../../../helpers/utlis/utilzFunc";
import { notificationMessage } from "../../../helpers/utlis/notifications_Func";

class DashboardSideMenus extends Component {
  constructor(props) {
    super(props);
    this.state = {
      SITE_STATUS: null,
      SITE_COMMON_USE: null,
      MUNICIPALITY_NAME:null,
      typeOfBoundaries: null, // municipilites or districts
      typeOfSites: null, //ad boards or site polygons
    };
    this.FormRef = React.createRef();
  }
  removeAllTempGraphics(graphicLayerName) {
    //1- remove all temp graphics from map
    let graphicLayerOfMultiSelect = window.__map__.getLayer(graphicLayerName);
    let allGraphics = graphicLayerOfMultiSelect.graphics;
    let prevSelectedFeatures = this.props.tempSelectedFeaturesData;
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
  componentWillUnmount() {
    this.setState({
      SITE_STATUS: null,
      SITE_COMMON_USE: null,
      typeOfBoundaries: null,
      typeOfSites: null,
      MUNICIPALITY_NAME:null
    });
    window.__map__.getLayer("graphicLayer_Dashboard").clear();
  }
  deSelectCity = (e, field) => {
    if(this.state[field]!==e){
      this.setState({ [field]: e });
      this.props.showTable(false)
    }
  };
  handleSelect = (name) => (e) => {
    if(this.state[name]!==e){
      if(name === 'typeOfBoundaries') 
      {
        this.setState({ [name]: e, MUNICIPALITY_NAME:null });
        this.FormRef.current.setFieldsValue({...this.state,[name]: e,MUNICIPALITY_NAME:null})
      }
      else this.setState({ [name]: e });
      this.props.showTable(false)
    let dashboardGraphicLayer = window.__map__.getLayer("graphicLayer_Dashboard");
    dashboardGraphicLayer.clear();
    }

  };

  renderDomainSelect(fieldname) {
    const { fields } = this.props;
    if (!fields) return null;

    var layername = "Invest_Site_Polygon".toLocaleLowerCase();
    var domain = fields[layername].find((field) => field.name == fieldname)
      .domain.codedValues;
    if (fieldname === "SITE_COMMON_USE") domain = sortAlphabets(domain, "name");
    return domain.map((cv) => {
      if (fieldname === "SITE_STATUS" && cv.code === 1) return;
      else
        return (
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
        );
    });
  }

  notificationByAdding = () => {
    const args = {
      description: "تم الإضافة بنجاح بجدول التقارير",
      duration: 5,
    };
    notification.open(args);
  };

  notificationNotMatchedLands = () => {
    const args = {
      description: "عفواً لا يوجد أراضي استثمارية مطابقة للبيانات المدخلة",
      duration: 5,
    };
    notification.open(args);
  };

  notificationSomethingWrong = () => {
    const args = {
      description: "عفواً حدث خطأً ما أثناء العملية. حاول مرة أخرى",
      duration: 5,
    };
    notification.open(args);
  };

  zoomToParticularArea = async (whereCondition) => {
    var layerIndex = getLayerIndex("Invest_Site_Polygon");
    this.props.openLoader(); //for loader in case of zooimng
    await queryTask({
      returnGeometry: true,
      url: `${window.__mapUrl__}/${layerIndex}`,
      outFields: ["OBJECTID", "SITE_GEOSPATIAL_ID"],
      where: whereCondition,
      callbackResult: ({ features }) => {
        if (features.length) {
          zoomToFeature(features, window.__map__, 150, () =>
            setTimeout(() => {
              window.__map__._fixedPan(-20, window.__map__.height * 0.1);
            }, 100)
          );
          this.props.closeLoader(); //for loader in case of zooimng
        } else this.props.closeLoader();
      },
    });
  };

  composeWhere() {
    const { SITE_COMMON_USE, typeOfBoundaries, typeOfSites, SITE_STATUS, MUNICIPALITY_NAME } =
      this.state;
    var where = ``;
    if (SITE_COMMON_USE) where += `SITE_COMMON_USE=${SITE_COMMON_USE}`;
    if (where && SITE_STATUS) where += ` AND SITE_STATUS=${SITE_STATUS}`;
    if (where &&MUNICIPALITY_NAME ) where += ` AND MUNICIPALITY_NAME=${MUNICIPALITY_NAME}`;
    return where;
  }
  openWizard = () => {
    let errors = this.FormRef.current.getFieldsError();
    if (errors.length && errors.find((err) => err.errors.length)) return;
    else {
      this.props.openLoader();
      let layernames = this.state.typeOfSites
        ? [this.state.typeOfSites]
        : ["INVEST_SITE_POLYGON", "ADVERTISING_BOARDS"];
      let whereCondition = [];
      if (this.state.SITE_STATUS)
        whereCondition.push(`SITE_STATUS=${this.state.SITE_STATUS}`);
      if (this.state.SITE_COMMON_USE)
        whereCondition.push(`SITE_COMMON_USE=${this.state.SITE_COMMON_USE}`);
        if (this.state.MUNICIPALITY_NAME)
        whereCondition.push(`MUNICIPALITY_NAME=${this.state.MUNICIPALITY_NAME}`);

        let queryParams = {params:{
          where: whereCondition.length ? whereCondition.join(" AND ") : "1=1",
          groupByFields: [this.state.typeOfBoundaries],
          statistics: [
            {
              type: "count",
              field: "SITE_COMMON_USE",
              name: "TotalActivities",
            },
          ],
          returnDistinctValues: true,
          returnGeometry: false,
        },layerIndex:getLayerIndex(this.state.typeOfSites),
        MUNICIPALITY:this.state.MUNICIPALITY_NAME?{MUNICIPALITY_NAME:this.state.MUNICIPALITY_NAME, layerIndex:getLayerIndex("MUNICIPALITY_BOUNDARY")}:""}
      let promises = [];
      layernames.forEach((layername) => {
        promises.push(
          new Promise((resolve, reject) => {
            let layerIndex = getLayerIndex(layername);
            queryTask({
              ...queryParams.params,
              url: `${window.__mapUrl__}/${layerIndex}`,
              // outFields: ["SITE_GEOSPATIAL_ID,PARCEL_PLAN_NO,PLAN_NO,OBJECTID"],
              callbackResult: ({ features }) => {
                if (features.length) {
                  getFeatureDomainName(features, layerIndex).then((rf) => {
                    if (!rf.length) resolve([]);
                    else resolve(rf);
                  });
                } else resolve([]);
              },
              callbackError: (err) => {
                console.log(err);
                resolve([]);
              },
            });
          })
        );
      });
      Promise.all(promises)
        .then((res) => {
          let commonUseData = [...res[0]].reduce((comulative, item) => {
            if (!comulative.length)
              comulative.push({
                name: item.attributes[this.state.typeOfBoundaries],
                value: item.attributes.TOTALACTIVITIESDISTINCT,
                nameCode:
                  item.attributes[this.state.typeOfBoundaries + "_Code"],
              });
            else {
              let isExist = comulative.find(
                (c) =>
                  c.nameCode === item.attributes[this.state.typeOfBoundaries]
              );
              if (isExist) {
                isExist.value += item.attributes.TOTALACTIVITIESDISTINCT;
              } else
                comulative.push({
                  name: item.attributes[this.state.typeOfBoundaries],
                  value: item.attributes.TOTALACTIVITIESDISTINCT,
                  nameCode:
                    item.attributes[this.state.typeOfBoundaries + "_Code"],
                });
            }
            return comulative;
          }, []);
          if(commonUseData.length){

            console.log({ commonUseData });
            this.props.closeLoader();
            this.props.showTable(true);
            this.props.addDataToDashboard({
              commonUseData,
              queryParams,
              layernames,
            });
          }else{
            notificationMessage("لا توجد نتائج طبقا للمدخلات المدخلة",5);
            this.props.closeLoader();
            this.props.showTable(false);
          }
        })
        .catch((err) => {
          console.log(err);
          this.props.closeLoader();
          this.props.showTable(false);
          notificationMessage("حدث خطأ برجاء المحاولة مرة أخرى", 4);
        });
    }
  };
  render() {
    return (
      <div className="coordinates mb-4 dashboardHelp ">
        {/* {this.state.loading == true ? <Loader /> : null} */}
        <h3 className="mb-2">الإحصائيات </h3>
        <Container>
          <Form
            className="GeneralForm"
            layout="vertical"
            name="validate_other_report"
            ref={this.FormRef}
            onFinish={this.openWizard}
          >
            <Form.Item
              // hasFeedback={this.state.wayOfChooseingInvestSite!=="selectFromMap"?true:false}
              name="typeOfBoundaries"
              rules={[
                {
                  message: "من فضلك ادخل نوع الحدود الادارية ",
                  required: true,
                },
              ]}
            >
              <Select
                allowClear
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
                className="dont-show"
                onSelect={this.handleSelect("typeOfBoundaries")}
                value={this.state.typeOfBoundaries}
                onDeselect={(e)=>this.deSelectCity(e,"SITE_STATUS")}
                onClear={(e)=>this.deSelectCity(e,"SITE_STATUS")}
                placeholder="اختر الحدود الادارية"
                name="typeOfBoundaries"
                getPopupContainer={(trigger) => trigger.parentNode}
              >
                <Select.Option
                  className="text-right"
                  key={2}
                  value="MUNICIPALITY_NAME"
                >
                  البلديات
                </Select.Option>
                <Select.Option
                  key={3}
                  value="DISTRICT_NAME"
                  className="text-right"
                >
                  الأحياء
                </Select.Option>
              </Select>
            </Form.Item>
            {this.state.typeOfBoundaries==="DISTRICT_NAME"&&<Form.Item
              // hasFeedback={this.state.wayOfChooseingInvestSite!=="selectFromMap"?true:false}
              name="MUNICIPALITY_NAME"
              rules={[
                {
                  message: "من فضلك اختر البلدية الشاملة للأحياء ",
                  required: true,
                },
              ]}
            >
              <Select
                allowClear
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
                className="dont-show"
                onSelect={this.handleSelect("MUNICIPALITY_NAME")}
                value={this.state.MUNICIPALITY_NAME}
                onDeselect={(e)=>this.deSelectCity(e,"MUNICIPALITY_NAME")}
                onClear={(e)=>this.deSelectCity(e,"MUNICIPALITY_NAME")}
                placeholder="اختر البلدية الشاملة للأحياء"
                name="MUNICIPALITY_NAME"
                getPopupContainer={(trigger) => trigger.parentNode}
              >
                  {this.renderDomainSelect("MUNICIPALITY_NAME")}
              </Select>
            </Form.Item>}
            
            <Form.Item
              // hasFeedback={this.state.city ? true : false}
              name="typeOfSites"
              rules={[
                {
                  message: "من فضلك ادخل نوع المواقع الاستثمارية ",
                  required: true,
                },
              ]}
            >
              <Select
                name="typeOfSites"
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
                onSelect={this.handleSelect("typeOfSites")}
                value={this.state.typeOfSites}
                onDeselect={(e)=>this.deSelectCity(e,"typeOfSites")}
                onClear={(e)=>this.deSelectCity(e,"typeOfSites")}
                placeholder="اختر نوع المواقع الاستثمارية"
                getPopupContainer={(trigger) => trigger.parentNode}
              >
                <Select.Option
                  className="text-right"
                  key={2}
                  value="INVEST_SITE_POLYGON"
                >
                  مواقع استثمارية
                  <img
                        className="server-img-icon-svg"
                        src={`${window.imagesServerUrl}/SITE_MAIN_ACTIVITY_FORAS/555.svg`}
                        alt="img"
                      />
                </Select.Option>
                <Select.Option
                  key={3}
                  value="ADVERTISING_BOARDS"
                  className="text-right"
                >
                  الإعلانات
                  <img
                        className="server-img-icon-svg m-2 ad-boards"
                        src={`${window.imagesServerUrl}/SITE_MAIN_ACTIVITY_FORAS/444.svg`}
                        alt="img"
                      />
                </Select.Option>
              </Select>
            </Form.Item>
            {this.state.typeOfSites==="INVEST_SITE_POLYGON" && (
              <Form.Item
                name="SITE_COMMON_USE"
                // rules={[
                //   {
                //     message: "من فضلك اختر طريقة اختيار الموقع الاستثماري",
                //     required: true,
                //   },
                // ]}
              >
                <Select
                  allowClear
                  name="SITE_COMMON_USE"
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
                  onSelect={this.handleSelect("SITE_COMMON_USE")}
                  onDeselect={(e)=>this.deSelectCity(e,"SITE_COMMON_USE")}
                  onClear={(e)=>this.deSelectCity(e,"SITE_COMMON_USE")}
                  value={this.state.SITE_COMMON_USE}
                  placeholder=" اختر النشاط الاستثماري"
                  getPopupContainer={(trigger) => trigger.parentNode}
                >
                  {this.renderDomainSelect("SITE_COMMON_USE")}
                </Select>
              </Form.Item>
            )}

            <Form.Item
              // hasFeedback={this.state.SITE_COMMON_USE  ? true : false}
              name="SITE_STATUS"
            >
              <Select
                name="SITE_STATUS"
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
                onSelect={this.handleSelect("SITE_STATUS")}
                value={this.state.SITE_STATUS}
                onDeselect={(e)=>this.deSelectCity(e,"SITE_STATUS")}
                onClear={(e)=>this.deSelectCity(e,"SITE_STATUS")}
                placeholder="اختر حالة الموقع"
                getPopupContainer={(trigger) => trigger.parentNode}
              >
                {this.renderDomainSelect("SITE_STATUS")}
              </Select>
            </Form.Item>

            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-around",
              }}
              className="mt-4"
            >
              <Button
                // disabled={
                //   this.state.SITE_COMMON_USE
                // }
                // onClick={this.openWizard}
                className="SearchBtn mt-3"
                size="large"
                htmlType="submit"
              >
                بحث
              </Button>
            </div>
          </Form>
        </Container>
      </div>
    );
  }
}
const mapStateToProps = ({ mapUpdate }) => {
  const {
    fields,
    currentUser,
    tableSettings,
    tempSelectedFeaturesData,
    multiSelectActive,
  } = mapUpdate;
  return {
    fields,
    currentUser,
    tableSettings,
    tempSelectedFeaturesData,
    multiSelectActive,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    addLandToReportTable: (data) =>
      dispatch({ type: "ADD_TO_TABLE_DATA_SET", data }),
    clearTableData: () => dispatch({ type: "CLEAR_RESULT_TABLE_DATA_SET" }),
    activateMultiSelectButton: (layerName) =>
      dispatch({
        type: "ACTIVATE_MULTI_SELECT",
        layerName,
        typeUse: "investmentReport",
      }),
    diActivateMultiSelectButton: () =>
      dispatch({ type: "DIACTIVATE_MULTI_SELECT" }),
    emptyTempSelectedFeats: () => dispatch({ type: "EMPTY_DATA_FROM_TEMP" }),
    disactivateSingleSelect: () =>
      dispatch({ type: "DIACTIVATE_SINGLE_SELECT" }),
    clearSelection: () => dispatch({ type: "CLEAR_SELECTED" }),
    addDataToDashboard: (data) =>
      dispatch({ type: "ADD_DATA_TO_DASHBOARD", data }),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(DashboardSideMenus);

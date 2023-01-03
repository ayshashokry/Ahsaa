import React, { Component } from "react";
import { connect } from "react-redux";
import { Container } from "react-bootstrap";
import { Row, Col, Input, Form, Button, Select, notification, Tooltip } from "antd";
import AtmIcon from "../../assets/images/atm-icon-for-form.svg";
import GoogleIcon from "../../assets/images/google-maps.svg";
import EmojiTransportationIcon from "@material-ui/icons/EmojiTransportation";
import PhotoLibraryIcon from "@material-ui/icons/PhotoLibrary";
import BorderAllIcon from "@material-ui/icons/BorderAll";
import { AiOutlineFile } from "react-icons/ai";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAd } from '@fortawesome/free-solid-svg-icons'

import {
  convertEngNumbersToArabic,
  convertNumbersToEnglish,
  exportCADFile,
  getFeatureDomainName,
  getLayerIndex,
  highlightFeature,
  queryTask,
  zoomToFeature,
  zoomToLayer,
} from "../common/mapviewer";
import axios from "axios";
import { sortAlphabets } from "../../helpers/utlis/utilzFunc";
//general search results components
import SearchResultDetails from "./SerarchResults/SearchResultDetails";
import SearchResultMenu from "./SerarchResults/SearchResultMenu";
import { notificationMessage } from "../../helpers/utlis/notifications_Func";
import EXPORTCADIcon from "../../assets/images/icons8-dwg-24.png"
import DownloadCSV from "../Tables/RemarksSuggestionTable/helpers/downloadCSVSearchTable";

class GeneralSearch extends Component {
  constructor(props) {
    super(props);
    this.exportCadRef = React.createRef();
    this.formRef = React.createRef(null);
    this.state = {
      locationStatus: "3",
      sitesType: "INVEST_SITE_POLYGON",
      from: "",
      to: "",
      InvestMentActivity: [],
      planNumber: 0,
      district: "",
      city: "",
      biddingNumber: "",
      contractNo: "",
      plans: [],
      districts: [],
      loading: false,
      flagForTechReport: [],
      breadCrumbTitle:"بحث عام فرص معلنة"
    };
  }
  componentDidMount() {
    let {user} = this.props;
    if (this.formRef.current) {
     this.props.setIsInvestableSite(true);
      this.formRef.current.setFieldsValue({
        locationStatus: "3",
        sitesType: "INVEST_SITE_POLYGON",
      });
    }
  }
  componentDidUpdate(prevProps) {
    //desc: if user stand on "القائمة" then clicks on "بحث عام الفرص" 
    let {user} = this.props;
    if (
      prevProps.generalSearchInputsShown !==
        this.props.generalSearchInputsShown &&
      this.props.generalSearchInputsShown
    ) {
      this.formRef.current?.setFieldsValue({
        locationStatus: "3",
        sitesType: "INVEST_SITE_POLYGON",
        from: null,
        to: null,
        InvestMentActivity: [],
        planNumber: null,
        district: null,
        city: null,
        biddingNumber: null,
        contractNo: null,
      });
      this.props.setIsInvestableSite(true);
      this.setState({
        locationStatus: "3",
        sitesType: "INVEST_SITE_POLYGON",
        from: "",
        to: "",
        InvestMentActivity: [],
        planNumber: 0,
        district: "",
        city: "",
        biddingNumber: "",
        contractNo: "",
        plans: [],
        districts: [],
        loading: false,
        flagForTechReport: [],
        breadCrumbTitle:"بحث عام فرص معلنة"
      });
    }
    if (prevProps.user.user_type_id != this.props.user.user_type_id){
      this.formRef.current?.setFieldsValue({
        locationStatus: "3",
        sitesType: "INVEST_SITE_POLYGON",
        from: null,
        to: null,
        InvestMentActivity: [],
        planNumber: null,
        district: null,
        city: null,
        biddingNumber: null,
        contractNo: null,
      });
      this.props.setIsInvestableSite(true);
      this.setState({
        locationStatus: "3",
        sitesType: "INVEST_SITE_POLYGON",
        from: "",
        to: "",
        InvestMentActivity: [],
        planNumber: 0,
        district: "",
        city: "",
        biddingNumber: "",
        contractNo: "",
        plans: [],
        districts: [],
        loading: false,
        flagForTechReport: [],
        breadCrumbTitle:"بحث عام فرص معلنة"
      });
    }
  }
  componentWillUnmount() {
    let {user,deleteFilteredIDs} =this.props;
    this.props.closeLoader();
    // this.props.clearTableData();
    // this.props.clearSelectedFeatureData();
    this.setState(null);
    this.props.setIsInvestableSite(false);
    //delete filtered IDs of results from redux
    deleteFilteredIDs();
    // if(window.__map__){
    // window.__map__.getLayer("searchGraphicLayer").clear();
    // let graphicLayerOfZooming = window.__map__.getLayer("zoomGraphicLayer");
    // graphicLayerOfZooming.clear();
    // }
  }
  deSelectCity = (e) => {
    this.setState({
      plans: [],
      districts: [],
      district: "",
      planNumber: "",
      city: "",
    });
  };
  handleClearSelect = (name) => {
    let formValues = this.formRef.current.getFieldsValue(true);
    this.formRef.current.setFieldsValue({
      ...formValues,
      [name]: name === "InvestMentActivity" ? [] : null,
    });
    this.setState({ [name]: name === "InvestMentActivity" ? [] : "" });
  };

  handleSelect = (name) => (e) => {
    const { user } = this.props;
    if (!e?.length && name === "InvestMentActivity") {
      let formValues = this.formRef.current.getFieldsValue(true);
      this.formRef.current.setFieldsValue({
        ...formValues,
        [name]: name === "InvestMentActivity" ? [] : null,
      });
      this.setState({ [name]: name === "InvestMentActivity" ? [] : "" });
      this.formRef.current.validateFields();
    } else {
      if (["contractNo", "biddingNumber", "from", "to"].includes(name)) {
        console.log(e.target.value, convertNumbersToEnglish(e.target.value));
        let englishNoValue = convertNumbersToEnglish(e.target.value);
        this.setState({ [name]: englishNoValue });
      }
       else this.setState({ [name]: e });
      let whereCondition;
      switch (name) {
        case "locationStatus":
          this.formRef.current.resetFields();
          this.formRef.current.setFieldsValue({
            locationStatus: e,
            sitesType: "INVEST_SITE_POLYGON",
          });
          if(e==3) this.props.setIsInvestableSite(true);
          else this.props.setIsInvestableSite(false);
          this.setState({
            [name]: e,
            breadCrumbTitle:e==2?"بحث عام فرص شاغرة":e==3?"بحث عام فرص معلنة":e==4?"بحث عام فرص مستثمرة":"بحث عام الفرص",
            contractNo: "",
            biddingNumber: "",
            plans: [],
            districts: [],
            district: "",
            planNumber: "",
            city: "",
            from: "",
            to: "",
            InvestMentActivity: [],
            sitesType: "INVEST_SITE_POLYGON",
          });
          break;
        case "sitesType":
          if (e && e !== "INVEST_SITE_POLYGON") {
            this.setState({ sitesType: e, InvestMentActivity: [] });
          } else if (e) {
            this.setState({ sitesType: e });
          } else {
            this.setState({ sitesType: "", InvestMentActivity: [] });
          }
          break;

        case "city":
          if (e) {
            this.setState(() => {
              this.setState({ city: e, district: "", planNumber: "" });
              this.zoomToParticularArea(`MUNICIPALITY_NAME=${e}`);
              this.catchDistricts(e);
              if (
                (user &&
                  [1,3].includes(user.user_type_id)) ||
                  (((!user) || (user&&!Object.keys(user).length) || (user&& [2].includes(user.user_type_id))) &&!["3", ""].includes(this.state.locationStatus))
              ) this.catchPlans(e);
              let formValues = this.formRef.current.getFieldsValue(true);
              this.formRef.current.setFieldsValue({ ...formValues, city: e });
            });
          } else {
            this.setState({
              plans: [],
              districts: [],
              district: "",
              planNumber: "",
              city: "",
            });
          }
          break;
        case "planNumber":
          let planNo;
          if (e) planNo = convertNumbersToEnglish(e);

          if (e && this.state.city) {
            whereCondition = `MUNICIPALITY_NAME=${this.state.city} AND PLAN_NO='${planNo}'`;
          } else if (this.state.city && this.state.district) {
            whereCondition = `MUNICIPALITY_NAME=${this.state.city} AND DISTRICT_NAME=${this.state.district}`;
          } else if (this.state.city) {
            whereCondition = `MUNICIPALITY_NAME=${this.state.city}`;
          } else if (this.state.locationStatus)
            whereCondition = `SITE_STATUS=${this.state.locationStatus}`;
          else whereCondition = "";
          if (whereCondition) this.zoomToParticularArea(whereCondition);
          break;
        case "district":
          if (e && this.state.city) {
            whereCondition = `MUNICIPALITY_NAME=${this.state.city} AND DISTRICT_NAME=${e}`;
          } else if (this.state.city && this.state.planNumber) {
            whereCondition = `MUNICIPALITY_NAME=${this.state.city} AND PLAN_NO='${this.state.planNumber}'`;
          } else if (this.state.city) {
            whereCondition = `MUNICIPALITY_NAME=${this.state.city}`;
          } else if (this.state.locationStatus)
            whereCondition = `SITE_STATUS=${this.state.locationStatus}`;
          else whereCondition = "";
          if (whereCondition) this.zoomToParticularArea(whereCondition);
          break;
        case "contractNo":
          let contractNo = convertNumbersToEnglish(e.target.value);
          whereCondition = `SITE_STATUS=${this.state.locationStatus} AND CONTRACT_NUMBER='${contractNo}'`;
          this.zoomToParticularArea(whereCondition);
          break;
        case "InvestMentActivity":
          let formValues = this.formRef.current.getFieldsValue(true);
          if (e[e.length - 1] === "") {
            this.formRef.current.setFieldsValue({
              ...formValues,
              InvestMentActivity: [""],
            });
            this.setState({
              InvestMentActivity: [""],
            });
          } else if (e[0] === "") {
            this.formRef.current.setFieldsValue({
              ...formValues,
              InvestMentActivity: e.filter((item) => item),
            });
            this.setState({
              InvestMentActivity: e.filter((item) => item),
            });
          }
          break;
        default:
          break;
      }
    }
  };

  catchPlans(selectedMunicipality) {
    var layerIndex = getLayerIndex("Invest_Site_Polygon");
    queryTask({
      returnGeometry: false,
      url: `${window.__mapUrl__}/${layerIndex}`,
      returnDistinctValues: true,
      outFields: ["PLAN_NO"],
      where: `MUNICIPALITY_NAME=${selectedMunicipality} AND PLAN_NO LIKE '%' AND PLAN_NO <> 'بدون' AND PLAN_NO <>'<Null>' AND PLAN_NO <>' ' `,
      callbackResult: ({ features }) => {
        this.setState({ plans: features });
      },
    });
  }

  catchDistricts(selectedMunicipality) {
    var layerIndex = getLayerIndex("Invest_Site_Polygon");
    queryTask({
      returnGeometry: false,
      url: `${window.__mapUrl__}/${layerIndex}`,
      returnDistinctValues: true,
      outFields: ["DISTRICT_NAME"],
      where: `MUNICIPALITY_NAME=${selectedMunicipality} AND DISTRICT_NAME LIKE '%'`,
      callbackResult: ({ features }) => {
        // fix features
        getFeatureDomainName(features, layerIndex).then((districts) => {
          this.setState({ districts });
        });
      },
    });
  }
  composeWhere() {
    const {
      InvestMentActivity,
      locationStatus,
      city,
      district,
      planNumber,
      from,
      to,
      biddingNumber,
      contractNo,
    } = this.state;
    var where = [];
    where.push(`SITE_STATUS=${locationStatus}`);
    if (InvestMentActivity.length && !InvestMentActivity.includes(""))
      where.push(`SITE_COMMON_USE IN (${InvestMentActivity.join(",")})`);
    if (city) where.push(`MUNICIPALITY_NAME=${city}`);
    if (district) where.push(`DISTRICT_NAME=${district}`);
    if (planNumber) where.push(`PLAN_NO='${planNumber}'`);
    if (from) where.push(`SITE_AREA >=${from}`);
    if (to) where.push(`SITE_AREA <=${to}`);
    if (biddingNumber) where.push(`AUCTION_NO='${biddingNumber}'`);
    if (contractNo) where.push(`CONTRACT_NUMBER='${contractNo}'`);
    console.log(where);
    return where;
  }
  notificationNoData = () => {
    const args = {
      description: "لا توجد نتائج",
      duration: 3,
    };
    notification.open(args);
  };
  generalSearch = (e) => {
    let formErrors = this.formRef.current.getFieldsError();
    let isThereValidateError = formErrors.find(item=>item.errors.length);
    if (!this.state.locationStatus || !this.state.sitesType || isThereValidateError) return;
    const { sitesType } = this.state;
    const { user } = this.props;
    this.props.openLoader(); //for loader in case of search process
    this.props.clearTableData();
    this.props.showTable(false);
    window.__map__.getLayer("zoomGraphicLayer").clear();
    window.__map__.getLayer("searchGraphicLayer").clear();

    let layernames = [];
    if (!sitesType) layernames = ["INVEST_SITE_POLYGON", "ADVERTISING_BOARDS"];
    else if (sitesType === "INVEST_SITE_POLYGON")
      layernames.push("Invest_Site_Polygon");
    else if (sitesType === "ADVERTISING_BOARDS")
      layernames.push("Advertising_boards");
    // if (InvestMentActivity === 15131) layernames = ["Advertising_boards"];

    const promises = layernames.map((layername) => {
      const layerIndex = getLayerIndex(layername);

      return new Promise((resolve, reject) => {
        let whereCondition =
          layerIndex === getLayerIndex("ADVERTISING_BOARDS")
            ? this.composeWhere()
                .filter((w) => {
                  if (!["SITE_AREA <", "SITE_AREA >"].includes(w.split("=")[0]))
                    return w;
                })
                .join(" and ")
            : this.composeWhere().join(" and ");
        queryTask({
          returnGeometry: true,
          url: `${window.__mapUrl__}/${layerIndex}`,
          outFields: ["*"],
          where: whereCondition,
          callbackResult: ({ features }) => {
            // fix features
            if (features.length) {
              features =
                this.props.currentUser !== "Employee"
                  ? features.map((feat) => {
                      delete feat.attributes["SITE_AREA"];
                      return feat;
                    })
                  : features;
              highlightFeature(features, window.__map__, {
                noclear: true,
                isZoom: true,
                layerName: "searchGraphicLayer",
                highlightWidth: 3,
                fillColor: [225, 225, 255, 0.25],
                strokeColor: "black",
              });
            }
            resolve({ layername, data: features });
          },
          callbackError: (err) => {
            console.log(err);
            reject(err);
          },
        });
      });
    });

    Promise.all(promises)
      .then((result) => {
        // this.props.closeLoader(); //for loader in case of search process
        if (this.isResultEmpty(result)) {
          this.notificationNoData();
          window.__map__.getLayer("zoomGraphicLayer").clear();
          window.__map__.getLayer("searchGraphicLayer").clear();
          this.props.closeLoader(); //for stop loader in case there is no result
          return this.props.pushResultTableData(null);
        }
        if (this.state.locationStatus !== "") {
          let flagTechReportPromises = [];
          result.forEach((group) => {
            if (group.layername.toLocaleLowerCase() === "invest_site_polygon") {
              let indexLayer = getLayerIndex("TBL_BUILD_DETAILS"); //TBL_BUILD_DETAILS that includes TECHNIQUAL_REPORT to check yes or no
              flagTechReportPromises = group.data.map((feat) => {
                return new Promise((resolve, reject) =>
                  queryTask({
                    returnGeometry: false,
                    url: `${window.__mapUrl__}/${indexLayer}`,
                    outFields: ["SITE_GEOSPATIAL_ID,TECHNIQUAL_REPORT"],
                    where: `SITE_GEOSPATIAL_ID=${feat.attributes.SITE_GEOSPATIAL_ID}`,
                    callbackResult: ({ features }) => {
                      if (features && features.length > 0) {
                        resolve({
                          flag: features[0].attributes.TECHNIQUAL_REPORT
                            ? true
                            : false,
                          id: features[0].attributes.SITE_GEOSPATIAL_ID,
                        });
                      } else
                        resolve({
                          flag: false,
                          id: feat.attributes.SITE_GEOSPATIAL_ID,
                        });
                    },
                    callbackError: (err) => {
                      console.error(err);
                      resolve({ flag: false });
                    },
                  })
                );
              });
            } else
              flagTechReportPromises = [
                ...flagTechReportPromises,
                ...group.data.map((feat) => {
                  return { flag: false };
                }),
              ];
          });
          Promise.all(flagTechReportPromises).then((resultOfFlagTech) => {
            this.setState({ flagForTechReport: resultOfFlagTech });
            this.props.closeLoader(); //for loader in case of search process
            this.props.showTable(true);
            this.props.generalOpenResultMenu(); //open search results (cards)
          });
        }

        this.props.pushResultTableData({
          result,
          columns: [
            { name: "SITE_COMMON_USE", alias: "النشاط الاستثماري" },
            { name: "SITE_STATUS", alias: "حالة الموقع" },
            { name: "SITE_SUB_STATUS", alias: "حالة الموقع التتفصيلية " },
            { name: "SITE_SUBTYPE", alias: "نوع الموقع" },
            { name: "SITE_AREA", alias: "المساحة" },
            { name: "STREET_NAME", alias: "اسم الشارع" },
            { name: "PARCEL_PLAN_NO", alias: "رقم قطعة الارض" },
            { name: "PLAN_NO", alias: "رقم المخطط" },
            { name: "MUNICIPALITY_NAME", alias: "البلدية" },
            { name: "DISTRICT_NAME", alias: "الحي" },
            { name: "SITE_LAT_COORD", alias: "احداثي دائرة العرض للمركز" },
            { name: "SITE_LONG_COORD", alias: "احداثي خط الطول للمركز" },
          ],
          actions: [
            //show all remarks - suggestions of selected site
            {
              name: (feature) => {
                if (user && [1].includes(user.user_type_id)) {
                  if (
                    feature.attributes["حالة الموقع"] === "شاغرة" ||
                    feature.attributes["SITE_STATUS"] === 2
                  )
                    return "showAllsuggestions";
                  else return "showAllremarks";
                }
                return "";
              },
              alias: (feature) => {
                if (user && [1].includes(user.user_type_id)) {
                  if (
                    feature.attributes["حالة الموقع"] === "شاغرة" ||
                    feature.attributes["SITE_STATUS"] === 2
                  )
                    return "عرض الاقتراحات";
                  else return "عرض الملاحظات";
                }
                return "";
              },
              icon: <AiOutlineFile fontSize="large" />,
              canRender: (feature, layername) => {
                if (
                  user &&
                  [1].includes(user.user_type_id) &&
                  layername.toLowerCase() === "invest_site_polygon"
                )
                  return true;
                else return false;
              },
              action: async (feature, layername) => {
                this.props.openLoader(); //for loader
                if (
                  feature.attributes["حالة الموقع"] === "شاغرة" ||
                  feature.attributes["SITE_STATUS"] === 2
                ) {
                  // push the feature to the store
                  try {
                    let res = await axios.get(
                      window.API_URL + "api/Suggestion/getall",
                      {
                        headers: {
                          Authorization: `Bearer ${user.token}`,
                        },
                      }
                    );

                    let result = res.data.results;
                    if (result.length) {
                      let filteredRes = result.filter(
                        (item) =>
                          item.suggestion_investment &&
                          item.suggestion_investment.find(
                            (i) =>
                              i.investment_spatial_id ===
                              feature.attributes.SITE_GEOSPATIAL_ID
                          )
                      );
                      console.log(filteredRes);
                      this.props.pushContentToModal({
                        feature: filteredRes,
                        layername,
                        name: "showAllsuggestions",
                      });
                    } else {
                      this.props.pushContentToModal({
                        feature: [],
                        layername,
                        name: "showAllsuggestions",
                      });
                    }
                    this.props.closeLoader();
                    return true;
                  } catch (err) {
                    //put a notification message
                    console.log(err);
                    this.props.closeLoader();
                    return false;
                  }
                } else {
                  try {
                    let res = await axios.get(
                      window.API_URL + "api/remark/getall",
                      {
                        headers: {
                          Authorization: `Bearer ${user.token}`,
                        },
                      }
                    );
                    let result = res.data.results;
                    if (result.length) {
                      let filteredRes = result.filter(
                        (item) =>
                          item.remark_investment &&
                          item.remark_investment.find(
                            (i) =>
                              i.invest_spatial_id ===
                              feature.attributes.SITE_GEOSPATIAL_ID
                          )
                      );
                      console.log(filteredRes);
                      this.props.pushContentToModal({
                        feature: filteredRes,
                        layername,
                        name: "showAllremarks",
                      });
                    } else {
                      this.props.pushContentToModal({
                        feature: [],
                        layername,
                        name: "showAllremarks",
                      });
                    }
                    this.props.closeLoader();
                    return true;
                  } catch (err) {
                    console.log(err);
                    this.props.closeLoader();
                    return false;
                  }
                }
              },
            },
            ///
            // show remark modal to enter data
            {
              name: (feature) => {
                if (
                  user &&
                  [
                    2, //investor
                    3, //eng office
                  ].includes(user.user_type_id)
                ) {
                  if (
                    feature.attributes["حالة الموقع"] === "شاغرة" ||
                    feature.attributes["SITE_STATUS"] === 2
                  )
                    return "suggestion";
                  else return "remark";
                }
                return "";
              },
              alias: (feature) => {
                if (
                  user &&
                  [
                    2, //investor
                    3, //eng office
                  ].includes(user.user_type_id)
                ) {
                  if (
                    feature.attributes["حالة الموقع"] === "شاغرة" ||
                    feature.attributes["SITE_STATUS"] === 2
                  )
                    return "تقديم اقتراح";
                  else return "تقديم ملاحظة";
                }
                return "";
              },
              icon: <AiOutlineFile fontSize="large" />,
              canRender: (feature, layername) => {
                if (
                  user &&
                  [
                    // 2,    //investor
                    3, //eng office
                  ].includes(user.user_type_id) &&
                  layername.toLowerCase() === "invest_site_polygon"
                )
                  return true;
                else return false;
              },
              action: (feature, layername) => {
                if (
                  feature.attributes["حالة الموقع"] === "شاغرة" ||
                  feature.attributes["SITE_STATUS"] === 2
                )
                  // push the feature to the store
                  // so the borders modal can be opened
                  this.props.pushContentToModal({
                    feature,
                    layername,
                    name: "suggestion",
                  });
                else
                  this.props.pushContentToModal({
                    feature,
                    layername,
                    name: "remark",
                  });
              },
            },
            ///
            // zoom
            {
              name: "zoom",
              alias: "تكبير",
              icon: <i className="fas fa-search-plus fa-lg"></i>,
              canRender: () => true,
              action: (feature, layername) => {
                this.props.openLoader(); //for loader in case of zooimng
                const layerIndex = getLayerIndex(layername);
                queryTask({
                  returnGeometry: true,
                  url: `${window.__mapUrl__}/${layerIndex}`,
                  outFields: ["OBJECTID", "SITE_GEOSPATIAL_ID"],
                  where: `SITE_GEOSPATIAL_ID=${feature.attributes["SITE_GEOSPATIAL_ID"]}`,
                  callbackResult: ({ features }) => {
                    window.__map__.getLayer("zoomGraphicLayer").clear();
                    highlightFeature(features, window.__map__, {
                      noclear: true,
                      isZoom: true,
                      layerName: "zoomGraphicLayer",
                      highlightWidth: 5,
                      fillColor: [225, 225, 0, 0.25],
                      strokeColor: "grey",
                      isDashStyle: true,
                    });
                    // setTimeout(() => {
                    //   let graphicLayerOfZooming = window.__map__.getLayer("zoomGraphicLayer");
                    //   graphicLayerOfZooming.clear()
                    //   }, 4000);
                    this.props.closeLoader(); //for loader in case of zooimng
                    // this.props.addToSelectedFeatures(features);
                  },
                });
              },
            },
            ///
            // open google location
            {
              name: "OpenInGoogle",
              alias: "الذهاب إلى جوجل",
              icon: (
                <img
                  src={GoogleIcon}
                  alt="go to google"
              className='svg'
                  style={{ width: "16px" }}
                />
              ),
              canRender: () => true,
              action: (data) => {
                console.log(data);
                let dataLat = data.attributes["SITE_LAT_COORD"];
                let dataLong = data.attributes["SITE_LONG_COORD"];

                window.open(
                  `http://maps.google.com/maps?q=${dataLat},${dataLong}`,
                  "_blank"
                );
              },
            },
            //
            //Borders from field
            {
              name: "bordersFromField",
              alias: "حدود الموقع من الطبيعة",
              icon: <i className="far fa-map fa-lg"></i>,
              canRender: (feature, layername) =>
                layername.toLocaleLowerCase() ===
                  "Invest_Site_Polygon".toLocaleLowerCase() &&
                feature.attributes["SITE_COMMON_USE"] !== 15131,
              action: (feature, layername) => {
                // push the feature to the store
                // so the borders modal can be opened
                this.props.pushContentToModal({
                  feature,
                  layername,
                  name: "Border_Field_Info",
                });
              },
            },
            //Borders from Plan --> employee just can see it
            {
              name: "bordersFromPlan",
              alias: "حدود الموقع من المخطط",
              icon: <BorderAllIcon fontSize="large" />,
              canRender: (feature, layername) =>
                layername.toLocaleLowerCase() ===
                  "Invest_Site_Polygon".toLocaleLowerCase() &&
                feature.attributes["SITE_COMMON_USE"] !== 15131 &&
                this.props.currentUser === "Employee",
              action: async (feature, layername) => {
                this.props.openLoader();
                let layerIndex = getLayerIndex("INVEST_SITE_BOUNDARY"); //INVEST_SITE_BOUNDARY
                await queryTask({
                  returnGeometry: false,
                  url: `${window.__mapUrl__}/${layerIndex}`,
                  outFields: ["*"],
                  where: `SITE_GEOSPATIAL_ID=${feature.attributes["SITE_GEOSPATIAL_ID"]}`,
                  callbackResult: ({ features }) => {
                    this.props.closeLoader();
                    getFeatureDomainName(features, layerIndex).then((rf) => {
                      if (!rf.length) rf = [];
                      this.props.pushContentToModal({
                        features: rf,
                        layername,
                        name: "Border_Plan_Info",
                        borderDescirbtion: feature.attributes,
                      });
                    });
                  },
                  callbackError: (err) => {
                    this.props.closeLoader();
                    console.error(err);
                  },
                });
              },
            },
            //advertise boards group
            {
              name: "AD borders",
              alias: "بيانات المجموعة الإعلانية",
              icon: <FontAwesomeIcon icon={faAd} />,
              canRender: (feature, layername) =>
                getLayerIndex(layername) ===
                getLayerIndex("ADVERTISING_BOARDS"),
              // &&feature.attributes["SITE_COMMON_USE"] === 15131
              action: async (feature, layername) => {
                // push the feature to the store
                // so the borders modal can be opened
                this.props.openLoader();
                let indexLayer = getLayerIndex("TBL_BOARDS_GROUP"); //TBL_BOARDS_GROUP
                await queryTask({
                  returnGeometry: false,
                  url: `${window.__mapUrl__}/${indexLayer}`,
                  outFields: ["*"],
                  where: `GROUP_CODE=${feature.attributes["GROUP_CODE"]}`,
                  callbackResult: ({ features }) => {
                    this.props.closeLoader();
                    getFeatureDomainName(features, indexLayer).then((rf) => {
                      if (!rf.length) rf = [];
                      this.props.pushContentToModal({
                        feature: rf,
                        name: "ADGroup_Info",
                      });
                    });
                  },
                  callbackError: (err) => {
                    console.error(err);
                    this.props.closeLoader();
                  },
                });
              },
            },
            //for contract info
            // {
            //   name: "contract",
            //   alias: "بيانات العقد",
            //   icon: <i className="fas fa-file-contract"></i>,
            //   canRender: (feature, layername) =>
            //     layername.toLocaleLowerCase() ===
            //       "Invest_Site_Polygon".toLocaleLowerCase() &&
            //     feature.attributes["SITE_STATUS"] === 4,
            //   action: async (feature, layername) => {
            //     // push the feature to the store
            //     // so the borders modal can be opened
            //     let layerIndex = 16;     //TBL_CONTRACTS
            //     await queryTask({
            //       returnGeometry: false,
            //       url: `${window.__mapUrl__}/${layerIndex}`,
            //       outFields: ["*"],
            //       where: `SITE_GEOSPATIAL_ID=${feature.attributes["SITE_GEOSPATIAL_ID"]}`,
            //       callbackResult: ({ features }) => {
            //           getFeatureDomainName(features, layerIndex).then((rf) => {
            //         // this.props.pushContentToModal({ feature:rf, name:"Contract_Info" });
            //           })
            //       },
            //       callbackError: (err) => {
            //         console.error(err);
            //       },
            //     });
            //   },
            // },
            //for ATM info
            {
              name: "atmInfo",
              alias: "بيانات الصراف الآلي",
              icon: (
                <img
                  src={AtmIcon}
              className='svg'
                  alt="atm icon"
                  style={{
                    width: "25px",
                    height: "25px",
                  }}
                />
              ),
              // <AtmIcon />
              canRender: (feature, layername) =>
                layername.toLocaleLowerCase() ===
                  "Invest_Site_Polygon".toLocaleLowerCase() &&
                feature.attributes["SITE_SUBTYPE"] === 6,
              action: async (feature, layername) => {
                // push the feature to the store
                // so the borders modal can be opened
                this.props.closeLoader();
                let indexLayer = getLayerIndex("TBL_ATM"); //TBL_ATM
                await queryTask({
                  returnGeometry: false,
                  url: `${window.__mapUrl__}/${indexLayer}`,
                  outFields: ["*"],
                  where: `SITE_GEOSPATIAL_ID=${feature.attributes["SITE_GEOSPATIAL_ID"]}`,
                  callbackResult: ({ features }) => {
                    this.props.closeLoader();
                    getFeatureDomainName(features, indexLayer).then((rf) => {
                      if (!rf.length) rf = [{ attributes: {} }];
                      this.props.pushContentToModal({
                        feature: rf[0],
                        name: "ATM_Info",
                      });
                    });
                  },
                  callbackError: (err) => {
                    this.props.closeLoader();
                    console.error(err);
                  },
                });
              },
            },
            //for Building info
            {
              name: "BuildingDataInfo",
              alias: "بيانات المبني",
              icon: <i className="fas fa-city fa-lg"></i>,
              canRender: (feature, layername) =>
                layername.toLocaleLowerCase() ===
                  "Invest_Site_Polygon".toLocaleLowerCase() &&
                feature.attributes["SITE_SUBTYPE"] === 1,
              action: async (feature, layername) => {
                // push the feature to the store
                // so the borders modal can be opened
                this.props.openLoader();
                console.log(feature);
                console.log(feature.attributes["SITE_GEOSPATIAL_ID"]);
                let indexLayer = getLayerIndex("TBL_BUILDING_DATA"); //TBL_BUILDING_DATA
                await queryTask({
                  returnGeometry: false,
                  url: `${window.__mapUrl__}/${indexLayer}`,
                  outFields: ["*"],
                  where: `SITE_GEOSPATIAL_ID=${feature.attributes["SITE_GEOSPATIAL_ID"]}`,
                  callbackResult: ({ features }) => {
                    this.props.closeLoader();
                    console.log(features);
                    getFeatureDomainName(features, indexLayer).then((rf) => {
                      if (!rf.length) rf = [{ attributes: {} }];
                      this.props.pushContentToModal({
                        feature: rf[0],
                        name: "Building_Data_Info",
                      });
                    });
                  },
                  callbackError: (err) => {
                    this.props.closeLoader();
                    console.error(err);
                  },
                });
              },
            },
            //for Building details info --> show it only if there is TECHNIQUAL_REPORT value in TBL_BUILD_DETAILS
            {
              name: "BuildingDetailsInfo",
              alias: " بيانات تفاصيل المباني",
              icon: <EmojiTransportationIcon fontSize="medium" />,
              canRender: (feature, layername) => {
                if (
                  layername.toLocaleLowerCase() ===
                    "Invest_Site_Polygon".toLocaleLowerCase() &&
                  this.state.flagForTechReport.length
                ) {
                  let flagForTechReport = this.state.flagForTechReport.find(
                    (item) => item.id === feature.attributes.SITE_GEOSPATIAL_ID
                  );
                  if (flagForTechReport) return flagForTechReport.flag;
                  else return false;
                } else return false;
                //   let indexLayer = getLayerIndex("TBL_BUILD_DETAILS"); //TBL_BUILD_DETAILS that includes TECHNIQUAL_REPORT to check yes or no
                //       return new Promise((resolve,reject)=>
                //         queryTask({
                //           returnGeometry: false,
                //           url: `${window.__mapUrl__}/${indexLayer}`,
                //           outFields: ["*"],
                //           where: `SITE_GEOSPATIAL_ID=${feature.attributes["SITE_GEOSPATIAL_ID"]}
                //       AND TECHNIQUAL_REPORT=1`,
                //           callbackResult: async ({ features }) => {
                //             if (features.length > 0)
                //             resolve(true)
                //             // _this.setState({flagForTechReport:true});
                //             else resolve(false)
                //             // await _this.setState({flagForTechReport:false});
                //           },
                //           callbackError: async (err) => {
                //             console.error(err);
                //             resolve(false)
                //             // await _this.setState({flagForTechReport:false});
                //           },
                //         })
                //       )
                //     // _this.setState({flagForTechReport: res})
                // } else new Promise((resolve, reject)=>resolve(false));
              },
              action: async (feature, layername) => {
                // push the feature to the
                this.props.openLoader();
                let featAttributes = { ...feature.attributes };
                console.log(feature.attributes["SITE_GEOSPATIAL_ID"]);
                let indexLayer = getLayerIndex("TBL_BUILD_DETAILS"); //TBL_BUILD_DETAILS that includes TECHNIQUAL_REPORT to check yes or no
                await queryTask({
                  returnGeometry: false,
                  url: `${window.__mapUrl__}/${indexLayer}`,
                  outFields: ["*"],
                  where: `SITE_GEOSPATIAL_ID=${feature.attributes["SITE_GEOSPATIAL_ID"]}`,
                  callbackResult: ({ features }) => {
                    this.props.closeLoader();
                    let featureWithAllAttributes = [];
                    if (features.length > 0) {
                      featureWithAllAttributes = features.map((feat) => {
                        feat.attributes = {
                          ...feat.attributes,
                          ...featAttributes,
                        };
                        return feat;
                      });
                    } else
                      featureWithAllAttributes = [
                        { attributes: featAttributes },
                      ];
                    this.props.pushContentToModal({
                      feature: featureWithAllAttributes,
                      name: "Building_Details_Info",
                    });
                  },
                  callbackError: (err) => {
                    this.props.closeLoader();
                    console.error(err);
                  },
                });
              },
            },
            //for Building images info
            {
              name: "BuildingImages",
              alias: "صور المباني",
              icon: <PhotoLibraryIcon />,
              canRender: (feature, layername) => {
                if (
                  layername.toLocaleLowerCase() ===
                    "Invest_Site_Polygon".toLocaleLowerCase() &&
                  this.state.flagForTechReport.length
                ) {
                  let flagForTechReport = this.state.flagForTechReport.find(
                    (item) => item.id === feature.attributes.SITE_GEOSPATIAL_ID
                  );
                  if (flagForTechReport) return flagForTechReport.flag;
                  else return false;
                } else return false;
                //   let indexLayer = getLayerIndex("TBL_BUILD_DETAILS"); //TBL_BUILD_DETAILS that includes TECHNIQUAL_REPORT to check yes or no
                //   async function checkTechnicalReportYesOrNot(_this) {
                //       // let res =
                //       // _this.setState({flagForTechReport:false})
                //        await queryTask({
                //           returnGeometry: false,
                //           url: `${window.__mapUrl__}/${indexLayer}`,
                //           outFields: ["*"],
                //           where: `SITE_GEOSPATIAL_ID=${feature.attributes["SITE_GEOSPATIAL_ID"]}
                //       AND TECHNIQUAL_REPORT=1`,
                //           callbackResult: async ({ features }) => {
                //             if (features.length > 0) _this.setState({flagForTechReport:true});
                //             else await _this.setState({flagForTechReport:false});
                //           },
                //           callbackError: async (err) => {
                //             console.error(err);
                //             await _this.setState({flagForTechReport:false});
                //           },
                //         })

                //     // _this.setState({flagForTechReport: res})
                //   }
                //   checkTechnicalReportYesOrNot(this);
                //   return this.state.flagForTechReport;
                // } else return false;
              },
              action: async (feature, layername) => {
                // push the feature to the store
                // so the borders modal can be opened
                this.props.openLoader();
                let indexLayer = getLayerIndex("TBL_BUILD_DETAILS"); //TBL_BUILD_DETAILS that includes TECHNIQUAL_REPORT to check yes or no
                await queryTask({
                  returnGeometry: false,
                  url: `${window.__mapUrl__}/${indexLayer}`,
                  outFields: ["IMAGE_URL"],
                  where: `SITE_GEOSPATIAL_ID=${feature.attributes["SITE_GEOSPATIAL_ID"]}`,
                  callbackResult: ({ features }) => {
                    this.props.closeLoader();
                    if (!features.length) features = [{ attributes: {} }];
                    this.props.pushContentToModal({
                      feature: features[0],
                      name: "Building_Images",
                    });
                  },
                  callbackError: (err) => {
                    this.props.closeLoader();
                    console.error(err);
                  },
                });
              },
            },
            //for towers info
            {
              name: "towers info",
              alias: "بيانات الأبراج",
              icon: <i className="fas fa-broadcast-tower fa-lg"></i>,
              canRender: (feature, layername) =>
                layername.toLocaleLowerCase() ===
                  "Invest_Site_Polygon".toLocaleLowerCase() &&
                feature.attributes["SITE_SUBTYPE"] === 3,
              action: async (feature, layername) => {
                // push the feature to the store
                // so the borders modal can be opened
                this.props.openLoader();
                console.log(feature.attributes["SITE_GEOSPATIAL_ID"]);
                let indexLayer = getLayerIndex("TBL_TOWERS"); //TBL_TOWERS
                await queryTask({
                  returnGeometry: false,
                  url: `${window.__mapUrl__}/${indexLayer}`,
                  outFields: [
                    "TOWER_LOCATION_CODE,TOWER_TYPE,TOWER_HEIGHT,TOWER_SERVICE_PROVIDER",
                  ],
                  where: `SITE_GEOSPATIAL_ID=${feature.attributes["SITE_GEOSPATIAL_ID"]}`,
                  callbackResult: ({ features }) => {
                    this.props.closeLoader();
                    getFeatureDomainName(features, indexLayer).then((rf) => {
                      if (!rf.length) rf = [{ attributes: {} }];
                      this.props.pushContentToModal({
                        feature: rf[0],
                        name: "Tower_Info",
                      });
                    });
                  },
                  callbackError: (err) => {
                    this.props.closeLoader();
                    console.error(err);
                  },
                });
              },
            },
            //for elec stations info
            {
              name: "elec stations info",
              alias: "بيانات  محطات الكهرباء",
              icon: <i className="fas fa-gopuram fa-lg"></i>,
              canRender: (feature, layername) =>
                layername.toLocaleLowerCase() ===
                  "Invest_Site_Polygon".toLocaleLowerCase() &&
                feature.attributes["SITE_SUBTYPE"] === 5,
              action: async (feature, layername) => {
                // push the feature to the store
                // so the borders modal can be opened
                this.props.openLoader();
                console.log(feature.attributes["SITE_GEOSPATIAL_ID"]);
                let indexLayer = getLayerIndex("TBL_ELEC_STATION");
                await queryTask({
                  returnGeometry: false,
                  url: `${window.__mapUrl__}/${indexLayer}`,
                  outFields: ["ELEC_TYPE,NAME"],
                  where: `SITE_GEOSPATIAL_ID=${feature.attributes["SITE_GEOSPATIAL_ID"]}`,
                  callbackResult: ({ features }) => {
                    this.props.closeLoader();
                    getFeatureDomainName(features, indexLayer).then((rf) => {
                      if (!rf.length) rf = [{ attributes: {} }];
                      this.props.pushContentToModal({
                        feature: rf[0],
                        name: "Elec_Stations_Info",
                      });
                    });
                  },
                  callbackError: (err) => {
                    this.props.closeLoader();
                    console.error(err);
                  },
                });
              },
            },
            //for Site Coordinates info
            {
              name: "coordinates info",
              alias: "بيانات الاحداثيات",
              icon: <i className="fas fa-map-marked-alt fa-lg"></i>,
              canRender: (feature, layername) =>
                getLayerIndex(layername) ===
                  getLayerIndex("Invest_Site_Polygon") &&
                feature.attributes["SITE_SUBTYPE"] !== 2 &&
                this.props.currentUser === "Employee",
              action: async (feature, layername) => {
                // push the feature to the store
                // so the borders modal can be opened
                this.props.openLoader();
                console.log(feature.attributes["SITE_GEOSPATIAL_ID"]);
                let indexLayer = getLayerIndex("INVEST_SITE_CORNER");
                await queryTask({
                  returnGeometry: false,
                  url: `${window.__mapUrl__}/${indexLayer}`,
                  outFields: ["XGCS_COORD,YGCS_COORD,CORNER_NO"],
                  where: `SITE_GEOSPATIAL_ID=${feature.attributes["SITE_GEOSPATIAL_ID"]}`,
                  callbackResult: ({ features }) => {
                    this.props.closeLoader();
                    if (!features.length) features = [];
                    this.props.pushContentToModal({
                      features: features,
                      name: "Coordinate_Info",
                    });
                  },
                  callbackError: (err) => {
                    this.props.closeLoader();
                    console.error(err);
                  },
                });
              },
            },
          ],
        });
        this.setState({ flagForTechReport: false });
        highlightFeature(result.data, window.__map__, {
          noclear: true,
          isZoom: true,
          layerName: "searchGraphicLayer",
          highlightWidth: 3,
          fillColor: [225, 225, 255, 0.25],
          strokeColor: "black",
        });
        this.props.disactivateSingleSelect()
      })
      .catch((err) => {
        console.log(err);
        notificationMessage("حدث خطأ برجاء المحاولة مرة أخرى");
        window.__map__.getLayer("zoomGraphicLayer").clear();
        window.__map__.getLayer("searchGraphicLayer").clear();
        this.props.closeLoader(); //for stop loader in case there is no result
        this.props.pushResultTableData(null);
      });
  };
  isResultEmpty(result) {
    return result.every((resultSet) => resultSet.data.length === 0);
  }
  renderDomainSelect(fieldname) {
    const { fields } = this.props;
    if (!fields) return null;

    var layername = "Invest_Site_Polygon".toLocaleLowerCase();
    var domain = fields[layername].find((field) => field.name === fieldname)
      .domain.codedValues;
    if (fieldname === "MUNICIPALITY_NAME")
      domain = sortAlphabets(domain, "name");
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
        ) : (
          ""
        )}
      </Select.Option>
    ));
  }

  renderPlans() {
    const { plans } = this.state;
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

  renderDistricts() {
    const { districts } = this.state;
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

  /**
   * desc: (zoomToParticularArea) will zoom to a particular area based on entering value to the general earch input
   * input: the condition which map will zoom to based on
   * output: none --> it just implement the logic to zoom
   **/
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
          zoomToFeature(features, window.__map__, 150);
          this.props.closeLoader(); //for loader in case of zooimng
        } else this.props.closeLoader();
      },
    });
  };
  handleExportCadFile(){
    const { tableSettings, filteredTableSettingsIDs } = this.props;
    this.props.openLoader()
    let self = this;
    let geoIDs = filteredTableSettingsIDs.bool?
    filteredTableSettingsIDs.data
    :tableSettings.result.flatMap(feat=>feat.data).map(f=>f.attributes.SITE_GEOSPATIAL_ID);
    let url = window.__GP_EXPORT_CAD_FILE__;
    let whereClause = `[{"AHSA.INVEST_SITE_POLYGON":"SITE_GEOSPATIAL_ID IN (${(geoIDs.join(","))})"}]`
    let params = {
      //Filters:[{"AHSA.INVEST_SITE_POLYGON":"SITE_GEOSPATIAL_ID= 4.9465742540651E13"}]
      Filters:whereClause,
      FileType:"CAD"
    }
    function callBackAfterExportCAD(result){
      console.log(result);
      self.exportCadRef.current.href = window.API_FILES_URL+result;
      self.exportCadRef.current.click()
      //notification with it is succeeded
      notificationMessage("جاري تحميل ملف الكاد",5)
      self.props.closeLoader()
    }
    function callbackError(err){
      console.log(err);
      //notification with something error happened
      notificationMessage("حدث خطأ برجاء المحاولة مرة أخرى",5)
      self.props.closeLoader()

    }
    console.log(whereClause);
    
    exportCADFile(url, params,callBackAfterExportCAD, callbackError)
  }
  zoomToAllInMap() {
    window.__map__.getLayer("zoomGraphicLayer").clear();
    if(this.props.showingDetailsViaMap) 
    zoomToLayer("highLightGraphicLayer", window.__map__, 50);
else zoomToLayer("searchGraphicLayer", window.__map__, 3);
    //zoomGraphicLayer
  }
  render() {
    const { user } = this.props;
    return (
      <>
        {/* {this.state.loading === true ? <Loader /> : null} */}
        <div className="coordinates mb-4">
          <div className="searchStepsWizard ">
            <nav class="breadcrumbs">
              {this.props.generalResultDetailsShown ? (
                <li
                  onClick={this.props.generalOpenResultdetails}
                  className={
                    this.props.generalResultDetailsShown
                      ? "breadcrumbs__item breadcrumbs__itemActive third"
                      : "breadcrumbs__item third"
                  }
                >
                  النتائج
                </li>
              ) : null}
              {this.props.generalResultMenuShown ||
              this.props.generalResultDetailsShown ? (
                <li
                  onClick={this.props.generalOpenResultMenu}
                  className={
                    this.props.generalResultMenuShown
                      ? "breadcrumbs__item breadcrumbs__itemActive second"
                      : "breadcrumbs__item second"
                  }
                >
                  القائمة
                </li>
              ) : null}

              <li
                onClick={this.props.generalOpenSearchInputs}
                className={
                  this.props.generalSearchInputsShown
                    ? "breadcrumbs__item breadcrumbs__itemActive first"
                    : "breadcrumbs__item first"
                }
              >
                {this.state.breadCrumbTitle}
              </li>
            </nav>
            {this.props.generalResultMenuShown&&this.props.tableSettings&&this.props.tableSettings.result.length?
            <div style={{display:'flex', justifyContent:'space-between'}}>  
            <div style={{display:'flex', alignItems:'center'}}>
              <div className="mr-2 ml-2" onClick={this.zoomToAllInMap.bind(this)}>
              <Tooltip placement="topLeft" title={"تكبير إلي الكل"}>
                <i className="fas fa-expand-arrows-alt fa-lg"></i>
              </Tooltip>
            </div>
                <a style={{display:'none'}} download ref={this.exportCadRef}></a>
            {this.props.tableSettings&&this.props.tableSettings.result.length&&
            this.props.tableSettings.result.find(r=>r.layername.toLocaleLowerCase()==="invest_site_polygon")&&
            <div className="mr-2 ml-2" onClick={this.handleExportCadFile.bind(this)}>
              <Tooltip placement="topLeft" title={"استخراج ملف الكاد"}>
                <img style={{cursor:'pointer'}} src={EXPORTCADIcon} alt="export cad file" width={30} height={30} />
              </Tooltip>
            </div>}
            <DownloadCSV
              dataSet={this.props.tableSettings.result?.map(r=>r.data)?.flat().map((item) => item.attributes)}
              filteredTableSettingsIDs={this.props.filteredTableSettingsIDs}
              fields={this.props.fields}
            />
            </div>
            <div>
            <span className="resultsNumber">
              <span>عدد النتائج: </span>
              <span style={{ fontWeight: "bold" }}>{
              this.props.filteredTableSettingsIDs?.data?.length ||
              this.props.tableSettings.result?.map(r=>r.data)?.flat().length
              }</span>
            </span>
            </div>

            </div>:null}
          </div>{" "}
          <Container>
            {this.props.generalSearchInputsShown ? (
              <Form
                className="GeneralForm"
                layout="vertical"
                name="validate_other"
                ref={this.formRef}
              >
                <Form.Item
                  hasFeedback
                  name="locationStatus"
                  rules={[
                    {
                      message: "إختر حالة الموقع",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    showSearch
                    allowClear
                    className="dont-show"
                    onChange={this.handleSelect("locationStatus")}
                    // onClear={()=>this.handleClearSelect('locationStatus')}
                    value={this.state.locationStatus}
                    placeholder="حالة الموقع "
                    getPopupContainer={(trigger) => trigger.parentNode}
                    optionFilterProp="v"
                    filterOption={(input, option) =>
                      option.v.indexOf(input) >= 0
                    }
                    // defaultValue="3"
                  >
                    <Select.Option v="شاغرة" value="2">
                      شاغرة
                      <img
                      className="server-img-icon-svg"
                        src={`${window.imagesServerUrl}/SITE_MAIN_ACTIVITY_FORAS/222.svg`}
                        alt="img"
                      />
                    </Select.Option>
                    <Select.Option v="فرص استثمارية معلنة" value="3">
                      فرص استثمارية معلنة
                      <img
                      className="server-img-icon-svg"
                        src={`${window.imagesServerUrl}/SITE_MAIN_ACTIVITY_FORAS/111.svg`}
                        alt="img"
                      />
                    </Select.Option>
                    {user && [1].includes(user.user_type_id) && (
                      <Select.Option v="مستثمرة" value="4">
                        مستثمرة
                        <img
                      className="server-img-icon-svg"
                          src={`${window.imagesServerUrl}/SITE_MAIN_ACTIVITY_FORAS/333.svg`}
                          alt="img"
                        />
                      </Select.Option>
                    )}
                  </Select>
                </Form.Item>
                <Form.Item
                  hasFeedback
                  name="sitesType"
                  rules={[
                    {
                      message: "إختر نوع المواقع الاستثمارية",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    showSearch
                    allowClear
                    className="dont-show"
                    onChange={this.handleSelect("sitesType")}
                    // onClear={()=>this.handleClearSelect('sitesType')}
                    value={this.state.sitesType}
                    placeholder="نوع المواقع الاستثمارية "
                    getPopupContainer={(trigger) => trigger.parentNode}
                    optionFilterProp="v"
                    filterOption={(input, option) =>
                      option.v.indexOf(input) >= 0
                    }
                    // defaultValue="INVEST_SITE_POLYGON"
                  >
                    <Select.Option
                      v=" المواقع الاستثمارية "
                      value="INVEST_SITE_POLYGON"
                    >
                      المواقع الاستثمارية
                      <img
                        className="server-img-icon-svg"
                        src={`${window.imagesServerUrl}/SITE_MAIN_ACTIVITY_FORAS/555.svg`}
                        alt="img"
                      />
                    </Select.Option>
                    <Select.Option v="الإعلانات" value="ADVERTISING_BOARDS">
                      الإعلانات
                      <img
                        className="server-img-icon-svg m-2 ad-boards"
                        src={`${window.imagesServerUrl}/SITE_MAIN_ACTIVITY_FORAS/444.svg`}
                        alt="img"
                      />
                    </Select.Option>
                  </Select>
                </Form.Item>
                {this.state.sitesType === "INVEST_SITE_POLYGON" && (
                  <Form.Item name="InvestMentActivity">
                    <Select
                      allowClear
                      autoClearSearchValue
                      mode="multiple"
                      showSearch
                      // onClear={()=>this.handleClearSelect('InvestMentActivity')}
                      filterOption={(input, option) => {
                        if (
                          typeof option.children === "object" &&
                          option.children !== "جميع الانشطة الاستثمارية"
                        )
                          return (
                            option.children[0]
                              .toLowerCase()
                              .indexOf(input.toLowerCase()) >= 0
                          );
                        else return -1;
                      }}
                      className="dont-show"
                      onChange={this.handleSelect("InvestMentActivity")}
                      value={this.state.InvestMentActivity}
                      placeholder="جميع الأنشطة الاستثمارية"
                      getPopupContainer={(trigger) => trigger.parentNode}
                      defaultValue=""
                    >
                      <Select.Option className="text-right" value={""}>
                        {"جميع الانشطة الاستثمارية"}
                      </Select.Option>
                      {this.renderDomainSelect("SITE_COMMON_USE")}
                    </Select>
                  </Form.Item>
                )}
                <Form.Item name="city">
                  <Select
                    allowClear
                    showSearch
                    filterOption={(input, option) => {
                      if (
                        typeof option.children === "object" &&
                        option.children !== "جميع البلديات"
                      )
                        return (
                          option.children[0]
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        );
                      else return -1;
                    }}
                    onDeselect={this.deSelectCity}
                    onClear={this.deSelectCity}
                    className="dont-show"
                    onChange={this.handleSelect("city")}
                    value={this.state.city}
                    placeholder="جميع البلديات"
                    getPopupContainer={(trigger) => trigger.parentNode}
                    defaultValue=""
                  >
                    <Select.Option className="text-right" value={""}>
                      {"جميع البلديات "}
                    </Select.Option>
                    {this.renderDomainSelect("MUNICIPALITY_NAME")}
                  </Select>
                </Form.Item>
                {this.state.city !== "" ? (
                  <>
                    <Form.Item>
                      <Select
                        allowClear
                        showSearch
                        filterOption={(input, option) =>
                          option.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                        className="dont-show"
                        onChange={this.handleSelect("district")}
                        // onClear={()=>this.handleClearSelect("district")}
                        // value={this.state.district}
                        placeholder="الحي"
                        getPopupContainer={(trigger) => trigger.parentNode}
                      >
                        {this.renderDistricts()}
                      </Select>
                    </Form.Item>
                  </>
                ) : null}
                {(user &&
                  [1,3].includes(user.user_type_id)) ||
                  (((!user) || (user&&!Object.keys(user).length) || (user&& [2].includes(user.user_type_id))) &&!["3", ""].includes(this.state.locationStatus)) ? (
                    <Form.Item >
                      <Select
                        name="planNumberSelect"
                        allowClear
                        showSearch
                        filterOption={(input, option) => {
                          if (input.toLowerCase())
                            return (
                              option.children
                                .toLowerCase()
                                .indexOf(input.toLowerCase()) >= 0 ||
                              option.children
                                .toLowerCase()
                                .indexOf(
                                  convertNumbersToEnglish(input.toLowerCase())
                                ) >= 0 ||
                              option.children
                                .toLowerCase()
                                .indexOf(
                                  convertEngNumbersToArabic(input.toLowerCase())
                                ) >= 0
                            );
                        }}
                        className="dont-show"
                        onChange={this.handleSelect("planNumber")}
                        // onClear={()=>this.handleClearSelect('planNumber')}
                        // value={this.state.planNumber}
                        placeholder="رقم المخطط"
                        getPopupContainer={(trigger) => trigger.parentNode}
                      >
                        {this.renderPlans()}
                      </Select>
                    </Form.Item>
                  ):null}
                {this.state.locationStatus === "4" ? (
                  <Form.Item name="contractNo">
                    <Input
                      type="string"
                      name="contractNo"
                      onChange={this.handleSelect("contractNo")}
                      value={this.state.contractNo}
                      placeholder="رقم العقد"
                    />
                  </Form.Item>
                ) : null}{" "}
                {!["", "3"].includes(this.state.locationStatus) &&
                user &&
                [1].includes(user.user_type_id) &&
                this.state.sitesType === "INVEST_SITE_POLYGON" ? (
                  <>
                    <Form.Item name="from" rules={[
                      {
                        pattern:new RegExp("^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)$"),
                        message:'ادخل أرقاماً فقط'
                      }
                    ]}>
                      <Input
                        // type="number"
                        name="from"
                        onChange={this.handleSelect("from")}
                        value={this.state.from}
                        placeholder="المساحة من"
                      />
                    </Form.Item>
                    <Form.Item name="to" rules={[
                      {
                        pattern:new RegExp("^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)$"),
                        message:'ادخل أرقاماً فقط'
                      }
                    ]}>
                      <Input
                        // type="number"
                        name="to"
                        onChange={this.handleSelect("to")}
                        value={this.state.to}
                        placeholder="المساحة إلي"
                      />
                    </Form.Item>
                  </>
                ) : null}
                {this.state.locationStatus === "3" ? (
                  <Form.Item name="biddingNumber">
                    <Input
                      type="string"
                      name="biddingNumber"
                      onChange={this.handleSelect("biddingNumber")}
                      value={this.state.biddingNumber}
                      placeholder="رقم المنافسة"
                    />
                  </Form.Item>
                ) : null}{" "}
                <Row>
                  <Col span={24}>
                    <Button
                      onClick={this.generalSearch}
                      className="SearchBtn mt-3"
                      size="large"
                      htmlType="submit"
                    >
                      بحث
                    </Button>
                  </Col>
                </Row>
              </Form>
            ) : this.props.generalResultMenuShown ? (
              <SearchResultMenu
                OpenSearchInputs={this.props.generalOpenSearchInputs}
                OpenResultdetails={this.props.generalOpenResultdetails}
                isInvestableSitesChosen={this.props.isInvestableSitesChosen}
              />
            ) : this.props.generalResultDetailsShown ? (
              <SearchResultDetails
                removeDetailsActiveTab={this.props.removeDetailsActiveTab}
                OpenSearchInputs={this.props.generalOpenSearchInputs}
                OpenResultMenu={this.props.generalOpenResultMenu}
                showData={this.props.generalResultDetailsShown}
                openLoader = {this.props.openLoader}
                closeLoader = {this.props.closeLoader}
              />
            ) : null}
          </Container>
        </div>
      </>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addToSelectedFeatures: (features) =>
      dispatch({ type: "ADD_TO_SELECTED_FEATURES", features }),
    pushResultTableData: (data) =>
      dispatch({ type: "RESULT_TABLE_DATA_SET", data }),
    pushContentToModal: (data) =>
      dispatch({ type: "TABLE_ICON_MODAL_DATA_SET", data }),
    clearTableData: () => dispatch({ type: "CLEAR_RESULT_TABLE_DATA_SET" }),
    clearSelectedFeatureData: () =>
      dispatch({ type: "CLOSE_TABLE_ICON_MODAL" }),
      disactivateSingleSelect: () =>
      dispatch({ type: "DIACTIVATE_SINGLE_SELECT" }),
    deleteFilteredIDs:()=>dispatch({ type:'EMPTY_FILTERED_RESULT_TABLE' })
  };
};

const mapStateToProps = ({ mapUpdate }) => {
  const { fields, currentUser, auth, tableSettings, filteredTableSettingsIDs } = mapUpdate;
  return {
    fields,
    currentUser,
    tableSettings,
    user: auth.user,
    filteredTableSettingsIDs
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(GeneralSearch);

import React, { Component } from "react";
import { connect } from "react-redux";
import { Container } from "react-bootstrap";
import axios from "axios";
import {
  Row,
  Col,
  Input,
  Form,
  Button,
  Select,
  notification,
  Tooltip,
} from "antd";
import {
  queryTask,
  buffer,
  getLayerIndex,
  getFeatureDomainName,
  highlightFeature,
  LoadModules,
  convertNumbersToEnglish,
  zoomToLayer,
  exportCADFile,
} from "../common/mapviewer";
// import AtmIcon from "@material-ui/icons/Atm";
import AtmIcon from "../../assets/images/atm-icon-for-form.svg";
import GoogleIcon from "../../assets/images/google-maps.svg";
import EmojiTransportationIcon from "@material-ui/icons/EmojiTransportation";
import PhotoLibraryIcon from "@material-ui/icons/PhotoLibrary";
import { AiOutlineFile } from "react-icons/ai";
import BorderAllIcon from "@material-ui/icons/BorderAll";
import { makeFlashOnAssetsWithSameAuctionNo } from "../map/actions";
//nearest location search results components
import SearchResultDetails from "./SerarchResults/SearchResultDetails";
import SearchResultMenu from "./SerarchResults/SearchResultMenu";
import EXPORTCADIcon from "../../assets/images/icons8-dwg-24.png";
import DownloadCSV from "../Tables/RemarksSuggestionTable/helpers/downloadCSVSearchTable";
import { notificationMessage } from "../../helpers/utlis/notifications_Func";

class NearestLocationSearch extends Component {
  constructor(props) {
    super(props);
    this.exportCadRef = React.createRef();
    this.formRef = React.createRef();
    this.state = {
      locationStatus: "",
      searchSpace: "",
      InvestMentActivity: [],
      error: "",
      loading: false,
      flagForTechReport: [],
    };
  }
  componentDidUpdate(prevProps) {
    if (
      prevProps.nearestSearchInputsShown !==
        this.props.nearestSearchInputsShown &&
      this.props.nearestSearchInputsShown
    ) {
      this.formRef.current?.resetFields();
      this.setState({
        locationStatus: "",
        InvestMentActivity: [],
        error: "",
      });
    }
  }
  componentWillUnmount() {
    this.setState(null);
    // window.__map__.getLayer("graphicLayer2").clear(); //clear buffer
    // window.__map__.getLayer("searchGraphicLayer").clear(); //clear buffer
    // let graphicLayerOfZooming = window.__map__.getLayer("zoomGraphicLayer");
    // graphicLayerOfZooming.clear(); //clear if there is any hightlighted sites made in clicking zoom in the search table
    // this.props.clearTableData();
    this.props.showTable(false);
    
    // this.props.clearSelectedFeatureData();
  }
  renderDomainSelect(fieldname) {
    const { fields } = this.props;
    if (!fields) return null;

    var layername = "INVEST_SITE_POLYGON".toLocaleLowerCase();
    var domain = fields[layername].find((field) => field.name === fieldname)
      .domain.codedValues;
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
  handleSelect = (name) => (e) => {
    console.log(e);
    if (name == "InvestMentActivity") {
      if (!e?.length) {
        let formValues = this.formRef.current.getFieldsValue(true);
        this.formRef.current.setFieldsValue({
          ...formValues,
          [name]: name === "InvestMentActivity" ? [] : null,
        });
        this.setState({ [name]: name === "InvestMentActivity" ? [] : "" });
        this.formRef.current.validateFields();
      } else {
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
      }
      // this.formRef.current.validateFields();
    } else this.setState({ [name]: e });
  };
  handlesearchSpace = (e) => {
    if (e.target.name === "searchSpace") {
      let englishNoValue = convertNumbersToEnglish(e.target.value);
      if (englishNoValue.match(/^[\u0660-\u06690-9$@$!%*?&#^-_. +]+$/))
        this.setState({ [e.target.name]: englishNoValue });
    } else this.setState({ [e.target.name]: e.target.value });
  };
  nearestSearch = (e) => {
    if (
      this.state.locationStatus !== "" &&
      this.state.searchSpace !== ""
      // this.state.InvestMentActivity !== ""
    ) {
      if (this.props.selectedSpotonMap === null) {
        this.setState({ error: "برجاء اختيار موقع من الخريطة" });
        this.props.disactivateSingleSelect()
      }
      this.props.handleMapClickEvent({
        cursor: "default",
        handler: ({ mapPoint }) => {
          LoadModules(["esri/tasks/query"]).then(([Query]) => {
            queryTask({
              returnGeometry: true,
              url: `${window.__mapUrl__}/${getLayerIndex(
                "MUNICIPALITY_BOUNDARY"
              )}`,
              outFields: ["OBJECTID"],
              geometry: mapPoint,
              spatialRelationship: Query.SPATIAL_REL_INTERSECTS,
              callbackResult: ({ features }) => {
                if (features.length) {
                  this.setState({ error: "" });
                  this.executeSearch(mapPoint, this.state.searchSpace);
                  this.props.handleMapClickEvent({
                    cursor: "default",
                    handler: ({ mapPoint }) =>
                      makeFlashOnAssetsWithSameAuctionNo(mapPoint),
                  });
                } else {
                  this.notificationWithOutSideAhsaa();
                }
              },
              callbackError: (err) => {
                console.log(err);
                this.notificationError();
              },
            });
          });
        },
      });
    }
  };
  notificationNoData = () => {
    const args = {
      description: "لا توجد نتائج",
      duration: 3,
    };
    notification.open(args);
  };

  notificationError = () => {
    const args = {
      description: "عذرا لقد حدث خطأ. من فضلك حاول مرة أخرى",
      duration: 3,
    };
    notification.open(args);
  };

  notificationWithOutSideAhsaa = () => {
    const args1 = {
      description: "الموقع يقع خارج حدود الأمانة",
      duration: 4,
    };
    const args2 = {
      description: " من فضلك اضغط داخل حدود الأمانة",
      duration: 5,
    };
    notification.warn(args1);
    setTimeout(() => {
      notification.info(args2);
    }, 1000);
  };

  executeSearch(mapPoint, distance) {
    if (this.state.locationStatus === "") return;
    const { InvestMentActivity, locationStatus } = this.state;
    this.props.openLoader();
    this.props.clearTableData();
    this.props.showTable(false);

    let layernames = ["INVEST_SITE_POLYGON"];

    layernames.push("ADVERTISING_BOARDS");

    buffer(mapPoint, distance, (geometry) => {
      LoadModules(["esri/graphic"]).then(([Graphic]) => {
        var feature = new Graphic(geometry);
        highlightFeature(feature, window.__map__, {
          isZoom: true,
          layerName: "graphicLayer2",
        });
      });
      let promises = layernames.map((layername) => {
        const layerIndex = getLayerIndex(layername);
        var where;
        if (InvestMentActivity.length == 0 || InvestMentActivity.includes(""))
          where = `SITE_STATUS=${locationStatus}`;
        else
          where = `SITE_STATUS=${locationStatus} AND SITE_COMMON_USE=${InvestMentActivity}`;
        return new Promise((resolve, reject) => {
          queryTask({
            returnGeometry: true,
            geometry,
            url: `${window.__mapUrl__}/${layerIndex}`,
            outFields: ["*"],
            where,
            callbackResult: ({ features }) => {
              let result = { layername, data: features };
              highlightFeature(features, window.__map__, {
                noclear: true,
                isZoom: true,
                layerName: "searchGraphicLayer",
                highlightWidth: 3,
                fillColor: [225, 225, 255, 0.25],
                strokeColor: "black",
              });
              resolve(result);

              // });
            },
            callbackError: (err) => {},
          });
        });
      });
      Promise.all(promises).then((result) => {
        if (this.isResultEmpty(result)) {
          this.notificationNoData();
          window.__map__.getLayer("searchGraphicLayer").clear();
          this.props.closeLoader(); //for stop loader in case there is no result
          return this.props.pushResultTableData(null);
        }

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
          this.props.nearestOpenResultMenu(); //open search results (cards)
        });

        const { user } = this.props;
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
              icon: <AiOutlineFile fontSize="medium" />,
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
                  else return "تقديم ملاحظات";
                }
                return "";
              },
              icon: <AiOutlineFile fontSize="medium" />,
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
            {
              name: "zoom",
              alias: "تكبير",
              icon: <i className="fas fa-search-plus pl-1 fa-lg"></i>,
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
            {
              name: "OpenInGoogle",
              alias: "الذهاب إلى جوجل",
              icon: (
                <img
                  src={GoogleIcon}
              className='svg'
                  alt="go to google"
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
            //Borders from field
            {
              name: "bordersFromField",
              alias: "حدود الموقع من الطبيعة",
              icon: <i className="far fa-map pl-1"></i>,
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
              icon: <BorderAllIcon />,
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
              icon: <i className="fas fa-ad 5x fa-lg"></i>,
              canRender: (feature, layername) =>
                getLayerIndex(layername) ===
                getLayerIndex("ADVERTISING_BOARDS"),
              // &&feature.attributes["SITE_COMMON_USE"]===15131
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
            //     layername.toLocaleLowerCase() ==
            //       "Invest_Site_Polygon".toLocaleLowerCase() &&
            //     feature.attributes["SITE_STATUS"]===4,
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
                this.props.openLoader();
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
                this.props.openLoader();
                // so the borders modal can be opened
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
      });
    });
  }
  isResultEmpty(result) {
    return result.every((resultSet) => resultSet.data.length === 0);
  }
  handleExportCadFile() {
    const { tableSettings, filteredTableSettingsIDs } = this.props;
    this.props.openLoader();
    let self = this;
    let geoIDs = filteredTableSettingsIDs.bool? 
    filteredTableSettingsIDs.data
    :tableSettings.result
      .flatMap((feat) => feat.data)
      .map((f) => f.attributes.SITE_GEOSPATIAL_ID);
    let url = window.__GP_EXPORT_CAD_FILE__;
    let whereClause = `[{"AHSA.INVEST_SITE_POLYGON":"SITE_GEOSPATIAL_ID IN (${geoIDs.join(
      ","
    )})"}]`;
    let params = {
      //Filters:[{"AHSA.INVEST_SITE_POLYGON":"SITE_GEOSPATIAL_ID= 4.9465742540651E13"}]
      Filters: whereClause,
      FileType: "CAD",
    };
    function callBackAfterExportCAD(result) {
      console.log(result);
      self.exportCadRef.current.href = window.API_FILES_URL + result;
      self.exportCadRef.current.click();
      //notification with it is succeeded
      notificationMessage("جاري تحميل ملف الكاد", 5);
      self.props.closeLoader();
    }
    function callbackError(err) {
      console.log(err);
      //notification with something error happened
      notificationMessage("حدث خطأ برجاء المحاولة مرة أخرى", 5);
      self.props.closeLoader();
    }
    console.log(whereClause);

    exportCADFile(url, params, callBackAfterExportCAD, callbackError);
  }
  zoomToAllInMap() {
    window.__map__.getLayer("zoomGraphicLayer").clear();
    if (this.props.showingDetailsViaMap)
      zoomToLayer("highLightGraphicLayer", window.__map__, 50);
    else zoomToLayer("searchGraphicLayer", window.__map__, 3);
    //zoomGraphicLayer
  }
  render() {
    return (
      <div className="coordinates mb-4">
        <div className="searchStepsWizard ">
          <nav class="breadcrumbs">
            {this.props.nearestResultDetailsShown ? (
              <li
                onClick={this.props.nearestOpenResultdetails}
                className={
                  this.props.nearestResultDetailsShown
                    ? "breadcrumbs__item breadcrumbs__itemActive third"
                    : "breadcrumbs__item third"
                }
              >
                النتائج
              </li>
            ) : null}
            {this.props.nearestResultMenuShown ||
            this.props.nearestResultDetailsShown ? (
              <li
                onClick={this.props.nearestOpenResultMenu}
                className={
                  this.props.nearestResultMenuShown
                    ? "breadcrumbs__item breadcrumbs__itemActive second"
                    : "breadcrumbs__item second"
                }
              >
                القائمة
              </li>
            ) : null}

            <li
              onClick={this.props.nearestOpenSearchInputs}
              className={
                this.props.nearestSearchInputsShown
                  ? "breadcrumbs__item breadcrumbs__itemActive first"
                  : "breadcrumbs__item first"
              }
            >
              بحث أقرب موقع
            </li>
          </nav>
          {this.props.nearestResultMenuShown &&
          this.props.tableSettings &&
          this.props.tableSettings.result.length ? (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  className="mr-2 ml-2"
                  onClick={this.zoomToAllInMap.bind(this)}
                >
                  <Tooltip placement="topLeft" title={"تكبير إلي الكل"}>
                    <i className="fas fa-expand-arrows-alt fa-lg"></i>
                  </Tooltip>
                </div>
                <a
                  style={{ display: "none" }}
                  download
                  ref={this.exportCadRef}
                ></a>
                {this.props.tableSettings &&
                  this.props.tableSettings.result.length &&
                  this.props.tableSettings.result.find(
                    (r) =>
                      r.layername.toLocaleLowerCase() === "invest_site_polygon"
                  ) && (
                    <div
                      className="mr-2 ml-2"
                      onClick={this.handleExportCadFile.bind(this)}
                    >
                      <Tooltip placement="topLeft" title={"استخراج ملف الكاد"}>
                        <img
                          style={{ cursor: "pointer" }}
                          src={EXPORTCADIcon}
                          alt="export cad file"
                          width={30}
                          height={30}
                        />
                      </Tooltip>
                    </div>
                  )}
                <DownloadCSV
                  dataSet={this.props.tableSettings.result
                    ?.map((r) => r.data)
                    ?.flat()
                    .map((item) => item.attributes)}
                  fields={this.props.fields}
                />
              </div>
              <div>
                <span className="resultsNumber">
                  <span>عدد النتائج: </span>
                  <span style={{ fontWeight: "bold" }}>
                    {
                      this.props.tableSettings.result
                        ?.map((r) => r.data)
                        ?.flat().length
                    }
                  </span>
                </span>
              </div>
            </div>
          ) : null}
        </div>{" "}
        {/* { this.state.loading? <Loader />: null} */}
        {this.props.nearestSearchInputsShown ? (
          <Form
            className="nearestLocationForm"
            layout="vertical"
            name="validate_other"
            ref={this.formRef}
          >
            <Container>
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
                  allowClear
                  className="dont-show"
                  onChange={this.handleSelect("locationStatus")}
                  value={this.state.locationStatus}
                  placeholder="حالة الموقع "
                  getPopupContainer={(trigger) => trigger.parentNode}
                >
                  <Select.Option value="2">
                    شاغرة
                    <img
                      className="server-img-icon-svg"
                      src={`${window.imagesServerUrl}/SITE_MAIN_ACTIVITY_FORAS/222.svg`}
                      alt="img"
                    />
                  </Select.Option>
                  <Select.Option value="3">
                    فرص استثمارية معلنة
                    <img
                      className="server-img-icon-svg"
                      src={`${window.imagesServerUrl}/SITE_MAIN_ACTIVITY_FORAS/111.svg`}
                      alt="img"
                    />
                  </Select.Option>
                  <Select.Option value="4">
                    مستثمرة
                    <img
                      className="server-img-icon-svg"
                      src={`${window.imagesServerUrl}/SITE_MAIN_ACTIVITY_FORAS/333.svg`}
                      alt="img"
                    />
                  </Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                hasFeedback
                name="InvestMentActivity"
                // rules={[
                //   {
                //     message: "إختر النشاط الإستثماري",
                //     required: true,
                //   },
                // ]}
              >
                <Select
                  allowClear
                  autoClearSearchValue
                  showSearch
                  mode="multiple"
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
                  placeholder="جميع الانشطة الاستثمارية"
                  getPopupContainer={(trigger) => trigger.parentNode}
                  // defaultValue=''
                >
                  <Select.Option className="text-right" value={""}>
                    {"جميع الانشطة الاستثمارية"}
                  </Select.Option>
                  {this.renderDomainSelect("SITE_COMMON_USE")}
                </Select>
              </Form.Item>
              <Form.Item
                name="searchSpace"
                rules={[
                  {
                    message: "من فضلك ادخل محيط البحث",
                    required: true,
                  },
                  {
                    pattern: /^[\u0660-\u06690-9$@$!%*?&#^-_. +]+$/,
                    message: "يجب ادخال رقم",
                    // required:true
                  },
                ]}
                hasFeedback
              >
                <Input
                  // type="number"
                  name="searchSpace"
                  onChange={this.handlesearchSpace}
                  value={this.state.searchSpace}
                  placeholder=" محيط البحث(م)"
                />
              </Form.Item>
              {this.props.selectedSpotonMap === null ? (
                <p
                  className="mt-4"
                  style={{
                    color: "red",
                    margin: "auto",
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  {this.state.error}
                </p>
              ) : null}
              <Row>
                <Col span={24}>
                  <Button
                    onClick={this.nearestSearch}
                    className="SearchBtn mt-3"
                    size="large"
                    htmlType="submit"
                  >
                    بحث
                  </Button>
                </Col>
              </Row>
            </Container>
          </Form>
        ) : this.props.nearestResultMenuShown ? (
          <SearchResultMenu
            OpenSearchInputs={this.props.nearestOpenSearchInputs}
            OpenResultdetails={this.props.nearestOpenResultdetails}
          />
        ) : this.props.nearestResultDetailsShown ? (
          <SearchResultDetails
            removeDetailsActiveTab={this.props.removeDetailsActiveTab}
            OpenSearchInputs={this.props.nearestOpenSearchInputs}
            OpenResultMenu={this.props.nearestOpenResultMenu}
            showData={this.props.nearestResultDetailsShown}
            openLoader = {this.props.openLoader}
            closeLoader = {this.props.closeLoader}
          />
        ) : null}
        {this.props.nearestSearchInputsShown && (
          <div
            style={{
              width: "100%",
              direction: "rtl",
              display: "flex",
              flexDirection: "row",
            }}
          >
            <strong
              style={{
                width: "90%",
                whiteSpace: "pre-wrap",
                textAlign: "right",
                margin: "1vw",
                direction: "rtl",
                padding: "0.5vw",
                background: "antiquewhite",
                fontSize: "medium",
                fontFamily: "NeoSansArabic",
              }}
            >
              * برجاء الضغط على بحث بعد إدخال الحقول المطلوبة ثم الضغط على موقع
              من الخريطة
            </strong>
          </div>
        )}
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addToSelectedFeatures: (features) =>
      dispatch({ type: "ADD_TO_SELECTED_FEATURES", features }),
    pushResultTableData: (data) =>
      dispatch({ type: "RESULT_TABLE_DATA_SET", data }),
    handleMapClickEvent: ({ cursor, handler }) =>
      dispatch({ type: "MAP_CLICK_EVENT", cursor, handler }),
    // pushToBordersModal: (data) => dispatch({ type: "BORDERS_TABLE_DATA_SET", data }),
    pushContentToModal: (data) =>
      dispatch({ type: "TABLE_ICON_MODAL_DATA_SET", data }),
    clearTableData: () => dispatch({ type: "CLEAR_RESULT_TABLE_DATA_SET" }),
    clearSelectedFeatureData: () =>
      dispatch({ type: "CLOSE_TABLE_ICON_MODAL" }),
      disactivateSingleSelect: () =>
      dispatch({ type: "DIACTIVATE_SINGLE_SELECT" }),
  };
};

const mapStateToProps = ({ mapUpdate }) => {
  const { fields, currentUser, auth, tableSettings,filteredTableSettingsIDs } = mapUpdate;
  return {
    fields,
    currentUser,
    user: auth.user,
    tableSettings,
    filteredTableSettingsIDs
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NearestLocationSearch);

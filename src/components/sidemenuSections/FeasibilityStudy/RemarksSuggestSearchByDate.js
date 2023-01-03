import React, { useEffect, useRef, useState } from "react";
import { Container } from "react-bootstrap";
import moment from "moment-hijri";
import { connect } from "react-redux";
import axios from "axios";
import { Row, Col, Form, Button, Select } from "antd";
import {
  queryTask,
  getLayerIndex,
  getFeatureDomainName,
  highlightFeature,
} from "../../common/mapviewer";
import AtmIcon from "../../../assets/images/atm-icon-for-form.svg";
import GoogleIcon from "../../../assets/images/google-maps.svg";
import EmojiTransportationIcon from "@material-ui/icons/EmojiTransportation";
import PhotoLibraryIcon from "@material-ui/icons/PhotoLibrary";
import { AiOutlineFile } from "react-icons/ai";
import BorderAllIcon from "@material-ui/icons/BorderAll";
import { notificationMessage } from "../../../helpers/utlis/notifications_Func";
import { HIJRI_MONTHS } from "../../../helpers/utlis/Constants";

function RemarksSuggestionsSideMenus(props) {
  const Formref = useRef(null);
  const [suggestReportBool, setSuggestReportBool] = useState(
    props.printSuggestionReport
  );
  const suggestionReportBoolRef = useRef();
  // prevStateSuggestionReportBool.current =
  const [formData, setFormData] = useState({
    dayFrom: "",
    monthFrom: "",
    yearFrom: "",
    dayTo: "",
    monthTo: "",
    yearTo: "",
  });
  const [flagForTechReport, setFlagForTechReport] = useState([]);
  useEffect(() => {
    suggestionReportBoolRef.current = suggestReportBool;
    return ()=>{
      let graphicLayerOfZooming = window.__map__.getLayer("zoomGraphicLayer");
    graphicLayerOfZooming.clear()
    }
  }, []);
  const prevsuggestionReportBool = suggestionReportBoolRef.current;
  useEffect(() => {
    if (prevsuggestionReportBool == suggestReportBool) {
      props.showTable(false);
      console.log(moment);
      Formref.current.resetFields();
      setFormData({
        dayFrom: "",
        monthFrom: "",
        yearFrom: "",
        dayTo: "",
        monthTo: "",
        yearTo: "",
      });
    }
  }, [props.titleHeader]);
  const handleSelect = (value, name) => {
    let formDataClone = { ...formData };
    if (!value) setFormData({ ...formDataClone, [name]: "" });
    else setFormData({ ...formDataClone, [name]: value });
  };
  // const handleDeSelect = (name)=>{
  //   console.log(name);
  // }

  const getFeaturesOfRemarksORSuggest = async (type) => {
    let layername = "INVEST_SITE_POLYGON";
    const { user } = props;
    let promises = [];
    let layerIndex = getLayerIndex(layername);
    // console.log(type == "الملاحظات");
    let apiURL =
      type == "الملاحظات" ? `api/remark/getall` : `api/Suggestion/getall`;

    try {
      let res = await axios.get(window.API_URL + apiURL, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      let result = await res.data.results;
      if (result.length) {
        // console.log(moment);
        //step2: filter them based on date
        let filteredRes = result.filter((item) => {
          let startDay = moment(
            `${formData.dayFrom}/${formData.monthFrom}/${formData.yearFrom}`,
            "iDD/iMM/iYYYY"
          );
          let endDay = moment(
            `${formData.dayTo}/${formData.monthTo}/${formData.yearTo}`,
            "iDD/iMM/iYYYY"
          );
          let createdDay = moment(item.create_at, "iDD/iMM/iYYYY");
          //validation checks
          let isBetween = createdDay.isBetween(startDay._d, endDay._d);
          let isMatchedStartDay =
            item.create_at ==
            `${formData.dayFrom}/${formData.monthFrom}/${formData.yearFrom}`;
          let isMatchedEndDay =
            item.create_at ==
            `${formData.dayTo}/${formData.monthTo}/${formData.yearTo}`;
          if (isBetween || isMatchedStartDay || isMatchedEndDay) return item;
        });
        if (filteredRes.length) {
          // console.log(filteredRes);
          //step3: get geospatialIDs
          let geoSpatialIDs =[]
          if (type == "الملاحظات"){
            geoSpatialIDs = filteredRes.filter(f=>f.remark_investment).map((item) => {
              let remark_invest_arr =item.remark_investment; 
              return remark_invest_arr.map(
                (i) => i.invest_spatial_id
                );
              })
            }
            else{
              geoSpatialIDs = filteredRes.filter(f=>f.suggestion_investment).map(item=>{
              let suggest_invest_arr=item.suggestion_investment 
              return suggest_invest_arr.map(
                (i) => i.investment_spatial_id
                );
              })
          };
          promises.push(
            new Promise((resolve, reject) => {
              queryTask({
                returnGeometry: false,
                url: `${window.__mapUrl__}/${layerIndex}`,
                outFields: ["*"],
                where: `SITE_GEOSPATIAL_ID IN(${geoSpatialIDs.flat().join(",")})`,
                callbackResult: ({ features }) => {
                  // console.log({ features });
                  //step4: get all sites with these geospatialIDs
                  if (features && features.length > 0) {
                    resolve({
                      features,
                      name:
                        type == "الملاحظات"
                          ? "showAllremarks"
                          : "showAllsuggestions",
                      layername,
                      remarksOrSuggestions:type == "الملاحظات"
                      ?  filteredRes.filter(f=>f.remark_investment)
                      :  filteredRes.filter(f=>f.suggestion_investment),
                    });
                  } else
                    resolve({
                      features: [],
                      name:
                        type == "الملاحظات"
                          ? "showAllremarks"
                          : "showAllsuggestions",
                      layername,
                      remarksOrSuggestions: [],
                    });
                },
                callbackError: (err) => {
                  console.error(err);
                  reject(err);
                },
              });
            })
          );

          let flagTechReportPromises = [];
          let results = await Promise.all(promises);
          results.forEach((item) => {
            if (item.layername.toLocaleLowerCase() === "invest_site_polygon") {
              let indexLayer = getLayerIndex("TBL_BUILD_DETAILS"); //TBL_BUILD_DETAILS that includes TECHNIQUAL_REPORT to check yes or no
              flagTechReportPromises = item.features.map((feat) => {
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
                ...item.features.map((feat) => {
                  return { flag: false };
                }),
              ];
          });
          return {
            flagTechReportPromises,
            sitesFeatures: results.length ? results[0] : [],
          };
        } else {
          return false;
        }
      } else {
        return false;
      }
    } catch (err) {
      console.log(err);
    }
  };

  const getResults = async (type) => {
    const { user } = props;
    
    let error = Object.values(formData).includes('');
    if(error) return;
    let layername = "INVEST_SITE_POLYGON";
    props.openLoader();
    try{

    
    let res = await getFeaturesOfRemarksORSuggest(type);
    if (res) {
      //step7: show all results in table
      Promise.all(res.flagTechReportPromises).then((resultOfFlagTech) => {
        setFlagForTechReport(resultOfFlagTech);
        props.closeLoader(); //for loader in case of search process
        props.pushResultTableData({
          result: [{ layername, data: res.sitesFeatures.features }],
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
            {
              name: (feature) => {
                if (user && [1].includes(user.user_type_id)) {
                  return "Charts";
                } else return "";
              },
              alias: (feature) => {
                if (user && [1].includes(user.user_type_id)) {
                  return "الرسوم البيانية";
                }
                return "";
              },
              icon: <i className="fas fa-chart-pie"></i>,
              canRender: (feature) => {
                if (
                  user &&
                  [1].includes(user.user_type_id) &&
                  props.titleHeader !== "الملاحظات"
                )
                  return true;
                else return false;
              },
              action: (feature, layername) => {
                let geoSpatialID = feature.attributes.SITE_GEOSPATIAL_ID;
                // console.log("Show Charts of suggestions");
                props.pushContentToModal({
                  feature: res.sitesFeatures.remarksOrSuggestions.filter(
                    (item) =>
                      item.suggestion_investment
                        .map((i) => i.investment_spatial_id)
                        .includes(geoSpatialID)
                  ),
                  layername,
                  name: "suggestionsCharts",
                });
              },
            },
            //show all remarks - suggestions of selected site
            {
              name: (feature) => {
                if (user && [1].includes(user.user_type_id)) {
                  if (props.titleHeader !== "الملاحظات")
                    return "showAllsuggestions";
                  else return "showAllremarks";
                }
                return "";
              },
              alias: (feature) => {
                if (user && [1].includes(user.user_type_id)) {
                  if (props.titleHeader !== "الملاحظات")
                    return "عرض الاقتراحات";
                  else return "عرض الملاحظات";
                }
                return "";
              },
              icon: <AiOutlineFile fontSize="medium" />,
              canRender: (feature) => {
                if (user && [1].includes(user.user_type_id)) return true;
                else return false;
              },
              action: (feature, layername) => {
                let geoSpatialID = feature.attributes.SITE_GEOSPATIAL_ID;
                // console.log(res.sitesFeatures.remarksOrSuggestions);
                if (props.titleHeader !== "الملاحظات") {
                  // push the feature to the store + remarks or suggestions
                  props.pushContentToModal({
                    feature: res.sitesFeatures.remarksOrSuggestions.filter(
                      (item) =>
                        item.suggestion_investment
                          .map((i) => i.investment_spatial_id)
                          .includes(geoSpatialID)
                    ),
                    layername,
                    name: "showAllsuggestions",
                  });
                } else {
                  props.pushContentToModal({
                    feature: res.sitesFeatures.remarksOrSuggestions.filter(
                      (item) =>
                        item.remark_investment
                          .map((i) => i.invest_spatial_id)
                          .includes(geoSpatialID)
                    ),
                    layername,
                    name: "showAllremarks",
                  });
                }
              },
            },

            {
              name: "zoom",
              alias: "تكبير",
              icon: <i className="fas fa-search-plus pl-1"></i>,
              canRender: () => true,
              action: (feature, layername) => {
                props.openLoader(); //for loader in case of zooimng
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
                    props.closeLoader(); //for loader in case of zooimng
                    // props.addToSelectedFeatures(features);
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
                // console.log(data);
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
              name: "borders",
              alias: "حدود الموقع من الطبيعة",
              icon: <i className="far fa-map pl-1"></i>,
              canRender: (feature, layername) =>
                layername.toLocaleLowerCase() ==
                  "Invest_Site_Polygon".toLocaleLowerCase() &&
                feature.attributes["SITE_COMMON_USE"] !== 15131,
              action: (feature, layername) => {
                // push the feature to the store
                // so the borders modal can be opened
                props.pushContentToModal({
                  feature,
                  layername,
                  name: "Border_Field_Info",
                });
              },
            },
            //Borders from Plan --> employee just can see it
            {
              name: "borders",
              alias: "حدود الموقع من المخطط",
              icon: <BorderAllIcon />,
              canRender: (feature, layername) =>
                layername.toLocaleLowerCase() ==
                  "Invest_Site_Polygon".toLocaleLowerCase() &&
                feature.attributes["SITE_COMMON_USE"] !== 15131 &&
                props.currentUser === "Employee",
              action: async (feature, layername) => {
                props.openLoader(); //for loader in case of zooimng

                let layerIndex = getLayerIndex("INVEST_SITE_BOUNDARY"); //INVEST_SITE_BOUNDARY
                await queryTask({
                  returnGeometry: false,
                  url: `${window.__mapUrl__}/${layerIndex}`,
                  outFields: ["*"],
                  where: `SITE_GEOSPATIAL_ID=${feature.attributes["SITE_GEOSPATIAL_ID"]}`,
                  callbackResult: ({ features }) => {
                    getFeatureDomainName(features, layerIndex).then((rf) => {
                props.closeLoader(); //for loader in case of zooimng
                      if (!rf.length) rf = [];
                      props.pushContentToModal({
                        features: rf,
                        layername,
                        name: "Border_Plan_Info",
                        borderDescirbtion: feature.attributes,
                      });
                    });
                  },
                  callbackError: (err) => {
                props.closeLoader(); //for loader in case of zooimng
                    console.error(err);
                  },
                });
              },
            },
            //advertise boards group
            {
              name: "AD borders",
              alias: "بيانات المجموعة الإعلانية",
              icon: <i className="fas fa-ad 5x"></i>,
              canRender: (feature, layername) =>
                getLayerIndex(layername) == getLayerIndex("ADVERTISING_BOARDS"),
              // &&feature.attributes["SITE_COMMON_USE"] == 15131
              action: async (feature, layername) => {
                // push the feature to the store
                // so the borders modal can be opened
                props.openLoader(); 
                let indexLayer = getLayerIndex("TBL_BOARDS_GROUP"); //TBL_BOARDS_GROUP
                await queryTask({
                  returnGeometry: false,
                  url: `${window.__mapUrl__}/${indexLayer}`,
                  outFields: ["*"],
                  where: `GROUP_CODE=${feature.attributes["GROUP_CODE"]}`,
                  callbackResult: ({ features }) => {
                props.closeLoader(); 
                    getFeatureDomainName(features, indexLayer).then((rf) => {
                      if (!rf.length) rf = [];
                      props.pushContentToModal({
                        feature: rf,
                        name: "ADGroup_Info",
                      });
                    });
                  },
                  callbackError: (err) => {
                props.closeLoader(); 
                    console.error(err);
                  },
                });
              },
            },

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
                layername.toLocaleLowerCase() ==
                  "Invest_Site_Polygon".toLocaleLowerCase() &&
                feature.attributes["SITE_SUBTYPE"] == 6,
              action: async (feature, layername) => {
                // push the feature to the store
                // so the borders modal can be opened
                props.openLoader(); 
                let indexLayer = getLayerIndex("TBL_ATM"); //TBL_ATM
                await queryTask({
                  returnGeometry: false,
                  url: `${window.__mapUrl__}/${indexLayer}`,
                  outFields: ["*"],
                  where: `SITE_GEOSPATIAL_ID=${feature.attributes["SITE_GEOSPATIAL_ID"]}`,
                  callbackResult: ({ features }) => {
                props.closeLoader(); 
                    getFeatureDomainName(features, indexLayer).then((rf) => {
                      if (!rf.length) rf = [{ attributes: {} }];
                      props.pushContentToModal({
                        feature: rf[0],
                        name: "ATM_Info",
                      });
                    });
                  },
                  callbackError: (err) => {
                props.closeLoader(); 
                    console.error(err);
                  },
                });
              },
            },
            //for Building info
            {
              name: "BuildingDataInfo",
              alias: "بيانات المبني",
              icon: <i className="fas fa-city"></i>,
              canRender: (feature, layername) =>
                layername.toLocaleLowerCase() ==
                  "Invest_Site_Polygon".toLocaleLowerCase() &&
                feature.attributes["SITE_SUBTYPE"] == 1,
              action: async (feature, layername) => {
                // push the feature to the store
                // so the borders modal can be opened
                props.openLoader(); 
                // console.log(feature);
                // console.log(feature.attributes["SITE_GEOSPATIAL_ID"]);
                let indexLayer = getLayerIndex("TBL_BUILDING_DATA"); //TBL_BUILDING_DATA
                await queryTask({
                  returnGeometry: false,
                  url: `${window.__mapUrl__}/${indexLayer}`,
                  outFields: ["*"],
                  where: `SITE_GEOSPATIAL_ID=${feature.attributes["SITE_GEOSPATIAL_ID"]}`,
                  callbackResult: ({ features }) => {
                props.closeLoader(); 
                    // console.log(features);
                    getFeatureDomainName(features, indexLayer).then((rf) => {
                      if (!rf.length) rf = [{ attributes: {} }];
                      props.pushContentToModal({
                        feature: rf[0],
                        name: "Building_Data_Info",
                      });
                    });
                  },
                  callbackError: (err) => {
                props.closeLoader(); 
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
                  layername.toLocaleLowerCase() ==
                    "Invest_Site_Polygon".toLocaleLowerCase() &&
                  flagForTechReport.length
                ) {
                  let flagTechReport = flagForTechReport.find(
                    (item) => item.id === feature.attributes.SITE_GEOSPATIAL_ID
                  );
                  if (flagTechReport) return flagTechReport.flag;
                  else return false;
                } else return false;
              },
              action: async (feature, layername) => {
                // push the feature to the
                props.openLoader(); 
                let featAttributes = { ...feature.attributes };
                // console.log(feature.attributes["SITE_GEOSPATIAL_ID"]);
                let indexLayer = getLayerIndex("TBL_BUILD_DETAILS"); //TBL_BUILD_DETAILS that includes TECHNIQUAL_REPORT to check yes or no
                await queryTask({
                  returnGeometry: false,
                  url: `${window.__mapUrl__}/${indexLayer}`,
                  outFields: ["*"],
                  where: `SITE_GEOSPATIAL_ID=${feature.attributes["SITE_GEOSPATIAL_ID"]}`,
                  callbackResult: ({ features }) => {
                props.closeLoader(); 
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
                    props.pushContentToModal({
                      feature: featureWithAllAttributes,
                      name: "Building_Details_Info",
                    });
                  },
                  callbackError: (err) => {
                    console.error(err);
                props.closeLoader(); 
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
                  layername.toLocaleLowerCase() ==
                    "Invest_Site_Polygon".toLocaleLowerCase() &&
                  flagForTechReport.length
                ) {
                  let flagTechReport = flagForTechReport.find(
                    (item) => item.id === feature.attributes.SITE_GEOSPATIAL_ID
                  );
                  if (flagTechReport) return flagTechReport.flag;
                  else return false;
                } else return false;
              },
              action: async (feature, layername) => {
                // push the feature to the store
                // so the borders modal can be opened
                props.openLoader(); 
                let indexLayer = getLayerIndex("TBL_BUILD_DETAILS"); //TBL_BUILD_DETAILS that includes TECHNIQUAL_REPORT to check yes or no
                await queryTask({
                  returnGeometry: false,
                  url: `${window.__mapUrl__}/${indexLayer}`,
                  outFields: ["IMAGE_URL"],
                  where: `SITE_GEOSPATIAL_ID=${feature.attributes["SITE_GEOSPATIAL_ID"]}`,
                  callbackResult: ({ features }) => {
                props.closeLoader(); 
                    if (!features.length) features = [{ attributes: {} }];
                    props.pushContentToModal({
                      feature: features[0],
                      name: "Building_Images",
                    });
                  },
                  callbackError: (err) => {
                props.closeLoader(); 
                    console.error(err);
                  },
                });
              },
            },
            //for towers info
            {
              name: "towers info",
              alias: "بيانات الأبراج",
              icon: <i className="fas fa-broadcast-tower"></i>,
              canRender: (feature, layername) =>
                layername.toLocaleLowerCase() ==
                  "Invest_Site_Polygon".toLocaleLowerCase() &&
                feature.attributes["SITE_SUBTYPE"] == 3,
              action: async (feature, layername) => {
                // push the feature to the store
                // so the borders modal can be opened
                props.openLoader(); 
                // console.log(feature.attributes["SITE_GEOSPATIAL_ID"]);
                let indexLayer = getLayerIndex("TBL_TOWERS"); //TBL_TOWERS
                await queryTask({
                  returnGeometry: false,
                  url: `${window.__mapUrl__}/${indexLayer}`,
                  outFields: [
                    "TOWER_LOCATION_CODE,TOWER_TYPE,TOWER_HEIGHT,TOWER_SERVICE_PROVIDER",
                  ],
                  where: `SITE_GEOSPATIAL_ID=${feature.attributes["SITE_GEOSPATIAL_ID"]}`,
                  callbackResult: ({ features }) => {
                    getFeatureDomainName(features, indexLayer).then((rf) => {
                props.closeLoader(); 
                      if (!rf.length) rf = [{ attributes: {} }];
                      props.pushContentToModal({
                        feature: rf[0],
                        name: "Tower_Info",
                      });
                    });
                  },
                  callbackError: (err) => {
                props.closeLoader(); 
                    console.error(err);
                  },
                });
              },
            },
            //for elec stations info
            {
              name: "elec stations info",
              alias: "بيانات  محطات الكهرباء",
              icon: <i className="fas fa-gopuram"></i>,
              canRender: (feature, layername) =>
                layername.toLocaleLowerCase() ==
                  "Invest_Site_Polygon".toLocaleLowerCase() &&
                feature.attributes["SITE_SUBTYPE"] == 5,
              action: async (feature, layername) => {
                // push the feature to the store
                // so the borders modal can be opened
                props.openLoader(); 
                // console.log(feature.attributes["SITE_GEOSPATIAL_ID"]);
                let indexLayer = getLayerIndex("TBL_ELEC_STATION");
                await queryTask({
                  returnGeometry: false,
                  url: `${window.__mapUrl__}/${indexLayer}`,
                  outFields: ["ELEC_TYPE,NAME"],
                  where: `SITE_GEOSPATIAL_ID=${feature.attributes["SITE_GEOSPATIAL_ID"]}`,
                  callbackResult: ({ features }) => {
                    getFeatureDomainName(features, indexLayer).then((rf) => {
                props.closeLoader(); 
                      if (!rf.length) rf = [{ attributes: {} }];
                      props.pushContentToModal({
                        feature: rf[0],
                        name: "Elec_Stations_Info",
                      });
                    });
                  },
                  callbackError: (err) => {
                props.closeLoader(); 
                    console.error(err);
                  },
                });
              },
            },
            //for Site Coordinates info
            {
              name: "coordinates info",
              alias: "بيانات الاحداثيات",
              icon: <i className="fas fa-map-marked-alt"></i>,
              canRender: (feature, layername) =>
                getLayerIndex(layername) ==
                  getLayerIndex("Invest_Site_Polygon") &&
                feature.attributes["SITE_SUBTYPE"] !== 2 &&
                props.currentUser === "Employee",
              action: async (feature, layername) => {
                // so the borders modal can be opened
                props.openLoader(); 
                // console.log(feature.attributes["SITE_GEOSPATIAL_ID"]);
                let indexLayer = getLayerIndex("INVEST_SITE_CORNER");
                await queryTask({
                  returnGeometry: false,
                  url: `${window.__mapUrl__}/${indexLayer}`,
                  outFields: ["XGCS_COORD,YGCS_COORD,CORNER_NO"],
                  where: `SITE_GEOSPATIAL_ID=${feature.attributes["SITE_GEOSPATIAL_ID"]}`,
                  callbackResult: ({ features }) => {
                    props.closeLoader(); 
                    if (!features.length) features = [];
                    props.pushContentToModal({
                      features: features,
                      name: "Coordinate_Info",
                    });
                  },
                  callbackError: (err) => {
                    console.error(err);
                    props.closeLoader(); 
                  },
                });
              },
            },
          ],
        });
        props.showTable(true);
      });
    } else {
      props.closeLoader();
      notificationMessage("عفواً لا يوجد نتائج");
    }
  }catch(err){
    props.closeLoader();
    notificationMessage("عفواً لقد حدث خطأ");
  }
  };
  return (
    <div className="coordinates mb-4">
      <h3 className="mb-2">{props.titleHeader} </h3>
      <Container className="pt-2">
        {/* day */}

        <Form
          className="GeneralForm"
          layout="vertical"
          name="validate_other"
          ref={Formref}
        >
          <p style={{ display: "flex" }}>
            <strong>من:</strong>
          </p>
          <Row gutter={{ xs: 8 }} className="justify-content-around">
            <Col className="gutter-row" span={7}>
              <Form.Item
                hasFeedback
                name="dayFrom"
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
                      option.value.toLowerCase().indexOf(input.toLowerCase()) >=
                      0
                    );
                  }}
                  className="dont-show"
                  // onDeselect={()=>handleDeSelect("dayFrom")}
                  // onClear={()=>handleDeSelect("dayFrom")}
                  name="dayFrom"
                  value={formData.dayFrom}
                  onChange={(e) => handleSelect(e, "dayFrom")}
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
            <Col className="gutter-row ml-1 mr-1" span={9}>
              <Form.Item
                hasFeedback
                name="monthFrom"
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
                      option.key.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    );
                  }}
                  className="dont-show"
                  value={formData.monthFrom}
                  // onDeselect={()=>handleDeSelect("monthFrom")}
                  // onClear={()=>handleDeSelect("monthFrom")}
                  name="monthFrom"
                  onChange={(e) => handleSelect(e, "monthFrom")}
                  placeholder=" الشهر"
                  getPopupContainer={(trigger) => trigger.parentNode}
                >
                  {HIJRI_MONTHS.map((month, index) => {
                    // console.log(
                    //   "index",
                    //   index,
                    //   index + 1 < 10
                    //     ? String("0" + (+index + 1))
                    //     : String(+index + 1)
                    // );
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
            <Col className="gutter-row" span={7}>
              <Form.Item
                hasFeedback
                name="yearFrom"
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
                      option.value.toLowerCase().indexOf(input.toLowerCase()) >=
                      0
                    );
                  }}
                  className="dont-show"
                  // onDeselect={()=>handleDeSelect("yearFrom")}
                  // onClear={()=>handleDeSelect("yearFrom")}
                  name="yearFrom"
                  value={formData.yearFrom}
                  onChange={(e) => handleSelect(e, "yearFrom")}
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
          <p style={{ display: "flex" }}>
            <strong>إلى:</strong>
          </p>
          <Row gutter={{ xs: 8 }} className="justify-content-around">
            <Col className="gutter-row" span={7}>
              <Form.Item
                hasFeedback
                name="dayTo"
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
                      option.value.toLowerCase().indexOf(input.toLowerCase()) >=
                      0
                    );
                  }}
                  className="dont-show"
                  // onDeselect={()=>handleDeSelect("dayTo")}
                  // onClear={()=>handleDeSelect("dayTo")}
                  name="dayTo"
                  value={formData.dayTo}
                  onChange={(e) => handleSelect(e, "dayTo")}
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
            <Col className="gutter-row ml-1 mr-1" span={9}>
              <Form.Item
                hasFeedback
                name="monthTo"
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
                      option.key.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    );
                  }}
                  className="dont-show"
                  // onDeselect={()=>handleDeSelect('monthTo')}
                  // onClear={()=>handleDeSelect('monthTo')}
                  name="monthTo"
                  value={formData.monthTo}
                  onChange={(e) => handleSelect(e, "monthTo")}
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
                            : String(index + 1)
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
            <Col className="gutter-row" span={7}>
              <Form.Item
                hasFeedback
                name="yearTo"
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
                      option.value.toLowerCase().indexOf(input.toLowerCase()) >=
                      0
                    );
                  }}
                  className="dont-show"
                  // onDeselect={()=>handleDeSelect('yearTo')}
                  // onClear={()=>handleDeSelect('yearTo')}
                  name="yearTo"
                  value={formData.yearTo}
                  onChange={(e) => handleSelect(e, "yearTo")}
                  placeholder=" السنة"
                  getPopupContainer={(trigger) => trigger.parentNode}
                >
                  {Array(11)
                    .fill(moment().format("iYYYY") - 10)
                    .reduce((all, item, index) => {
                      if (!all.length) all = [String(item)];
                      else all.push(String(+item + index));
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
          <Col span={24}>
            <Button
              onClick={() => getResults(props.titleHeader)}
              className="SearchBtn mt-3"
              size="large"
              htmlType="submit"
            >
              بحث
            </Button>
          </Col>
        </Form>
      </Container>
    </div>
  );
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
  };
};

const mapStateToProps = ({ mapUpdate }) => {
  const { fields, currentUser, auth } = mapUpdate;
  return {
    fields,
    currentUser,
    user: auth.user,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RemarksSuggestionsSideMenus);
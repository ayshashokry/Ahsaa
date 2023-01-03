/* eslint-disable react/jsx-key */
import React, { Component } from "react";
import { layersSetting } from "../../reportMapViewer/config/layers";
import { find, round } from "lodash";
import QRCode from "react-qr-code";
import axios from 'axios';
import {connect} from 'react-redux'
import AhsaaLogo from "../../../assets/images/ahsalogo.png";
import footer from "../../../assets/images/footer.png";
import { withRouter } from "react-router";
import MapComponent from "../../reportMapViewer/map/index";
import Loader from "../../loader/index";
import {INVESTOR_DATA, CONTRACTS_MAIN_DATA} from '../../SideMenuTabs/helpers/ContractTabsFields'
import { queryTask, highlightFeatureForReportMap } from "../../common/mapviewer";
import { getFeatureDomainName, getDomain } from "../../reportMapViewer/common/common_func";
import queryString from "query-string";
// import { ahsaMapUrl, ahsaReportMapUrl } from "../../reportMapViewer/config";

import { getMapInfo } from "../../reportMapViewer/common/esriRequest_Func";

class TechReportInDetailsComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      contractData:undefined, imgTypes:[]
    };
    this.layerName = "INVEST_SITE_POLYGON";
  }

  getFeaturesInfo(mapInfo, dataInfo) {
    var investPolyLayer = find(
      mapInfo.layers,
      {
        name: "INVEST_SITE_POLYGON",
      },
      true
    );
    var buildDetailsTbl = find(
      dataInfo.$layers.tables,
      {
        name: "TBL_BUILD_DETAILS",
      },
      true
    );
    if(buildDetailsTbl) {
      let imgTypes = buildDetailsTbl.fields.find((f) => f.name === 'PHOTO_TYPE').domain;
      this.setState({imgTypes:imgTypes?.codedValues})
    }
    let siteGeoID = localStorage.getItem("techReportSiteDetail");
    // "SERIAL >= " + from_id + " and SERIAL <= " + to_id;
    if (siteGeoID)
      queryTask({
        returnGeometry: false,
        url: window.ahsaReportMapUrl + "/" + investPolyLayer.id,
        where: `SITE_GEOSPATIAL_ID=${siteGeoID}`,
        outFields: layersSetting["INVEST_SITE_POLYGON"].outFields,
        callbackResult: (data) => {
          let selectedFeatures = data.features;
          getFeatureDomainName(
            selectedFeatures,
            investPolyLayer.id,
            false,
            window.ahsaReportMapUrl
          ).then(async (res) => {
            this.getBoundContractIBuildDetailsnfo(res, mapInfo).then(
              (ContractBuildDetailsAndBoundaries) => {
                  this.stopLoading();
                this.setState({
                  selectedFeatures: ContractBuildDetailsAndBoundaries,
                  // , loading:false
                });
              }
            );
          });
        },
        returnGeometry: true,
        callbackError(error) {},
      });
  }

  
  getBoundContractIBuildDetailsnfo(features, mapInfo) {
    let requests = features.length * 2;
    let index = 0;
    return new Promise((resolve, reject) => {
      features.forEach((feature) => {
        var investPolyLayer = find(
          mapInfo.layers,
          {
            name: "INVEST_SITE_BOUNDARY",
          },
          true
        );

        queryTask({
          url: window.ahsaReportMapUrl + "/" + investPolyLayer.id,
          where:
            "SITE_GEOSPATIAL_ID = " + feature.attributes.SITE_GEOSPATIAL_ID,
          outFields: layersSetting["INVEST_SITE_BOUNDARY"].outFields,
          callbackResult: (data) => {
            getFeatureDomainName(
              data.features,
              investPolyLayer.id,
              false,
              window.ahsaReportMapUrl
            ).then((res) => {
              res.forEach((r) => {
                if (r.attributes["BOUNDARY_DIRECTION"] == "الحد الشمالى") {
                  r.attributes["BOUNDARY_DESCRIPTION"] =
                    feature.attributes["NORTH_BOUNDARY_DESCRIPTION"];
                } else if (
                  r.attributes["BOUNDARY_DIRECTION"] == "الحد الشرقى"
                ) {
                  r.attributes["BOUNDARY_DESCRIPTION"] =
                    feature.attributes["EAST_BOUNDARY_DESCRIPTION"];
                } else if (
                  r.attributes["BOUNDARY_DIRECTION"] == "الحد الجنوبى"
                ) {
                  r.attributes["BOUNDARY_DESCRIPTION"] =
                    feature.attributes["SOUTH_BOUNDARY_DESCRIPTION"];
                } else if (
                  r.attributes["BOUNDARY_DIRECTION"] == "الحد الغربى"
                ) {
                  r.attributes["BOUNDARY_DESCRIPTION"] =
                    feature.attributes["WEST_BOUNDARY_DESCRIPTION"];
                }
              });
              feature.boundries = res;
              index++;
              if (index == requests) resolve(features);
            });
          },
          returnGeometry: false,
          callbackError(error) {},
        });

        let buildingDetailsTbl = find(mapInfo.tables, {
          name: "TBL_BUILD_DETAILS",
        });

        queryTask({
          url: window.ahsaReportMapUrl + "/" + buildingDetailsTbl.id,
          where:
            "SITE_GEOSPATIAL_ID = " + feature.attributes.SITE_GEOSPATIAL_ID,
          outFields: layersSetting["TBL_BUILD_DETAILS"].outFields,
          orderByFields: ["CREATED_DATE DESC"],
          callbackResult: (data) => {
            getFeatureDomainName(
              data.features,
              buildingDetailsTbl.id,
              false,
              window.ahsaReportMapUrl
            ).then((res) => {
              feature.buildingDetails = res;
              index++;
              if (index == requests) resolve(features);
            });
          },
          returnGeometry: false,
          callbackError(error) {},
        });
     
      });
    });
  }
  fetchContractInfo =async(geoSpatialID)=>{
    let contractDataForAll = [];
let contractInfo = await axios.get(window.API_URL+`contract-info?spatial_id=${Number(geoSpatialID)}`,{
        headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${this.props.user.token||localStorage.getItem("userToken")}`,
      },
    })
    let contract_id = contractInfo?.data[0]?.CONTRACT_ID;
    contractDataForAll.push(
      contractInfo?.data[0]
    );
  
  this.setState({contractData:contractDataForAll})
   
  };
  componentDidMount() {
    this.setState({ zoom: true, loading: true });
    let geoSpatialID = localStorage.getItem("techReportSiteDetail")
    if(geoSpatialID){
    
      this.fetchContractInfo(geoSpatialID)
      getMapInfo(window.ahsaReportMapUrl).then((data) => {
        this.layers = data.info.mapInfo.layers;
        this.getFeaturesInfo(data.info.mapInfo, data.info);
      });
    }else{
        this.props.history.replace("/404notfound")
    }
  }
  stopLoading() {
    this.setState({ loading: false });
  }

  onMapCreate(feature, map) {
    highlightFeatureForReportMap(feature, map, {
      isZoom: true,
      layerName: "zoomGraphicLayer",
      zoomFactor: 100,
      callback: () => {
        window[map.id]._fixedPan(-0.2 * map.width, 0);
      },
    });
  }

  removeBaseMap(feature, isLastMap, map) {
    highlightFeatureForReportMap(feature, map, {
      isZoom: true,
      layerName: "zoomGraphicLayer",
      zoomFactor: 50,
      isnoHightlight: true,
      callback: () => {
        // var removedBaseMap = map.getLayer(map.basemapLayerIds[0]);
        // if (removedBaseMap) {
        //   map.removeLayer(removedBaseMap);
        // }
        window[map.id]._fixedPan(-0.2 * map.width, 0);
        if (isLastMap) {
          setTimeout(() => {
            this.setState({ loading: false });
          }, 2000);
        }
      },
    });
  }

  render() {
    let { selectedFeatures = [], zoom } = this.state;
    return selectedFeatures.length > 0 ? (
      <div className="reportStyle2">
        {this.state.loading ? <Loader /> : null}
        {selectedFeatures.map((feature, key) => (
          <div
            style={{ padding: "10px", margin: "1%", textAlign: "justify" }}
            id={`${key}`}
            className="one-page"
          >
            <div>
              {/** Header of report */}
              <div className="">
                <div style={{ fontSize: "17px", display: "flex" }}>
                  <div>
                    <img
                      src={AhsaaLogo}
                      className="img-logo-print2"
                      style={{ width: "130px" }}
                    />
                  </div>
                  <div className="investment_report_header">
                    <h4>أمانة الاحساء</h4>
                    <h4>الإدارة العامة للاستثمارات وتنمية الايرادات</h4>
                    <h4>
                      مشروع تقديم خدمات استشارية لدراسة وتنمية وتطوير
                      الاستثمارات{" "}
                    </h4>
                  </div>

                  <div>
                    <div
                      style={{
                        display: "block",
                        marginTop: "10px",
                        textAlign: "center",
                      }}
                    >
                      <a
                        href={
                          "http://maps.google.com/maps?q=" +
                          feature.attributes["SITE_LAT_COORD"] +
                          "," +
                          feature.attributes["SITE_LONG_COORD"]
                        }
                        target="blank"
                      >
                        رابط جوجل
                      </a>
                    </div>
                    <div style={{ display: "block", marginTop: "10px" }}>
                      <QRCode
                        size={128}
                        value={
                          "http://maps.google.com/maps?q=" +
                          feature.attributes["SITE_LAT_COORD"] +
                          "," +
                          feature.attributes["SITE_LONG_COORD"]
                        }
                      />
                    </div>
                  </div>
                </div>
             
              </div>
              {/************************** */}

              <h3 className="text-center">التقرير الفني التفصيلي</h3>
                        <br></br>
                        <br></br>
              
                        <h3 className="underlineStyle">تقرير مبنى قائم</h3>

              <div key={"p" + key}>
                {/** Section1:  تقرير مبنى قائم*/}
                <div
                  style={{
                    gridTemplateColumns: "auto auto",
                    display: "grid",
                  }}
                >
                  {Object.keys(feature.attributes).map((attribute, index) => {
                    return (
                      layersSetting[this.layerName].outFields.indexOf(
                        attribute
                      ) > -1 &&
                      layersSetting[this.layerName].hideFields.indexOf(
                        attribute
                      ) < 0 &&
                      feature.attributes[attribute] &&
                      attribute != "PROPERTY_ID" && (
                        <div key={"xyyy" + index}>
                          {layersSetting[this.layerName].outFields.indexOf(
                            attribute
                          ) > -1 &&
                            layersSetting[this.layerName].hideFields.indexOf(
                              attribute
                            ) < 0 &&
                            feature.attributes[attribute] &&
                            attribute != "PROPERTY_ID" && (
                              <div className="reportRow">
                                {
                                  <div>
                                    {
                                      [
                                        "OBJECTID",
                                        ...layersSetting[this.layerName]
                                          .aliasOutFields,
                                      ][
                                        layersSetting[
                                          this.layerName
                                        ].outFields.indexOf(attribute)
                                      ]
                                    }
                                  </div>
                                }

                                <div
                                  style={
                                    attribute == "SITE_LAT_COORD" ||
                                    attribute == "SITE_LONG_COORD"
                                      ? { direction: "ltr" }
                                      : {}
                                  }
                                >
                                  {!isNaN(feature.attributes[attribute]) &&
                                  attribute != "SITE_LAT_COORD" &&
                                  attribute != "SITE_LONG_COORD"
                                    ? round(
                                        Number(feature.attributes[attribute]),
                                        2
                                      )
                                    : ["<Null>", "", " "].includes(
                                        feature.attributes[attribute]
                                      )
                                    ? "بدون"
                                    : feature.attributes[attribute]}
                                </div>
                              </div>
                            )}
                        </div>
                      )
                    );
                  })}
                  <div>
                    <div className="reportRow">
                      رابط جوجل
                      <div>
                        <div>
                          <a
                            onClick={() =>
                              window.open(
                                `http://maps.google.com/maps?q=${feature.attributes["SITE_LAT_COORD"]},${feature.attributes["SITE_LONG_COORD"]}`
                              )
                            }
                          >
                            {`http://maps.google.com/maps?q=${feature.attributes["SITE_LAT_COORD"]},${feature.attributes["SITE_LONG_COORD"]}`}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/************************** */}

                {/** Section2: بيانات المستثمر*/}

                <div style={{ display: "flex" }}>
                  <div style={{ width: "100%" }}>
                    <h3 className="underlineStyle">بيانات المستثمر</h3>
                    {
                      <table className="table table-bordered">
                        <thead>
                          <tr>
                            {this.state.contractData&&this.state.contractData[key]?
                             INVESTOR_DATA.filter(
                              (item) =>item.groupPermissions.includes(1)      //1 => tech reports
                              ).map((attribute, i) => 
                                 (
                                    <th
                                      key={key+"xy" + i}
                                      style={{
                                        color: "firebrick",
                                        fontSize: "14px",
                                      }}
                                    >
                                      {
                                        attribute.alias?
                                        attribute.alias:
                                        "بدون"
                                      }
                                    </th>
                                  )
                                ):null}
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                          {this.state.contractData&&this.state.contractData[key]
                            ? INVESTOR_DATA.filter(
                              (item) =>item.groupPermissions.includes(1)      //1 => tech reports
                              ).map((attribute, i) => (
                                  
                                        <td key={key+"xyz" + i}>       
                                              {
                                              this.state.contractData[key][attribute.fieldName]?
                                              this.state.contractData[key][attribute.fieldName]
                                            : "بدون"}
                                        </td>
                                      )
                                      )
                                      
                                      : [1].map(() => (
                                    
                                      <td key={"asd"}>غير متوفر</td>
                                      

                                      ))}
                                      </tr>
                        </tbody>
                      </table>
                    }
                  </div>
                </div>

                {/************************** */}
                {/** Section3:   بيانات العقد*/}

                <div style={{ display: "flex" }}>
                  <div style={{ width: "100%" }}>
                    <h3 className="underlineStyle">بيانات العقد</h3>
                    {
                      <table className="table table-bordered">
                        <thead>
                            {this.state.contractData&&this.state.contractData[key]?
                               
                                 (
                                   <tr>
                                    <th
                                      key={"xy"}
                                      style={{
                                        color: "firebrick",
                                        fontSize: "14px",
                                      }}
                                    >
                                      الحقل
                                    </th>
                                    <th
                                      key={"xy"}
                                      style={{
                                        color: "firebrick",
                                        fontSize: "14px",
                                      }}
                                    >
                                      الوصف
                                    </th>
                          </tr>
                                  )
                                :null}
                        </thead>
                        <tbody>
                          {this.state.contractData&&this.state.contractData[key]
                            ? CONTRACTS_MAIN_DATA.filter(
                              (item) =>item.groupPermissions.includes(1)      //1 => tech reports
                              ).map((attribute, i) => {
                              if(attribute.fieldName!=="CONTRACT_FILE")
                              return(
                              <tr>
                                        <td key={key+"xyzz" + i} style={{fontWeight:'bold'}}>       
                                              {
                                              attribute.alias?
                                              attribute.alias
                                            : "بدون"}
                                        </td>
                                        <td key={key+"xyzy" + i}>       
                                              {
                                              this.state.contractData[key][attribute.fieldName]?
                                              this.state.contractData[key][attribute.fieldName]:"بدون"
                                            }
                                        </td>
                                  </tr>
                                      )}
                                  )
                            : [1].map(() => (
                              <tr>
                                      <td>غير متوفر</td>
                                   
                                      
                                      </tr>
                                      ))}
                        </tbody>
                      </table>
                    }
                  </div>
                </div>

                {/************************** */}

                {/** Section4:   حدود الموقع */}

                {feature.boundries && (
                  <div style={{ display: "flex" }}>
                    <div style={{ width: "50%" }}>
                      <h3 className="underlineStyle">
                        الموقع حسب المخطط المعتمد
                      </h3>
                      {
                        <table className="table table-bordered">
                          <thead>
                            <tr>
                              {Object.keys(
                                layersSetting["INVEST_SITE_BOUNDARY"].outFields
                              ).map((attribute, i) => {
                                return (
                                  !["1"].includes(attribute) && (
                                    <th
                                      key={key+"xya" + i}
                                      style={{
                                        color: "firebrick",
                                        fontSize: "14px",
                                      }}
                                    >
                                      {
                                        layersSetting["INVEST_SITE_BOUNDARY"]
                                          .aliasOutFields[i]
                                      }
                                    </th>
                                  )
                                );
                              })}
                            </tr>
                          </thead>
                          <tbody>
                            {feature.boundries.length
                              ? feature.boundries.map((boundry, i) => (
                                  <tr key={key+"p"+i}>
                                    {Object.keys(boundry.attributes).map(
                                      (attribute, keyr) => {
                                        return (
                                          !["BOUNDARY_LENGTH"].includes(
                                            attribute
                                          ) &&
                                          layersSetting[
                                            "INVEST_SITE_BOUNDARY"
                                          ].outFields.indexOf(attribute) > -1 &&
                                          attribute != "SITE_GEOSPATIAL_ID" && (
                                            <td key={"xyzo" + keyr}>
                                              {boundry.attributes[attribute]
                                                ? !isNaN(
                                                    boundry.attributes[
                                                      attribute
                                                    ]
                                                  ) &&
                                                  attribute !=
                                                    "SITE_LONG_COORD" &&
                                                  attribute != "SITE_LAT_COORD"
                                                  ? round(
                                                      Number(
                                                        boundry.attributes[
                                                          attribute
                                                        ]
                                                      ),
                                                      2
                                                    )
                                                  : boundry.attributes[
                                                      attribute
                                                    ]
                                                : "بدون"}
                                            </td>
                                          )
                                        );
                                      }
                                    )}
                                  </tr>
                                ))
                              : [1].map(() => (
                                  <>
                                    <tr>
                                      {[1].map(() => (
                                        <td>غير متوفر</td>
                                      ))}
                                    </tr>
                                  </>
                                ))}
                          </tbody>
                        </table>
                      }
                    </div>

                    <div style={{ width: "50%" }}>
                      <h3 className="underlineStyle">الموقع حسب الطبيعة</h3>
                      {
                        <table className="table table-bordered">
                          <thead>
                            <tr>
                              {Object.keys(
                                layersSetting["INVEST_SITE_BOUNDARY"].outFields
                              ).map((attribute, i) => {
                                return (
                                  !["1"].includes(attribute) && (
                                    <th
                                      key={i}
                                      style={{
                                        color: "firebrick",
                                        fontSize: "14px",
                                      }}
                                    >
                                      {
                                        layersSetting["INVEST_SITE_BOUNDARY"]
                                          .aliasOutFields[i]
                                      }
                                    </th>
                                  )
                                );
                              })}
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>الحد الشمالي</td>
                              {/* <td>
                                  {feature.attributes.NORTH_BOUNDARY_LENGTH ||
                                    "غير متوفر"}
                                </td> */}
                              <td>
                                {feature.attributes.NORTH_BOUNDARY_DESC ||
                                  "غير متوفر"}
                              </td>
                            </tr>

                            <tr>
                              <td>الحد الشرقي</td>
                              {/* <td>
                                  {feature.attributes.EAST_BOUNDARY_LENGTH ||
                                    "غير متوفر"}
                                </td> */}
                              <td>
                                {feature.attributes.EAST_BOUNDARY_DESC ||
                                  "غير متوفر"}
                              </td>
                            </tr>

                            <tr>
                              <td>الحد الغربي</td>
                              {/* <td>
                                  {feature.attributes.WEST_BOUNDARY_LENGTH ||
                                    "غير متوفر"}
                                </td> */}
                              <td>
                                {feature.attributes.WEST_BOUNDARY_DESC ||
                                  "غير متوفر"}
                              </td>
                            </tr>
                            <tr>
                              <td>الحد الجنوبي</td>
                              {/* <td>
                                  {feature.attributes.SOUTH_BOUNDARY_LENGTH ||
                                    "غير متوفر"}
                                </td> */}
                              <td>
                                {feature.attributes.SOUTH_BOUNDARY_DESC ||
                                  "غير متوفر"}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      }
                    </div>
                  </div>
                )}
                {/************************** */}
                {/** Section5:  الكروكي وخريطة الموقع */}

                <div
                  style={{ display: "flex" }}
                  className={zoom ? "zoomcenter" : ""}
                >
                  <div className="divBorder" style={{ width: "50%" }}>
                    <label className="labelReport">المصور الفضائي</label>
                    <MapComponent
                      onMapCreate={this.onMapCreate.bind(this, feature)}
                      siteSpatial={feature.attributes.SITE_GEOSPATIAL_ID}
                      basemap="hybrid"
                      mapUrl={window.ahsaMapUrl}
                      mapId={`reportMap${key}`}
                      isStatlliteMap={true}
                      isOnlyfeature="true"
                      isReportMap="true"
                      style={{ width: "50%", height: "150px" }}
                    />
                  </div>
                  <div className="divBorder" style={{ width: "50%" }}>
                    <label className="labelReport">
                      صورة المستكشف الجغرافي
                    </label>
                    <MapComponent
                      onMapCreate={this.removeBaseMap.bind(
                        this,
                        feature,
                        selectedFeatures.length == key + 1
                      )}
                      basemap="osm"
                      mapUrl={window.ahsaReportMapUrl}
                      mapId={`reportMapNoMap${key}`}
                      isReportMap="true"
                      stopLoading={this.stopLoading.bind(this)}
                      isLastMap={selectedFeatures.length == key + 1}
                      isConditionMap="true"
                      siteSpatial={feature.attributes.SITE_GEOSPATIAL_ID}
                      style={{ width: "50%", height: "150px" }}
                    />
                  </div>
                </div>
                {/************************** */}
                {/** Section6:   وصف بيانات العقار + الصور */}

                <h3 className="underlineStyle buildingDetailsSection">
                  وصف بيانات العقار
                </h3>
                {feature.buildingDetails.length
                  ? feature.buildingDetails.map((buildDetail) => (
                      <div
                        className="buildingDetailsTable"
                        style={{
                          width: "100%",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <div
                          style={{
                            width: "100%",
                            display: "flex",
                            flexDirection: "row",
                          }}
                        >
                          <div style={{ width: "50%" }}>
                            {
                              <table className="table table-bordered">
                                <tbody>
                                  {buildDetail && buildDetail.attributes ? (
                                    <>
                                      <tr>
                                        <td>الاستخدام الحالي</td>

                                        <td>
                                          {buildDetail.attributes
                                            .BUILD_ACTUAL_USE || "غير متوفر"}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td>توصيف الموقع</td>

                                        <td>
                                          {buildDetail.attributes.BUILD_USE ||
                                            "غير متوفر"}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td>حالة الموقع</td>

                                        <td>
                                          {buildDetail.attributes
                                            .LOCATION_STATUS || "غير متوفر"}
                                        </td>
                                      </tr>

                                      <tr>
                                        <td>نوعية البناء</td>

                                        <td>
                                          {buildDetail.attributes.BUILD_TYPE ||
                                            "غير متوفر"}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td>حالة المبني</td>

                                        <td>
                                          {buildDetail.attributes
                                            .BUILDING_STATUS || "غير متوفر"}
                                        </td>
                                      </tr>
                                    </>
                                  ) : (
                                    [1].map(() => (
                                      <>
                                        <tr>
                                          {[1].map(() => (
                                            <td>غير متوفر</td>
                                          ))}
                                        </tr>
                                      </>
                                    ))
                                  )}
                                </tbody>
                              </table>
                            }
                          </div>
                          <div style={{ width: "50%" }}>
                            {
                              <table className="table table-bordered">
                                <tbody>
                                  {buildDetail && buildDetail.attributes ? (
                                    <>
                                      <tr>
                                        <td>عدد الأدوار</td>

                                        <td>
                                          {buildDetail.attributes
                                            .BUILD_FLOOR_COUNT || "غير متوفر"}
                                        </td>
                                      </tr>

                                      <tr>
                                        <td>عدد الوحدات</td>

                                        <td>
                                          {buildDetail.attributes
                                            .BUILD_UNIT_COUNT || "غير متوفر"}
                                        </td>
                                      </tr>

                                      <tr>
                                        <td>حالة العقار</td>

                                        <td>
                                          {buildDetail.attributes
                                            .FLOOR_STATUS || "غير متوفر"}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td>خدمات العقار</td>

                                        <td>
                                          {buildDetail.attributes
                                            .BUILD_SERVICES || "غير متوفر"}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td>ملاحظات التقرير</td>

                                        <td>
                                          {buildDetail.attributes
                                            .BUILD_REPORT || "غير متوفر"}
                                        </td>
                                      </tr>
                                    </>
                                  ) : (
                                    [1].map(() => (
                                      <>
                                        <tr>
                                          {[1].map(() => (
                                            <td>غير متوفر</td>
                                          ))}
                                        </tr>
                                      </>
                                    ))
                                  )}
                                </tbody>
                              </table>
                            }
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexFlow: "row",
                            justifyContent: "center",
                            flexWrap: "wrap",
                            margin: "1% 0",
                          }}
                        >
                          {buildDetail.attributes["IMAGE_URL"]
                            ? buildDetail.attributes["IMAGE_URL"]
                                .split(",")
                                .map((img) => {
                                  let imgSrc = img.split('&')[0];
                                  let imgType = img.split('&')[1];
                                  return (
                                    <div style={{display:'flex', flexDirection:'column', margin:'0 3em'}}>
                                    {imgType&&<div style={{display:'flex'}}>
                                      <label>النوع: </label>
                                      <span>{this.state.imgTypes.find(item=>item.code == imgType)?.name}</span>
                                    </div>}
                                    <div className="buildingImage-container"
                                    style={{
                                    margin: "0 10%",
                                  display:'contents'}}
                                    >
                                    <img
                                      className="buildingImage"
                                      src={window.API_FILES_URL + imgSrc}
                                      alt="building image"
                                      style={{
                                        width: "35vw",
                                        // height: "50%",
                                        // margin: "5% 5%",
                                      }}
                                    />
                                    </div>
                                    
                                    </div>
                                  );
                                })
                            : false}
                        </div>
                      </div>
                    ))
                  : ""}
                {/*********************************************** */}
              </div>
            </div>
          </div>
        ))}
        <footer className="footerahsa-print">
          <img
            src={footer}
            className="img-logo-print2"
            align="left"
            style={{ width: "100px", marginLeft: "40px" }}
          />
          {/* <div style={{ marginTop: "15px",display: 'flex',flexDirection: 'column',justifyContent: 'flex-end' }}>
              <span style={{ fontSize: "20px" }}>
                تقرير المهمة الثانية {this.startIndex}/24
              </span>
            </div> */}
        </footer>
      </div>
    ) : (
      <Loader />
    );
  }
}

// export default withRouter(PrintAhsaComponent);
const mapStateToProps =({mapUpdate})=>{
  return {
    user:mapUpdate?.auth?.user
  }
}
export default withRouter(connect(mapStateToProps)(TechReportInDetailsComponent))

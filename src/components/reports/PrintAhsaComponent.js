/* eslint-disable react/jsx-key */
import React, { Component } from "react";
import { layersSetting } from "../reportMapViewer/config/layers";
import { connect } from "react-redux";
import { find, round, sortBy, get } from "lodash";
// import { ahsaReportMapUrl, ahsaMapUrl } from "../reportMapViewer/config/map";
import QRCode from "react-qr-code";
import AhsaaLogo  from "../../assets/images/ahsalogo.png"
import  footer from "../../assets/images/footer.png"
import { withRouter } from "react-router";
import MapComponent from "../reportMapViewer/map/index";
import Loader from "../../components/loader/index";

import {
  queryTask,
  highlightFeatureForReportMap,
} from "../common/mapviewer";
import {getFeatureDomainName} from "../reportMapViewer/common/common_func";
import queryString from "query-string";
import { ahsaMapUrl, ahsaReportMapUrl } from "../reportMapViewer/config";
import { getMapInfo } from "../reportMapViewer/common/esriRequest_Func";

class PrintAhsaComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading:true,
      where: localStorage.getItem("investmentQueryCondition")
    };
    this.layerName = "INVEST_SITE_POLYGON";
    const values = queryString.parse(this.props.location.search);
    this.startIndex = values.m || 1;

    getMapInfo(window.ahsaReportMapUrl).then((data) => {
      this.layers = data.info.mapInfo.layers;
      this.getFeaturesBounderiesInfo(
        data.info.mapInfo.layers
      );
    });
  }

  getFeaturesBounderiesInfo(layers) {
    var layer = find(
      layers,
      {
        name: "INVEST_SITE_POLYGON",
      },
      true
    );

    /*ids = ids.split(',');
   let featuresCondition = ids.map((r) => {
     return "SITE_GEOSPATIAL_ID = " + r
   });

   let where = featuresCondition.join(' or ');
*/

    // let where = sessionStorage.getItem("investmentQueryCondition");
    // "SERIAL >= " + from_id + " and SERIAL <= " + to_id;
if(this.state.where)
    queryTask({
      returnGeometry:false,
      url: window.ahsaReportMapUrl + "/" + layer.id,
      where: this.state.where,
      outFields: layersSetting["INVEST_SITE_POLYGON"].outFields,
      callbackResult: (data) => {
        let selectedFeatures = data.features;
        getFeatureDomainName(
          selectedFeatures,
          layer.id,
          false,
          window.ahsaReportMapUrl
        ).then(async(res) => {
         await queryTask({
            url: window.ahsaReportMapUrl + "/" + layer.id,
            where: this.state.where,
            outFields: [
              "SITE_UTL_ELECT",
              "SITE_UTL_WATER",
              "SITE_UTL_GAS",
              "SITE_UTL_SWG",
              "SITE_GEOSPATIAL_ID",
            ],
            callbackResult: (data) => {
              data.features.forEach((f) => {
                let parentFeature = find(res, (r) => {
                  return (
                    r.attributes.SITE_GEOSPATIAL_ID ==
                    f.attributes.SITE_GEOSPATIAL_ID
                  );
                });

                parentFeature.attributes = {
                  ...parentFeature.attributes,
                  ...f.attributes,
                };
              });
              this.getBoundriesAndCorners(res).then((boundryCornerRes) => {
                this.setState({
                  selectedFeatures: boundryCornerRes
                  // , loading:false
                });
              });
            },
            returnGeometry: false,
            callbackError(error) {},
          });
        });
      },
      returnGeometry: true,
      callbackError(error) {},
    });
  }

  getBoundriesAndCorners(features) {
    let requests = features.length * 2;
    let index = 0;
    return new Promise((resolve, reject) => {
      features.forEach((feature) => {
        var layer = find(
          this.layers,
          {
            name: "INVEST_SITE_BOUNDARY",
          },
          true
        );

        queryTask({
          url: window.ahsaReportMapUrl + "/" + layer.id,
          where:
            "SITE_GEOSPATIAL_ID = " + feature.attributes.SITE_GEOSPATIAL_ID,
          outFields: layersSetting["INVEST_SITE_BOUNDARY"].outFields,
          callbackResult: (data) => {
            getFeatureDomainName(
              data.features,
              layer.id,
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

        let cornerLayer = find(this.layers, {
          name: "INVEST_SITE_CORNER",
        });

        queryTask({
          url: window.ahsaReportMapUrl + "/" + cornerLayer.id,
          where:
            "SITE_GEOSPATIAL_ID = " + feature.attributes.SITE_GEOSPATIAL_ID,
          outFields: layersSetting["INVEST_SITE_CORNER"].outFields,
          callbackResult: (data) => {
            getFeatureDomainName(
              data.features,
              cornerLayer.id,
              false,
              window.ahsaReportMapUrl
            ).then((res) => {
              feature.corners = res;
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

  componentDidMount() {
    this.setState({ zoom: true, loading:true });
    // window.document.body.style = 'overflow: auto !important;'
  }
componentWillUnmount(){
  // window.document.body.style = 'overflow: hidden !important;'
  // localStorage.removeItem("queryCondition")
}
stopLoading(){
  this.setState({loading:false})
}

  onMapCreate(feature, map) {
    console.log(map);

    highlightFeatureForReportMap(feature, map, {
      isZoom: true,
      layerName: "zoomGraphicLayer",
      zoomFactor: 100,
      callback: () => {
        window[map.id]._fixedPan(-0.2 * map.width, 0);
      },
    });
  }

  removeBaseMap(feature,isLastMap ,map) {
    console.log(map);
    highlightFeatureForReportMap(feature, map, {
      isZoom: true,
      layerName: "zoomGraphicLayer",
      zoomFactor: 50,
      isnoHightlight: true,
      callback: () => {
        var removedBaseMap
        if(map.basemapLayerIds&&map.basemapLayerIds[0])
        removedBaseMap = map.getLayer(map.basemapLayerIds[0]);
        if (removedBaseMap) {
          map.removeLayer(removedBaseMap);
        }
        window[map.id]._fixedPan(-0.2 * map.width, 0);
        if(isLastMap) {
        setTimeout(() => {
          this.setState({loading:false})
        }, 2000);
        }
      },
    });
  }

  render() {
    let { selectedFeatures = [], zoom } = this.state;
    return selectedFeatures.length > 0 && this.state.where ? (
        <div className="reportStyle2">
         {this.state.loading?(<Loader />):null}
          {selectedFeatures.map((feature, key) => (
            <div style={{ padding: "10px", margin: "1%",textAlign: 'justify' }} id={`${key}`} 
            className="one-page">
              <div >
                <div className="">
                  <div style={{ fontSize: "17px", display: "flex" }}>
                    <div>
                      <img
                        src={AhsaaLogo}
                        className="img-logo-print2"
                        style={{ width: "130px" }}
                      />
                    </div>
                    <div
                    className="investment_report_header"
                    >
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
                  <button
                    type="button"
                    style={{ width: "40%",
                    color:'white',
                        backgroundColor: '#f0ad4e',
                    borderColor: '#efa945'
                    // left: '35%',
                    // fontWeight:'bold',
                    // position: 'absolute',
                    // fontSize: 'large',
                    // marginTop: '1%'
                   }}
                    className="btn btn-warning print-button"
                    onClick={() => {
                      
                      window.print();
                    }}
                  >
                    طباعة 
                  </button>
                </div>
                <h3 className="underlineStyle">بيانات الموقع الاستثمارى</h3>

                <div key={"p" + key}>
                  <div
                    style={{
                      gridTemplateColumns: "auto auto",
                      display: "grid",
                    }}
                  >
                    {Object.keys(feature.attributes).map(
                      (attribute, index) =>{
                        console.log(attribute);
                       return layersSetting[this.layerName].outFields.indexOf(
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
                                  {this.isBoards ? (
                                    <div>
                                      {" "}
                                      {[
                                        "OBJECTID",
                                        ...layersSetting[this.layerName]
                                          .aliasOutFields,
                                      ][
                                        layersSetting[
                                          this.layerName
                                        ].outFields.indexOf(attribute)
                                      ] == "النشاط الاستثماري" &&
                                      feature.attributes.INVEST_STATUS ==
                                        "شاغرة"
                                        ? "النشاط الاستثماري المقترح"
                                        : [
                                            "OBJECTID",
                                            ...layersSetting[this.layerName]
                                              .aliasOutFields,
                                          ][
                                            layersSetting[
                                              this.layerName
                                            ].outFields.indexOf(attribute)
                                          ]}{" "}
                                    </div>
                                  ) : (
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
                                  )}

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
                                      :["<Null>",""," "].includes(feature.attributes[attribute])?
                                      "بدون": 
                                      feature.attributes[attribute]}
                                  </div>
                                </div>
                              )}
                          </div>
                        )
                                      })}
                  </div>

                  <h3 className="underlineStyle">احداثيات اركان الموقع</h3>
                  {
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          {Object.keys(
                            layersSetting["INVEST_SITE_CORNER"].outFields
                          ).map(
                            (attribute, i) =>
                              attribute != "OBJECTID" && (
                                <th
                                  key={"xyzq" + i}
                                  style={{
                                    color: "firebrick",
                                    fontSize: "14px",
                                  }}
                                >
                                  {
                                    layersSetting["INVEST_SITE_CORNER"]
                                      .aliasOutFields[i]
                                  }
                                </th>
                              )
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {feature.corners.length?
                        sortBy(
                          feature.corners,
                          (o) => o.attributes.CORNER_NO
                        ).map((corner, i) => (
                          <tr>
                            {Object.keys(corner.attributes).map(
                              (attribute, keye) =>
                                layersSetting[
                                  "INVEST_SITE_CORNER"
                                ].outFields.indexOf(attribute) > -1 &&
                                corner.attributes[attribute] &&
                                attribute != "SITE_GEOSPATIAL_ID" && (
                                  <td key={"x" + keye}>
                                    {attribute == "CORNER_NO"
                                      ? corner.attributes[attribute]
                                      : corner.attributes[attribute].toFixed(4)}
                                  </td>
                                )
                            )}
                          </tr>
                        )):
                        <tr>
                          <td>غير متوفر</td>
                        </tr>
                        }
                      </tbody>
                    </table>
                  }

                  {feature.boundries && (
                    <div style={{ display: "flex" }}>
                      <div style={{ width: "50%" }}>
                        <h3 className="underlineStyle">
                          الحدود والأبعاد من المخطط المعتمد
                        </h3>
                        {
                          <table className="table table-bordered">
                            <thead>
                              <tr>
                                {Object.keys(
                                  layersSetting["INVEST_SITE_BOUNDARY"]
                                    .outFields
                                ).map(
                                  (attribute, i) =>
                                    attribute != "OBJECTID" && (
                                      <th
                                        key={"xy" + i}
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
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {feature.boundries.length?
                              feature.boundries.map((boundry, i) => (
                                <tr>
                                  {Object.keys(boundry.attributes).map(
                                    (attribute, keyr) =>
                                      layersSetting[
                                        "INVEST_SITE_BOUNDARY"
                                      ].outFields.indexOf(attribute) > -1 &&
                                      attribute != "SITE_GEOSPATIAL_ID" && (
                                        <td key={"xyz" + keyr}>
                                          {boundry.attributes[attribute]
                                            ? !isNaN(
                                                boundry.attributes[attribute]
                                              ) &&
                                              attribute != "SITE_LONG_COORD" &&
                                              attribute != "SITE_LAT_COORD"
                                              ? round(
                                                  Number(
                                                    boundry.attributes[
                                                      attribute
                                                    ]
                                                  ),
                                                  2
                                                )
                                              : boundry.attributes[attribute]
                                            : "بدون"}
                                        </td>
                                      )
                                  )}
                                </tr>
                              )):
                              (
                                [1].map(()=>
                                <><tr>
                                   {[1].map(()=>
                                  <td>غير متوفر</td>
                                   )}
                                  </tr>
                                </>
                              ))
                              }
                            </tbody>
                          </table>
                        }
                      </div>

                      <div style={{ width: "50%" }}>
                        <h3 className="underlineStyle">
                          الحدود والأبعاد من العقد
                        </h3>
                        {
                          <table className="table table-bordered">
                            <thead>
                              <tr>
                                {Object.keys(
                                  layersSetting["INVEST_SITE_BOUNDARY"]
                                    .outFields
                                ).map(
                                  (attribute, i) =>
                                    attribute != "OBJECTID" && (
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
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>الحد الشمالي</td>
                                <td>
                                  {feature.attributes.NORTH_BOUNDARY_LENGTH ||
                                    "غير متوفر"}
                                </td>
                                <td>
                                  {feature.attributes.NORTH_BOUNDARY_DESC ||
                                    "غير متوفر"}
                                </td>
                              </tr>

                              <tr>
                                <td>الحد الشرقي</td>
                                <td>
                                  {feature.attributes.EAST_BOUNDARY_LENGTH ||
                                    "غير متوفر"}
                                </td>
                                <td>
                                  {feature.attributes.EAST_BOUNDARY_DESC ||
                                    "غير متوفر"}
                                </td>
                              </tr>

                              <tr>
                                <td>الحد الغربي</td>
                                <td>
                                  {feature.attributes.WEST_BOUNDARY_LENGTH ||
                                    "غير متوفر"}
                                </td>
                                <td>
                                  {feature.attributes.WEST_BOUNDARY_DESC ||
                                    "غير متوفر"}
                                </td>
                              </tr>
                              <tr>
                                <td>الحد الجنوبي</td>
                                <td>
                                  {feature.attributes.SOUTH_BOUNDARY_LENGTH ||
                                    "غير متوفر"}
                                </td>
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

                  <div
                    style={{ display: "flex" }}
                    className={zoom ? "zoomcenter" : ""}
                  >
                    <div className="divBorder" style={{ width: "50%" }}>
                      <label className="labelReport">المصور الفضائي</label>
                      <MapComponent
                        onMapCreate={this.onMapCreate.bind(this, feature)}
                        siteSpatial={feature.attributes.SITE_GEOSPATIAL_ID}
                        mapUrl={window.ahsaMapUrl}
                        mapId={`reportMap${key}`}
                        isStatlliteMap={true}
                        isOnlyfeature="true"
                        isReportMap="true"
                        style={{ width: "50%", height: "150px" }}
                      />
                    </div>
                    <div className="divBorder" style={{ width: "50%" }}>
                      <label className="labelReport">كروكي الموقع</label>
                      <MapComponent
                        onMapCreate={this.removeBaseMap.bind(this, feature,selectedFeatures.length==(key+1))}
                        mapUrl={window.ahsaReportMapUrl}
                        mapId={`reportMapNoMap${key}`}
                        isReportMap="true"
                        stopLoading={this.stopLoading.bind(this)}
                        isLastMap={selectedFeatures.length==(key+1)}
                        isConditionMap="true"
                        siteSpatial={feature.attributes.SITE_GEOSPATIAL_ID}
                        style={{ width: "50%", height: "150px" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <footer className="footerahsa-print" >
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
    ) :!this.state.where?
    <h1 style={{textAlign:'center'}}>حدث خطأ برجاء المحاولة مرة أخرى</h1>
    : (
      <Loader />
    );
  }
}

export default withRouter(PrintAhsaComponent);

//export default connect(mapStateToProps, mapDispatchToProps)(PrintComponent))

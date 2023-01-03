/* eslint-disable react/jsx-key */
import React, { Component } from "react";
import {
  layersSetting,
  feasibilityStudyData,
} from "../../reportMapViewer/config/layers";
import { find, uniq } from "lodash";
import QRCode from "react-qr-code";
import AhsaaLogo from "../../../assets/images/ahsalogo.png";
import MinistiryLogo from "../../../assets/images/ministryLogo.png";
import VisionLogo from "../../../assets/images/vision2030.png";
import KSALogo from "../../../assets/images/KSALogo.png";
import footer from "../../../assets/images/footer.png";
import { withRouter } from "react-router";
import MapComponent from "../../reportMapViewer/map/index";
import Loader from "../../../components/loader/index";
import markerIcon from "../../../assets/images/marker_pin_icon.svg";

import {
  queryTask,
  highlightFeatureForReportMap,
  zoomToLayer,
  LoadModules,
  getLegend,
} from "../../common/mapviewer";
import { getFeatureDomainName } from "../../reportMapViewer/common/common_func";
import queryString from "query-string";
// import { ahsaMapUrl, ahsaReportMapUrl } from "../../reportMapViewer/config";
import { getMapInfo } from "../../reportMapViewer/common/esriRequest_Func";

class FeasibilityStudyComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      parcelLegends: [],
    };
    this.layerName = "INVEST_SITE_POLYGON";
    this.startIndex = 1;
   
  }
  getFeaturesInfo(mapInfo) {
    var investPolyLayer = find(
      mapInfo.layers,
      {
        name: "INVEST_SITE_POLYGON",
      },
      true
    );

    let where = localStorage.getItem("feasibilityStudyQueryCondition");
    if (where)
      queryTask({
        returnGeometry: false,
        url: window.__mapUrl__ + "/" + investPolyLayer.id,
        where: where,
        outFields: layersSetting["INVEST_SITE_POLYGON"].outFields,
        callbackResult: async(data) => {
          let selectedFeatures = data.features;
          console.log(selectedFeatures);
          getFeatureDomainName(
            selectedFeatures,
            investPolyLayer.id,
            false,
            window.__mapUrl__
          ).then(async (res) => {
            let contractInfo = await this.getContractInfo(res, mapInfo);
            let buildingInfo = await this.getBuildingDetailsInfo(contractInfo, mapInfo);
            let result  = await this.getInvestStudyInfo(buildingInfo, mapInfo);
              console.log({ result });
              let data = result;
              this.setState({
                selectedFeatures: data.map((item) => {
                  return {
                    contractData: item.contractDetails,
                    buildingDetailsData: item.buildingDetails,
                    investStudyData: item.investStudyData,
                    investPolygonData: item,
                  };
                }),
                loading: false,
              });
          
          });
        },
        returnGeometry: true,
        callbackError(error) {},
      });
  }
  getContractInfo(features, mapInfo) {
    return new Promise((resolve, reject) => {
      features.forEach((feature) => {
        let contractLayer = find(mapInfo.tables, {
          name: "TBL_CONTRACTS",
        });

        queryTask({
          url: window.__mapUrl__ + "/" + contractLayer.id,
          where:
            "SITE_GEOSPATIAL_ID = " + feature.attributes.SITE_GEOSPATIAL_ID,
          outFields: ["*"],
          callbackResult: (data) => {
            if (data.features.length)
              getFeatureDomainName(
                data.features,
                contractLayer.id,
                false,
                window.__mapUrl__
              ).then((res) => {
                feature.contractDetails = res;
                resolve(features);
              });
            else {
              feature.contractDetails = null;
              resolve(features);
            }
          },
          returnGeometry: false,
          callbackError(error) {},
        });
      });
    });
  }

  getInvestStudyInfo(features, mapInfo) {
    return new Promise((resolve, reject) => {
      let count = 0;
      features.forEach((feature) => {
        let contractLayer = find(mapInfo.tables, {
          name: "TBL_INVEST_STUDY",
        });

        queryTask({
          url: window.__mapUrl__ + "/" + contractLayer.id,
          where:
            "SITE_GEOSPATIAL_ID = " + feature.attributes.SITE_GEOSPATIAL_ID,
          outFields: ["*"],
          callbackResult: (data) => {
            if (data.features.length){
              getFeatureDomainName(
                data.features,
                contractLayer.id,
                false,
                window.__mapUrl__
              ).then((res) => {
                feature.investStudyData = res;
                count++;
                if(count===features.length) resolve(features);
              });
            }
            else {
              feature.investStudyData = null;
              count++;
              if(count===features.length) resolve(features);
            }
          },
          returnGeometry: false,
          callbackError(error) {},
        });
      });
    });
  }

  getBuildingDetailsInfo(features, mapInfo) {
    return new Promise((resolve, reject) => {
      features.forEach((feature) => {
        let buildingDetailsTbl = find(mapInfo.tables, {
          name: "TBL_BUILD_DETAILS",
        });

        queryTask({
          url: window.__mapUrl__ + "/" + buildingDetailsTbl.id,
          where:
            "SITE_GEOSPATIAL_ID = " + feature.attributes.SITE_GEOSPATIAL_ID,
          outFields: layersSetting["TBL_BUILD_DETAILS"].outFields,
          callbackResult: (data) => {
            if (data.features.length)
              getFeatureDomainName(
                [data.features[0]],
                buildingDetailsTbl.id,
                false,
                window.__mapUrl__
              ).then((res) => {
                feature.buildingDetails = res;
                resolve(features);
              });
            else {
              feature.buildingDetails = null;
              resolve(features);
            }
          },
          returnGeometry: false,
          callbackError(error) {},
        });
      });
    });
  }

  componentDidMount() {
    this.setState({ zoom: true, loading: true });
    getMapInfo(window.__mapUrl__).then((data) => {
      this.layerInfo = data.info.$layers;
      console.log({ data });
      this.layers = data.info.mapInfo.layers;
      this.getFeaturesInfo(data.info.mapInfo);
    });
  }

  stopLoading() {
    this.setState({ loading: false });
  }

  onMapCreate(feature, isAdminBordersMap, map) {
    console.log(map);
    this.setState({loading:true})
    var municipiltyLayer = find(
      this.layers,
      {
        name: "MUNICIPALITY_BOUNDARY",
      },
      true
    );
    if (isAdminBordersMap) {
      LoadModules([
        "esri/graphic",
        "esri/symbols/SimpleLineSymbol",
        "esri/Color",
        "esri/symbols/PictureMarkerSymbol",
        "esri/graphicsUtils",
        "esri/geometry/Extent",
        "esri/geometry/Polyline",
        "esri/symbols/SimpleMarkerSymbol",
      ]).then(
        ([
          Graphic,
          SimpleLineSymbol,
          Color,
          PictureMarkerSymbol,
          graphicsUtils,
          Extent,
          Polyline,
          SimpleMarkerSymbol,
        ]) => {
          let promises = [];
          //get Municipility geom
          promises.push(
            new Promise((resolve, reject) => {
              queryTask({
                url: window.__mapUrl__ + "/" + municipiltyLayer.id,
                where: "MUNICIPALITY_NAME = 2",
                outFields: [""],
                returnGeometry: true,
                callbackResult: (data) => {
                  console.log({ munucipilityData: data });
                  if (data.features.length) {
                    resolve({
                      munic_geom: data.features,
                      munic_centroid: data.features[0].geometry.getCentroid(),
                    });
                  } else {
                    resolve([]);
                  }
                },
                callbackError(error) {
                  console.log(error, "something wrong during queryTask");
                },
              });
            })
          );
          //get centroid of site
          promises.push(
            new Promise((resolve, reject) => {
              let siteGeom = feature.geometry;
              console.log({ centroid: siteGeom.getCentroid() });
              resolve(siteGeom.getCentroid());
            })
          );
          Promise.all(promises).then((res) => {
            let centroid_munic_geom = res[0].munic_centroid;
            let munic_geom = res[0].munic_geom;
            let site_centroid = res[1];
            let adminLayer = map.getLayer("adminstrationBordersGraphicLayer");
            let pointSymbol = new PictureMarkerSymbol({
              url: markerIcon,
              height: 20,
              xoffset: 0,
              yoffset: 0,
              width: 20,
              type: "esriPMS",
            });
            // let polygonSymbol = new SimpleFillSymbol(
            //   SimpleFillSymbol.STYLE_SOLID,
            //   new SimpleLineSymbol(
            //     SimpleFillSymbol.STYLE_SOLID,
            //     new Color("black"),
            //     1
            //   ),
            //   new Color([255, 0, 0, 0.5])
            // );
            let lineBetSiteToMunicipility = new Polyline({
              paths: [
                [
                  [centroid_munic_geom.x, centroid_munic_geom.y],
                  [site_centroid.x, site_centroid.y],
                ],
              ],
              type: "polyline",
              spatialReference: site_centroid.spatialReference,
            });

            adminLayer.add(
              new Graphic(
                lineBetSiteToMunicipility,
                new SimpleLineSymbol(
                  SimpleLineSymbol.STYLE_DASH,
                  new Color([255, 0, 0]),
                  3
                )
              )
            );
            adminLayer.add(
              new Graphic(
                centroid_munic_geom,
                new SimpleMarkerSymbol(
                  SimpleMarkerSymbol.STYLE_SQUARE,
                  10,
                  new SimpleLineSymbol(
                    SimpleLineSymbol.STYLE_SOLID,
                    new Color([255, 0, 0]),
                    1
                  ),
                  new Color([255, 0, 0, 0.25])
                )
              )
            );
            adminLayer.add(new Graphic(munic_geom[0].geometry));
            adminLayer.add(new Graphic(site_centroid, pointSymbol));
            let layerExtent = graphicsUtils.graphicsExtent(adminLayer.graphics);
            let extent = new Extent(
              layerExtent.xmin - 5,
              layerExtent.ymin - 5,
              layerExtent.xmax + 5,
              layerExtent.ymax + 5,
              map.spatialReference
            );

            map.setExtent(extent.expand(2));
            // zoomToLayer("adminstrationBordersGraphicLayer",map,3)
          });
        }
      );
    } else
      highlightFeatureForReportMap(feature, map, {
        isZoom: true,
        layerName: "zoomGraphicLayer",
        zoomFactor: 100,
        callback: () => {
          window[map.id]._fixedPan(-0.2 * map.width, 0);
          console.log({ extent: window[map.id].extent }, map.id);
          if (map.id.includes("surroundActiv")) {
            this.getParcelsLegend(
              window.__FEASIBILITY_STUDY_MAPSERVICE__,
              map.id
            );
          }
          this.stopLoading()
        },
      });
  }

  getParcelsLegend(url, mapId) {
    getMapInfo(url).then((data) => {
      let layers = data.info.mapInfo.layers;
      let grExt =
        window[mapId].getLayer("zoomGraphicLayer").graphics[0]._extent;
      grExt.xmin -= 150;
      grExt.ymin -= 150;
      grExt.ymax += 150;
      grExt.xmax += 150;
      let parcelsLayer = find(
        layers,
        {
          name: "PARCELS",
        },
        true
      );
      LoadModules(["esri/tasks/query"]).then(([Query]) => {
        queryTask({
          url: window.__FEASIBILITY_STUDY_MAPSERVICE__ + "/" + parcelsLayer.id,
          // where: "MUNICIPALITY_NAME = 2",
          spatialRelationship: Query.SPATIAL_REL_INTERSECTS,
          geometry: grExt,
          outFields: ["PLANLANDUSECODE"],
          returnGeometry: false,
          returnDistinctValues: true,
          callbackResult: (data) => {
            console.log({ data });
            let parcelsLanUseCodes = uniq(
              data.features.map((f) => f.attributes.PLANLANDUSECODE)
            ).filter((f) => f);
            console.log(parcelsLanUseCodes);
            fetch(url + "/legend?f=pjson")
              .then((res) => res.json())
              .then((res) => {
                let parcelsLegend = res.layers.find(
                  (l) => l.layerId === parcelsLayer.id
                ).legend;
                console.log(parcelsLegend);
                let filterLegends = parcelsLegend.filter((leg) =>
                  parcelsLanUseCodes.includes(parseInt(leg.values[0]))
                );
                this.setState({ parcelLegends: filterLegends });
              });

            // console.log({ munucipilityData: data });
            // if (data.features.length) resolve(data.features);
            // else {
            // resolve([]);
            // }
          },
          callbackError(error) {
            console.log(error, "something wrong during queryTask");
          },
        });
      });
    });
  }

  removeBaseMap(feature, isLastMap, map) {
    console.log(map);
    this.setState({loading:true})
    highlightFeatureForReportMap(feature, map, {
      isZoom: true,
      layerName: "zoomGraphicLayer",
      zoomFactor: 50,
      isnoHightlight: true,
      callback: () => {
        var removedBaseMap;
        if (map.basemapLayerIds && map.basemapLayerIds[0])
          removedBaseMap = map.getLayer(map.basemapLayerIds[0]);
        if (removedBaseMap) {
          map.removeLayer(removedBaseMap);
        }
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
    return selectedFeatures.length ? (
      <div className="reportStyle2">
        {this.state.loading ? <Loader /> : null}
        {selectedFeatures.map((feature, key) => (
          <>
            <div
              style={{ padding: "10px", margin: "", textAlign: "justify" }}
              id={`${key}`}
              className="one-page-feasibility-report"
            >
              {/********Header Report*********** */}
              <div className="header-border">
                <div className="feasibility-header">
                  <div className="ministry-logo">
                    <img src={KSALogo} alt="ksa logo" width={90} height={90} />
                    <img
                      src={MinistiryLogo}
                      alt="Ministry logo"
                      width={140}
                      height={60}
                    />
                  </div>
                  <div>
                    <img
                      src={AhsaaLogo}
                      alt="Ahsaa Logo"
                      width={120}
                      height={120}
                    />
                  </div>

                  <div style={{ display: "flex" }}>
                    <div className="qr-code-container">
                      <QRCode
                        size={110}
                        value={
                          "http://maps.google.com/maps?q=" +
                          feature.investPolygonData.attributes[
                            "SITE_LAT_COORD"
                          ] +
                          "," +
                          feature.investPolygonData.attributes[
                            "SITE_LONG_COORD"
                          ]
                        }
                      />
                    </div>
                    <img src={VisionLogo} alt="vision 2030" width={150} />
                  </div>
                </div>
                <button
                  type="button"
                  style={{
                    width: "40%",
                    color: "white",
                    backgroundColor: "#f0ad4e",
                    borderColor: "#efa945",
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

              {/********End of Header Report*********** */}

              {/********Report Body*********** */}

              <div className="feasibility-study-container">
                <div className="right-side-report col-8">
                  <div>
                    <table style={{ width: "100%" }}>
                      <thead>
                        <th>
                          <h3 className="head-table-feasibility">
                            بيانات الموقع من المستكشف الجغرافي{" "}
                          </h3>
                        </th>
                      </thead>
                      <tbody>
                        {feasibilityStudyData.INVEST_SITE_POLYGON.shownDataInReport.map(
                          (item, index) => (
                            <tr
                              key={index}
                              className="tbl-feasibility-report-row"
                            >
                              <div className="row-right-side">
                                <td className="label-right">{item.label1}</td>
                                <td className="value">
                                  {feature.investPolygonData.attributes[
                                    item.fieldName1
                                  ]
                                    ? item.fieldName1 == "SITE_AREA"
                                      ? parseFloat(
                                          feature.investPolygonData.attributes[
                                            item.fieldName1
                                          ]
                                        ).toFixed(2)
                                      : feature.investPolygonData.attributes[
                                          item.fieldName1
                                        ]
                                    : "لا يوجد"}
                                </td>
                              </div>
                              <div className="row-left-side">
                                <td className="label-left">{item.label2}</td>
                                <td className="value">
                                  {item.fieldName2 == "Coordinates" &&
                                  feature.investPolygonData.attributes[
                                    "SITE_LAT_COORD"
                                  ] &&
                                  feature.investPolygonData.attributes[
                                    "SITE_LONG_COORD"
                                  ] ? (
                                    `${feature.investPolygonData.attributes["SITE_LAT_COORD"]} E, 
                          ${feature.investPolygonData.attributes["SITE_LONG_COORD"]} N`
                                  ) : item.fieldName2 == "googleMapsSite" &&
                                    feature.investPolygonData.attributes[
                                      "SITE_LAT_COORD"
                                    ] &&
                                    feature.investPolygonData.attributes[
                                      "SITE_LONG_COORD"
                                    ] ? (
                                    <a
                                      href={
                                        "http://maps.google.com/maps?q=" +
                                        feature.investPolygonData.attributes[
                                          "SITE_LAT_COORD"
                                        ] +
                                        "," +
                                        feature.investPolygonData.attributes[
                                          "SITE_LONG_COORD"
                                        ]
                                      }
                                    >
                                      الموقع على جوجل
                                    </a>
                                  ) : feature.investPolygonData.attributes[
                                      item.fieldName2
                                    ] ? (
                                    feature.investPolygonData.attributes[
                                      item.fieldName2
                                    ]
                                  ) : (
                                    "لا يوجد"
                                  )}
                                </td>
                              </div>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>

                    <table style={{ width: "100%" }}>
                      <thead>
                        <th>
                          <h3 className="head-table-feasibility">
                            بيانات الموقع من العقد{" "}
                          </h3>
                        </th>
                      </thead>
                      <tbody>
                        {feasibilityStudyData.TBL_CONTRACTS.shownDataInReport.map(
                          (item, index) => (
                            <tr
                              key={index}
                              className="tbl-feasibility-report-row"
                            >
                              <div className="row-right-side">
                                <td className="label-right">{item.label1}</td>
                                <td className="value">
                                  {item.fieldName1 === "FILE_NUMBER"
                                    ? feature.investPolygonData.attributes[
                                        item.fieldName1
                                      ]
                                      ? feature.investPolygonData.attributes[
                                          item.fieldName1
                                        ]
                                      : "لا يوجد"
                                    : feature.contractData &&
                                      feature.contractData[0].attributes[
                                        item.fieldName1
                                      ]
                                    ? feature.contractData[0].attributes[
                                        item.fieldName1
                                      ]
                                    : "لا يوجد"}
                                </td>
                              </div>
                              <div className="row-left-side">
                                <td className="label-left">{item.label2}</td>
                                <td className="value">
                                  {feature.contractData &&
                                  feature.contractData[0].attributes[
                                    item.fieldName2
                                  ]
                                    ? feature.contractData[0].attributes[
                                        item.fieldName2
                                      ]
                                    : "لا يوجد"}
                                </td>
                              </div>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>

                    <table style={{ width: "100%" }}>
                      <thead>
                        <th>
                          <h3 className="head-table-feasibility">
                            التقرير الفني{" "}
                          </h3>
                        </th>
                      </thead>
                      <tbody>
                        {feasibilityStudyData.TBL_BUILD_DETAILS.shownDataInReport.map(
                          (item, index) => (
                            <tr
                              key={index}
                              className="tbl-feasibility-report-row"
                            >
                              <div className="row-right-side">
                                <td className="label-right">{item.label1}</td>
                                <td className="value">
                                  {feature.buildingDetailsData &&
                                  feature.buildingDetailsData[0].attributes[
                                    item.fieldName1
                                  ]
                                    ? feature.buildingDetailsData[0].attributes[
                                        item.fieldName1
                                      ]
                                    : "لا يوجد"}
                                </td>
                              </div>
                              <div className="row-left-side">
                                <td className="label-left">{item.label2}</td>
                                <td className="value">
                                  {feature.buildingDetailsData &&
                                  feature.buildingDetailsData[0].attributes[
                                    item.fieldName2
                                  ]
                                    ? feature.buildingDetailsData[0].attributes[
                                        item.fieldName2
                                      ]
                                    : "لا يوجد"}
                                </td>
                              </div>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                    {/**** Site Sevices ***** */}
                    <div style={{ width: "100%" }}>
                      <h3 className="head-table-feasibility">خدمات الموقع </h3>
                      <div className="section-content">
                        <ul style={{
                            display: "flex",
                            flexDirection: "column",
                            textAlign: "justify",
                            fontSize: "25px",
                            marginRight: "15px",
                        }}>
                          <li>
                            (
                            {feature.buildingDetailsData &&
                            feature.buildingDetailsData[0].attributes[
                              "BUILD_SERVICES"
                            ]
                              ? feature.buildingDetailsData[0].attributes[
                                  "BUILD_SERVICES"
                                ]
                              : "لا يوجد"}
                            )
                          </li>
                        </ul>
                      </div>
                    </div>
                    {/**** End Site Sevices ***** */}
                    {/**** Site Evaluation ***** */}
                    <div style={{ width: "100%" }}>
                      <h3 className="head-table-feasibility">تقييم الموقع </h3>
                      <div className="section-content">
                        <ul
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            textAlign: "justify",
                            fontSize: "25px",
                            marginRight: "15px",
                          }}
                        >
                          {feature.investStudyData &&
                          feature.investStudyData[0].attributes[
                            "SURROND_ACTIVITIES"
                          ] ? (
                            feature.investStudyData[0].attributes[
                              "SURROND_ACTIVITIES"
                            ]
                              .split(",")
                              .filter(i=>i)
                              .map((item, index) => <li key={index}>{item}</li>)
                          ) : (
                            <li>لا يوجد</li>
                          )}
                        </ul>
                      </div>
                    </div>
                    {/**** End Site Evaluation ***** */}
                  </div>
                </div>
                <div
                  className="left-side-report col-4"
                  style={{
                    flexDirection: "column",
                    display: "flex",
                    marginBottom: "10px",
                  }}
                >
                  <div className="admin-borders-map">
                    <h3 className="head-table-feasibility">الحدود الإدارية </h3>
                    <div>
                      <MapComponent
                        onMapCreate={this.onMapCreate.bind(
                          this,
                          feature.investPolygonData,
                          true
                        )}
                        siteSpatial={
                          feature.investPolygonData.attributes
                            .SITE_GEOSPATIAL_ID
                        }
                        basemap="hybrid"
                        mapUrl={window.__FEASIBILITY_STUDY_MAPSERVICE__}
                        mapId={`administrationBorders${key}`}
                        // isStatlliteMap={true}
                        // isOnlyfeature="true"
                        isAdminBordersMap="true"
                        style={{ width: "100%", height: "90%" }}
                      />
                    </div>
                  </div>
                  <div className="satellite-map">
                    <h3 className="head-table-feasibility">المصور الفضائي </h3>
                    <div>
                      <MapComponent
                        onMapCreate={this.onMapCreate.bind(
                          this,
                          feature.investPolygonData,
                          false
                        )}
                        siteSpatial={
                          feature.investPolygonData.attributes
                            .SITE_GEOSPATIAL_ID
                        }
                        basemap="hybrid"
                        mapUrl={window.ahsaMapUrl}
                        mapId={`reportMap${key}`}
                        isStatlliteMap={true}
                        isOnlyfeature="true"
                        isReportMap="true"
                        isFeasibilityReport={true}
                        style={{ width: "100%", height: "90%" }}
                      />
                    </div>
                  </div>
                  <div className="site-map">
                    <h3 className="head-table-feasibility">كروكي الموقع </h3>
                    <div>
                      <MapComponent
                        onMapCreate={this.removeBaseMap.bind(
                          this,
                          feature.investPolygonData,
                          true
                        )}
                        isFeasibilityReport={true}
                        mapUrl={window.ahsaReportMapUrl}
                        mapId={`reportMapNoMap${key}`}
                        isReportMap="true"
                        stopLoading={this.stopLoading.bind(this)}
                        isLastMap={true}
                        isConditionMap="true"
                        siteSpatial={
                          feature.investPolygonData.attributes
                            .SITE_GEOSPATIAL_ID
                        }
                        style={{ width: "100%", height: "90%" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="footer-spacePie">&nbsp;</div>

              <div className="feasibility-study-container2 separatediv">
                {/********Header Report*********** */}
                <div className="repeated-header ">
                  <div className="feasibility-header">
                    <div className="ministry-logo">
                      <img
                        src={KSALogo}
                        alt="ksa logo"
                        width={90}
                        height={90}
                      />
                      <img
                        src={MinistiryLogo}
                        alt="Ministry logo"
                        width={140}
                        height={60}
                      />
                    </div>
                    <div>
                      <img
                        src={AhsaaLogo}
                        alt="Ahsaa Logo"
                        width={120}
                        height={120}
                      />
                    </div>

                    <div style={{ display: "flex" }}>
                      <div className="qr-code-container">
                        <QRCode
                          size={110}
                          value={
                            "http://maps.google.com/maps?q=" +
                            feature.investPolygonData.attributes[
                              "SITE_LAT_COORD"
                            ] +
                            "," +
                            feature.investPolygonData.attributes[
                              "SITE_LONG_COORD"
                            ]
                          }
                        />
                      </div>
                      <img src={VisionLogo} alt="vision 2030" width={150} />
                    </div>
                  </div>
                </div>
                {/********End of Header Report*********** */}
                <div style={{ display: "flex" }}>
                  <div className="right-side-report col-8">
                    <div>
                      {/**** Site Sevices ***** */}
                      <div style={{ width: "100%" }}>
                        <h3 className="head-table-feasibility">
                          التوصيات العامة{" "}
                        </h3>
                        <div className="section-content">
                          <ul
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              textAlign: "justify",
                              fontSize: "25px",
                              marginRight: "15px",
                            }}
                          >
                            {feature.investStudyData &&
                            feature.investStudyData[0].attributes[
                              "GENERAL_RECOMMANDITION"
                            ] ? (
                              feature.investStudyData[0].attributes[
                                "GENERAL_RECOMMANDITION"
                              ]
                                .split(",")
                                .map((item, index) => (
                                  <li key={index}>{item}</li>
                                ))
                            ) : (
                              <li>لا يوجد</li>
                            )}
                          </ul>
                        </div>
                      </div>
                      {/**** End Site Sevices ***** */}
                      {/**** Planning Study ***** */}
                      <div
                        style={{
                          width: "100%",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <div>
                          <h3 className="head-table-feasibility">
                            الدراسة التخطيطية{" "}
                          </h3>
                          <div className="section-content">
                            <ul
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                textAlign: "justify",
                                fontSize: "25px",
                                marginRight: "15px",
                              }}
                            >
                              {feature.investStudyData &&
                              feature.investStudyData[0].attributes[
                                "PLANNING_STUDY"
                              ] ? (
                                feature.investStudyData[0].attributes[
                                  "PLANNING_STUDY"
                                ]
                                  .split(",")
                                  .map((item, index) => (
                                    <li key={index}>{item}</li>
                                  ))
                              ) : (
                                <li>لا يوجد</li>
                              )}
                            </ul>
                          </div>
                        </div>
                        <div className="study-notes">
                          <label>الملاحظات</label>
                          <p>
                            {feature.investStudyData &&
                            feature.investStudyData[0].attributes[
                              "PLANNING_STUDY_NOTES"
                            ]
                              ? feature.investStudyData[0].attributes[
                                  "PLANNING_STUDY_NOTES"
                                ]
                              : "لا يوجد"}
                          </p>
                        </div>
                      </div>
                      {/**** End Planning Study ***** */}
                    </div>
                  </div>

                  <div
                    className="left-side-report col-4"
                    style={{
                      flexDirection: "column",
                      display: "flex",
                      marginBottom: "10px",
                    }}
                  >
                    <div className="satellite-map">
                      <h3 className="head-table-feasibility">
                        الأنشطة المحيطة{" "}
                      </h3>
                      <div>
                        <MapComponent
                          onMapCreate={this.onMapCreate.bind(
                            this,
                            feature.investPolygonData,
                            false
                          )}
                          siteSpatial={
                            feature.investPolygonData.attributes
                              .SITE_GEOSPATIAL_ID
                          }
                          isFeasibilityReport={true}
                          basemap="hybrid"
                          mapUrl={window.__FEASIBILITY_STUDY_MAPSERVICE__}
                          mapId={`surroundActiv${key}`}
                          // isStatlliteMap={true}
                          // isOnlyfeature="true"
                          isParcels="true"
                          isReportMap="true"
                          style={{ width: "100%", height: "90%" }}
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          flexWrap: "wrap",
                        }}
                      >
                        {this.state.parcelLegends.map((pLegend) => (
                          <div className="legend-container">
                            <img
                              className="m-2 legend-img"
                              style={{ width: "3em", height: "1.5em" }}
                              src={
                                "data:image/jpeg;base64," + pLegend.imageData
                              }
                              alt={pLegend.label}
                            />
                            <label className="m-2 legend-text">{pLegend.label}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {/**** Economic Study ***** */}
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    padding: "0 15px",
                  }}
                >
                  <div>
                    <h3 className="head-table-feasibility">
                      الدراسة الاقتصادية{" "}
                    </h3>
                    <ul
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        textAlign: "justify",
                        fontSize: "25px",
                        // marginRight: "15px",   
                        width:'100%',
                        border:'groove'

                      }}
                    >
                      {feature.investStudyData &&
                      feature.investStudyData[0].attributes[
                        "ECONOMIC_STUDY"
                      ] ? (
                        feature.investStudyData[0].attributes["ECONOMIC_STUDY"]
                          .split(",")
                          .map((item, index) => <li key={index}>{item}</li>)
                      ) : (
                        <li>لا يوجد</li>
                      )}
                    </ul>
                  </div>
                  <div className="study-notes">
                    <label>الملاحظات</label>
                    <p>
                      {feature.investStudyData &&
                      feature.investStudyData[0].attributes[
                        "ECONOMIC_STUDY_NOTES"
                      ]
                        ? feature.investStudyData[0].attributes[
                            "ECONOMIC_STUDY_NOTES"
                          ]
                        : "لا يوجد"}
                    </p>
                  </div>
                </div>
                {/**** End Economic Study ***** */}
              </div>
              <div className="footer-spacePie">&nbsp;</div>

              {/********End Report Body*********** */}
            </div>
          </>
        ))}

        {/********Footer Report*********** */}

        <footer
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around",
          }}
        >
          <div className="footerahsa-print">
            <img
              src={footer}
              className="img-logo-print2"
              align="left"
              style={{ width: "100px", marginLeft: "40px" }}
            />
            <h4
              style={{
                color: "#922226",
                display: "none", //make it in print-media flex
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              الإحساء وجهتك الاستثمارية
            </h4>
            <div
              style={{
                margin: "25px",
                display: "none", //make it in print-media flex
                flexDirection: "column",
                justifyContent: "flex-end",
              }}
            >
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#922226",
                }}
              >
                ص {this.startIndex}من {selectedFeatures.length}
              </span>
            </div>
          </div>
        </footer>
        {/********End Footer Report*********** */}
      </div>
    ) : (
      <Loader />
    );
  }
}

export default withRouter(FeasibilityStudyComponent);

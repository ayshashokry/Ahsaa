import React, { Component } from "react";
import { connect } from "react-redux";
import axios from "axios";
import Layers from "./layers";
import {
  createMap,
  drawGraphicToOfferdForInvestement,
  makeFlashOnAssetsWithSameAuctionNo,
} from "./actions";
import {
  getLegend,
  getMapInfo,
  getFeatureServiceInfo,
  LoadModules,
  getFeatureDomainName,
  getLayerIndex,
  queryTask,
  highlightFeature,
} from "../../components/common/mapviewer";
// import { generateToken } from "@esri/arcgis-rest-auth";
// import { request } from "@esri/arcgis-rest-request";
import { withRouter } from "react-router";
import { notificationMessage } from "../../helpers/utlis/notifications_Func";
import { isResultEmpty } from "../../helpers/utlis/utilzFunc";
import AtmIcon from "../../assets/images/atm-icon-for-form.svg";
import GoogleIcon from "../../assets/images/google-maps.svg";
import EmojiTransportationIcon from "@material-ui/icons/EmojiTransportation";
import PhotoLibraryIcon from "@material-ui/icons/PhotoLibrary";
import { AiOutlineFile } from "react-icons/ai";
import BorderAllIcon from "@material-ui/icons/BorderAll";

class MapComponent extends Component {
  shouldComponentUpdate() {
    return false;
  }
  constructor(props) {
    super(props);
    this.state = {
      flagForTechReport: [],
    };
  }
  componentDidMount() {
    try {
      if (this.props.isAuth)
        getFeatureServiceInfo(this.props.user.esriToken)
          .then((data) => {
            let { layers, tables } = data;
            window.__featureServiceLayers__ = layers;
            window.__featureServiceTables__ = tables;
          })
          .catch((err) => {
            /**
             * todo: put here redirect to serverErrPage
             */
            notificationMessage("حدث خطأ", 5);
            this.props.history.push("/serverErr");
            //
            console.error("Error in getFeatureServiceInfo");
            // throw new Error("Error in getFeatureServiceInfo");
          });
      getMapInfo()
        .then((data) => {
          LoadModules([
            "esri/SpatialReference",
            "esri/geometry/Extent",
            "esri/tasks/query",
            "esri/geometry/Polygon",
            "esri/geometry/Point",
            "esri/graphic",
            "esri/symbols/PictureMarkerSymbol",
            "esri/dijit/Scalebar",
            "esri/toolbars/draw",
            "esri/dijit/BasemapGallery",
            "esri/dijit/Basemap",
            "esri/dijit/BasemapLayer",
          ]).then(
            ([
              SpatialReference,
              Extent,
              Query,
              Polygon,
              Point,
              Graphic,
              PictureMarkerSymbol,
              Scalebar,
              Draw,
              BasemapGallery,
              Basemap,
              BasemapLayer,
            ]) => {
              var { fullExtent, layers, tables } = data;

              const fullExtentObject = new Extent(
                fullExtent.xmin,
                fullExtent.ymin,
                fullExtent.xmax,
                fullExtent.ymax,
                new SpatialReference({ wkid: fullExtent.spatialReference.wkid })
              );

              window.__fullExtent__ = fullExtentObject;
              var mapSetting = {};
              mapSetting.basemap = window.__basemapName__;
              mapSetting.logo = false;
              mapSetting.slider = false;
              mapSetting.extent = fullExtentObject;
              mapSetting.minZoom = 6;
              mapSetting.isDoubleClickZoom = false;
              mapSetting.lods = [
                {
                  level: 0,
                  resolution: 156543.033928,
                  scale: 591657527.591555,
                },
                {
                  level: 1,
                  resolution: 78271.5169639999,
                  scale: 295828763.795777,
                },
                {
                  level: 2,
                  resolution: 39135.7584820001,
                  scale: 147914381.897889,
                },
                {
                  level: 3,
                  resolution: 19567.8792409999,
                  scale: 73957190.948944,
                },
                {
                  level: 4,
                  resolution: 9783.93962049996,
                  scale: 36978595.474472,
                },
                {
                  level: 5,
                  resolution: 4891.96981024998,
                  scale: 18489297.737236,
                },
                {
                  level: 6,
                  resolution: 2445.98490512499,
                  scale: 9244648.868618,
                },
                {
                  level: 7,
                  resolution: 1222.99245256249,
                  scale: 4622324.434309,
                },
                {
                  level: 8,
                  resolution: 611.49622628138,
                  scale: 2311162.217155,
                },
                {
                  level: 9,
                  resolution: 305.748113140558,
                  scale: 1155581.108577,
                },
                {
                  level: 10,
                  resolution: 152.874056570411,
                  scale: 577790.554289,
                },
                {
                  level: 11,
                  resolution: 76.4370282850732,
                  scale: 288895.277144,
                },
                {
                  level: 12,
                  resolution: 38.2185141425366,
                  scale: 144447.638572,
                },
                {
                  level: 13,
                  resolution: 19.1092570712683,
                  scale: 72223.819286,
                },
                {
                  level: 14,
                  resolution: 9.55462853563415,
                  scale: 36111.909643,
                },
                {
                  level: 15,
                  resolution: 4.77731426794937,
                  scale: 18055.954822,
                },
                {
                  level: 16,
                  resolution: 2.38865713397468,
                  scale: 9027.977411,
                },
                {
                  level: 17,
                  resolution: 1.19432856685505,
                  scale: 4513.988705,
                },
                {
                  level: 18,
                  resolution: 0.597164283559817,
                  scale: 2256.994353,
                },
                {
                  level: 19,
                  resolution: 0.298582141647617,
                  scale: 1128.497176,
                },
                {
                  level: 20,
                  resolution: 0.149291070823808,
                  scale: 564.248588,
                },
              ];

              // setting layers and tables in window object
              // layers and tables are resulted
              // from mapservice definition
              window.__layers__ = layers;
              window.__tables__ = tables;
              // dispatch mapLoaded
              const { mapLoaded } = this.props;
              createMap("map", mapSetting, Layers)
                .then(async (map) => {
                  window.__map__ = map;
                  map.reorderLayer("zoomGraphicLayer", 100);
                  await this.pushFieldsToTheStore(layers);
                  let self = this;
                  
                    let qString = self.props.location.search;
                    let siteGEoID = new URLSearchParams(qString?.toUpperCase()).get('SITE_GEOSPATIAL_ID'); 
                    if(siteGEoID){
                      
                      self.props.openLoader();
                      self.executeSearch(null, null, `SITE_GEOSPATIAL_ID=${siteGEoID}`)
                    
                  }
                  map.on("dbl-click", (e) => {
                    let mapPoint = e.mapPoint;
                    this.props.handleCloseMenu();
                    this.props.showRemarkSuggestTablestate &&
                      this.props.showRemarkSuggestTable(false);
                    this.props.showResultTablestate &&
                      this.props.showResultTable(false);
                    this.props.showUpdateTablestate &&
                      this.props.showUpdateTable(false);
                    this.props.openLoader();
                    this.getSiteInfo(mapPoint);
                  });
                  window.__legend__ = await getLegend();
                  //scale bar
                  let scaleBar = new Scalebar({
                    map: map,
                    attachTo: "bottom-left",
                    scalebarUnit: "dual",
                  });
                  scaleBar.show();

                  //add multiple select tool to map
                  let selectionToolbar = new Draw(window.__map__, {
                    showTooltips: false,
                    // tooltipOffset:0
                  });
                  window.__MultiSelect__ = selectionToolbar;

                  // })
                  if (window.__baseMapGallery) {
                    window.__baseMapGallery.destroy();
                    window.__baseMapGallery = null;
                  }
                  if (!window.__baseMapGallery) {
                    let osmLayer = new BasemapLayer({
                      templateUrl:
                        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                      type: "OpenStreetMap",
                    });
                    let osmBaseMap = new Basemap({
                      thumbnailUrl:
                        "http://www.arcgis.com/sharing/rest/content/items/c29cfb7875fc4b97b58ba6987c460862/info/thumbnail/thumbnail1547740877120.jpeg",
                      title: "OpenStreet Map",
                      layers: [osmLayer],
                      id: "1",
                    });
                    let streetsLayer = new BasemapLayer({
                      url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer",
                      // type:"VectorTileLayer"
                    });
                    let streetsBaseMap = new Basemap({
                      thumbnailUrl:
                        "http://www.arcgis.com/sharing/rest/content/items/f81bc478e12c4f1691d0d7ab6361f5a6/info/thumbnail/street_thumb_b2wm.jpg",
                      title: "الشوارع",
                      layers: [streetsLayer],
                      id: "2",
                    });
                    let imageryLayer = new BasemapLayer({
                      url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
                      // type:"VectorTileLayer"
                    });
                    let imageryBaseMap = new Basemap({
                      thumbnailUrl:
                        "http://www.arcgis.com/sharing/rest/content/items/86de95d4e0244cba80f0fa2c9403a7b2/info/thumbnail/thumbnail1591224931210.jpeg",
                      title: "الصور الفضائية",
                      layers: [imageryLayer],
                      id: "3",
                    });
                    let topoLayer = new BasemapLayer({
                      url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer",
                      // type:"VectorTileLayer"
                    });
                    let topoBaseMap = new Basemap({
                      thumbnailUrl:
                        "http://www.arcgis.com/sharing/rest/content/items/588f0e0acc514c11bc7c898fed9fc651/info/thumbnail/topo_thumb_b2wm.jpg",
                      title: "طبوجرافيا",
                      layers: [topoLayer],
                      id: "4",
                    });
                    let nationalGeoLayer = new BasemapLayer({
                      url: "https://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer",
                      // type:"VectorTileLayer"
                    });
                    let nationalGeoBaseMap = new Basemap({
                      thumbnailUrl:
                        "http://www.arcgis.com/sharing/rest/content/items/4afed5cef9734e3eac2f247071b63869/info/thumbnail/thumbnail1566584105475.jpeg",
                      title: "الجغرافيا الوطنية",
                      layers: [nationalGeoLayer],
                      id: "5",
                    });
                    let grayLayer = new BasemapLayer({
                      // url:"https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer",
                      styleUrl:
                        "https://www.arcgis.com/sharing/rest/content/items/c11ce4f7801740b2905eb03ddc963ac8/resources/styles/root.json",
                      type: "VectorTileLayer",
                    });
                    let grayBasemap = new Basemap({
                      thumbnailUrl:
                        "http://www.arcgis.com/sharing/rest/content/items/a343955125bf4002987c400ad6d0346c/info/thumbnail/darkgray_thumb_b2wm.jpg",
                      title: "لوحات بلون رمادي داكن",
                      layers: [grayLayer],
                      id: "6",
                    });
                    let lightLayer = new BasemapLayer({
                      url: "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer",
                      // type:"VectorTileLayer"
                    });
                    let lightBasemap = new Basemap({
                      thumbnailUrl:
                        "http://www.arcgis.com/sharing/rest/content/items/de45b9cad20141ebb82fae0da8b3e2c6/info/thumbnail/lightgray_thumb_b2wm.jpg",
                      title: "لوحات بلون رمادي فاتح",
                      layers: [lightLayer],
                      id: "7",
                    });
                    let imageryWithLabelsLayer = new BasemapLayer({
                      url: "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer",
                      // type:"VectorTileLayer"
                    });
                    let imageryWithLabelsBaseMap = new Basemap({
                      thumbnailUrl:
                        "http://www.arcgis.com/sharing/rest/content/items/2ea9c9cf54cb494187b03a5057d1a830/info/thumbnail/Jhbrid_thumb_b2.jpg",
                      title: "الصور الفضائية ذات تسميات",
                      layers: [imageryLayer, imageryWithLabelsLayer],
                      id: "8",
                    });
                    let terrainBasemap = new Basemap({
                      layers: [
                        new BasemapLayer({
                          url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer",
                        }),
                      ],
                      title: "التضاريس",
                      id: "9",
                      thumbnailUrl:
                        "http://www.arcgis.com/sharing/rest/content/items/1536abe5e5504e5db380ccfaa9b6fd8d/info/thumbnail/Terrain_Labels_Web_map.jpg",
                    });
                    //basemap gallery
                    let basemapGallery = new BasemapGallery(
                      {
                        showArcGISBasemaps: false,
                        basemaps: [
                          osmBaseMap,
                          streetsBaseMap,
                          topoBaseMap,
                          imageryBaseMap,
                          imageryWithLabelsBaseMap,
                          grayBasemap,
                          lightBasemap,
                          nationalGeoBaseMap,
                          terrainBasemap,
                        ],
                        map: window.__map__,
                      },
                      "basemapGallery"
                    );
                    basemapGallery.startup();
                    // basemapGallery.select("1");

                    window.__baseMapGallery = basemapGallery;
                  }
                 
                  // Handle the map `extent-change` event
                  window.__map__.on("extent-change", (e) => {
                    let { user, tableSettings, isInvestableSitesChosen } =
                      this.props;
                    var mapScale = window.__map__.getScale();
                    window.__legend__["layers"].forEach(function (layer) {
                      var minScale = layer.minScale;
                      var maxScale = layer.maxScale;

                      if (
                        (maxScale <= mapScale || maxScale == 0) &&
                        (minScale >= mapScale || minScale == 0)
                      ) {
                        layer.disable = false;
                      } else {
                        layer.disable = "disableLabel";
                      }
                    });
                    //todo: filter tableSettings result based on map extent
                    //in case of employee and investable sites (فرص معلنة فقط)
                    if (
                      isInvestableSitesChosen &&
                      tableSettings
                    ) {
                      //todo: make logic of filtering shown cards based on map extent (done)
                      this.filterTableSettingsBasedOnMapExtent(e.extent);
                    }
                  });

                  //handle click on one of land or AD that offered for investment to select all with the same auction No,
                  // window.__map__.on('click',(e)=>{
                  this.props.handleMapClickEvent({
                    cursor: "default",
                    handler: ({ mapPoint }) =>
                      makeFlashOnAssetsWithSameAuctionNo(mapPoint),
                  });
                  if (this.props.isMapLoaded) mapLoaded();
                  drawGraphicToOfferdForInvestement().then(res=>{
                    if(!res){
                      //there is an error
                      notificationMessage("حدث خطأ", 5);
                      this.props.history.push("/serverErr");
                    }
                  });
                })
                .then((res) => {
                  console.log("Map Created");
                }).catch(err=>{
                  console.log(err, "Error in Creating Map");
                });
            }
          );
        })
        .catch((err) => {
          /**
           * todo: put here redirect to serverErrPage
           */
          console.error("Error in getMapInfo");

          notificationMessage("حدث خطأ", 5);
          this.props.history.push("/serverErr");
          //
          // throw new Error("Error in getMapInfo");
        });
    } catch (error) {
      console.log(error);
      /**
       * todo: put here redirect to serverErrPage
       */
      notificationMessage("حدث خطأ اثناء الارسال", 5);
      this.props.history.replace("/serverErr");
      //
    }
  }
  async getSiteInfo(mapPoint) {
    LoadModules(["esri/tasks/query"]).then(([Query]) => {
      queryTask({
        returnGeometry: true,
        url: `${window.__mapUrl__}/${getLayerIndex("MUNICIPALITY_BOUNDARY")}`,
        outFields: ["OBJECTID"],
        geometry: mapPoint,
        spatialRelationship: Query.SPATIAL_REL_INTERSECTS,
        callbackResult: ({ features }) => {
          if (features.length) {
            this.executeSearch(mapPoint, Query);
          } else {
            notificationMessage("الموقع يقع خارج حدود الأمانة");
            setTimeout(() => {
              notificationMessage(" من فضلك اضغط داخل حدود الأمانة");
            }, 1500);
            this.props.closeLoader();
          }
        },
        callbackError: (err) => {
          console.log(err);
          this.props.closeLoader();
          this.notificationError();
        },
      });
    });
  }
  async executeSearch(mapPoint, Query,where, callBack) {
    const { user } = this.props;
    //clear tableSettings from redux
    this.props.clearTableData();
    //clear selected card data
    this.props.clearSelectedFeatureData();
    //clear selectedFeatures that existing from selection tool
    this.props.clearAllSelectedFeatures();
    //remove highlighting from map
    window.__map__.getLayer("zoomGraphicLayer").clear();
    window.__map__.getLayer("searchGraphicLayer").clear();
    window.__map__.getLayer("highLightGraphicLayer").clear();
    let layernames = ["INVEST_SITE_POLYGON"];
    layernames.push("ADVERTISING_BOARDS");
    let promises = layernames.map((layername, index) => {
      const layerIndex = getLayerIndex(layername);
      let params = mapPoint?{
        returnGeometry: true,
        geometry: mapPoint,
        url: `${window.__mapUrl__}/${layerIndex}`,
        outFields: ["*"],
        spatialRelationship: Query.SPATIAL_REL_INTERSECTS,
      }:{
        returnGeometry: true,
        where ,
        url: `${window.__mapUrl__}/${layerIndex}`,
        outFields: ["*"],
      }
      return new Promise((resolve, reject) => {
        queryTask({
          ...params,
          callbackResult: ({ features }) => {
            let result = { layername, data: features };
            //logic to allow just for employees to get site details that already invested
            //todo: make logic to get site data of if invested, just for the site owner (investor) [done]
            if (user && [1].includes(user.user_type_id)) {
              resolve(result);
            } else if (!features.find((f) => f.attributes.SITE_STATUS === 4)) {
              resolve(result);
            } else resolve("not allowed");
          },
          callbackError: (err) => {
            if(index && mapPoint){
              notificationMessage("حدث خطأ برجاء المحاولة مرة أخرى");
              reject(err);
            }
            this.props.closeLoader();
          },
        });
      });
    });
    let result = await Promise.all(promises);
    //in case of not allowed ==> break of method:
    if (result.includes("not allowed")) {
      notificationMessage("غير مصرح لك بالاطلاع على معلومات تلك الأرض", 5);
      this.props.closeLoader();
      if(!mapPoint){

        this.props.handleCloseMenu();
        this.props.changeRoute("home");
        window.__map__.getLayer("searchGraphicLayer").clear();
        return this.props.pushResultTableData(null);
      }else return;
    }
    //in case there is no result sites
    if (isResultEmpty(result)&&mapPoint) {
      notificationMessage("برجاءالضغط على طبقة من الخريطة");
      window.__map__.getLayer("searchGraphicLayer").clear();
      this.props.closeLoader(); //for stop loader in case there is no result

      if (['siteDetailsSideMenu','dblClickSiteDetailsSideMenu'].includes(this.props.routeName)) {
        this.props.handleCloseMenu();
        this.props.changeRoute("home");
      }
      return this.props.pushResultTableData(null);
    }

    //if there is result
     this.props.handleMapClickEvent({
              cursor: "default",
              handler: ({ mapPoint }) =>
                makeFlashOnAssetsWithSameAuctionNo(mapPoint),
    });
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
                notificationMessage("حدث خطأ برجاء المحاولة مرة أخرى");
                reject(err);
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
    let resultOfFlagTech = await Promise.all(flagTechReportPromises);
    //set state resultOfFlagTech to use it in actions methods
    this.setState({ flagForTechReport: resultOfFlagTech });
    this.props.changeRoute("dblClickSiteDetailsSideMenu");
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
                this.props.closeLoader(); //for loader in case of zooimng
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
            getLayerIndex(layername) === getLayerIndex("ADVERTISING_BOARDS"),
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
        //     feature.attributes["SITE_STATUS"]===4&&user.user_type_id===1,
        //   action: async (feature, layername) => {
        //     // push the feature to the store
        //     // so the borders modal can be opened
        //     this.props.openLoader();
        //     //1- fetch the contract data includes contract_id
        //     let contractData = await axios.get(window.API_FILES_URL+`contract-info?spatial_id=${feature.attributes.SITE_GEOSPATIAL_ID}`)
        //     let contract_id = contractData?.CONTRACT_ID;
        //     //2- from contract_id fetch the contract installments info 
        //     let contractInstallments = await axios.get(window.API_FILES_URL+`contract-installment?contract_id=${contract_id}`);

        //     //3- push the data to the store
        //     // this.props.pushContentToModal({
        //     //   feature: rf[0],
        //     //   name: "ATM_Info",
        //     // });
        //     this.props.closeLoader();

        //   },
        // },
        //for ATM info
        {
          name: "atmInfo",
          alias: "بيانات الصراف الآلي",
          icon: (
            <img
              src={AtmIcon}
              className="svg"
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
                  featureWithAllAttributes = [{ attributes: featAttributes }];
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
            getLayerIndex(layername) === getLayerIndex("Invest_Site_Polygon") &&
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
    highlightFeature(
      result
        .filter((r) => r.data.length)
        .map((r) => r.data)
        .flat(),
      window.__map__,
      {
        noclear: false,
        isZoom: true,
        layerName: "searchGraphicLayer",
        highlightWidth: 3,
        fillColor: [225, 225, 255, 0.25],
        strokeColor: "black",
      }
    );
    this.props.handleOpenMenu();
    this.props.closeLoader(); //for loader in case of search process
  }
  async filterTableSettingsBasedOnMapExtent(mapExtent) {
    this.props.openLoader();
    let { tableSettings } = this.props;
    let resultIDs = tableSettings?.result?.length
      ? tableSettings.result
          .map((r) => r.data)
          .flat()
          .map((t) => t.attributes.SITE_GEOSPATIAL_ID)
      : [];
    let whereCondition = resultIDs.length
      ? `SITE_GEOSPATIAL_ID IN (${resultIDs.join(",")})`
      : "1=1";
    LoadModules(["esri/tasks/query"]).then(async ([Query]) => {
      let layernames = ["INVEST_SITE_POLYGON"];
      layernames.push("ADVERTISING_BOARDS");
      let promises = layernames.map((layername) => {
        const layerIndex = getLayerIndex(layername);
        return new Promise((resolve, reject) => {
          queryTask({
            returnGeometry: true,
            geometry: mapExtent,
            url: `${window.__mapUrl__}/${layerIndex}`,
            outFields: ["SITE_GEOSPATIAL_ID"],
            spatialRelationship: Query.SPATIAL_REL_INTERSECTS,
            where: whereCondition,
            callbackResult: ({ features }) => {
              let result = [];
              if (features.length) {
                result = features.map((f) => f.attributes.SITE_GEOSPATIAL_ID);
              }
              resolve(result);
            },
            callbackError: (err) => {
              notificationMessage("حدث خطأ برجاء المحاولة مرة أخرى");
              reject(err);
              this.props.closeLoader();
            },
          });
        });
      });
      let results = await Promise.all(promises);
      // if there are filtered sites
      if (results.flat().length) {
        this.props.filterResultData(results.flat());
      }
      // if there is no sites
      else {
        this.props.filterResultData([]);
      }
      this.props.closeLoader();
    });
  }
  async pushFieldsToTheStore(layers) {
    //layers -- > includes all layers on mapServer
    //tablesLayersIds will include all tables ids
    let tablesLayersIds = [];
    await fetch(window.__mapUrl__ + "?f=pjson")
      .then((res) => res.json())
      .then((data) => {
        tablesLayersIds = data.tables.map((tbl) => {
          return { id: tbl.id };
        });
      });
    layers = [...layers, ...tablesLayersIds];

    const layersUrls = layers.map(
      (layer) => `${window.__mapUrl__}/${layer.id}?f=pjson`
    );
    const fields = {};
    await Promise.all(layersUrls.map((url) => fetch(url)))
      .then((rs) => Promise.all(rs.map((r) => r.json())))
      .then((jsonResult) =>
        jsonResult.forEach(
          (json) => (fields[json.name.toLowerCase()] = json.fields)
        )
      );

    this.props.addFields(fields);
  }

  render() {
    // return <div id="map" style={{ height: "100vh" }}></div>;
    return (
      <>
        <div
          id="map"
          style={{ height: "100%" }}
          // className={this.props.openMenu ? "esriOpen" : "esriClose"}
        ></div>
      </>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    mapLoaded: () => dispatch({ type: "MAP_LOADED" }),
    addFields: (fields) => dispatch({ type: "DOMAINS_ADDED", fields }),
    fireFeaturesLoading: (bool) =>
      dispatch({ type: "LOADING_FEATURES_ON_ZOOMING", data: bool }),
    handleMapClickEvent: ({ cursor, handler }) =>
      dispatch({ type: "MAP_CLICK_EVENT", cursor, handler }),
    pushResultTableData: (data) =>
      dispatch({ type: "RESULT_TABLE_DATA_SET", data }),
    pushContentToModal: (data) =>
      dispatch({ type: "TABLE_ICON_MODAL_DATA_SET", data }),
    clearTableData: () => dispatch({ type: "CLEAR_RESULT_TABLE_DATA_SET" }),
    clearSelectedFeatureData: () =>
      dispatch({ type: "CLOSE_TABLE_ICON_MODAL" }),
    clearAllSelectedFeatures: () => dispatch({ type: "CLEAR_SELECTED" }),
    filterResultData: (data) => dispatch({ type: "FILTER_RESULT_TABLE", data }),
  };
};
const mapStateToProps = ({ mapUpdate }) => {
  return {
    user: mapUpdate.auth.user,
    isAuth: mapUpdate.auth.isAuth,
    isMapLoaded: mapUpdate.mapLoaded,
    currentUser: mapUpdate.currentUser,
    tableSettings: mapUpdate.tableSettings,
  };
};
export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(MapComponent)
);

import store from "../../../redux/store";
import {
  getLayerIndex,
  highlightFeature,
  identify,
  LoadModules,
  queryTask,
} from "../../common/mapviewer";
// require("./clusterLayer/clusterLayerCode")
//handle adding graphics symbol to invest site polygon, AD boards that are offered for investment
export const drawGraphicToOfferdForInvestement = () => {
 
 return new Promise((resolve, reject)=>{
  LoadModules([
    "esri/tasks/query",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/Color",
    "extras/clusterLayerCode",
    "esri/renderers/ClassBreaksRenderer",
  ]).then(
    ([
      Query,
      SimpleMarkerSymbol,
      SimpleLineSymbol,
      Color,
      ClusterFeatureLayer,
      ClassBreaksRenderer,
    ]) => {
      if (!window.__map__.getLayer("clusters")) {
        let investSitePolygonGraphicLayer = window.__map__.getLayer(
          "graphicLayer_Invest_Site_Polygon"
        );
        let ADBoardsGraphicLayer = window.__map__.getLayer(
          "graphicLayer_AD_Boards"
        );
        if (investSitePolygonGraphicLayer)
          investSitePolygonGraphicLayer.clear();
        if (ADBoardsGraphicLayer) ADBoardsGraphicLayer.clear();
        let investPolygonAndADBoardsGroup = [
          {
            indexLayer: getLayerIndex("invest_site_polygon"),
            graphicLayer: investSitePolygonGraphicLayer,
            name: "INVEST_SITE_POLYGON",
          },
          {
            indexLayer: getLayerIndex("ADVERTISING_BOARDS"),
            graphicLayer: ADBoardsGraphicLayer,
            name: "ADVERTISING_BOARDS",
          },
        ];
        // Add cluster renderer
        let defaultSym = new SimpleMarkerSymbol(
          "circle",
          16,
          new SimpleLineSymbol(
            SimpleLineSymbol.STYLE_SOLID,
            new Color([102, 0, 0, 0.55]),
            3
          ),
          new Color([255, 255, 255, 1])
        );

        let selectedSym = new SimpleMarkerSymbol(
          "circle",
          16,
          new SimpleLineSymbol(
            SimpleLineSymbol.STYLE_SOLID,
            new Color([102, 0, 0, 0.85]),
            3
          ),
          new Color([255, 255, 255, 1])
        );
          store.dispatch({type:"MAP_NOT_LOADED"});
        investPolygonAndADBoardsGroup.forEach(async (layer) => {
          await queryTask({
            returnGeometry: true,
            url: `${window.__mapUrl__}/${layer.indexLayer}`,
            outFields:
              layer.indexLayer == getLayerIndex("invest_site_polygon")
                ? [
                    "SITE_GEOSPATIAL_ID,AUCTION_NO,SITE_STATUS,SITE_MAIN_ACTIVITY_FORAS,SITE_COMMON_USE,OBJECTID",
                  ]
                : [
                    "SITE_GEOSPATIAL_ID,AUCTION_NO,SITE_STATUS,SITE_COMMON_USE,OBJECTID",
                  ],
            geometry: window.__map__.extent,
            spatialRelationship: Query.SPATIAL_REL_ENVELOPEINTERSECTS,
            where: "SITE_STATUS=3",
            layerName: layer.graphicLayer,
            callbackResult: (res) => {
              let { features } = res;

              if (features.length) {
                //clusering logic for adding clusters to map
                let clusterLayer = new ClusterFeatureLayer({
                  url: `${window.__mapUrl__}/${layer.indexLayer}`,
                  distance: 95,
                  id: "clusters",
                  labelColor: "#fff",
                  resolution:
                    window.__map__.extent.getWidth() / window.__map__.width,
                  //"singleColor": "#888",
                  singleSymbol: defaultSym,
                  // "singleTemplate": infoTemplate,
                  useDefaultSymbol: false,
                  zoomOnClick: true,
                  showSingles: true,
                  objectIdField: "OBJECTID",
                  outFields: ["*"],
                  where: "SITE_STATUS=3",
                  layerName: layer.name,
                  _imageServerUrl: window.imagesServerUrl,
                });

                let renderer = new ClassBreaksRenderer(
                  defaultSym,
                  "clusterCount"
                );

                // Red Clusters
                let small = new SimpleMarkerSymbol(
                  "circle",
                  25,
                  new SimpleLineSymbol(
                    SimpleLineSymbol.STYLE_SOLID,
                    new Color([212, 116, 60, 0.5]),
                    15
                  ),
                  new Color([212, 116, 60, 0.75])
                );
                let medium = new SimpleMarkerSymbol(
                  "circle",
                  50,
                  new SimpleLineSymbol(
                    SimpleLineSymbol.STYLE_SOLID,
                    new Color([178, 70, 37, 0.5]),
                    15
                  ),
                  new Color([178, 70, 37, 0.75])
                );
                let large = new SimpleMarkerSymbol(
                  "circle",
                  80,
                  new SimpleLineSymbol(
                    SimpleLineSymbol.STYLE_SOLID,
                    new Color([144, 24, 13, 0.5]),
                    15
                  ),
                  new Color([144, 24, 13, 0.75])
                );
                let xlarge = new SimpleMarkerSymbol(
                  "circle",
                  110,
                  new SimpleLineSymbol(
                    SimpleLineSymbol.STYLE_SOLID,
                    new Color([102, 0, 0, 0.5]),
                    15
                  ),
                  new Color([102, 0, 0, 0.75])
                );

                // Break values - can adjust easily
                renderer.addBreak(2, 50, small);
                renderer.addBreak(50, 250, medium);
                renderer.addBreak(250, 1000, large);
                renderer.addBreak(1000, 50000, xlarge);

                // Providing a ClassBreakRenderer is also optional
                clusterLayer.setRenderer(renderer);
                window.__map__.addLayer(clusterLayer);
                //////////////////////////////////////////////////////////////////////////////////////////
                store.dispatch({type:"MAP_LOADED"});
                resolve(true)
              }
            },
            callbackError: (e) => {
              console.log(e);
              resolve(false)
            },
          });
        });
      }
    }
  );
})
};

export const makeFlashOnAssetsWithSameAuctionNo = (geometry) => {
  identify(window.__map__, {
    url: window.__mapUrl__,
    geometry,
    returnGeometry: false,
    layerIds: [
      getLayerIndex("ADVERTISING_BOARDS"),
      getLayerIndex("INVEST_SITE_POLYGON"),
    ],
  }).then(async (identifyData) => {
    //check in case of clicking on unkown place out of mapservice
    if (identifyData.length === 0) {
      console.log(identifyData, "Click on layers rather than invest, AD");
    }
    identifyData.forEach(async (item) => {
      let indexLayer = item.layerId;
      let feature = item.feature;
      if (feature.attributes["حالة الموقع"] === "مطروحة للاستثمار") {
        let auctionNo = feature.attributes["رقم المنافسة"];
        await queryTask({
          returnGeometry: true,
          url: `${window.__mapUrl__}/${indexLayer}`,
          outFields: [
            "SITE_GEOSPATIAL_ID,AUCTION_NO,SITE_STATUS,SITE_COMMON_USE",
          ],
          where:
            auctionNo == "Null"
              ? `SITE_STATUS=3 AND AUCTION_NO IS Null AND OBJECTID=${feature.attributes["OBJECTID"]}`
              : `SITE_STATUS=3 AND AUCTION_NO=${auctionNo}`,
          callbackResult: ({ features }) => {
            highLight().then(() => {
              setTimeout(() => {
                window.__map__.getLayer("graphicLayer2").clear();
              }, 1000);
            });
            async function highLight() {
              if (features.length > 1)
                await highlightFeature(features, window.__map__, {
                  isZoom: true,
                  layerName: "graphicLayer2",
                  fillColor: "white",
                  strokeColor: [255, 255, 255],
                  highlightWidth: 7,
                  highlighColor: "cyan",
                  isHiglightFillColorWithBorder: true,
                });
            }
          },
        });
      }
    });
  });
};

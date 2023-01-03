import { getLayerIndex, highlightFeature, queryTask, zoomToFeature, zoomToLayer } from "../../common/mapviewer";
import {LoadModules} from "../../common/mapviewer/esri_loader"
export const highlightBoundaries = (boundariesType, boundariesCodes, colors, callBackFunc) => {
  console.log({boundariesCodes:boundariesCodes.filter(b=>b),});  
  let boundaryField = boundariesType === "MUNICIPALITY_NAME"
    ? "MUNICIPALITY_NAME"
    : "DISTRICT_NAME"
    let where = boundaryField +` IN (${
        boundariesCodes.filter(b=>b).join(",")
      })`
  let layerIndex = getLayerIndex(
    boundariesType === "MUNICIPALITY_NAME"
      ? "MUNICIPALITY_BOUNDARY"
      : "DISTRICT_BOUNDARY"
  );
  LoadModules(["esri/graphicsUtils",
  "esri/geometry/Extent"]).then(([graphicsUtils,Extent])=>{
    queryTask({
      returnGeometry: true,
      url: window.__mapUrl__ + "/" + layerIndex,
      where: where,
      outFields: [boundaryField],
      callbackResult: async(data) => {
        let selectedFeatures = data.features;
       await highLight(selectedFeatures,"graphicLayer_Dashboard",colors,boundaryField);
        // zoomToLayer("graphicLayer_Dashboard",window.__map__,5);
        let grDashboardLayer = window.__map__.getLayer("graphicLayer_Dashboard")
        let layerExtent = graphicsUtils.graphicsExtent(grDashboardLayer.graphics);
            let extent = new Extent(
              layerExtent.xmin - 5,
              layerExtent.ymin - 5,
              layerExtent.xmax + 5,
              layerExtent.ymax + 5,
              window.__map__.spatialReference
            );
            // window.__map__.setExtent(extent.expand(2));
        callBackFunc();
      },
      returnGeometry: true,
      callbackError(error) {},
    });
  })
};



export async function highLight(
    features,
    graphicLayerName, colors, boundaryField
  ) {
    LoadModules([
      "esri/graphic",
      "esri/symbols/SimpleFillSymbol",
      "esri/symbols/SimpleLineSymbol",
      "esri/Color",
      "esri/graphicsUtils",
    "esri/geometry/Extent",
    ]).then(
      async ([
        Graphic,
        SimpleFillSymbol,
        SimpleLineSymbol,
        Color,
        graphicsUtils,
        Extent
      ]) => {
        let graphicLayer = window.__map__.getLayer(graphicLayerName);
        console.log({boundaryField});
          await features.forEach((feat) => {
            var sfs = new SimpleFillSymbol(
              SimpleFillSymbol.STYLE_SOLID,
              new SimpleLineSymbol(
                SimpleLineSymbol.STYLE_SOLID,
                new Color([255, 255, 255]),
                1
              ),
              new Color(colors.find(c=>c.boundCode===feat.attributes[boundaryField]).color)
            );
            console.log("in graphic",boundaryField,feat.attributes[boundaryField]);
            let graphic = new Graphic(
              feat.geometry,
              sfs,
              {boundCode:feat.attributes[boundaryField]}
            );
            graphicLayer.add(graphic);
          });
        let feats = graphicLayer.graphics;
        // let grDashboardLayer = window.__map__.getLayer("graphicLayer_Dashboard")
        let layerExtent = graphicsUtils.graphicsExtent(feats);
            let extent = new Extent(
              layerExtent.xmin - 5,
              layerExtent.ymin - 5,
              layerExtent.xmax + 5,
              layerExtent.ymax + 5,
              window.__map__.spatialReference
            );
            window.__map__.setExtent(boundaryField==="MUNICIPALITY_NAME"?extent.expand(2):extent);

        // let featsExtent = graphicsUtils.graphicsExtent(feats);
        // console.log({graphicsUtils});
        // window.__map__.setExtent(featsExtent.expand(5));
      }
    );
  }
  

export  const zoomToBound = (boundCode) => {
    let dashboardGraphicLayer = window.__map__.getLayer(
      "graphicLayer_Dashboard"
    );
    let feature = dashboardGraphicLayer.graphics.find(
      (g) => g.attributes.boundCode === boundCode
    );
    highlightFeature(feature, window.__map__, {
      noclear: true,
      isZoom: false,
      layerName: "zoomGraphicLayer",
      strokeColor: "#daa520",
      fillColor:[255,255,255,0.55],
      highlighColor:[255,255,255,0.55],
      highlightWidth: 5,
      isDashStyle:true,
      zoomFactor:500
    });
        setTimeout(() => {
          let graphicLayerOfZooming = window.__map__.getLayer("zoomGraphicLayer");
          graphicLayerOfZooming.clear();
        }, 4000);
  };
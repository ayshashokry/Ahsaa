import { LoadModules } from "../../../components/common/mapviewer/esri_loader";

export const createLayer = (layer, { ArcGISDynamicMapServiceLayer, GraphicsLayer, FeatureLayer, ArcGISTiledMapServiceLayer }) => {
    var out = null;
    if (layer.type === "ArcGISDynamicMapServiceLayer") {
        out = new ArcGISDynamicMapServiceLayer(layer.url);
    } else if (layer.type === "GraphicsLayer") {
        out = new GraphicsLayer();
    } else if (layer.type === "FeatureLayer") {
        out = new FeatureLayer(layer.url, {
            opacity: 0,
            id: layer.id,
            mode: layer.mode,
            outFields: layer.outFields || ["*"]
        });
    } else if (layer.type === "ArcGISTiledMapServiceLayer") {
        out = new ArcGISTiledMapServiceLayer(layer.url);
    }
    out.opacity = layer.opacity;
    out.id = layer.id;
    out.featureCollection = layer.featureCollection;
    return out;
};

export const createMap = (mapDiv, settings, layers) => {
    return LoadModules(['esri/map',
        "esri/layers/ArcGISDynamicMapServiceLayer",
        "esri/layers/GraphicsLayer",
        "esri/layers/FeatureLayer",
        "esri/layers/ArcGISTiledMapServiceLayer"
    ])
        .then(([Map, ArcGISDynamicMapServiceLayer, GraphicsLayer, FeatureLayer, ArcGISTiledMapServiceLayer]) => {
            const map = new Map(mapDiv, settings);

            layers.forEach(function (layer) {
                // if (layer.id === "baseMap") layer.url = window.__mapUrl__
                map.addLayer(createLayer(layer, {
                    ArcGISDynamicMapServiceLayer,
                    GraphicsLayer,
                    FeatureLayer,
                    ArcGISTiledMapServiceLayer
                }));
            });

            return map;
        });
}

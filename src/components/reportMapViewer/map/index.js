import React, { Component } from "react";
import { connect } from "react-redux";

import Layers from "./layers";
import {
  createMap,
} from "./actions";
import {
  LoadModules,
} from "../../common/mapviewer";
import { getMapInfo } from "../common/esriRequest_Func"
import { find } from "lodash";
// import { ahsaReportMapUrl } from "../config";

class MapComponent extends Component {
  shouldComponentUpdate() {
    return false;
  }

  componentDidMount() {
    let mapLayers = JSON.parse(JSON.stringify(Layers));
    getMapInfo(this.props.mapUrl).then((data) => {
      window.mapInfo = data;
      LoadModules(["esri/SpatialReference", "esri/geometry/Extent"]).then(
        ([SpatialReference, Extent]) => {
          var mapSetting = {};
          let extent = data.info.mapInfo.fullExtent
          mapSetting.basemap = this.props.basemap;
          mapSetting.extent = new Extent(extent.xmin,
            extent.ymin,
            extent.xmax,
            extent.ymax,
            new SpatialReference({
              wkid: extent.spatialReference.wkid
            })
          )
          // setting layers and tables in window object
          // layers and tables are resulted
          // from mapservice definition
          // window.__layers__ = mapLayers;

          if (this.props.isConditionMap) {
            layer = find(mapLayers, {
              id: "baseMap"
            });

            layer.url =  this.props.mapUrl;
          } else {
            var layer = find(mapLayers, {
              id: "baseMap"
            });

            layer.url =
              this.props.mapUrl || layer.url;
          }
          createMap(this.props.mapId, mapSetting, mapLayers).then(async (map) => {
            var visible = [];
            window[`${this.props.mapId}`] = map;
            //كروكي الموقع
            if (this.props.isConditionMap) {
              var layerDefs = [];
              visible = [];
              data.info.mapInfo.layers.forEach((layer, index) => {
                if (
                  layer.name == "INVEST_SITE_CORNER" ||
                  layer.name == "INVEST_SITE_BOUNDARY"
                ) {
                  layerDefs[index] =
                    "SITE_GEOSPATIAL_ID =" + this.props.siteSpatial;
                  visible.push(index);
                }
              });
              map.getLayer("baseMap").setVisibleLayers(visible);
              map.getLayer("baseMap").setLayerDefinitions(layerDefs);
            }
            //الحدود الادارية
            if (this.props.isAdminBordersMap) {
              var layerDefs1 = [];
              visible = [];
              data.info.mapInfo.layers.forEach((layer, index) => { 
              if (
                layer.name !== "MUNICIPALITY_BOUNDARY"
              ) {
                layerDefs1[index] = "1!=1";
              } else {
                //layerDefs1[index] = "1!=1";
                visible.push(index);
              }
            })
            map.getLayer("baseMap").setVisibleLayers(visible);
              // map.getLayer("baseMap").setLayerDefinitions(layerDefs);
            }
            //المصور الفضائي
            if (this.props.isOnlyfeature) {
              var layerDefs1 = [];
              visible = [];
              data.info.mapInfo.layers.forEach((layer, index) => {
                if (
                  layer.name == "INVEST_SITE_CORNER" ||
                  layer.name == "INVEST_SITE_BOUNDARY"
                ) {
                  layerDefs1[index] = "1!=1";
                } else {
                  //layerDefs1[index] = "1!=1";
                  visible.push(index);
                }
              });

              map.getLayer("baseMap").setVisibleLayers(visible);
            }
            if(this.props.isParcels){
              var layerDefs1 = [];
              visible = [];
              data.info.mapInfo.layers.forEach((layer, index) => {
                if (
                  layer.name !== "PARCELS"
                ) {
                  layerDefs1[index] = "1!=1";
                } else {
                  //layerDefs1[index] = "1!=1";
                  visible.push(index);
                }
              });

              map.getLayer("baseMap").setVisibleLayers(visible);
            }
         // dispatch mapLoaded
        //  const { mapLoaded } = this.props;
        //  mapLoaded();
         map.on('load',
         this.props.onMapCreate.bind(this, map)
        //  if(this.props.isLastMap&&this.props.isConditionMap)
          // setTimeout(() => {
            // this.props.stopLoading()
          // },2000) 
          // }
          )
          });
        }
      );
    });
  }

  render() {
    return (
      <>
        <div id={this.props.mapId} 
        style={this.props.isFeasibilityReport?this.props.style:null}
        ></div>
      </>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    mapLoaded: () => dispatch({ type: "MAP_LOADED" }),
  };
};

export default connect(null, mapDispatchToProps)(MapComponent);

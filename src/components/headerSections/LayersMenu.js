import React, { Component } from "react";
import { Accordion, Card } from "react-bootstrap";
import { Button } from "antd";
import { Checkbox } from "@material-ui/core";
import { Fragment } from "react";
import { getLayerIndex } from "../common/mapviewer";
export default class LayersMenu extends Component {
  layersLocal = {
    INVEST_SITE_POLYGON: {
      name: "الأراضي الاستثمارية",
    },
    ADVERTISING_BOARDS: {
      name: "اللوحات الاعلانية",
    },
    PLAN_DATA: {
      name: "المخططات",
    },
    DISTRICT_BOUNDARY: {
      name: "الأحياء",
    },
    MUNICIPALITY_BOUNDARY: {
      name: "البلديات",
    },
    INVEST_SITE_BOUNDARY: {
      name: "",
    },
    INVEST_SITE_CORNER: {
      name: "",
    },
    PARCELS: {
      name: "طبقة الأراضي",
    },
  };

  constructor(props) {
    super(props);

    this.state = {
      expandicon1: "fas fa-angle-left",
      expandicon2: "fas fa-angle-left",
      landsData: props.legend,
      chks: window.__map__.getLayer("baseMap").layerInfos.map((layer) => ({
        index: layer.id,
        checked:
        layer.id===getLayerIndex("PARCELS")?false:  
        window.__map__.getLayer("baseMap").visibleLayers.indexOf(layer.id) >=
          0,
        layername: layer.name,
      })),
    };
  }

  changeExpandIcon1 = (e) => {
    if (this.state.expandicon1 == "fas fa-angle-left") {
      this.setState({ expandicon1: "fas fa-angle-down" });
    } else {
      this.setState({ expandicon1: "fas fa-angle-left" });
    }
  };

  changeExpandIcon2 = (e) => {
    if (this.state.expandicon2 == "fas fa-angle-left") {
      this.setState({ expandicon2: "fas fa-angle-down" });
    } else {
      this.setState({ expandicon2: "fas fa-angle-left" });
    }
  };
  zoomToLayer = (layer) => {
    //
    if (layer.minScale > 0 && layer.disable) {
      var dpi = 96; //Set to resolution of your screen
      var scale = layer.minScale;
      var mapunitInMeters = 111319.5; //size of one degree at Equator. Change if you are using a projection with a different unit than degrees
      var newRes = scale / (dpi * 39.37 * mapunitInMeters);
      var newExtent = window.__map__.extent.expand(newRes * 600);
      window.__map__.setExtent(newExtent);
    }
  };

  setVisibility = (layerIndex,layerName, visible) => {
    var bm = window.__map__.getLayer("baseMap");
    var vl = bm.visibleLayers;
    var s = new Set(vl);

    if (visible) {
      s.add(getLayerIndex(layerName));
    } else {
      s.delete(getLayerIndex(layerName));
    }
    bm.setVisibleLayers([...s]);

    var { chks } = this.state;

    var chk = chks.find((c) => c.index === layerIndex);
    chk.checked = visible;

    this.setState({
      chks,
    });
  };

  renderCmp() {
    const { layers } = window.__legend__;
    let displayedLayers = layers.filter(
      (layer) =>
        layer.layerId == getLayerIndex("INVEST_SITE_POLYGON") 
        ||layer.layerId == getLayerIndex("ADVERTISING_BOARDS")
        ||layer.layerId == getLayerIndex("PARCELS")
    );
    console.log(displayedLayers);
    displayedLayers = displayedLayers.filter((layer) => {
      let layerCopy = { ...layer };
      if (layerCopy.legend[0].label == "<all other values>")
        layerCopy.legend.splice(0, 1);
      return layerCopy;
    });
    return displayedLayers.map((layer, k) => {
      return (
        <Accordion key={k} onClick={(event) => event.stopPropagation()}>
          <Card onClick={(event) => event.stopPropagation()}>
            <Card.Header onClick={(event) => event.stopPropagation()}>
              <Accordion.Toggle
                id={1}
                as={Button}
                variant="link"
                eventKey="1"
                onClick={this.changeExpandIcon1}
              >
                <i
                  style={{
                    color: "#031d2d",
                    marginTop: "5px",
                  }}
                  className={this.state.expandicon1}
                ></i>
              </Accordion.Toggle>
              <span>
                <Checkbox
                  key={k}
                  checked={this.state.chks[k].checked}
                  onChange={(e) => this.setVisibility(k,layer.layerName, e.target.checked)}
                ></Checkbox>
              </span>
              <span className="layerslabel">
                {this.layersLocal[layer.layerName].name}
              </span>{" "}
              <i
                onClick={(e) => {
                  e.stopPropagation();
                  this.zoomToLayer(layer);
                }}
                className="fas fa-search-plus layersZoom"
              ></i>
            </Card.Header>

            <Accordion.Collapse eventKey="1">
              <Card.Body>
                <ul>
                  {layer.legend.map((land, index) => (
                    <li>
                      <img src={"data:image/jpeg;base64," + land.imageData} />
                      <span>{land.label}</span>
                    </li>
                  ))}
                </ul>
              </Card.Body>
            </Accordion.Collapse>
          </Card>
        </Accordion>
      );
    });
  }

  render() {
    return <Fragment>{this.renderCmp()}</Fragment>;
  }
}
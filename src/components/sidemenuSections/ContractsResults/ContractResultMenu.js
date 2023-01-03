import React, { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearchPlus } from "@fortawesome/free-solid-svg-icons";
// import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { Row, Col, Tooltip } from "antd";
import { connect } from "react-redux";
import { useEffect } from "react";
import {getInfiniteScroll} from '../../../helpers/utlis/getInfiniteScroll'
import { Waypoint } from "react-waypoint";
import { getLayerIndex, highlightFeature, queryTask } from "../../common/mapviewer";


function ContractResultMenu(props) {
  const limit = 10;

  const [paginationList, setPagintionList] = useState([]);
  const [result, setResult] = useState([]);
  // tracking on which page we currently are
  const [page, setPage] = useState(0);
  //extract needed data from tableContent to show them on cards
  //todo: make list interactive with map extent in case of SITE_STATUS = 3 مطروحة للاستثمار (done)

  useEffect(() => {
    let {
      menuData,
    } = props;
  
    setResult(menuData);
    let elements = getInfiniteScroll(menuData, limit, page)
    setPagintionList(elements);
  }, []);


  useEffect(() => {
    if(result.length && paginationList.length <result.length){
    let elements = getInfiniteScroll(result,limit,page)
    setPagintionList(elements);
    }
  }, [page]);

const handleZoomToSite =(data)=>{
  props.openLoader();
  let geoID = data.SITE_GEOSPATIAL_ID;
  let layerIndex = getLayerIndex("INVEST_SITE_POLYGON");
  if(geoID){
    queryTask({
      returnGeometry: true,
      url: `${window.__mapUrl__}/${layerIndex}`,
      where:`SITE_GEOSPATIAL_ID=${geoID}`,
      outFields: ["OBJECTID"],
      callbackResult: ({ features }) => {
        highlightFeature(features, window.__map__, {
          isZoom: true,
          layerName: "zoomGraphicLayer",
          zoomFactor: features.length === 1 ? 50 : 200,
        });
        setTimeout(() => {
          window.__map__.getLayer("zoomGraphicLayer").clear();
        }, 3000);
        props.closeLoader();
      },
      callbackError: (err) => {
        props.closeLoader();
        console.log(err);
      },
    });
    
  }
}
  return (
    <div className="generalSearchResult">
      {
        paginationList.map((r, index) => (
          <>
          <div key={index} className="generalSearchCard">
            <Row>
              <Col
                span={16}
                onClick={() => props.OpenResultdetails(r)}
              >
                <h5>رقم العقد : {r.CONTRACT_NUMBER?r.CONTRACT_NUMBER:"بدون"}</h5>
                <p>
                  <span className="munSpan"> حالة العقد: {r.SITE_STATUS?r.SITE_STATUS:"بدون"}</span> -
                  <span className="distSpan">البلدية: {r.BALADEYAH_BRANCH_NAME?r.BALADEYAH_BRANCH_NAME:"بدون"}</span>
                </p>
              </Col>
              <Col span={8} style={{ margin: "auto", textAlign: "center" }}>
                <Tooltip title={"تكبير"} placement="top">
                  <button
                    className="tooltipButton"
                    onClick={() => handleZoomToSite(r)}
                  >
                    <FontAwesomeIcon
                      className="zoomIcon"
                      icon={faSearchPlus}
                      style={{
                        cursor: "pointer",
                      }}
                    />
                  </button>
                </Tooltip>

                {/* <Tooltip title={"خرائط جوجل"} placement="top">
                  <button
                    className="tooltipButton"
                    onClick={() => props.goToGoogleAction.action(r.feature)}
                  >
                    <FontAwesomeIcon
                      icon={faGoogle}
                      className="googleIcon"
                      style={{
                        cursor: "pointer",
                      }}
                    />
                  </button>
                </Tooltip> */}
              </Col>
            </Row>
          </div>
          {index === limit * page ? (
            <Waypoint onEnter={() => setPage(page + 1)} />
          ) : null}
          </>
        ))
      } 
    </div>
  );
}

const mapStateToProps = ({ mapUpdate }) => {
  return {
    fields: mapUpdate.fields,
    user: mapUpdate.auth.user,
  };
};
export default connect(mapStateToProps)(ContractResultMenu);

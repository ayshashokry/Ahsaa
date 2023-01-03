import React, { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearchPlus } from "@fortawesome/free-solid-svg-icons";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { Row, Col, Tooltip } from "antd";
import { connect } from "react-redux";
import { useEffect } from "react";
import {getInfiniteScroll} from '../../../helpers/utlis/getInfiniteScroll'
import { Waypoint } from "react-waypoint";


function SearchResultMenu(props) {
  const limit = 10;

  const [paginationList, setPagintionList] = useState([]);
  const [result, setResult] = useState([]);
  // tracking on which page we currently are
  const [page, setPage] = useState(0);
  //extract needed data from tableContent to show them on cards
  //todo: make list interactive with map extent in case of SITE_STATUS = 3 مطروحة للاستثمار (done)

  useEffect(() => {
    let {
      filteredTableSettingsIDs,
      isInvestableSitesChosen,
      user,
      tableContent,
    } = props;
    let filteredData = { ...filteredTableSettingsIDs };
    let resContent = tableContent?.result; // [{layername:"invest",data:[....]},{layername:"baords",data:[.....]}]
    let res = [];
    if (resContent?.length) {
      resContent.forEach((item) => {
        //todo: make logic of filtering shown cards based on map extent (done)
        let shownData =
          (filteredData.bool &&
          isInvestableSitesChosen)
            ? item.data.filter((d) => {
                if (
                  filteredData.data?.includes(d.attributes.SITE_GEOSPATIAL_ID)
                )
                  return d;
              })
            : item.data;
        if (item.layername?.toLowerCase() === "invest_site_polygon") {
          shownData?.forEach((row) => {
            let card = {
              name: row.attributes.PARCEL_PLAN_NO
                ? row.attributes.PARCEL_PLAN_NO
                : "بدون",
              mun: row.attributes.MUNICIPALITY_NAME
                ? getDomainName(
                    item.layername,
                    "MUNICIPALITY_NAME",
                    row.attributes.MUNICIPALITY_NAME
                  )
                : "بدون",
              dist: row.attributes.DISTRICT_NAME
                ? getDomainName(
                    item.layername,
                    "DISTRICT_NAME",
                    row.attributes.DISTRICT_NAME
                  )
                : "بدون",
              layername: item.layername,
              feature: row,
            };
            res.push(card);
          });
        } else {
          shownData?.forEach((row) => {
            let card = {
              name: row.attributes.SITE_FIELD_SERIAL
                ? row.attributes.SITE_FIELD_SERIAL
                : "بدون",
              mun: row.attributes.MUNICIPALITY_NAME
                ? getDomainName(
                    item.layername,
                    "MUNICIPALITY_NAME",
                    row.attributes.MUNICIPALITY_NAME
                  )
                : "بدون",
              dist: row.attributes.DISTRICT_NAME
                ? getDomainName(
                    item.layername,
                    "DISTRICT_NAME",
                    row.attributes.DISTRICT_NAME
                  )
                : "بدون",
              layername: item.layername,
              feature: row,
            };
            res.push(card);
          });
        }
      });
    }
    setResult(res);
    let elements = getInfiniteScroll(res, limit, page)
    setPagintionList(elements);
  }, [
    props.tableContent?.result?.map((r) => r.data)?.flat()?.length,
    props.filteredTableSettingsIDs?.data?.length,
    props.routeName
  ]);


  useEffect(() => {
    if(result.length && paginationList.length <result.length){
    let elements = getInfiniteScroll(result,limit,page)
    setPagintionList(elements);
    }
  }, [page]);
 

  const getDomainName = (layername, fieldname, code) => {
    let fieldValue;
    layername = layername.toLocaleLowerCase();
    let domain = props.fields[layername].find(
      (field) => field.name == fieldname
    ).domain;
    //check if there is a domain or null
    if (domain) {
      domain = domain.codedValues;
      if (code)
        fieldValue = domain.find((domain) => domain.code === code)
          ? domain.find((domain) => domain.code === code).name
          : code;
      else fieldValue = "بدون";
    } else fieldValue = code;

    return fieldValue;
  };

  return (
    <div className="generalSearchResult">
      {paginationList.length ? (
        paginationList.map((r, index) => (
          <>
          <div key={index} className="generalSearchCard">
            <Row>
              <Col
                span={16}
                onClick={() => props.OpenResultdetails(r.feature, r.layername)}
              >
                <h5>رقم قطعة الأرض : {r.name}</h5>
                <p>
                  <span className="munSpan"> {r.mun}</span> -
                  <span className="distSpan">الحي: {r.dist}</span>
                </p>
              </Col>
              <Col span={8} style={{ margin: "auto", textAlign: "center" }}>
                <Tooltip title={"تكبير"} placement="top">
                  <button
                    className="tooltipButton"
                    onClick={() => {
                      props.zoomAction.action(r.feature, r.layername);
                      setTimeout(() => {
                        window.__map__.getLayer("zoomGraphicLayer").clear();
                      }, 3000);
                    }}
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

                <Tooltip title={"خرائط جوجل"} placement="top">
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
                </Tooltip>
              </Col>
            </Row>
          </div>
          {index === limit * page ? (
            <Waypoint onEnter={() => setPage(page + 1)} />
          ) : null}
          </>
        ))
      ) : props.filteredTableSettingsIDs?.bool &&
        !props.filteredTableSettingsIDs.data.length ? (
        <div style={{ textAlign: "center" }}>"لا يوجد نتائج "</div>
      ) : null}
    </div>
  );
}

const mapStateToProps = ({ mapUpdate }) => {
  return {
    tableContent: mapUpdate.tableSettings,
    fields: mapUpdate.fields,
    zoomAction: mapUpdate.tableSettings?.actions?.find(
      (f) => f.name === "zoom"
    ),
    goToGoogleAction: mapUpdate.tableSettings?.actions?.find(
      (f) => f.name === "OpenInGoogle"
    ),
    filteredTableSettingsIDs: mapUpdate.filteredTableSettingsIDs,
    user: mapUpdate.auth.user,
  };
};
export default connect(mapStateToProps)(SearchResultMenu);

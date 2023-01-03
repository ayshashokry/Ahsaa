import React, { useState, useRef, useEffect } from "react";
import { Pagination, ConfigProvider, Tooltip } from "antd";
import { connect } from "react-redux";
import { Table, Button } from "react-bootstrap";
import DownloadCSV from "./helpers/downloadCSV";
import * as _ from "lodash";
import { getLayerIndex, queryTask } from "../../common/mapviewer";
import moment from "moment-hijri";
import { notificationMessage } from "../../../helpers/utlis/notifications_Func";

function ShowingPriceTable(props) {
  //in case of search table click --> shownData contains feature, layername, name
  // const { shownData  } = props;
  const [shownData, setShowData] = useState([]);
  const [currentRows, setcurrentRows] = useState([]);
  const [tableDisplay, setTableDisplay] = useState("SearchRemarkSuggestion");
  const [pageNo, setpageNo] = useState(1);
  const [pageSize, setpageSize] = useState(10);
  const tblRef = useRef(null);
  const tableRef = useRef(null);

  const openTable = () => {
    setTableDisplay("SearchRemarkSuggestion");
  };
  const closeTable = () => {
    setTableDisplay("RemarkSuggestTableHidden");
  };
  const onChangePage = (pageNo, pageSize) => {
    setpageNo(pageNo);
    if (tableRef.current) tableRef.current.scrollTop = 0;
  };
  useEffect(() => {
    var layerIndex = getLayerIndex("TBL_PRICING");
    props.openLoader();
    queryTask({
      returnGeometry: true,
      url: `${window.__mapUrl__}/${layerIndex}`,
      outFields: columns,
      where: `SITE_GEOSPATIAL_ID=${props.selectedFeatures[0].attributes.SITE_GEOSPATIAL_ID}`,
      callbackResult: ({ features }) => {
        if (!features.length) {
          notificationMessage("لا توجد نتائج لعرض السعر", 5);
          var graphicLayer = window.__map__.getLayer("highLightGraphicLayer");
          if (graphicLayer.graphics) {
            graphicLayer.clear();
          }
          props.clearTableData();
          props.closeLoader();
          // props.disactivateSingleSelect();
          return;
        } else {
          setShowData(features);
          props.closeLoader();
        }
      },
    });
    return () => {
      setShowData([]);
      var graphicLayer = window.__map__.getLayer("highLightGraphicLayer");
          if (graphicLayer.graphics) {
            graphicLayer.clear();
          }
          props.clearTableData();
    };
  }, []);
  const headers = [
    "محضر التسعير",
    "تاريخ محضر لجنة تقييم السعر",
    "ملاحظات",
    "القيمة الإجمالية للإيجار السنوي (ريال سعودي)",
    "سعر المتر (ريال سعودي)",
  ];
  const columns = [
    "ATTACHMENT",
    "COMMITTEE_PRICING_DATE",
    "NOTES",
    "PRICE",
    "UNIT_PRICE",
  ];
  if (shownData.length)
    return (
      <div className={tableDisplay}>
        <Table
          striped
          id="emp"
          ref={tblRef}
          responsive
          onMouseLeave={props.clearLines}
        >
          <div className="tableHeaderIconsDiv">
            <Button onClick={props.zoomToAllInMap}>
              <Tooltip placement="topLeft" title={"تكبير إلي الكل"}>
                <i className="fas fa-expand-arrows-alt mx-3"></i>
              </Tooltip>
            </Button>
            <DownloadCSV
              dataSet={shownData.map((item) => item.attributes)}
              labels={headers}
              columns={columns}
              fields={props.fields}
            />
            <span className="resultsNumber">
              <span>عدد النتائج: </span>
              <span style={{ fontWeight: "bold" }}>{shownData.length}</span>
            </span>
            {tableDisplay == "RemarkSuggestTableHidden" ? (
              <i onClick={openTable} className="fas fa-arrow-up tableArrow"></i>
            ) : (
              <i
                onClick={closeTable}
                className="fas fa-arrow-down tableArrow"
              ></i>
            )}
            {/* <i
            onClick={() => {
              props.goBack();
            }}
            className="fas fa-arrow-left tableArrow"
          ></i> */}
          </div>
          <thead>
            <tr className="resultsHeader">
              {headers.map((h, hIndex) => (
                <th key={hIndex}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody ref={tableRef}>
            {shownData.length ? (
              shownData.map((feature, i) => {
                return (
                  <>
                    <tr key={i}>
                      {columns.map((c, ic) => (
                        <td key={ic}>
                          {!["ATTACHMENT", "COMMITTEE_PRICING_DATE"].includes(
                            c
                          ) ? (
                            feature.attributes[c]?feature.attributes[c]:"بدون"
                          ) : c === "ATTACHMENT" ? (
                            <a
                              href={
                                window.API_FILES_URL + feature.attributes[c]
                              }
                              target="_blank" 
                            >
                              عرض
                            </a>
                          ) : c === "COMMITTEE_PRICING_DATE" ? (
                            moment(feature.attributes[c]).format("iYYYY/iM/iD")
                          ) : (
                            "لا يوجد"
                          )}
                        </td>
                      ))}
                    </tr>
                  </>
                );
              })
            ) : (
              <div style={{ textAlign: "center" }} className="m-5">
                <h5> لا يوجد بيانات للعرض</h5>
              </div>
            )}
            {shownData.length && (
              <ConfigProvider direction="ltr">
                <Pagination
                  className="tablePagination pt-3"
                  total={shownData.length ? shownData.length : 1}
                  defaultCurrent={1}
                  pageSize={pageSize}
                  onChange={onChangePage}
                  current={pageNo}
                />
              </ConfigProvider>
            )}
          </tbody>
        </Table>
      </div>
    );
  else return null;
}
const mapStateToProps = ({ mapUpdate }) => {
  const { tableSettings, currentUser, fields, selectedFeatures } = mapUpdate;
  return {
    tableSettings,
    currentUser,
    fields,
    selectedFeatures,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    clearTableData: () => dispatch({ type: "CLEAR_SELECTED" }),
    disactivateSingleSelect: () =>
      dispatch({ type: "DIACTIVATE_SINGLE_SELECT" }),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(ShowingPriceTable);

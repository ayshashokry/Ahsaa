import React, { useState } from "react";
// import { Pagination, ConfigProvider } from "antd";
import { connect } from "react-redux";
import { Table } from "react-bootstrap";
import * as _ from "lodash";
import { useEffect } from "react";

import DownloadCSV from "./ExportCSVComp/downloadCSVSuggestNotes";
function RemarksSuggestionTab(props) {
  //in case of search table click --> shownData contains feature, layername, name
  const { selectedFeatureOnSearchTable, tabName } = props;
  const [shownData, setShownData] = useState([]);
  useEffect(() => {
    if (
      selectedFeatureOnSearchTable?.feature &&
      ["showAllsuggestions", "showAllremarks"].includes(tabName)
    ) {
      setShownData(selectedFeatureOnSearchTable?.feature);
    } else setShownData([]);
  }, [selectedFeatureOnSearchTable]);
  const headers =
    selectedFeatureOnSearchTable &&
    selectedFeatureOnSearchTable.name == "showAllsuggestions"
      ? [
          "الاسم",
          "رقم الجوال",
          "البريد الالكتروني",
          "الاقتراح الأول",
          "الاقتراح الثاني",
          "الاقتراح الثالث",
          "تفاصيل الملاحظة",
          "تاريخ الملاحظة",
        ]
      : selectedFeatureOnSearchTable
      ? [
          "الاسم",
          "رقم الجوال",
          "البريد الالكتروني",
          "نوع الملاحظة",
          "تفاصيل الملاحظة",
          "المرفق",
          "تاريخ الملاحظة",
        ]
      : [];
  let columns =
    selectedFeatureOnSearchTable &&
    selectedFeatureOnSearchTable.name == "showAllsuggestions"
      ? [
          "public_user_name",
          "phone",
          "email",
          "suggestion_type",
          "suggestion_type1",
          "suggestion_type2",
          "remarks",
          "create_at",
        ]
      : selectedFeatureOnSearchTable
      ? [
          "use_name",
          "use_phone",
          "use_email",
          "remark_type",
          "remark_details",
          "remark_image",
          "create_at",
        ]
      : [];
  if (selectedFeatureOnSearchTable)
    return (
      <>
       {shownData.length?
            <div style={{display:'flex', justifyContent:'space-between'}}>  
            <div style={{display:'flex', alignItems:'center'}}>
            <DownloadCSV 
            tabName={tabName}
             labels={headers}
             columns={columns} 
          dataSet={shownData.map((item) => item)} />
            </div>
            <div>
            <span className="resultsNumber">
              <span>عدد النتائج: </span>
              <span style={{ fontWeight: "bold" }}>{shownData.length}</span>
            </span>
            </div>

            </div>:null}
            <Table striped responsive hover className="mt-2">
        <tbody>
          {shownData.length ? (
            shownData.map((feature, i) => {
              // let reminder = i%2==0?'solid':""
              return (
                <>
                  {columns.map((c, ic) => (
                    <tr
                      key={i}
                      style={{ borderBottom: c == "create_at" ? "solid" : "" }}
                    >
                      <td key={ic}>
                        {(c == "suggestion_type" && feature[c]) ||
                        (c == "suggestion_type1" && feature[c]) ||
                        (c == "suggestion_type2" && feature[c]) ? (
                          feature[c].name
                        ) : feature[c] ? (
                          c === "remark_image" ? (
                            <a
                              href={window.API_FILES_URL + feature[c][0].path}
                              target="_blank"
                            >
                              عرض
                            </a>
                          ) : c === "remark_type" && feature[c] ? (
                            feature[c].name
                          ) : (
                            feature[c]
                          )
                        ) : (
                          "لا يوجد"
                        )}
                      </td>
                      <th>{headers[ic]}</th>
                    </tr>
                  ))}
                </>
              );
            })
          ) : (
            <div style={{ textAlign: "center" }} className="m-5">
              <h5>
                {" "}
                لا يوجد
                {selectedFeatureOnSearchTable.name === "showAllsuggestions"
                  ? "مقترحات"
                  : "ملاحظات"}{" "}
                للعرض
              </h5>
            </div>
          )}
        </tbody>
        </Table>
      </>
    );
  else
    return (
      <div style={{ textAlign: "center" }} className="m-5">
        <h5>لا يوجد بيانات للعرض</h5>
      </div>
    );
}
const mapStateToProps = ({ mapUpdate }) => {
  const { tableSettings, currentUser, fields, selectedFeatureOnSearchTable } =
    mapUpdate;
  return {
    tableSettings,
    currentUser,
    fields,
    selectedFeatureOnSearchTable,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    clearTableData: () => dispatch({ type: "CLOSE_TABLE_ICON_MODAL" }),
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RemarksSuggestionTab);

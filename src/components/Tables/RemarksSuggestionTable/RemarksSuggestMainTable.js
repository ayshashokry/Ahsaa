import React, { useState, useRef } from "react";
import { Pagination, ConfigProvider } from "antd";
import { connect } from "react-redux";
import { Table } from "react-bootstrap";
import DownloadCSV from "./helpers/downloadCSVSuggestNotes";
import * as _ from "lodash";

function RemarksSuggestMainTable(props) {
  //in case of search table click --> shownData contains feature, layername, name
  // const { shownData  } = props;
  const [shownData, setShowData] = useState(() => {
    if (props.selectedFeatureOnSearchTable && props.selectedFeatureOnSearchTable.feature.length) {
      return props.selectedFeatureOnSearchTable.feature;
    } else return [];
  });
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

  const headers =
    props.selectedFeatureOnSearchTable?.name == "showAllsuggestions"
      ? [
        "تاريخ الملاحظة",
        "تفاصيل الملاحظة",
        "الاقتراح الثالث",
        "الاقتراح الثاني",
        "الاقتراح الأول",
        "البريد الالكتروني",
        "رقم الجوال",
          "الاسم",
        ]
      : props.selectedFeatureOnSearchTable?[
        "تاريخ الملاحظة",
        "المرفق",
        "تفاصيل الملاحظة",
        "البريد الالكتروني",
        "رقم الجوال",
          "الاسم",
        ]:[];
  let columns =
    props.selectedFeatureOnSearchTable?.name == "showAllsuggestions"
    ? [
        "create_at",
        "remarks",
        "suggestion_type2",
        "suggestion_type1",
        "suggestion_type",
        "email",
        "phone",
        "public_user_name",
        ]
      : props.selectedFeatureOnSearchTable?[
        "create_at",
        "remark_image",
        "remark_details", 
        "use_email", 
        "use_phone", 
        "use_name", 
      ]:[];
      if(props.selectedFeatureOnSearchTable)
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
          {/* <Button onClick={props.zoomToAllInMap}>
            <Tooltip placement="topLeft" title={"تكبير إلي الكل"}>
              <i className="fas fa-expand-arrows-alt mx-3"></i>
            </Tooltip>
          </Button> */}
          <DownloadCSV fields={props.fields}
             labels={headers}
             columns={columns} 
          dataSet={shownData.map((item) => item)} />
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
          <i
            onClick={() => {
              props.goBack();
            }}
            className="fas fa-arrow-left tableArrow"
          ></i>
        </div>
        <thead>
          <tr className="resultsHeader">
          
              {headers.map((c, ci) => (
                <th key={ci} id={c} >
                  {c}
                </th>
              ))}
            </tr>
         
       
        </thead>
        <tbody ref={tableRef}>
          {shownData.length?shownData.map((feature, i) => {
            return (
              <>
              <tr key={i}>
                {columns.map((c, ic) => (
                  <td key={ic}>
                    {(c=="suggestion_type"&&feature[c])||
                    (c=="suggestion_type1"&&feature[c])||
                    (c=="suggestion_type2"&&feature[c])?
                    feature[c].name :
                    feature[c]?
                    c === "remark_image" ? (
                      <a
                        href={
                          window.API_FILES_URL + feature[c][0].path
                        }
                        target="_blank" 
                      >
                        عرض
                      </a>
                    ) :
                    c==="remark_type"&&feature[c]?(
                      feature[c].name
                    ):
                    feature[c]
                    :"لا يوجد"}
                  </td>
                ))}
              </tr>
             
              </>
            );
          }):(
            <div style={{textAlign:'center'}} className="m-5">
              <h5> لا يوجد 
            {props.selectedFeatureOnSearchTable.name === "showAllsuggestions"
            ? "مقترحات"
            : "ملاحظات"} للعرض 
            </h5>
            </div>
          )}
          {shownData.length&&(
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
)(RemarksSuggestMainTable);
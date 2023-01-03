import React, { useState, useRef, useEffect, Fragment } from "react";
import { Pagination, ConfigProvider, Tooltip } from "antd";
import { connect } from "react-redux";
import { Table, Button } from "react-bootstrap";
import DownloadCSV from "./helpers/downloadCSVSearchTable";
import * as _ from "lodash";
import RemarksSuggestMainTable from "./RemarksSuggestMainTable"
function RemarksSuggestionsSearch(props) {
  const [tableDisplay, setTableDisplay] = useState("SearchRemarkSuggestion");
  const [show, setShow] = useState(false);
  const [allDataResult, setAllDataResult] = useState([]);
  const [currentRows, setcurrentRows] = useState([]);
  const [pageNo, setpageNo] = useState(1);
  const [pageSize, setpageSize] = useState(10);

  const tblRef = useRef(null);
  const tableRef = useRef(null);
  let  { result, columns, actions } = props.tableSettings;
  useEffect(() => {
    console.info(props);
    //all data from server
    let allDataResult = result.reduce((a, b) => {
      let newData = b.data.map((item) => {
        return { ...item, layername: b.layername };
      });
      return _.concat(a, newData);
    }, []);

    // props.checkIsItNewDataFromSearch(allDataResult);
    // //pagination part
    let indexOfLastRowInPage = pageNo * pageSize;
    let indexOfStartRowInPage = indexOfLastRowInPage - pageSize;
    //data that will be displayed in current page
    let currentRows = allDataResult.slice(
      indexOfStartRowInPage,
      indexOfLastRowInPage
    );
    setAllDataResult(allDataResult);
    setcurrentRows(currentRows);
    //fetch the suggestions or remarks
  }, [props.tableSettings]);
  const getDomainName = (layername, fieldname, code) => {
    let fieldValue;
    layername = layername.toLocaleLowerCase();

    let domain = props.fields[layername].find(
      (field) => field.name == fieldname
    ).domain;
    //check if there is a domain or null
    if (domain) {
      domain = domain.codedValues;
      if (code) fieldValue = domain.find((domain) => domain.code === code)?
      domain.find((domain) => domain.code === code).name:code;
      else fieldValue = "بدون";
    } else fieldValue = code;

    return fieldValue;
  };
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
  if (!props.tableSettings) return <Fragment></Fragment>;
  if(show) return <RemarksSuggestMainTable 
  printSuggestionReport={props.printSuggestionReport}
  goBack={()=>setShow(false)}
  />
  else return (
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
          <DownloadCSV
          fileName={props.routeName==='suggestionsFromFeasibility'?"suggestionsResult":"remarksResult"} 
          fields={props.fields}
          dataSet={allDataResult.map((item) => item.attributes)} />
          <span className="resultsNumber">
            <span>عدد النتائج: </span>
            <span style={{ fontWeight: "bold" }}>{allDataResult.length}</span>
          </span>
          {tableDisplay == "RemarkSuggestTableHidden" ? (
            <i onClick={openTable} className="fas fa-arrow-up tableArrow"></i>
          ) : (
            <i
              onClick={closeTable}
              className="fas fa-arrow-down tableArrow"
            ></i>
          )}
        </div>
        <thead>
          <tr className="resultsHeader">
            {actions && actions.length > 0 && <th className="actionTH"></th>}
            {columns &&
              columns.map((c, ci) =>
                props.currentUser !== "Employee" &&
                c.name === "SITE_AREA" ? null : (
                  <th key={ci} id={c.name}>
                    {c.alias}
                  </th>
                )
              )}
          </tr>
        </thead>
        <tbody ref={tableRef}>
          {
            // result.map((resultSet) => {
            //   const { layername, data } = resultSet;
            //   return data.map((feature, i) => {
            currentRows.map((feature, i) => {
              return (
                <tr
                  key={i}
                  // onMouseOver={this.drawLineWithZoom.bind(this, feature)}
                >
                  <td
                    className="actionTD"
                    //</tr>onMouseOver={this.clearLines.bind(this)}
                  >
                    <span>
                      {actions.map((func, ix) => {
                        if  (typeof func.name=="function"&&
                        ["showAllsuggestions", "showAllremarks"].includes(
                          func.name(feature)
                        )
                      ) {
                          return (
                            <Tooltip
                              key={ix}
                              placement="topLeft"
                              title={
                                typeof func.alias == "string"
                                  ? func.alias
                                  : func.alias(feature)
                              }
                            >
                              <Button
                                onClick={() => {
                                  setShow(true)
                                  func.action(feature, feature.layername);
                                  // this.setState({currentWizard: func.name})
                                }}
                              >
                                {func.icon}
                              </Button>
                            </Tooltip>
                          );
                        }
                        else if (
                          func.canRender &&
                          func.canRender(feature, feature.layername)
                        ) {
                          return (
                            <Tooltip
                              key={ix}
                              placement="topLeft"
                              title={
                                typeof func.alias == "string"
                                  ? func.alias
                                  : func.alias(feature)
                              }
                            >
                              <Button
                                onClick={() =>
                                  func.action(feature, feature.layername)
                                }
                              >
                                {func.icon}
                              </Button>
                            </Tooltip>
                          );
                        } 
                        return <Fragment key={ix}></Fragment>;
                      })}
                    </span>
                  </td>
                  {columns &&
                    columns.map((c, ic) =>
                      // hide area for users rather than employee
                      props.currentUser !== "Employee" &&
                      c.name === "SITE_AREA" ? null : (
                        <td key={ic}>
                          {!feature.attributes[c.name] ||
                          feature.attributes[c.name]
                            .toString()
                            .toLowerCase() === "null" ||
                          feature.attributes[c.name]
                            .toString()
                            .toLowerCase() === "<null>" ||
                          feature.attributes[c.name].toString().trim() == ""
                            ? "بدون"
                            : c.name == "SITE_AREA"
                            ? parseFloat(feature.attributes[c.name]).toFixed(2)
                            : // feature.attributes[c.name]
                              getDomainName(
                                feature.layername,
                                c.name,
                                feature.attributes[c.name]
                              )}
                        </td>
                      )
                    )}
                </tr>
              );
            })
            //  })
          }

          <ConfigProvider direction="ltr">
            <Pagination
              className="tablePagination pt-3"
              total={allDataResult.length ? allDataResult.length : 1}
              defaultCurrent={1}
              pageSize={pageSize}
              onChange={onChangePage}
              current={pageNo}
            />
          </ConfigProvider>
        </tbody>
      </Table>
    </div>
  );
}
const mapStateToProps = ({ mapUpdate }) => {
  const {tableSettings,
    currentUser,
    fields,} = mapUpdate;
  return {
    tableSettings,
    currentUser,
    fields,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    sortTableData: (data) => dispatch({ type: "RESULT_TABLE_DATA_SET", data }),
    clearTableData: () => dispatch({ type: "CLEAR_RESULT_TABLE_DATA_SET" }),
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RemarksSuggestionsSearch);

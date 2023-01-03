import React, { Component, Fragment } from "react";
import { Table, Button } from "react-bootstrap";
import { Pagination, ConfigProvider, Tooltip } from "antd";
// import ReactHTMLTableToExcel from "react-html-table-to-excel";
import { connect } from "react-redux";
import * as _ from "lodash";
import DownloadCSV from "./RemarksSuggestionTable/helpers/downloadCSVSearchTable";
import {
  exportCADFile,
  highlightFeature,
  LoadModules,
  zoomToLayer,
} from "../common/mapviewer";
import RemarksSuggestMainTable from "./RemarksSuggestionTable/RemarksSuggestMainTable";
import EXPORTCADIcon from "../../assets/images/icons8-dwg-24.png"
import { notificationMessage } from "../../helpers/utlis/notifications_Func";

class SearchResultTable extends Component {
  constructor(props) {
    super(props);
    this.tblRef = React.createRef();
    this.state = {
      locationModalShow: null,
      tableDisplay: "SearchTableShown",
      // currentWizard:"search",
      resultData: [],
      pageNo: 1,
      pageSize: 10,
      totalNoOfData: 0,
      show: false ,
    };
    this.exportCadRef = React.createRef();
    this.tableRef = React.createRef();
  }
  openLocationModal = (id) => {
    this.setState({ locationModalShow: id });
  };
  closeLocationModal = () => {
    this.setState({ locationModalShow: null });
  };
  sortAscending = (e) => {};
  openTable = (e) => {
    this.setState({ tableDisplay: "SearchTableShown" });
  };
  closeTable = (e) => {
    this.setState({ tableDisplay: "SearchTableHidden" });
  };
  sortAlpha = (e) => {
    //element -> clicked dom element
    let element = e.target;
    const { tableSettings } = this.props;
    const { result } = tableSettings;
    let resultCopy = [...result];
    let resultData; //this is the final result after sorting
    if (element.id) {
      //map on the current table data -> resultCopy for sorting
      resultData = resultCopy.map((layer) => {
        let layerCopy = { ...layer };
        layerCopy.data = layerCopy.data.sort((a, b) => {
          //sorting based on the clicked column head
          if (e.target.id == "MUNICIPALITY_NAME") {
            return new Intl.Collator("ar").compare(
              a.attributes.MUNICIPALITY_NAME,
              b.attributes.MUNICIPALITY_NAME
            );
          }
          if (e.target.id == "SITE_STATUS") {
            return new Intl.Collator("ar").compare(
              a.attributes.SITE_STATUS,
              b.attributes.SITE_STATUS
            );
          }
          if (e.target.id == "SITE_SUBTYPE") {
            return new Intl.Collator("ar").compare(
              a.attributes.SITE_SUBTYPE,
              b.attributes.SITE_SUBTYPE
            );
          }
          if (e.target.id == "STREET_NAME") {
            return new Intl.Collator("ar").compare(
              a.attributes.STREET_NAME,
              b.attributes.STREET_NAME
            );
          }
          if (e.target.id == "SITE_COMMON_USE") {
            return new Intl.Collator("ar").compare(
              a.attributes.SITE_COMMON_USE,
              b.attributes.SITE_COMMON_USE
            );
          }
          if (e.target.id == "PLAN_NO") {
            return new Intl.Collator("ar").compare(
              a.attributes.PLAN_NO,
              b.attributes.PLAN_NO
            );
          }
          if (e.target.id == "SITE_AREA") {
            return a.attributes['SITE_AREA'] - b.attributes['SITE_AREA'];
          }
          if (e.target.id == "PARCEL_PLAN_NO") {
            return new Intl.Collator("ar").compare(
              a.attributes.PARCEL_PLAN_NO,
              b.attributes.PARCEL_PLAN_NO
            );
          }
        });
        //check if clicked dom element has class -> ascending --> this means the req. sorting is descending
        if (element.classList.contains("ascending")) {
          return { ...layerCopy, data: layerCopy.data.reverse() };
        }
        //else clicked dom element has no class -> ascending --> this means the req. sorting is ascending
        else {
          return { ...layerCopy, data: layerCopy.data };
        }
      });

      if (element.classList.contains("ascending")) {
        element.classList.remove("ascending");
      } else element.classList.add("ascending");
      //push the sorted data to redux
      this.props.sortTableData({
        ...tableSettings,
        result: resultData,
      });
    }
  };
  onChangePage = (pageNo, pageSize) => {
    this.setState({ pageNo: pageNo });
    if (this.tableRef.current) this.tableRef.current.scrollTop = 0;
  };

  // handle reset the page no. after each new search
  checkIsItNewDataFromSearch(allDataResult) {
    if (
      this.state.totalNoOfData &&
      this.state.totalNoOfData != allDataResult.length
    )
      this.onNewSearch("change", allDataResult.length);
    else if (!this.state.totalNoOfData && allDataResult.length)
      this.onNewSearch("firstTime", allDataResult.length);
  }
  onNewSearch(action, totalNo) {
    if (action === "firstTime")
      this.setState({ totalNoOfData: totalNo, pageNo: 1 });
    else {
      this.setState({ pageNo: 1, totalNoOfData: totalNo });
      this.onChangePage(1, null);
    }
  }
  componentWillUnmount() {
    console.log("will unmount");
    this.props.clearTableData();
  }
  getDomainName = (layername, fieldname, code) => {
    let fieldValue;
    layername = layername.toLocaleLowerCase();

    let domain = this.props.fields[layername].find(
      (field) => field.name == fieldname
    ).domain;
    //check if there is a domain or null
    if (domain) {
      domain = domain.codedValues;
      if (code) fieldValue = domain.find((domain) => domain.code === code)?
                              domain.find((domain) => domain.code === code).name:
                              code;
      else fieldValue = "بدون";
    } else fieldValue = code;

    return fieldValue;
  };
  zoomToAllInMap() {
    window.__map__.getLayer("zoomGraphicLayer").clear();
    if(this.props.showingDetailsViaMap) 
    zoomToLayer("highLightGraphicLayer", window.__map__, 50);
else zoomToLayer("searchGraphicLayer", window.__map__, 3);
    //zoomGraphicLayer
  }
  clearDrawerLine(fromHeader) {
    var canvas = document.getElementById("myCanvas");
    var context = canvas.getContext("2d");
    // cancelRequestAnimFrame()
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }

  drawLine(feature, event) {
    let e = {
      clientX: event.clientX,
      clientY: event.clientY,
    };

    // draw(feature, $event)
    LoadModules(["esri/geometry/screenUtils"]).then(([screenUtils]) => {
      var canvas = document.getElementById("myCanvas");
      var context = canvas.getContext("2d");
      let mapContainer = document.getElementById("page-wrap");
      mapContainer.style = "transform: none";
      context.canvas.width = window.innerWidth;
      context.canvas.height = window.innerHeight;
      context.clearRect(0, 0, canvas.width, canvas.height);

      var point;

      if (feature.geometry) {
        if (feature.geometry.type == "point") {
          point = screenUtils.toScreenPoint(
            window.__map__.extent,
            window.__map__.width,
            window.__map__.height,
            feature.geometry
          );
        } else {
          point = screenUtils.toScreenPoint(
            window.__map__.extent,
            window.__map__.width,
            window.__map__.height,
            feature.geometry.getExtent().getCenter()
          );
        }
        console.log(
          point.x,
          this.props.openMenu
            ? window.innerWidth - window.innerWidth * 0.2
            : window.innerWidth
        );
        console.log(
          point.y,
          window.innerHeight - this.tblRef.current.offsetHeight
        );
        let widthCheck = this.props.openMenu
          ? parseFloat(window.innerWidth - window.innerWidth * 0.2)
          : window.innerWidth;
        console.log(widthCheck);

        if (
          !(
            point.x < 0 ||
            point.y < 0 ||
            point.x > widthCheck ||
            point.y >
              window.innerHeight - (this.tblRef.current.offsetHeight + 35)
          )
        ) {
          context.moveTo(point.x, point.y + 50);
          context.lineTo(e.clientX, e.clientY);
          context.lineWidth = 1.5;
          var color = "#212121";
          context.strokeStyle = color;
          context.stroke();
          context.beginPath();
          context.strokeStyle = color;
          context.arc(point.x, point.y + 50, 3, 0, 2 * Math.PI, true);
          context.fill();
        }
      }
    });
  }

  drawLineWithZoom(feature, event) {
    this.drawLine(feature, event);
    highlightFeature(feature, window.__map__, {
      isZoom: false,
      layerName: "graphicLayer_Draw_Pointer_ToSites",
      isHiglightSymbol: true,
    });
  }

  clearLines() {
    this.clearDrawerLine(true);
    window.__map__.getLayer("graphicLayer_Draw_Pointer_ToSites").clear();
  }
  //for go back in remarks - suggestions table to this current table
  handleBackBtn (){
    this.setState({
       show: false ,
      tableDisplay:"SearchTableShown"
    })
  }
  handleExportCadFile(){
    const { tableSettings, filteredTableSettingsIDs } = this.props;
    this.props.openLoader()
    let self = this;
    let geoIDs = filteredTableSettingsIDs.bool?
    filteredTableSettingsIDs.data
    :tableSettings.result.flatMap(feat=>feat.data).map(f=>`SITE_GEOSPATIAL_ID= ${f.attributes.SITE_GEOSPATIAL_ID} `);
    let url = window.__GP_EXPORT_CAD_FILE__;
    let whereClause = `[{"AHSA.INVEST_SITE_POLYGON":"${(geoIDs.join(" or "))}"}]`
    let params = {
      //Filters:[{"AHSA.INVEST_SITE_POLYGON":"SITE_GEOSPATIAL_ID= 4.9465742540651E13"}]
      Filters:whereClause,
      FileType:"CAD"
    }
    function callBackAfterExportCAD(result){
      console.log(result);
      self.exportCadRef.current.href = window.API_FILES_URL+result;
      self.exportCadRef.current.click()
      //notification with it is succeeded
      notificationMessage("جاري تحميل ملف الكاد",5)
      self.props.closeLoader()
    }
    function callbackError(err){
      console.log(err);
      //notification with something error happened
      notificationMessage("حدث خطأ برجاء المحاولة مرة أخرى",5)
      self.props.closeLoader()

    }
    console.log(whereClause);
    
    exportCADFile(url, params,callBackAfterExportCAD, callbackError)
  }
  render() {
    const { tableSettings } = this.props;
    if (!tableSettings) return <Fragment></Fragment>;
    const { result, columns, actions } = tableSettings;

    //all data from server
    let allDataResult = result.reduce((a, b) => {
      let newData = b.data.map((item) => {
        return { ...item, layername: b.layername };
      });
      return _.concat(a, newData);
    }, []);

    // this.checkIsItNewDataFromSearch(allDataResult);
    // console.log(allDataResult);
    //pagination part
    // let indexOfLastRowInPage = this.state.pageNo * this.state.pageSize;
    // let indexOfStartRowInPage = indexOfLastRowInPage - this.state.pageSize;
    // //data that will be displayed in current page
    // let currentRows = allDataResult.slice(
    //   indexOfStartRowInPage,
    //   indexOfLastRowInPage
    // );
    //if show = true --> will open remarks - suggestions table
    // if (this.state.show)
    //   return (
    //     <RemarksSuggestMainTable
    //       goBack={this.handleBackBtn.bind(this)}
    //     />
    //   );
    return (
      allDataResult.map((feature, i) => { return columns.map((c, ic) =>
      // hide area for users rather than employee
      this.props.currentUser !== "Employee" &&
      c.name === "SITE_AREA" ? null : (
        <tr
        key={i}
  >    
        <td
          key={ic}
          // onMouseOver={this.drawLineWithZoom.bind(
          //   this,
          //   feature
          // )}
        >
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
              this.getDomainName(
                feature.layername,
                c.name,
                feature.attributes[c.name]
              )}
        </td>
      
  <th key={ic} id={c.name}>
    {c.alias}

        </th>
      </tr>)
      )
    }
    ))
    // return (
    //   <div className={this.state.tableDisplay}>
    //     <Table
    //       striped
    //       id="emp"
    //       ref={this.tblRef}
    //       responsive
    //       onMouseLeave={this.clearLines.bind(this)}
    //     >
    //       <div className="tableHeaderIconsDiv">
    //         <Button onClick={this.zoomToAllInMap.bind(this)}>
    //           <Tooltip placement="topLeft" title={"تكبير إلي الكل"}>
    //             <i className="fas fa-expand-arrows-alt mx-3"></i>
    //           </Tooltip>
    //         </Button>
    //             <a style={{display:'none'}} download ref={this.exportCadRef}></a>
    //         {this.props.tableSettings&&this.props.tableSettings.result.length&&
    //         this.props.tableSettings.result.find(r=>r.layername.toLocaleLowerCase()==="invest_site_polygon")&&
    //         <Button onClick={this.handleExportCadFile.bind(this)}>
    //           <Tooltip placement="topLeft" title={"استخراج ملف الكاد"}>
    //             <img src={EXPORTCADIcon} alt="export cad file" width={30} height={30} />
    //           </Tooltip>
    //         </Button>}
    //         <DownloadCSV
    //           dataSet={allDataResult.map((item) => item.attributes)}
    //           fields={this.props.fields}
    //         />
    //         <span className="resultsNumber">
    //           <span>عدد النتائج: </span>
    //           <span style={{ fontWeight: "bold" }}>{allDataResult.length}</span>
    //         </span>
    //         {this.state.tableDisplay == "SearchTableHidden" ? (
    //           <i
    //             onClick={this.openTable}
    //             className="fas fa-arrow-up tableArrow"
    //           ></i>
    //         ) : (
    //           <i
    //             onClick={this.closeTable}
    //             className="fas fa-arrow-down tableArrow"
    //           ></i>
    //         )}
    //       </div>
    //       <thead>
    //         <tr className="resultsHeader">
    //           {actions.length > 0 && <th className="actionTH"></th>}
    //           {columns.map((c, ci) =>
    //             this.props.currentUser !== "Employee" &&
    //             c.name === "SITE_AREA" ? null : (
    //               <th key={ci} id={c.name} onClick={this.sortAlpha}>
    //                 {c.alias}
    //               </th>
    //             )
    //           )}
    //         </tr>
    //       </thead>
    //       <tbody ref={this.tableRef}>
    //         {
    //           currentRows.map((feature, i) => {
    //             return (
    //               <tr
    //                 key={i}
    //               >
    //                 <td
    //                   className="actionTD"
    //                   onMouseOver={this.clearLines.bind(this)}
    //                 >
    //                   <span>
    //                     {actions.map((func, ix) => {
    //                       if (
    //                         typeof func.name == "function" && 
    //                         feature.layername.toLocaleLowerCase()==="invest_site_polygon"&&
    //                         ["showAllsuggestions", "showAllremarks"].includes(
    //                           func.name(feature)
    //                         )
    //                       ) {
    //                         return (
    //                           <Tooltip
    //                             key={ix}
    //                             placement="topLeft"
    //                             title={
    //                               typeof func.alias == "string"
    //                                 ? func.alias
    //                                 : func.alias(feature)
    //                             }
    //                           >
    //                             <Button
    //                               onClick={() => {
    //                                 func.action(feature, feature.layername).then((res)=>{
    //                                   if(res)
    //                                   this.setState({
    //                                      show: true
    //                                     });
    //                                   })
    //                               }}
    //                             >
    //                               {func.icon}
    //                             </Button>
    //                           </Tooltip>
    //                         );
    //                       } else if (
    //                         func.canRender &&
    //                         func.canRender(feature, feature.layername)
    //                       ) {
    //                         return (
    //                           <Tooltip
    //                             key={ix}
    //                             placement="topLeft"
    //                             title={
    //                               typeof func.alias == "string"
    //                                 ? func.alias
    //                                 : func.alias(feature)
    //                             }
    //                           >
    //                             <Button
    //                               onClick={() =>
    //                                 func.action(feature, feature.layername)
    //                               }
    //                             >
    //                               {func.icon}
    //                             </Button>
    //                           </Tooltip>
    //                         );
    //                       }
    //                       return <Fragment key={ix}></Fragment>;
    //                     })}
                     
    //                   </span>
    //                 </td>
    //                 {columns.map((c, ic) =>
    //                   // hide area for users rather than employee
    //                   this.props.currentUser !== "Employee" &&
    //                   c.name === "SITE_AREA" ? null : (
    //                     <td
    //                       key={ic}
    //                       onMouseOver={this.drawLineWithZoom.bind(
    //                         this,
    //                         feature
    //                       )}
    //                     >
    //                       {!feature.attributes[c.name] ||
    //                       feature.attributes[c.name]
    //                         .toString()
    //                         .toLowerCase() === "null" ||
    //                       feature.attributes[c.name]
    //                         .toString()
    //                         .toLowerCase() === "<null>" ||
    //                       feature.attributes[c.name].toString().trim() == ""
    //                         ? "بدون"
    //                         : c.name == "SITE_AREA"
    //                         ? parseFloat(feature.attributes[c.name]).toFixed(2)
    //                         : // feature.attributes[c.name]
    //                           this.getDomainName(
    //                             feature.layername,
    //                             c.name,
    //                             feature.attributes[c.name]
    //                           )}
    //                     </td>
    //                   )
    //                 )}
    //               </tr>
    //             );
    //           })
    //           //  })
    //         }

    //         <ConfigProvider direction="ltr">
    //           <Pagination
    //             className="tablePagination pt-3"
    //             total={allDataResult.length ? allDataResult.length : 1}
    //             defaultCurrent={1}
    //             pageSize={this.state.pageSize}
    //             onChange={this.onChangePage}
    //             current={this.state.pageNo}
    //           />
    //         </ConfigProvider>
    //       </tbody>
    //     </Table>
    //   </div>
    // );
  }
}

const mapStateToProps = ({ mapUpdate }) => {
  const { tableSettings, currentUser, fields, filteredTableSettingsIDs } = mapUpdate;
  return {
    tableSettings,
    currentUser,
    fields,
    filteredTableSettingsIDs
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    sortTableData: (data) => dispatch({ type: "RESULT_TABLE_DATA_SET", data }),
    clearTableData: () => dispatch({ type: "CLEAR_RESULT_TABLE_DATA_SET" }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchResultTable);

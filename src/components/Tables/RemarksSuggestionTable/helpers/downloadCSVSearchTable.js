import React from "react";
import ReactExport from "react-export-excel";
import { Tooltip } from "antd";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

class DownloadCSV extends React.Component {
  render() {
    let {fields,filteredTableSettingsIDs,fileName}= this.props;
    let dataSet = [...this.props.dataSet];
    if(filteredTableSettingsIDs?.bool&&filteredTableSettingsIDs?.data?.length){
      dataSet = dataSet.filter(item=>[...filteredTableSettingsIDs.data].includes(item.SITE_GEOSPATIAL_ID));
    }
    return (
      <ExcelFile
        filename={fileName?fileName:"SearchResult"}
        element={
          <div style={{marginLeft:'1em'}} >
            <Tooltip placement="topLeft" title={"استخراج CSV"}>
              <i className="fas fa-file-export fa-lg"></i>
            </Tooltip>
          </div>
        }
      >
        <ExcelSheet data={dataSet} name="SearchResult">
          <ExcelColumn
            label="البلدية"
            value={(col) =>
              col.MUNICIPALITY_NAME ? 
              fields["invest_site_polygon"].find((field) => field.name == "MUNICIPALITY_NAME")
              .domain.codedValues.find(c=>c.code===col.MUNICIPALITY_NAME).name : "بدون"
            }
          />
           <ExcelColumn
            label="الحي"
            value={(col) =>
              col.DISTRICT_NAME ? 
              fields["invest_site_polygon"].find((field) => field.name == "DISTRICT_NAME")
              .domain.codedValues.find(c=>c.code===col.DISTRICT_NAME).name : "بدون"
            }
          />
          <ExcelColumn
            label="رقم المخطط"
            value={(col) => (col.PLAN_NO &&!["","<Null>","<NULL>"].includes(col.PLAN_NO)?
            col.PLAN_NO : "بدون")}
          />
          <ExcelColumn
            label="رقم قطعة الارض"
            value={(col) => (col.PARCEL_PLAN_NO&&!["","<Null>","<NULL>"].includes(col.PARCEL_PLAN_NO) ? col.PARCEL_PLAN_NO : "بدون")}
          />
          <ExcelColumn
            label="اسم الشارع"
            value={(col) => (col.STREET_NAME&&!["","<Null>","<NULL>"].includes(col.STREET_NAME) ? col.STREET_NAME : "بدون")}
          />
          <ExcelColumn
            label="المساحة"
            value={(col) => (col['SITE_AREA']&&!["","<Null>","<NULL>"].includes(col['SITE_AREA']) ?
             col['SITE_AREA'] : "بدون")}
          />
          <ExcelColumn
            label="نوع الموقع"
            value={(col) => (col.SITE_SUBTYPE ? 
              fields["invest_site_polygon"].find((field) => field.name == "SITE_SUBTYPE")
              .domain.codedValues.find(c=>c.code===col.SITE_SUBTYPE).name 
              
               : "بدون")}
          />
          <ExcelColumn
            label="حالة الموقع"
            value={(col) => (col.SITE_STATUS ? 
              fields["invest_site_polygon"].find((field) => field.name == "SITE_STATUS")
              .domain.codedValues.find(c=>c.code===col.SITE_STATUS).name  : "بدون")}
          />
           <ExcelColumn
            label="حالة الموقع التفصيلية"
            value={(col) => (col.SITE_SUB_STATUS ? 
              fields["invest_site_polygon"].find((field) => field.name == "SITE_SUB_STATUS")
              .domain.codedValues.find(c=>c.code===col.SITE_SUB_STATUS).name  : "بدون")}
          />
          <ExcelColumn
            label="النشاط الاستثماري"
            value={(col) =>
              col.SITE_COMMON_USE ? 
              fields["invest_site_polygon"].find((field) => field.name == "SITE_COMMON_USE")
              .domain.codedValues.find(c=>c.code===col.SITE_COMMON_USE).name 
              
               : "بدون"
            }
          />
           <ExcelColumn
            label="احداثي دائرة العرض للمركز"
            value={(col) => (col.SITE_LAT_COORD&&!["","<Null>","<NULL>"].includes(col.SITE_LAT_COORD) ? col.SITE_LAT_COORD : "بدون")}
          />
          <ExcelColumn
            label="احداثي خط الطول للمركز"
            value={(col) => (col.SITE_LONG_COORD&&!["","<Null>","<NULL>"].includes(col.SITE_LONG_COORD) ? col.SITE_LONG_COORD : "بدون")}
          />
        </ExcelSheet>
      </ExcelFile>
    );
  }
}

export default DownloadCSV;

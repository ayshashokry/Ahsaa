import React from "react";
import ReactExport from "react-export-excel";
import { Tooltip } from "antd";
import moment from "moment-hijri";
const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

class DownloadCSV extends React.Component {
  render() {
    let {fields, dataSet, columns, labels}= this.props;
    console.log(fields);
    return (
      <ExcelFile
        filename="SearchResult"
        element={
          <button className="btn btn-info" type="button">
            <Tooltip placement="topLeft" title={"استخراج"}>
              <i className="fas fa-file-export "></i>
            </Tooltip>
          </button>
        }
      >
        <ExcelSheet data={dataSet} name="SearchResult">
        {labels.map((head, index)=>
        (<ExcelColumn
            label={head}
            value={(col) =>
              columns[index]==="COMMITTEE_PRICING_DATE"?
              moment(col["COMMITTEE_PRICING_DATE"]).format("iYYYY/iMM/iDD") 
              :
              columns[index]==="ATTACHMENT"?
              "مرفق":
              col[columns[index]]?col[columns[index]]:"بدون"
              
            }
          />)
          )}
                </ExcelSheet>
      </ExcelFile>
    );
  }
}

export default DownloadCSV;

import React from "react";
import ReactExport from "react-export-excel";
import { Tooltip } from "antd";
const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

class DownloadCSV extends React.Component {
  render() {
    let {fields, dataSet, columns, labels, typeData}= this.props;
    console.log(this.props);
    return (
      <ExcelFile
        filename="SearchResult"
        element={
          <button className="btn btn-info" style={{marginLeft:'1em'}} type="button">
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
             {
               return   (columns[index]==="remark_image"?
              "مرفق":
              columns[index]==="remark_type"?
              col[columns[index]].name:
              ["suggestion_type2","suggestion_type1","suggestion_type"].includes(columns[index])&&
              col[columns[index]]?
              col[columns[index]].name:
              col[columns[index]]?col[columns[index]]:"بدون")}
              
            }
          />)
          )}
                </ExcelSheet>
      </ExcelFile>
    );
  }
}

export default DownloadCSV;

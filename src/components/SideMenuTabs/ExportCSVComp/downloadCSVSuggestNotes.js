import React from "react";
import ReactExport from "react-export-excel";
import { Tooltip } from "antd";
const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

class DownloadCSV extends React.Component {
  render() {
    let { dataSet, columns, labels,tabName }= this.props;
    return (
      <ExcelFile
        filename={tabName=='showAllremarks'?'RemarksFile':"SuggestionsFile"}
        element={
          <span className="btn btn-danger">
            <Tooltip placement="topLeft" title={`استخراج CSV ${tabName=='showAllremarks'?'الملاحظات':"الاقتراحات"}`}>
              <i className="fas fa-file-export "></i>
            </Tooltip>
          </span>
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

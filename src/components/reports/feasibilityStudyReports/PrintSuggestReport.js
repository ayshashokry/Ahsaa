import React from 'react'
import { PieChart, Pie, Cell, Legend, Tooltip,ResponsiveContainer } from "recharts";
import { Table } from "react-bootstrap";

import { connect } from 'react-redux';
import AhsaaLogo  from "../../../assets/images/ahsalogo.png"
import  footer from "../../../assets/images/footer.png"
import { generateRandomColor } from '../../../helpers/utlis/utilzFunc';
function PrintSuggestReport({suggestionDataToPrint,
    backFromPrintSuggestionToSuggestionWizard,
    clearSuggestionDataForReport}) {
    const { type, data } = suggestionDataToPrint;
    let colorsForData =  data.length<5?
    ["#0088FE", "#00C49F", "#FFBB28", "#ba52f5","b54447"]
  :data.map((i, index) => {
      let defaultColors = 
      ["#0088FE", "#00C49F", "#FFBB28", "#ba52f5","b54447"]
      if(index>4) return generateRandomColor()
    else return defaultColors[i]
    });
    const handleGoBackToSuggestionWizard = ()=>{
        clearSuggestionDataForReport();
        backFromPrintSuggestionToSuggestionWizard()
    }
    return (
        
        <div className="reportStyle-Suggestion">
            <div style={{ padding: "10px", margin: "1%",textAlign: 'justify' }} 
            className="one-page">
              <div >
                <div className="">
                  <div style={{ fontSize: "17px", display: "flex" }}>
                    <div>
                      <img
                        src={AhsaaLogo}
                        className="img-logo-print2"
                        style={{ width: "130px" }}
                      />
                    </div>
                    <div
                    className="investment_report_header"
                    >
                      <h4>أمانة الاحساء</h4>
                      <h4>الإدارة العامة للاستثمارات وتنمية الايرادات</h4>
                      <h4>
                        مشروع تقديم خدمات استشارية لدراسة وتنمية وتطوير
                        الاستثمارات{" "}
                      </h4>
                    </div>
   </div>
                 <div className='row' style={{justifyContent:'space-around'}}>

                 
                  <button
                    type="button"
                    style={{ width: "30%",
                    color:'white',
                        backgroundColor: '#f0ad4e',
                    borderColor: '#efa945'
                    // left: '35%',
                    // fontWeight:'bold',
                    // position: 'absolute',
                    // fontSize: 'large',
                    // marginTop: '1%'
                   }}
                    className="btn btn-warning print-button"
                    onClick={() => {
                      
                      window.print();
                    }}
                  >
                    طباعة 
                  </button>
                  <button
                    type="button"
                    style={{ width: "30%",
                    color:'white',
                    backgroundColor: '#f0ad4e',
                    borderColor: '#efa945'
                    // left: '35%',
                    // fontWeight:'bold',
                    // position: 'absolute',
                    // fontSize: 'large',
                    // marginTop: '1%'
                   }}
                    className="btn btn-warning print-button"
                    onClick={handleGoBackToSuggestionWizard}
                  >
                    رجوع
                  </button>
                  </div>
                </div>
      {/* Body of report */}
      <div className="mt-2" style={{width:'100%', height:'2px', background:'black'}}></div>
                <div className="col container mt-5 p-5 suggest-report-body">
                    <div className="row">

                    <div className="col-2">
                       <h5 > {type==="suggestion_type"?
                        "المقترح الأول":
                        type==="suggestion_type1"?
                        "المقترح الثاني":
                        "المقترح الثالث"
                        }</h5>
                    </div>
                    <div className="col">
                    <PieChart width={900} height={450}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={160}
                label
                fill="#8884d8"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colorsForData[index]} />
                ))}
              </Pie>
              <Legend verticalAlign="top" align={'center'} height={36} layout={"vertical"}  />
              <Tooltip cursor={{ stroke: "red", strokeWidth: 2 }} />
            </PieChart>
                    </div>
                    </div>
                    <div className="col">
                    <Table responsive>
            <thead>
              <tr>
                <th>النشاط الاستثماري</th>
                <th>العدد</th>
              </tr>
            </thead>
            <tbody>
               {data.map((item,index)=>
              <tr key={index}>
                <td>
                 {item.name}
                </td>
                <td>
                {item.value}

                </td>
              </tr>)
                }
            </tbody>
          </Table>
       
                    </div>
                </div>
             </div>
            </div>
          <footer className="footerahsa-print" >
            <img
              src={footer}
              className="img-logo-print2"
              align="left"
              style={{ width: "100px", marginLeft: "40px" }}
            />
            {/* <div style={{ marginTop: "15px",display: 'flex',flexDirection: 'column',justifyContent: 'flex-end' }}>
              <span style={{ fontSize: "20px" }}>
                تقرير المهمة الثانية {this.startIndex}/24
              </span>
            </div> */}
          </footer>
        </div>
   
       
    )
}
const mapStateToProps = ({ feasibilityStudy }) => {
    const { suggestionDataToPrint } = feasibilityStudy;
    return {
        suggestionDataToPrint,
    };
  };
  
  const mapDispatchToProps = (dispatch) => {
    return {
      clearSuggestionDataForReport: () => dispatch({ type: "CLEAR_SUGGESTION_DATA_OF_REPORT" }),
    };
  };
export default connect(mapStateToProps,mapDispatchToProps)(PrintSuggestReport)

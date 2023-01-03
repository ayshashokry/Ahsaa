import React, { useState } from "react";
import { PieChart, Pie, Cell, Legend, Tooltip,ResponsiveContainer } from "recharts";
import { Button, Modal } from "react-bootstrap";
import { generateRandomColor } from "../../../../helpers/utlis/utilzFunc";
import { connect } from "react-redux";

function SuggestionsChart(props) {
  const { selectedFeatureOnSearchTable, closeModal,goToPrintSuggestionReportPage,printSuggestionReport } = props;
  const [currentType, setCurrentType] = useState("suggestion_type");
  const [colors, setColors] = useState([])
  const [dataChart, setDataChart] = useState(() => {
    let features = selectedFeatureOnSearchTable.feature;
    let countData = {};
    features.forEach((item) => {
      if (item.suggestion_type) {
        if (countData[item.suggestion_type.name])
          countData[item.suggestion_type.name] = {
            count: countData[item.suggestion_type.name].count + 1,
          };
        else
          countData[item.suggestion_type.name] = {
            count: 1,
          };
        //   } else if (item.suggestion_type1) {
        //     if (countData[item.suggestion_type1.name])
        //       countData[item.suggestion_type1.name] = {
        //         count: countData[item.suggestion_type1.name].count + 1,
        //       };
        //     else
        //       countData[item.suggestion_type1.name] = {
        //         count: 1,
        //       };
        //   } else if (item.suggestion_type2) {
        //     if (countData[item.suggestion_type2.name])
        //       countData[item.suggestion_type2.name] = {
        //         count: countData[item.suggestion_type2.name].count + 1,
        //       };
        //     else
        //       countData[item.suggestion_type2.name] = {
        //         count: 1,
        //       };
      }
    });
    let suggestiosWithCount = Object.entries(countData).map((d) => {
      return {
        name: d[0],
        value: d[1].count,
      };
    });
  let colorsForData =  suggestiosWithCount.length<5?
    ["#0088FE", "#00C49F", "#FFBB28", "#ba52f5","b54447"]
  :suggestiosWithCount.map((i, index) => {
      let defaultColors = 
      ["#0088FE", "#00C49F", "#FFBB28", "#ba52f5","b54447"]
      if(index>4) return generateRandomColor()
    else return defaultColors[i]
    });
    setColors(colorsForData)
    return suggestiosWithCount;
  });
  const handleClick = (suggsetType) => {
    let features = selectedFeatureOnSearchTable.feature;
    if (currentType !== suggsetType) {
      let suggestiosWithCount =getSuggestionCountDataForChart(features,suggsetType)
   
      // if(suggestiosWithCount.length)
      setCurrentType(suggsetType);
      setDataChart(suggestiosWithCount);
    }
  };
  const handlePrintReport =(suggsetType)=>{
    let features = selectedFeatureOnSearchTable.feature;
  
    let suggestiosWithCount =getSuggestionCountDataForChart(features,suggsetType)
    props.addSuggestionTypeForReport({
      type:suggsetType,
      data:suggestiosWithCount
    })
    goToPrintSuggestionReportPage()
  }

  const getSuggestionCountDataForChart= (features,suggsetType)=>{
    let countData = {};
    features.forEach((item) => {
      if (item[suggsetType]) {
        if (countData[item[suggsetType].name])
          countData[item[suggsetType].name] = {
            count: countData[item[suggsetType].name].count + 1,
          };
        else
          countData[item[suggsetType].name] = {
            count: 1,
          };
      }
    });
    let suggestiosWithCount = Object.entries(countData).map((d) => {
      return {
        name: d[0],
        value: d[1].count,
      };
    });
    return suggestiosWithCount
  }
  return (
    <Modal
      keyboard={false}
      onHide={closeModal}
      show={selectedFeatureOnSearchTable != null&&!printSuggestionReport}
      backdrop="static"
      className="suggestionChartModal"
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header>
        <Modal.Title id="contained-modal-title-vcenter">
          إحصائيات الاقتراحات
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row suggestionsCart-container">
          {dataChart.length ? (
            <PieChart width={600} height={350}>
              <Pie
                data={dataChart}
                cx="50%"
                cy="50%"
                outerRadius={85}
                label
                fill="#8884d8"
              >
                {dataChart.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index]} />
                ))}
              </Pie>
              <Legend verticalAlign="middle" align={'left'} height={36} layout={"vertical"}  />
              <Tooltip cursor={{ stroke: "red", strokeWidth: 2 }} />
            </PieChart>
          ) : (
            <div className="suggestions-empty">لا يوجد</div>
          )}
          <div className="suggestions-btns-types">
            <Button
              disabled={currentType === "suggestion_type"}
              onClick={() => handleClick("suggestion_type")}
              className={currentType==="suggestion_type"?"btn-secondary":""}
            >
              الاقتراح الأول
            </Button>
            <Button
              className={currentType==="suggestion_type1"?"btn-secondary":"btn btn-dark"}

              disabled={currentType === "suggestion_type1"}
              onClick={() => handleClick("suggestion_type1")}
            >
              الاقتراح الثاني
            </Button>
            <Button
              className={currentType==="suggestion_type2"?"btn-secondary":"btn btn-danger"}

disabled={currentType === "suggestion_type2"}
              onClick={() => handleClick("suggestion_type2")}
            >
              الاقتراح الثالث
            </Button>
          </div>
        </div>
        <Button className="closeBtn" onClick={closeModal}>
          إغلاق
        </Button>
        <Button className="closeBtn" onClick={()=>handlePrintReport(currentType)}
        disabled={ dataChart.length?false:true }
        >
          طباعة
        </Button>
      </Modal.Body>
    </Modal>
  );
}
const mapStateToProps = ({ mapUpdate }) => {
  const { selectedFeatureOnSearchTable } = mapUpdate;
  return {
    selectedFeatureOnSearchTable,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    addSuggestionTypeForReport: (data) => dispatch({ type: "ADD_SUGGESTION_FOR_REPORT",data }),
  };
};

export default connect(mapStateToProps,mapDispatchToProps)(SuggestionsChart);

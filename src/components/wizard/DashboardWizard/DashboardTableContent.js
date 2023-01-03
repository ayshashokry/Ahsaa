import React, { useState, useRef, useEffect } from "react";
import { Table, Modal } from "react-bootstrap";
import { Button, Checkbox, notification } from "antd";
import { connect } from "react-redux";
import { highlightFeature } from "../../common/mapviewer";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Text,
} from "recharts";
import {
  highlightBoundaries,
  zoomToBound,
} from "../../sidemenuSections/Dashboard/helpers_func";

function DashboardTableContent(props) {
  const [colors, setColors] = useState([]);
  const [totalSum, setTotalSum] = useState(0);
  const [maxValue, setMaxValue] = useState(0);
  const [minValue, setMinValue] = useState(0);
  const [dataChart, setDataChart] = useState([]);
  useEffect(() => {
    if (props.dashboardData) {
      let reqField = props.dashboardData.queryParams.params.groupByFields[0];
      let OUT_BOARDS = `خارج حدود  ${
        reqField === "MUNICIPALITY_NAME" ? "البلديات" : "الأحياء"
      }`;
      let data = props.dashboardData.commonUseData.map((item) => {
        return {
          //name==> name of boundary
          name:
            !item.name ||
            item.name == "null" ||
            item.name == "<Null>" ||
            item.name === null
              ? OUT_BOARDS
              : item.name,
          value: item.value, //value==> no. of common use per boundary
          boundCode: item.nameCode,
        };
      });
      let sumCount = 0;
      props.dashboardData.commonUseData.forEach(
        (item) => (sumCount += item.value)
      );
      console.log({ sumCount });
      setTotalSum(sumCount);
      let sortedData =  data.sort((a, b) => {
        return a.value - b.value;
      })
      let calcMinValue =sortedData[0].value; 
      let calcMaxValue =sortedData[sortedData.length - 1].value; 
      setMaxValue(calcMaxValue)
      setMinValue(calcMinValue)
      setDataChart(
        sortedData
      );

      //highlighting the boundaries on map
      let boundariesCodes = props.dashboardData.commonUseData.map(
        (f) => f.nameCode
      );
      let colors = props.dashboardData.commonUseData.map((item) => {
        return {
          color: [0, parseInt(
            50 +
              (1 -
                (item.value - calcMinValue) /
                calcMaxValue) *
                (255 - 50)
          ), 0, 0.85],
          boundCode: item.nameCode,
        };
      });
      const callBackFunc = () => {
        props.closeLoader();
      };
      props.openLoader();
      console.log({ boundariesCodes }); //243
      if (boundariesCodes.filter((it) => it).length)
        //to check is there any boundary code to hightlight on map or not
        highlightBoundaries(reqField, boundariesCodes, colors, callBackFunc);
      else props.closeLoader();
    }
    return () => {
      return null;
    };
  }, [props.dashboardData]);
  useEffect(() => {
    return () => {
      console.log("unmount");
      props.closeLoader();
      props.showTable(false);

      props.clearDataToDashboard();
    };
  }, []);

  function rgbToHex(r, g, b) {
    function c(v) {
      var hex = v.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }
    console.log("#" + c(r) + c(g) + c(b));
    return "#" + c(r) + c(g) + c(b);
  }
  return (
    <Table striped responsive className="firstStepTable">
      <div className="tableIcons">
        <Button
          style={{ width: "fit-content", position: "absolute", top: "0.3em" }}
          className="finishBtn mr-2"
          onClick={props.finishProcess}
        >
          {"طباعة "}
        </Button>
      </div>
      <h5
        style={{
          textAlign: "center",
          textAlign: "center",
          position: "absolute",
          top: "0",
          right: "2em",
        }}
      >
        الإجمالي الكلي: {totalSum}
      </h5>
      <div
        className="container"
        style={{ maxHeight: "50vh", display: "flex", flexDirection: "row" }}
      >
        <div className="piechart">
          {dataChart.length && (
            //  <ResponsiveContainer width={800} height={800}>
            <>
              <PieChart width={700} height={550} layout={"vertical"}>
                <Pie
                  data={dataChart}
                  dataKey="value"
                  nameKey="name"
                  cx="40%"
                  cy="40%"
                  outerRadius={160}
                  // labelLine={true}
                  // label={{ offsetRadius: 35, fill: "black", strokeWidth: 2, position:'insideStart' }}
                  // fill="#8884d8"
                  onClick={(e, a) => {
                    console.log(e, a);
                    let boundCode = e.boundCode;
                    if (boundCode) zoomToBound(boundCode);
                  }}
                >
                  {dataChart.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        `rgb(
                          0,
                          ${parseInt(
                            50 +
                              (1 -
                                (entry.value - minValue) /
                                  maxValue) *
                                (255 - 50)
                          )},
                          0,0.85
                        )`
                        // "#" +
                        // parseInt(
                        //   parseFloat(1 - (entry.value / totalSum)) * 255
                        // ).toString(16) +
                        // "f0000"
                      }
                    />
                  ))}
                </Pie>
                {/* <Legend  align={'left'} height={'50%'} layout={'centric'} verticalAlign={'middle'} /> */}
                <Tooltip />
              </PieChart>
            </>
            // </ResponsiveContainer>
          )}
        </div>
        <div className="hrcharts">
          {dataChart.length && (
            <BarChart
              height={dataChart.length * 30 < 400 ? 350 : dataChart.length * 30}
              width={500}
              data={dataChart}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
              barSize={30}
              barGap={8}
              layout={"vertical"}
            >
              <Bar
                name="إجمالي الأنشطة"
                dataKey="value"
                // fill="#8884d8"
                // background={{ fill: "#eee" }}
                onClick={(e, a) => {
                  let boundCode = e.boundCode;
                  if (boundCode) zoomToBound(boundCode);
                  console.log(e, a);
                }}
              >
                {dataChart.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      `rgb(0, ${parseInt(
                        50 +
                          (1 -
                            (entry.value - minValue) /
                              maxValue) *
                            (255 - 50)
                      )}, 0,0.85)`
                      // "#" +
                      // parseInt(
                      //   parseFloat(1 - (entry.value / totalSum)) * 255
                      // ).toString(16) +
                      // "f0000"
                    }
                  />
                ))}
              </Bar>

              <XAxis type={"number"} dataKey={"value"} />
              <YAxis
                type={"category"}
                dataKey="name"
                reversed={true}
                width={200}
                label={(props) => (
                  <Text width={250} scaleToFit={true}>
                    {props.text}
                  </Text>
                )}
              />
              <Tooltip />
              {/* <Legend /> */}
              {/* <CartesianGrid strokeDasharray="3 3" /> */}
            </BarChart>
          )}
          {dataChart.length ? null : (
            <div className="suggestions-empty">لا توجد بيانات</div>
          )}
        </div>
      </div>
    </Table>
  );
}
const mapStateToProps = ({ mapUpdate }) => {
  const { currentUser, dashboardData } = mapUpdate;
  return {
    currentUser,
    dashboardData,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    clearDataToDashboard: () => dispatch({ type: "CLEAR_DASHBOARD_DATA" }),
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DashboardTableContent);

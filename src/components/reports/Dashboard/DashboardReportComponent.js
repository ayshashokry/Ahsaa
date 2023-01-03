/* eslint-disable react/jsx-key */
import React, { Component } from "react";
import { withRouter } from "react-router";
import Loader from "../../loader/index";
import { getLayerIndex, queryTask } from "../../common/mapviewer";
import { getFeatureDomainName } from "../../reportMapViewer/common/common_func";
import { notificationMessage } from "../../../helpers/utlis/notifications_Func";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
  Text,
  ResponsiveContainer,
  Legend,
} from "recharts";
import AhsaaLogo from "../../../assets/images/ahsalogo.png";
import MinistiryLogo from "../../../assets/images/ministryLogo.png";
import VisionLogo from "../../../assets/images/vision2030.png";
import KSALogo from "../../../assets/images/KSALogo.png";
import footer from "../../../assets/images/footer.png";
import { getMapInfo } from "../../reportMapViewer/common/esriRequest_Func";

class DashboardReportComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      where: localStorage.getItem("dashboardQueryCondition"),
      dataChart: [],
      municipilityName: "",
      maxValue: "",
      minValue: "",
      totalSum: "",
    };
    this.startIndex = 1;
  }
  rgbToHex(r, g, b) {
    function c(v) {
      var hex = v.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }
    return "#" + c(r) + c(g) + c(b);
  }
  componentDidMount() {
    this.setState({ zoom: true, loading: true });
    let queryParams = JSON.parse(this.state.where);
    let promiseGetMunicipName = new Promise((resolve, reject) => {
      if (queryParams.MUNICIPALITY)
        getMapInfo(window.__mapUrl__).then((res) => {
          console.log(res);
          let layer = res?.info?.$layers?.layers?.find(
            (l) => l.id === queryParams.MUNICIPALITY.layerIndex
          );
          let municipilityName = layer.fields
            ?.find((f) => f.name == "MUNICIPALITY_NAME")
            ?.domain?.codedValues?.find(
              (c) => c.code === queryParams.MUNICIPALITY.MUNICIPALITY_NAME
            );
          resolve(municipilityName.name);
        });
      else resolve(null);
    });
    let promise = new Promise((resolve, reject) => {
      queryTask({
        ...queryParams.params,
        url: `${window.__mapUrl__}/${queryParams.layerIndex}`,

        // outFields: ["SITE_GEOSPATIAL_ID,PARCEL_PLAN_NO,PLAN_NO,OBJECTID"],
        callbackResult: ({ features }) => {
          if (features.length) {
            getFeatureDomainName(
              features,
              queryParams.layerIndex,
              null,
              window.__mapUrl__
            ).then((rf) => {
              if (!rf.length) resolve([]);
              else resolve(rf);
            });
          } else resolve([]);
        },
        callbackError: (err) => {
          console.log(err);
          resolve([]);
        },
      });
    });

    Promise.all([promise, promiseGetMunicipName])
      .then((res) => {
        let commonUseData = [...res[0]].reduce((comulative, item) => {
          if (!comulative.length) {
            comulative.push({
              name: item.attributes[queryParams.params.groupByFields[0]],
              value: item.attributes.TOTALACTIVITIESDISTINCT,
              nameCode:
                item.attributes[queryParams.params.groupByFields[0] + "_Code"],
            });
          } else {
            let isExist = comulative.find(
              (c) =>
                c.nameCode ===
                item.attributes[queryParams.params.groupByFields[0]]
            );
            if (isExist) {
              isExist.value += item.attributes.TOTALACTIVITIESDISTINCT;
            } else
              comulative.push({
                name: item.attributes[queryParams.params.groupByFields[0]],
                value: item.attributes.TOTALACTIVITIESDISTINCT,
                nameCode:
                  item.attributes[
                    queryParams.params.groupByFields[0] + "_Code"
                  ],
              });
          }
          return comulative;
        }, []);
        if (commonUseData.length) {
          let reqField = queryParams.params.groupByFields[0];
          let OUT_BOARDS = `خارج حدود  ${
            reqField === "MUNICIPALITY_NAME" ? "البلديات" : "الأحياء"
          }`;
          let data = commonUseData.map((item) => {
            return {
              name:
                !item.name ||
                item.name == "null" ||
                item.name == "<Null>" ||
                item.name === null
                  ? OUT_BOARDS
                  : item.name,
              value: item.value,
              nameCode: item.nameCode,
            };
          });
          let sumCount = 0;
          commonUseData.forEach((item) => (sumCount += item.value));
          console.log({ sumCount });
          let sortedData = data.sort((a, b) => {
            return a.value - b.value;
          });

          this.stopLoading();
          this.setState({
            dataChart: sortedData,
            totalSum: sumCount,
            maxValue: sortedData[sortedData.length - 1].value,
            minValue: sortedData[0].value,
            municipilityName: res[1] ? res[1] : "",
          });
        } else {
          notificationMessage("لا توجد نتائج ", 5);
          this.stopLoading();
        }
      })
      .catch((err) => {
        console.log(err);
        this.stopLoading();
        notificationMessage("حدث خطأ برجاء المحاولة مرة أخرى", 4);
      });
    // window.document.body.style = 'overflow: auto !important;'
  }
  componentWillUnmount() {
    // window.document.body.style = 'overflow: hidden !important;'
    // localStorage.removeItem("dashboardQueryCondition")
  }
  stopLoading() {
    this.setState({ loading: false });
  }

  renderLegend = () => {
    const { totalSum, dataChart } = this.state;
    let dataChartCopy = [...dataChart];
    return (
      <div
        className="legend-dashboard-report"
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "0",
          flexWrap: "wrap",
          height: dataChartCopy.length>35?"90em":"",
          width: "100%",
          alignContent: "center",
          // marginTop: "6em",
        }}
      >
        {dataChartCopy
          .sort((a, b) => {
            return b.value - a.value;
          })
          .map((entry, index) => (
            <div key={`item-${index}`} style={{ display: "flex" }}>
              {" "}
              <div
                style={{
                  width: "3em",
                  height: "1em",
                  marginLeft: "1em",
                  marginBottom: "0.5em",
                  background: `rgba(
                  0,
                  ${parseInt(50+(1-((entry.value-this.state.minValue) / this.state.maxValue)) *
                    (255-50))},
                  0,0.85
                )`,
                }}
              ></div>{" "}
              {entry.name}: {entry.value}
            </div>
          ))}
      </div>
    );
  };

  render() {
    let { dataChart = [], zoom, totalSum } = this.state;
    return dataChart.length > 0 && this.state.where ? (
      <>
        <div className="reportStyle2">
          {this.state.loading ? <Loader /> : null}
          <div
            style={{ padding: "10px", margin: "1%", textAlign: "justify" }}
            className="one-page-dashboard"
          >
            {/********Header Report*********** */}
            <div
              className=""
              style={{
                borderBottom: "solid 5px #922125",
                marginBottom: "3em",
              }}
            >
              <div className="feasibility-header">
                <div className="ministry-logo">
                  <img src={KSALogo} alt="ksa logo" width={90} height={90} />
                  <img
                    src={MinistiryLogo}
                    alt="Ministry logo"
                    width={140}
                    height={60}
                  />
                </div>
                <div>
                  <img
                    src={AhsaaLogo}
                    alt="Ahsaa Logo"
                    width={120}
                    height={120}
                  />
                </div>

                <div style={{ display: "flex" }}>
                  <img src={VisionLogo} alt="vision 2030" width={150} />
                </div>
              </div>
              <button
                type="button"
                style={{
                  width: "40%",
                  color: "white",
                  backgroundColor: "#f0ad4e",
                  borderColor: "#efa945",
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
            </div>

            {/********End of Header Report*********** */}
            <div className="m-3">
              {dataChart.length && (
                <>
                  <h3 style={{ textAlign: "center" }}>تقرير الإحصائيات</h3>
                  <h5 style={{ textAlign: "center" }}>
                    الإجمالي الكلي{" "}
                    {this.state.municipilityName &&
                      `خاص بـ  ${this.state.municipilityName}`}
                    : {totalSum}
                  </h5>
                  <div
                    className=""
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "start",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        // flexDirection: 'row-reverse',
                        width: "100%",
                        justifyContent: "space-around",
                        alignItems: "flex-start",
                        margin:'3em 0'
                        // marginBottom:'4em'
                      }}
                    >
                      <div
                        style={{
                          // direction: "rtl",
                          display: "flex",
                          flexDirection: "row",
                          flexWrap: "wrap",
                          // width: "100%",
                        }}
                      >
                        {dataChart.length && this.renderLegend()}
                      </div>
                      <div
                        className={dataChart.length>35?"hrcharts-dashboard-print hrcharts-dashboard":" hrcharts-dashboard " }
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "center",
                          direction:'ltr'
                        }}
                      >
                        {dataChart.length &&
                        (
                          dataChart.length>0?  
                          <BarChart
                            height={
                              dataChart.length * 30 < 400
                                ? 350
                                : dataChart.length * 30
                            }
                            width={650}
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
                            >
                              {dataChart.map((entry, index) => {
                                console.log(
                                  entry.value,
                                  this.state.maxValue,
                                  `rgb(0, ${parseInt(
                                    65+(entry.value-this.state.minValue / this.state.maxValue) *
                                      (255-65)
                                  )}, 0,0.85)`
                                );
                                return (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={
                                      `rgb(0, ${parseInt(
                                        50+(1-((entry.value-this.state.minValue) / this.state.maxValue)) *
                                        (255-50)
                                      )}, 0,0.85)`
                                      // "#" +
                                      // parseInt(
                                      //   parseFloat(1 - (entry.value / totalSum)) * 255
                                      // ).toString(16) +
                                      // "f0000"
                                    }
                                  />
                                );
                              })}
                            </Bar>

                            <XAxis
                             type={"number"} dataKey={"value"}
                              />
                            <YAxis
                              type={"category"}
                              dataKey="name"
                              reversed={true}
                              width={350}
                              label={(props) => (
                                <Text width={350} scaleToFit={true}>
                                  {props.text}
                                </Text>
                              )}
                            />
                            <Tooltip />
                            {/* <Legend /> */}
                            {/* <CartesianGrid strokeDasharray="3 3" /> */}
                          </BarChart>
                          :
                          <>
                            {/* <BarChart   //1
                            height={
                              dataChart.filter((item, index)=>index<=dataChart.length/2).length * 30 < 400
                                ? 350
                                : dataChart.filter((item, index)=>index<=dataChart.length/2).length * 30
                            }
                            width={500}
                            data={dataChart.filter((item, index)=>index<=dataChart.length/2)}
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
                          
                            >
                              {dataChart.filter((item, index)=>index<=dataChart.length/2).map((entry, index) => {
                                console.log(
                                  entry.value,
                                  this.state.maxValue,
                                  `rgb(0, ${parseInt(
                                    65+(entry.value-this.state.minValue / this.state.maxValue) *
                                      (255-65)
                                  )}, 0,0.85)`
                                );
                                return (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={
                                      `rgb(0, ${parseInt(
                                        50+(1-((entry.value-this.state.minValue) / this.state.maxValue)) *
                                        (255-50)
                                      )}, 0,0.85)`
                                   
                                    }
                                  />
                                );
                              })}
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
                         
                          </BarChart>
                          <BarChart   //2
                            height={
                              dataChart.filter((item, index)=>index>dataChart.length/2).length * 30 < 400
                                ? 350
                                : dataChart.filter((item, index)=>index>dataChart.length/2).length * 30
                            }
                            width={500}
                            data={dataChart.filter((item, index)=>index>dataChart.length/2)}
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
                            >
                              {dataChart.filter((item, index)=>index>dataChart.length/2).map((entry, index) => {
                                console.log(
                                  entry.value,
                                  this.state.maxValue,
                                  `rgb(0, ${parseInt(
                                    65+(entry.value-this.state.minValue / this.state.maxValue) *
                                      (255-65)
                                  )}, 0,0.85)`
                                );
                                return (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={
                                      `rgb(0, ${parseInt(
                                        50+(1-((entry.value-this.state.minValue) / this.state.maxValue)) *
                                        (255-50)
                                      )}, 0,0.85)`
                                      // "#" +
                                      // parseInt(
                                      //   parseFloat(1 - (entry.value / totalSum)) * 255
                                      // ).toString(16) +
                                      // "f0000"
                                    }
                                  />
                                );
                              })}
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
                         
                          </BarChart> */}
                          </>
                        )}
                        {/* {dataChart.length && (
                          <ResponsiveContainer width={700} height={600}>
                            <>
                              <PieChart
                                width={700}
                                height={600}
                                layout={"vertical"}
                              >
                                <Pie
                                  data={dataChart}
                                  dataKey="value"
                                  nameKey="name"
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={200}
                                  // labelLine={true}
                                  // label={{
                                  //   offsetRadius: 50,
                                  //   fill: "black",
                                  //   strokeWidth: 2,
                                  // }}
                                  // fill="#8884d8"
                                >
                                {dataChart.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        `rgb(
                          0,
                          ${parseInt((1-(entry.value / totalSum)) * 255)},
                          0,0.85
                        )`
                     
                      }
                    />
                  ))}
                                </Pie>
                           
                                <Tooltip />
                              </PieChart>
                            </>
                          </ResponsiveContainer>
                        )} */}
                      </div>
                    </div>
                    <table
                      className="table table-striped table-dashboard"
                      style={{
                        border: "groove",
                        width: "100%",
                        // direction: "rtl",
                        // marginTop: "5em",
                      }}
                    >
                      <thead>
                        <th>رقم مسلسل</th>
                        <th>اسم البلدية</th>
                        <th>عدد الأنشطة</th>
                      </thead>
                      <tbody>
                        {dataChart.reverse().map((item, index) => (
                          <tr
                            key={index}
                            // className="tbl-feasibility-report-row"
                          >
                            <td>{index + 1}</td>
                            <td>{item.name}</td>
                            <td>{item.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <footer className="footerahsa-print">
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
      </>
    ) : !this.state.where ? (
      <h1 style={{ textAlign: "center" }}>حدث خطأ برجاء المحاولة مرة أخرى</h1>
    ) : (
      <Loader />
    );
  }
}

export default withRouter(DashboardReportComponent);

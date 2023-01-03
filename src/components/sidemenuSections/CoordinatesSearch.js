import React, { Component } from "react";
import { Tabs, Tab, Container } from "react-bootstrap";
import { Row, Col, Input, Form, Button, notification } from "antd";
import { LoadModules, project, highlightFeature, convertNumbersToEnglish, getLayerIndex, queryTask } from "../common/mapviewer";
import Loader from "../loader/index";
export default class CoordinatesSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // DegWidthDeg: 0,
      // DegWidthSeconds: 0,
      // DegWidthMinutes: 0,
      // DegTallDeg: 0,
      // DegTallSeconds: 0,
      // DegTallMinutes: 0,
      coordinateWidth: 0,
      coordinateTall: 0,
      lngInMeters:0,
      latInMeters:0,
      loading:false
    };
  this.metersCoordsFormRef =React.createRef(); 
  this.geoCoordsFormRef =React.createRef(); 
  }
  componentWillUnmount(){
    this.setState(null);
    window.__map__.getLayer("zoomGraphicLayer").clear();
  }
  handleChange = (e) => {
    let value = convertNumbersToEnglish(e.target.value) 
    this.setState({ [e.target.name]: value});
  };
  CoordinateSearch = (e) => {
    const { coordinateWidth, coordinateTall } = this.state;
    if(!(coordinateWidth&&coordinateTall)) return;
    this.props.openLoader();    //for loader in case of search process

    var lat = coordinateWidth;
    var lng = coordinateTall;

    LoadModules(["esri/geometry/Point","esri/tasks/query"]).then(([Point,Query]) => {
      var point = new Point(lng, lat);
      project(point, 102100, (projected) => {
        point = projected[0];
       this.checkIfPointOutsideAhsaa(point, Query,()=>{
        highlightFeature(point, window.__map__, {
          layerName: "zoomGraphicLayer",
          isZoom: true,
          zoomFactor: 20,
        });
       })
        this.props.closeLoader();   //for loader in case of search process
      });
    });
  };
  // DegSearch = (e) => {
  //   const {
  //     DegWidthDeg,
  //     DegWidthSeconds,
  //     DegWidthMinutes,
  //     DegTallDeg,
  //     DegTallSeconds,
  //     DegTallMinutes,
  //   } = this.state;
  //   if(!(DegWidthDeg&&DegTallDeg)) return;
  //   this.props.openLoader();    //for loader in case of search process
  //   var lat = +DegWidthDeg + +DegWidthMinutes / 60 + +DegWidthSeconds / 3600;
  //   var lng = +DegTallDeg + +DegTallMinutes / 60 + +DegTallSeconds / 3600;

  //   LoadModules(["esri/geometry/Point"]).then(([Point]) => {
  //     var point = new Point(lng, lat);
  //     project(point, 102100, (projected) => {
  //       point = projected[0];
  //       highlightFeature(point, window.__map__, {
  //         layerName: "highLightGraphicLayer",
  //         isZoom: true,
  //         zoomFactor: 20,
  //       });
  //       this.props.closeLoader();   //for loader in case of search process
  //     });
  //   });
  // };
  metersCoordinateSearch = (e)=>{
    const {
    lngInMeters, latInMeters
    } = this.state;
    if(!(lngInMeters&&latInMeters)) return;
  // metersCoordsFormRef.current.validateFields()
  // .then(values => {
  //   /*
  // values:
  //   {
  //     lngInMeters,
  //     latInMeters
  //   }
  // */
  // })
  // .catch(errorInfo => {
  //   /*
  //   errorInfo:
  //     {
  //       values: {
  //         username: 'username',
  //         password: 'password',
  //       },
  //       errorFields: [
  //         { name: ['password'], errors: ['Please input your Password!'] },
  //       ],
  //       outOfDate: false,
  //     }
  //   */
  // }); 

    this.props.openLoader();    //for loader in case of search process
    var lat = latInMeters;
    var lng = lngInMeters;

    LoadModules(["esri/geometry/Point","esri/SpatialReference","esri/tasks/query"])
    .then(([Point, SpatialReference, Query]) => {
      let UTM39 = new SpatialReference(32639);
      var point = new Point(lng, lat,UTM39);
      project(point, 102100, (projected) => {
        point = projected[0];
      this.checkIfPointOutsideAhsaa(point, Query,()=>{
        highlightFeature(point, window.__map__, {
          layerName: "zoomGraphicLayer",
          isZoom: true,
          zoomFactor: 20,
        });
      })
        this.props.closeLoader();   //for loader in case of search process
      });
    });
  }

  checkIfPointOutsideAhsaa(point,Query, callBack){
    if(point.x <3767000 || point.x >5990000 || point.y<1940000 || point.y>3927000 || point.x=='NaN' ||point.y=='NaN')
    this.notificationWithOutSideAhsaa("out Saudia Arabia")
    else
    queryTask({
      returnGeometry: true,
      url: `${window.__mapUrl__}/${getLayerIndex("MUNICIPALITY_BOUNDARY")}`,
      outFields: ["OBJECTID"],
      geometry:point,
      spatialRelationship: Query.SPATIAL_REL_INTERSECTS,
      callbackResult: ({ features }) => {
        if (features.length){
          callBack()
        }else{
          this.notificationWithOutSideAhsaa()
        }
      },
      callbackError:(err)=>{
        this.notificationError()
      }
    })
  }
  
  notificationError = () => {
    const args = {
      description: "عذرا لقد حدث خطأ. من فضلك حاول مرة أخرى",
      duration: 3,
    };
    notification.open(args);
  };

  notificationWithOutSideAhsaa = (flag) => {
    const args1 = {
      description:flag=="out Saudia Arabia"?
      "الاحداثيات خارج حدود المملكة.": 
      "الاحداثيات المدخلة تقع خارج حدود الأمانة",
      duration: 4,
    };
    const args2 = {
      description: "برجاء ادخال احداثيات داخل حدود الأمانة",
      duration: 5,
    }
   

      notification.warn(args1);
      setTimeout(() => {
        notification.info(args2);
      }, 1000);
   
  };
  render() {
    return (
      <div className="coordinates">
        <h3 className="mb-3">بحث إحدائيات </h3>
        {this.state.loading? <Loader /> :null}
        <Tabs
          defaultActiveKey="coord"
          id="uncontrolled-tab-example"
          className=""
        >
          <Tab eventKey="coord" title="احداثيات عشرية">
            <Form
              className="coordinateForm"
              layout="vertical"
              name="validate_other"
              ref={this.metersCoordsFormRef}
            >
              <Container>
                <Row>
                  <Col span={24} className="">
                    <h5 className="mt-4 ">دائرة العرض</h5>
                    <Form.Item
                      name="coordinateWidth"
                      hasFeedback
                      rules={[
                        {
                          message: "إختر دائرة العرض",
                          required: true,
                        },
                      ]}
                    >
                      <Input
                        // type="number"
                        name="coordinateWidth"
                        onChange={this.handleChange}
                        value={this.state.coordinateWidth}
                        placeholder="ex: 25.3896671"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24} className="">
                    {" "}
                    <h5 className="mt-2">خطوط الطول</h5>
                    <Form.Item
                      rules={[
                        {
                          message: "إختر خطوط الطول",
                          required: true,
                        },
                      ]}
                      name="coordinateTall"
                      hasFeedback
                    >
                      <Input
                        // type="number"
                        name="coordinateTall"
                        onChange={this.handleChange}
                        value={this.state.coordinateTall}
                        placeholder="ex: 49.5604104"
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <Button
                      onClick={this.CoordinateSearch}
                      className="SearchBtn mt-3"
                      size="large"
                      htmlType="submit"
                    >
                      بحث
                    </Button>
                  </Col>
                </Row>
              </Container>
            </Form>
          </Tab>
          <Tab eventKey="metersCoord" title="احداثيات مترية">
            <Form
              className="coordinateForm"
              layout="vertical"
              name="validate_other"
            >
              <Container>
                <Row>
                  <Col span={24} className="">
                    <h5 className="mt-4 ">الاحداثي السيني</h5>
                    <Form.Item
                      name="lngInMeters"
                      hasFeedback
                      rules={[
                        {
                          message: "إختر الاحداثي السيني",
                          required: true,
                        },
                      ]}
                    >
                      <Input
                        // type="number"
                        name="lngInMeters"
                        onChange={this.handleChange}
                        value={this.state.lngInMeters}
                        placeholder="ex: 366113.371"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24} className="">
                    {" "}
                    <h5 className="mt-2">الاحداثي الصادي</h5>
                    <Form.Item
                      rules={[
                        {
                          message: "إختر الاحداثي الصادي",
                          required: true,
                        },
                      ]}
                      name="latInMeters"
                      hasFeedback
                    >
                      <Input
                        // type="number"
                        name="latInMeters"
                        onChange={this.handleChange}
                        value={this.state.latInMeters}
                        placeholder="ex: 2827877.048"
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <Button
                      onClick={this.metersCoordinateSearch}
                      className="SearchBtn mt-3"
                      size="large"
                      htmlType="submit"
                    >
                      بحث
                    </Button>
                  </Col>
                </Row>
              </Container>
            </Form>
          </Tab>
          {/* <Tab eventKey="deg-min" title="درجات-دقائق-ثواني">
            <Form
              className="coordinateForm"
              layout="vertical"
              name="validate_other"
            >
              {" "}
              <Container fluid>
                <h5 className="mt-4 mr-1">دائرة العرض</h5>
                <Row>
                  <Col span={8}>
                    <Form.Item
                      name="DegWidthSeconds"
                      hasFeedback
                      rules={[
                        {
                          message: "إختر الثانية",
                          required: true,
                        },
                      ]}
                      // help="Should be combination of numbers & alphabets"
                    >
                      <Input
                        // type="number"
                        name="DegWidthSeconds"
                        onChange={this.handleChange}
                        value={this.state.DegWidthSeconds}
                        placeholder='"ex: 37.47744 '
                      />
                    </Form.Item>
                  </Col>
                  <Col span={7} className="mr-1">
                    <Form.Item
                      rules={[
                        {
                          message: "إختر الدقيقة",
                          required: true,
                        },
                      ]}
                      name="DegWidthMinutes"
                      hasFeedback
                      // help="Should be combination of numbers & alphabets"
                    >
                      <Input
                        // type="number"
                        name="DegWidthMinutes"
                        onChange={this.handleChange}
                        value={this.state.DegWidthMinutes}
                        placeholder="'ex: 33"
                      />
                    </Form.Item>
                  </Col>{" "}
                  <Col span={7} className="mr-1 ml-2">
                    <Form.Item
                      rules={[
                        {
                          message: "إختر الدرجة",
                          required: true,
                        },
                      ]}
                      name="DegWidthDeg"
                      hasFeedback
                      // help="Should be combination of numbers & alphabets"
                    >
                      <Input
                        // type="number"
                        name="DegWidthDeg"
                        onChange={this.handleChange}
                        value={this.state.DegWidthDeg}
                        placeholder="ex: 49°"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <h5 className="mt-4 mr-1">خطوط الطول </h5>
                <Row>
                  <Col span={8} >
                    <Form.Item
                      name="DegTallSeconds"
                      rules={[
                        {
                          message: "إختر الثانية",
                          required: true,
                        },
                      ]}
                      hasFeedback
                      // help="Should be combination of numbers & alphabets"
                    >
                      <Input
                        // type="number"
                        name="DegTallSeconds"
                        onChange={this.handleChange}
                        value={this.state.DegTallSeconds}
                        placeholder='"ex: 22.80156 '
                      />
                    </Form.Item>
                  </Col>
                  <Col span={7} className="mr-1">
                    <Form.Item
                      name="DegTallMinutes"
                      hasFeedback
                      rules={[
                        {
                          message: "إختر الدقيقة",
                          required: true,
                        },
                      ]}
                      // help="Should be combination of numbers & alphabets"
                    >
                      <Input
                        // type="number"
                        name="DegTallMinutes"
                        onChange={this.handleChange}
                        value={this.state.DegTallMinutes}
                        placeholder="'ex: 23"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={7} className="mr-1 ml-2">
                    <Form.Item
                      name="DegTallDeg"
                      hasFeedback
                      rules={[
                        {
                          message: "إختر الدرجة",
                          required: true,
                        },
                      ]}
                    >
                      <Input
                        // type="number"
                        name="DegTallDeg"
                        onChange={this.handleChange}
                        value={this.state.DegTallDeg}
                        placeholder="ex: 25°"
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <Button
                      onClick={this.DegSearch}
                      className="SearchBtn mt-3"
                      size="large"
                      htmlType="submit"
                    >
                      بحث
                    </Button>
                  </Col>
                </Row>
              </Container>
            </Form>
          </Tab> */}
        </Tabs>
      </div>
    );
  }
}

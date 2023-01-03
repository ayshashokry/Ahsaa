import React, { Component } from "react";
import { connect } from "react-redux";
import { Container, Table } from "react-bootstrap";
import { Dropdown, Menu, Form, Select } from "antd";
import { highlightFeature } from "../common/mapviewer";
import { Fragment } from "react";

class IdentifyResult extends Component {
  formRef=React.createRef();
  layersLocal = {
    INVEST_SITE_POLYGON: {
      name: "الأراضي الاستثمارية",
    },
    ADVERTISING_BOARDS: {
      name: "اللوحات الاعلانية",
    },
    PLAN_DATA: {
      name: "المخططات",
    },
    DISTRICT_BOUNDARY: {
      name: "الأحياء",
    },
    MUNICIPALITY_BOUNDARY: {
      name: "البلديات",
    },
    INVEST_SITE_BOUNDARY: {
      name: "",
    },
    INVEST_SITE_CORNER: {
      name: "",
    },
  };
  state = {
    selectedInfo: "INVEST_SITE_POLYGON",
  };
  handleChangeInfo(e) {
    this.setState({ selectedInfo: e });
  }
  highlightFeatures(fs) {
    highlightFeature(fs, window.__map__, {
      isZoom: true,
      layerName: "zoomGraphicLayer",
    });
  }

  renderParcels = (attributes,layerName) => {
    console.log(attributes);
    return (
      <tbody>
        {/*  {this.props.currentUser!=="Guest"&&<tr>
          <th>اسم المستثمر</th>
          <td>{attributes["OWNER_NAME"] === undefined ? 'غير متوفر' : attributes["OWNER_NAME"]}</td>
        </tr>} */}
        <tr>
          <th>اسم البلدية</th>
          <td>
            {
              !attributes["MUNICIPALITY_NAME"] ||
            attributes["MUNICIPALITY_NAME"].toLowerCase() === "null" ||
            attributes["MUNICIPALITY_NAME"].trim() === ""
              ? "بدون"
              : attributes["MUNICIPALITY_NAME"]}
          </td>
        </tr>
        <tr>
          <th>رقم المخطط</th>
          <td>
            {
              !attributes["PLAN_NO"]||
            attributes["PLAN_NO"].toLowerCase() === "null"||
            attributes["PLAN_NO"]==="<Null>" ||
            attributes["PLAN_NO"].trim() == ""
              ? "بدون"
              : attributes["PLAN_NO"]}
          </td>
        </tr>
        <tr>
          <th>اسم الشارع</th>
          <td>
            {
              !attributes["STREET_NAME"] ||
            attributes["STREET_NAME"] === "null" ||
            attributes["STREET_NAME"] === "Null" ||
            attributes["STREET_NAME"].trim() == ""
              ? "بدون"
              : attributes["STREET_NAME"]}
          </td>
        </tr>
          {layerName.toLowerCase()==="invest_site_polygon"&&(
        <tr>

            <th>رقم قطعة الارض</th>
          <td>
            {attributes["PARCEL_PLAN_NO"].toLowerCase() === "null" ||
            attributes["PARCEL_PLAN_NO"].trim() == ""||
            !attributes["PARCEL_PLAN_NO"]  
            ? "بدون"
              : attributes["PARCEL_PLAN_NO"]}
          </td>
        </tr>
              )}
        <tr>
          <th>حالة الموقع</th>
          <td>
            {
              !attributes["SITE_STATUS"] ||
            attributes["SITE_STATUS"].toLowerCase() === "null" ||
            attributes["SITE_STATUS"].trim() == "" 
              ? "بدون"
              : attributes["SITE_STATUS"]}
          </td>
        </tr>
        {layerName.toLowerCase()==="invest_site_polygon"&&(
        <tr>
        <th>المساحة</th>
        <td>
          {
            !attributes["SITE_AREA"]  ||
          attributes["SITE_AREA"].toLowerCase() === "null" ||
          attributes["SITE_AREA"].trim() == "" 
            ? "بدون"
            : parseFloat(attributes["SITE_AREA"]).toFixed(2)}
        </td>
      </tr>
      // <tr>
        //   <th>رمز الاستخدام</th>
        //   <td>
        //     {
        //       !attributes["USING_SYMBOL"]  ||
        //     attributes["USING_SYMBOL"].toLowerCase() === "null" ||
        //     attributes["USING_SYMBOL"].trim() == "" 
        //       ? "بدون"
        //       : attributes["USING_SYMBOL"]}
        //   </td>
        // </tr>
        )}
        <tr>
          <th>النشاط</th>
          <td>
            {
              !attributes["SITE_COMMON_USE"]||
            attributes["SITE_COMMON_USE"].toLowerCase() === "null" ||
            attributes["SITE_COMMON_USE"].trim() == "" 
              ? "بدون"
              : attributes["SITE_COMMON_USE"]}
          </td>
        </tr>
      </tbody>
    );
  };
  renderAdBoards = (attributes,layerName) => {
    console.log(attributes);
    return (
      <tbody>
      
        <tr>
          <th>اسم البلدية</th>
          <td>
            {
              !attributes["MUNICIPALITY_NAME"] ||
            attributes["MUNICIPALITY_NAME"].toLowerCase() === "null" ||
            attributes["MUNICIPALITY_NAME"].trim() === ""
              ? "بدون"
              : attributes["MUNICIPALITY_NAME"]}
          </td>
        </tr>
        
        <tr>
          <th> اسم الشارع الرئيسي</th>
          <td>
            {
              !attributes["STREET_NAME"] ||
            attributes["STREET_NAME"] === "null" ||
            attributes["STREET_NAME"] === "Null" ||
            attributes["STREET_NAME"].trim() == ""
              ? "بدون"
              : attributes["STREET_NAME"]}
          </td>
        </tr>
      
        <tr>
          <th> احداثي دائرة العرض للمركز الهندسي</th>
          <td>
            {
              !attributes["SITE_LAT_COORD"] ||
            attributes["SITE_LAT_COORD"] === "null" ||
            attributes["SITE_LAT_COORD"] === "Null" ||
            attributes["SITE_LAT_COORD"].trim() == ""
              ? "بدون"
              : attributes["SITE_LAT_COORD"]}
          </td>
        </tr>
        <tr>
          <th> احداثي خط الطول للمركز الهندسي</th>
          <td>
            {
              !attributes["SITE_LAT_COORD"] ||
            attributes["SITE_LAT_COORD"] === "null" ||
            attributes["SITE_LAT_COORD"] === "Null" ||
            attributes["SITE_LAT_COORD"].trim() == ""
              ? "بدون"
              : attributes["SITE_LAT_COORD"]}
          </td>
        </tr>
       
        <tr>
          <th>الاستخدام الشائع</th>
          <td>
            {
              !attributes["SITE_COMMON_USE"]||
            attributes["SITE_COMMON_USE"].toLowerCase() === "null" ||
            attributes["SITE_COMMON_USE"].trim() == "" 
              ? "بدون"
              : attributes["SITE_COMMON_USE"]}
          </td>
        </tr>
      </tbody>
    );
  };
  assignUpdatedLayerName =(identifyData)=>{
    let selectedLayerNames=[]
    if(identifyData){
      identifyData && this.highlightFeatures(identifyData);
      selectedLayerNames = Object.keys(identifyData)
      if(this.formRef.current)this.formRef.current.setFieldsValue({selectmultiple:selectedLayerNames[0]})
      }
      return selectedLayerNames
  }
  render() {
    const   { showIdentify, identifyData,selectedInfo } = this.props;
    console.log(identifyData);
    let selectedLayerNames=this.assignUpdatedLayerName(identifyData)
    return (
      <>
        {identifyData && (
          <Container fluid>
            <h4>إستعلام</h4>
            <Form ref={this.formRef}>
              <Form.Item hasFeedback name="selectmultiple">
                <Select
                name="selectmultiple"
                  className="dont-show"
                  onChange={this.handleChangeInfo.bind(this)}
                  defaultValue={[selectedLayerNames[0]]}
                  value={selectedLayerNames[0]}
                  // placeholder=" الأراضي الإستثمارية"
                  getPopupContainer={(trigger) => trigger.parentNode}
                >
                  {selectedLayerNames.map((info, index) => (
                    <Select.Option
                      className="selectgroup"
                      value={info}
                      key={index}
                      id={info}
                    >
                      
                      {(this.layersLocal[info].name == "الأراضي الاستثمارية" ||
                        this.layersLocal[info].name == "اللوحات الاعلانية")&&
                          this.layersLocal[info].name
                      }
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
            <Table responsive>
              {selectedLayerNames.map(layerName=>{
             return identifyData[layerName].map((iter) => {
                const { attributes } = iter.feature;
                if (layerName === "INVEST_SITE_POLYGON")
                  return (
                    <>
                      {this.renderParcels(attributes, layerName)}
                      {identifyData[layerName].length &&
                      identifyData[layerName].indexOf(iter) !==
                        identifyData[layerName].length - 1 ? (
                        <p
                          style={{
                            width: "240%",
                            borderBottom: "solid",
                            borderColor: "#b54447",
                            position: "relative",
                            paddingTop: "1.5vw",
                          }}
                        ></p>
                      ) : null}
                    </>
                  );
                        else if(layerName==="ADVERTISING_BOARDS"){
                          return (
                            <>
                              {this.renderAdBoards(attributes, layerName)}
                              {identifyData[layerName].length &&
                              identifyData[layerName].indexOf(iter) !==
                                identifyData[layerName].length - 1 ? (
                                <p
                                  style={{
                                    width: "240%",
                                    borderBottom: "solid",
                                    borderColor: "#b54447",
                                    position: "relative",
                                    paddingTop: "1.5vw",
                                  }}
                                ></p>
                              ) : null}
                            </>
                          );
                        }
                        else return <Fragment></Fragment>;
              })
            })}
            </Table>
          </Container>
        )}
      </>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addToSelectedFeatures: (features) =>
      dispatch({ type: "ADD_TO_SELECTED_FEATURES", features }),
    clearSelection: () => dispatch({ type: "CLEAR_SELECTED" }),
    handleMapClickEvent: ({ cursor, handler }) =>
      dispatch({ type: "MAP_CLICK_EVENT", cursor, handler }),
  };
};

const mapStateToProps = ({ mapUpdate }) => {
  const { fields, currentUser } = mapUpdate;
  return {
    fields,
    currentUser,
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(IdentifyResult);

import React, { Component } from "react";
import { connect } from "react-redux";
import { Container, Modal } from "react-bootstrap";
import {
  Col,
  Row,
  Button,
  Upload,
  notification,
  Form,
  Select,
  message,
} from "antd";
import { CloudUploadOutlined } from "@material-ui/icons";
import {
  uploadCADFile,
  uploadKMZFile,
} from "../common/mapviewer";
import { uploadAdBoardFile, uploadLandFile } from "./helpers/common_func";
import axios from "axios";
// import { API_URL } from "../../config";

class AddLocationFromCAD extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFile: null,
      drawOnMap: false,
      showModal: false,
      modalMsg: "",
      tempSelectedFeatures: [],
      currentModal: "",
      typeOfAddedData: "",
      fileFormat: "",
      fileNameForGeoProcessTool: "",
    };
    this.Formref = React.createRef();
  }
  componentWillUnmount() {
    this.setState(null);
    this.props.showTable(false);
    this.props.emptyTempSelectedFeats();
    let cadLayerOnMap = window.__map__.getLayer("Features_From_CAD");
    cadLayerOnMap.clear();
    this.props.closeLoader();
    window.__map__.getLayer("graphicLayer_Multi_Select").clear();
  }
  notificationByAdding = () => {
    const args = {
      description: "تم الإضافة بنجاح بجدول الإضافة",
      duration: 3,
    };
    notification.open(args);
  };

  notificationEmptyFile = () => {
    const args = {
      description: "الملف لا يحتوي على مواقع",
      duration: 3,
    };
    notification.open(args);
  };

  notificationErrorDuringProcess = () => {
    const args = {
      description: "حدث خطأ أثناء قراءة البيانات. من فضلك حاول مرة أخرى",
      duration: 3,
    };
    notification.open(args);
  };

  notificationExpectedFeaturesInFile = (layerName) => {
    const args = {
      description:
        layerName.toLowerCase() === "invest_site_polygon"
          ? "عفواً الملف لا يحتوي على مواقع استثمارية"
          : "عفواً الملف لا يحتوي على لوحات اعلانية مرسومة",
      duration: 3,
    };
    notification.open(args);
  };

  notificationByLoadingDataFromFile = () => {
    const args = {
      description: "يتم قراءة بيانات الملف المرفوع. برجاء الانتظار",
      duration: 3,
    };
    notification.open(args);
  };

  notificationByIntersecting = (layername) => {
    const args = {
      description:
        layername == "invest_site_polygon"
          ? "تم الغاء العملية.. بعض المواقع تتقاطع مع مواقع استثمارية موجودة"
          : "تم الغاء العملية.. بعض المواقع تتقاطع مع اعلانات موجودة",
      duration: 5,
    };
    notification.open(args);
  };

  notificatioWithOutOfAhsaa = () => {
    const args = {
      description: "عفوًا المواقع الاستثمارية تقع خارج نطاق أمانة الأحساء ",
      duration: 4,
    };
    notification.open(args);
  };
  notificatioWithUploadingFile = () => {
    const args = {
      description: " تم رفع الملف بنجاح ",
      duration: 4,
    };
    notification.open(args);
  };
  notificatioWithFailingUploadingFile = () => {
    const args = {
      description: " حدث خطأ أثناء رفع الملف ",
      duration: 4,
    };
    notification.open(args);
  };
  removeUploadedFile (){
    let removeBtn = document.querySelector(".ant-btn.ant-btn-text.ant-btn-sm.ant-btn-icon-only.ant-btn-rtl.ant-upload-list-item-card-actions-btn")
    if(removeBtn) removeBtn.click();
  }
  setFile = (e) => {
    let self = this;
    console.log(e);
    let { fileList } = e;
    const status = e.file.status;
    if (status !== "uploading") {
      console.log(e.file, e.fileList);
    }
    if (status === "done") {
      message.success(`تم رفع الملف ${e.file.name} `);
      console.log("uploaded 100%");
      const formData = new FormData();
      formData.append(`file[${0}]`, e.fileList[0].originFileObj);
      axios
        .post(window.API_URL + "uploadMultifiles", formData)
        .then((res) => {
          let responseData = res.data[0];
          this.setState({
            selectedFile: [...fileList], //for showing upload success in update button
            // fileNameForGeoProcessTool: responseData.data,
          });
          self.getCadFile(responseData.data)
        })
        .catch((err) => {
          message.error(`حدث خطأ أثناء رفع الملف ${e.file.name} `);
          console.log(err);
        });
    
    
    
      } 
      if(status=="removed"){
        this.Formref.current.setFieldsValue({ fileUpload:null });

      }
      else if (status === "error") {
      message.error(`حدث خطأ أثناء رفع الملف ${e.file.name} `);
    }

    // if (e.fileList.length !== 0) {
    //   this.props.showTable(true);
    // }
  };
  callbackError() {
    this.notificationErrorDuringProcess();
    this.props.closeLoader();
  }
  getCadFile = (filePath) => {
    var self = this;
    let cadFeaturesLayer = this.state.typeOfAddedData;
    if (
      cadFeaturesLayer &&
      cadFeaturesLayer.toLocaleLowerCase() !== "invest_site_polygon" &&
      this.state.fileFormat &&
      filePath
    ) {
      this.props.openLoader();
      
      if (this.state.fileFormat === "cad")
        uploadCADFile(
          //parcels_CAD.DWG
          //boards_CAD.dwg
          window.__GP_CAD_TOJSON__,
          {
            CAD_File_Name: filePath,
          },
          // callBackForCADFile
          (res) => {
            uploadAdBoardFile(res, this, cadFeaturesLayer);
          },
          this.callbackError.bind(this)
        );
      else if (this.state.fileFormat === "kmz")
        uploadKMZFile(
          //parcels_CAD.DWG
          //boards_CAD.dwg
          window.__GP_KMZ_TOJSON__,
          {
            KML_File_Name: filePath,
          },
          (res) => {
            console.log(res);
            let resultInJson = JSON.parse(res.value);
            let pointFeatures = [];
            if (resultInJson.geometryType === "esriGeometryPoint") {
              pointFeatures = [...resultInJson.features];
              pointFeatures = pointFeatures.map((f) => {
                f = { ...f, spatialReference: resultInJson.spatialReference };
                return f;
              });
            }
            let result = {
              value: {
                pointFeatures: pointFeatures,
              },
              fileFormat: "kmz",
            };
            uploadAdBoardFile(result, this, cadFeaturesLayer);
            // callBackForCADFile(result)
          },
          this.callbackError.bind(this)
        );
    } else if (
      cadFeaturesLayer &&
      cadFeaturesLayer.toLocaleLowerCase() == "invest_site_polygon" &&
      filePath
    ) {
      this.props.openLoader();
      uploadCADFile(
        //parcels_CAD.DWG
        //boards_CAD.dwg
        window.__GP_CAD_TOJSON__,
        {
          CAD_File_Name: filePath,
        },
        // callBackForCADFile
        (res) => uploadLandFile(res, self, cadFeaturesLayer),
        this.callbackError.bind(this)
      );
    }
  };

  // user decline the process after his uploading cad file
  rejectConfimation() {
    this.setState({ showModal: false, modalMsg: "", currentModal: "" });
    this.props.emptyTempSelectedFeats();
    let cadLayerOnMap = window.__map__.getLayer("Features_From_CAD");
    cadLayerOnMap.clear();
  }
  //user approve on features on map after his uploading
  approveConfirmation(modalType) {
    // this.props.showTable(true);
    if (modalType === "confirmation") {
      // this.props.addSelectedFeaturesToTemp(this.state.tempSelectedFeatures); //add to temp till choosing user yes or no
      this.setState({ showModal: false });
      this.addLocationFromCharts();
    } else if (modalType === "checkIntersection") {
      let cadFeatures = this.props.tempSelectedFeaturesData;
      this.props.addLandToAddLandsTable(cadFeatures);
      this.props.showTable(true);
      this.notificationByAdding();
      this.setState({ showModal: false, modalMsg: "", currentModal: "" });
      this.props.emptyTempSelectedFeats();
    }
  }

  notificationNoData = () => {
    const args = {
      description: "لم يتم اختيار موقع استثماري",
      duration: 3,
    };
    notification.open(args);
  };

  addLocationFromCharts = () => {
    let cadFeatures = this.props.tempSelectedFeaturesData;

    if (cadFeatures.length) {
      //if there are some lands intesect with invest site polygons --> show msg
      let landsIntesectedWithInvestPolygons = cadFeatures.filter(
        (f) => f.isIntersectWithPolygon
      );
      if (landsIntesectedWithInvestPolygons.length) {
        setTimeout(() => {
          this.setState({
            showModal: true,
            modalMsg:
              "الموقع الاستثماري المراد اضافته يتقاطع مع مواقع استثمارية مستغلة" +
              " هل تريد الاستمرار في إضافة الموقع مع وجود تداخل مع موقع استثماري ",
            currentModal: "checkIntersection",
          });
        }, 1500);
      } else {
        this.props.addLandToAddLandsTable(cadFeatures);
        this.props.showTable(true);
        this.notificationByAdding();
        this.props.emptyTempSelectedFeats();
      }
    }
  };
  deSelect = (e) => {
  this.removeUploadedFile()
    this.Formref.current.setFieldsValue({ fileFormat: null, fileUpload: {file:{}, fileList:[]} });
    this.setState({ fileFormat: "", typeOfAddedData: "", selectedFile:null, fileNameForGeoProcessTool:"" });
  };
  handleSelect = (e, name) => {
    console.log(e);
    if (name === "fileFormat") {
      let cadLayerOnMap = window.__map__.getLayer("Features_From_CAD");
      cadLayerOnMap.clear();
      this.setState({ [name]: e });
    }else if(name==="typeOfAddedData"){
     this.removeUploadedFile()
      this.Formref.current.setFieldsValue({ fileFormat: null, fileUpload: {file:{}, fileList:[]} });
      this.setState({ [name]: e, fileFormat: "", selectedFile:null, fileNameForGeoProcessTool:"" });
   
    }
  };
  render() {
    return (
      <>
        <div className="coordinates mb-4">
          <h3 className="mb-2">إضافة موقع من الرسم الهندسي </h3>
          <Container className="pt-5">
            <Form
              className="GeneralForm"
              layout="vertical"
              name="validate_other"
              ref={this.Formref}
            >
              <Form.Item
                hasFeedback
                name="typeOfAddedData"
                rules={[
                  {
                    message:
                      "من فضلك اختر نوع المواقع الاستثمارية المراد إضافتها",
                    required: true,
                  },
                ]}
              >
                <Select
                  allowClear
                  showSearch
                  filterOption={(input, option) =>{
                    if (
                      typeof option.children === "object"
                    )
                      return (
                        option.children[0]
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      );
                    else return -1;
                    }
                  }
                  className="dont-show"
                  onDeselect={this.deSelect}
                  onClear={this.deSelect}
                  name="typeOfAddedData"
                  onChange={(e, name) =>
                    this.handleSelect(e, "typeOfAddedData")
                  }
                  placeholder=" نوع المواقع الاستثمارية المراد إضافتها"
                  getPopupContainer={(trigger) => trigger.parentNode}
                >
                  <Select.Option
                    key="Invest_Site_Polygon"
                    className="text-right"
                    value="Invest_Site_Polygon"
                  >
                    أراضي المواقع الاستثمارية
                    <img
                        className="server-img-icon-svg"
                        src={`${window.imagesServerUrl}/SITE_MAIN_ACTIVITY_FORAS/555.svg`}
                        alt="img"
                      />
                  </Select.Option>
                  <Select.Option
                    key="ADVERTISING_BOARDS"
                    className="text-right"
                    value="ADVERTISING_BOARDS"
                  >
                    اللوحات الإعلانية
                    <img
                        className="server-img-icon-svg m-2 ad-boards"
                        src={`${window.imagesServerUrl}/SITE_MAIN_ACTIVITY_FORAS/444.svg`}
                        alt="img"
                      />
                  </Select.Option>
                </Select>
              </Form.Item>
              {this.state.typeOfAddedData === "ADVERTISING_BOARDS" ? (
                <Form.Item
                  hasFeedback
                  name="fileFormat"
                  rules={[
                    {
                      message: "من فضلك اختر نوع الملف المرفوع",
                      required: true,
                    },
                  ]}
                >
                  <Select
                    allowClear
                    showSearch
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                    className="dont-show"
                    name="fileFormat"
                    onChange={(e, name) => this.handleSelect(e, "fileFormat")}
                    placeholder=" صيغة الملف الذي سيتم رفعه"
                    getPopupContainer={(trigger) => trigger.parentNode}
                  >
                    <Select.Option key="cad" className="text-right" value="cad">
                      ملف كاد
                    </Select.Option>
                    <Select.Option key="kmz" className="text-right" value="kmz">
                      KMZ ملف بصيغة
                    </Select.Option>
                  </Select>
                </Form.Item>
              ) : null}
              <Col xs={{ span: 24 }}>
                <p className="cadPlease">{this.state.typeOfAddedData==="Invest_Site_Polygon"?'من فضلك قم بإرفاق ملف كاد':
                'من فضلك قم بإرفاق الملف '
                }</p>
                <Form.Item
                  // hasFeedback
                  // name="fileUpload"
                  // rules={[
                  //   {
                  //     message: "من فضلك قم برفع الملف ",
                  //     required: true,
                  //   },
                  // ]}
                >
                  <Upload
                    disabled={this.state.typeOfAddedData ? false : true}
                    name="fileUpload"
                    fileList={this.state.selectedFile}
                    maxCount={1}
                    onChange={this.setFile}
                    accept=".kmz, .dwg"
                    type="file"
                    action={window.API_URL + "uploadMultifiles"}
                    onRemove={() => {
                      this.setState({ selectedFile: [], fileNameForGeoProcessTool:"" });
                    }}
                  >
                    <Button
                      disabled={this.state.typeOfAddedData ? false : true}
                      block
                    >
                      تحميل <CloudUploadOutlined />
                    </Button>
                  </Upload>
                </Form.Item>
                {/* <Button
                  onClick={this.getCadFile}
                  className="SearchBtn mt-3"
                  size="large"
                  htmlType="submit"
                >
                  اضافة
                </Button> */}
              </Col>
            </Form>
          </Container>
        </div>
        <Modal
          backdrop="static"
          className="addTaskModal"
          show={this.state.showModal}
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          // centered
        >
          <Modal.Header>
            <Modal.Title id="contained-modal-title-vcenter">
              {" "}
              {this.state.modalMsg}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="col">
              <Button
                onClick={() => this.rejectConfimation(this.state.currentModal)}
                className="addbtn mb-3"
                size="large"
                // htmlType="submit"
              >
                لا
              </Button>
              <Button
                onClick={() =>
                  this.approveConfirmation(this.state.currentModal)
                }
                className="addbtn mb-3"
                size="large"
                // htmlType="submit"
              >
                موافق
              </Button>
            </div>
          </Modal.Body>
        </Modal>
      </>
    );
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    addLandToAddLandsTable: (data) =>
      dispatch({ type: "ADD_TO_TABLE_DATA_SET", data }),
    pushContentToModal: (data) =>
      dispatch({ type: "TABLE_ICON_MODAL_DATA_SET", data }),
    clearTableData: () => dispatch({ type: "CLEAR_RESULT_TABLE_DATA_SET" }),
    emptyTempSelectedFeats: () => dispatch({ type: "EMPTY_DATA_FROM_TEMP" }),
    addSelectedFeaturesToTemp: (data) =>
      dispatch({ type: "ADD_DATA_TO_TEMP", data }),
  };
};

const mapStateToProps = ({ mapUpdate }) => {
  const { fields, currentUser, tableSettings, tempSelectedFeaturesData } =
    mapUpdate;
  return {
    fields,
    currentUser,
    tableSettings,
    tempSelectedFeaturesData,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AddLocationFromCAD);

import React, { Component } from "react";
import { Table, Modal } from "react-bootstrap";
import { Button, Tooltip, Checkbox, notification } from "antd";
// import AtmIcon from "@material-ui/icons/Atm";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAd } from '@fortawesome/free-solid-svg-icons'
import AtmIcon from "../../../assets/images/atm-icon-for-form.svg";
import AtmForm from "../AddLoctabsForms/AtmForm";
import AdvertisingForm from "../AddLoctabsForms/AdvertisingForm";
import MobileTowerForm from "../AddLoctabsForms/MobileTowerForm";
import ElectricityStationForm from "../AddLoctabsForms/ElectricityStationForm";
import BuildingDataForm from "../AddLoctabsForms/BuildingDataForm";
import LocationBordersForm from "../AddLoctabsForms/LocationBordersForm";
import EditForm from "../AddLoctabsForms/EditForm";
import { connect } from "react-redux";
import { getLayerIndex, highlightFeature } from "../../common/mapviewer";
class FirstStepAddLocFromParcelsTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showCancelModal: null,
      showCancelAllModal: null,
      showEditModal: null,
      showATMmodal: false,
      showMobileTower: false,
      showElectrictyStation: false,
      showBuildingData: false,
      showLocationBorders: false,
      showAdvertinsing: false,
      landId: null,
      allChecked: false,
      tableData: [],
      countedTableLength: 0,
      selectedFeatures: [],
    };
  }

  // handle check all input --> in case of check single checkbox
  componentDidMount() {
    if (this.props.tableSettings && this.props.tableSettings.result)
      this.setState({
        countedTableLength: this.props.tableSettings.result.length,
      });
  }
  // componentWillUpdate(){
  //   if (this.props.tableSettings && this.props.tableSettings.result)
  //     this.setState({
  //       selectedFeatures:this.props.tableSettings.result.filter(f=>f.isChecked)
  //     });
  // }
  componentWillUnmount() {
    // this.props.showTable(false);
    this.props.closeLoader();
    this.setState(null);
    // window.__map__.getLayer(
    //   "graphicLayer_Multi_Select"
    // ).clear();
    // window.__map__.getLayer(
    //   "Features_From_CAD"
    // ).clear();
    // this.props.clearTableData();
    // this.props.showTable(false);
  }
  componentDidUpdate() {
    //These next lines just for remove check from select all
    //in case of add new rows to table and the rows on table were already selected
    let { tableSettings } = this.props;
    if (tableSettings && tableSettings.result) {
      let resultData = [...tableSettings.result];
      if (
        resultData.find((item) => item.isChecked === false) &&
        this.state.allChecked &&
        this.state.countedTableLength !== resultData.length
      ) {
        this.setState({
          allChecked: false,
          countedTableLength: resultData.length,
        });
      }
    }
  }
  /**************** */

  handleCheck = (e) => {
    let itemID = e.target.id;
    let checked = e.target.checked;
    this.setState((prevState) => {
      let { allChecked } = prevState;
      let { tableSettings } = this.props;
      let tableData = [...tableSettings.result];
      tableData = tableData.map((item) =>
        item.id === itemID ? { ...item, isChecked: checked } : item
      );
      allChecked = tableData.every((item) => item.isChecked);
      let selectedFeatures = tableData.filter((f) => f.isChecked);

      this.props.editCountedData({ ...tableSettings, result: tableData });
      return { allChecked, selectedFeatures };
    });
  };
  handleCheckAll = (e) => {
    let checked = e.target.checked;
    let { tableSettings } = this.props;
    let tableData = [...tableSettings.result];
    tableData = tableData.map((item) => ({ ...item, isChecked: checked }));
    let selectedFeatures = tableData.filter((f) => f.isChecked);
    this.setState({ allChecked: checked, selectedFeatures });
    this.props.editCountedData({ ...tableSettings, result: tableData });
  };
  openModal = (name, id) => {
    if (id !== null) {
      this.setState({ [name]: id, landId: id });
    } else {
      this.setState({ [name]: true });
    }
  };
  closeModal = (name) => {
    this.setState({ [name]: null, landId: null });
  };

  cancelLand = (id) => {
    let graphicLayer;
    let graphicLayerMultiSelect = window.__map__.getLayer(
      "graphicLayer_Multi_Select"
    );
    let graphicLayerOfCAD = window.__map__.getLayer("Features_From_CAD");
    if (graphicLayerMultiSelect.graphics.length)
      graphicLayer = graphicLayerMultiSelect;
    else if (graphicLayerOfCAD.graphics.length)
      graphicLayer = graphicLayerOfCAD;
    if (id) {
      if (this.props.tableSettings.result.length === 1)
        this.props.showTable(false);
      let allGraphicFeatures = graphicLayer.graphics;
      let canceledGraphic = allGraphicFeatures.find(
        (f) => f.attributes.id === id
      );
      graphicLayer.remove(canceledGraphic);
      this.props.removeItemFromTable(id);
      let selectedFeatures = [...this.state.selectedFeatures];
      if (selectedFeatures.find((f) => f.id === id)) {
        selectedFeatures = selectedFeatures.filter((f) => f.id !== id);
      }
      //check if there is no rows in table grid --> close the grid
      this.setState({
        showCancelModal: null,
        selectedFeatures,
        countedTableLength: this.state.countedTableLength
          ? this.state.countedTableLength - 1
          : 0,
      });
    } else {
      let selectedFeaturesObjectIDs = [...this.state.selectedFeatures].map(
        (f) => (f.id ? f.id : f.id)
      );
      let allGraphicFeatures = graphicLayer.graphics;
      if (allGraphicFeatures.length)
        selectedFeaturesObjectIDs.forEach((id) => {
          graphicLayer.remove(
            allGraphicFeatures.find((g) => g.attributes.id === id)
          );
        });
      if (
        this.props.tableSettings.result.length ===
        this.state.selectedFeatures.length
      )
        this.props.showTable(false);
      this.props.cancelAllSelected();
      this.setState({
        showCancelAllModal: null,
        selectedFeatures: [],
        countedTableLength: this.state.countedTableLength
          ? this.state.countedTableLength - selectedFeaturesObjectIDs.length
          : 0,
      });
    }
    this.notificationWithCanceling();
  };

  notificationWithCanceling = () => {
    const args = {
      description:
        "تم الإلغاء بنجاح وإزالة الموقع الاستثماري/الاعلان من الجدول",
      duration: 3,
    };
    notification.open(args);
  };
  zoomToLand(id) {
    let graphicLayerOfMultiSelect = window.__map__.getLayer(
      "graphicLayer_Multi_Select"
    );
    let graphicLayerOfCADFile = window.__map__.getLayer("Features_From_CAD");
    let feature;
    if (graphicLayerOfMultiSelect.graphics.length) {
      feature = graphicLayerOfMultiSelect.graphics.find(
        (g) => g.attributes.id === id
      );
    } else if (graphicLayerOfCADFile.graphics.length) {
      feature = graphicLayerOfCADFile.graphics.find(
        (g) => g.attributes.id === id
      );
    }
    if (feature)
      highlightFeature(feature, window.__map__, {
        noclear: true,
        isZoom: true,
        strokeColor: "darkgray",
        highlightWidth: 5,
        layerName: "zoomGraphicLayer",
      });
    setTimeout(() => {
      let graphicLayerOfZooming = window.__map__.getLayer("zoomGraphicLayer");
      graphicLayerOfZooming.clear();
    }, 4000);
  }
  render() {
    const { tableSettings } = this.props;
    let tableData = [];
    let subTypesOfLandsOnTable = 0;
    let selectedAdBoardsGPCodes = [];
    let selectedFeatures = [];
    let adBoardData;
    if (tableSettings) {
      tableData = tableSettings.result;

      //******* Subtypes of all rows ********** */
      let isThereDataInUpdateTable = tableSettings && tableSettings.result;

      if (isThereDataInUpdateTable) {
        let { result } = tableSettings;
        selectedFeatures = result.filter((f) => f.isChecked);
        let investPolyonFeats = selectedFeatures.filter(
          (f) => f.layername.toLowerCase() === "invest_site_polygon"
        );
        //for ad boards
        let adBoardsFeats = selectedFeatures.filter(
          (f) => f.layername.toLowerCase() !== "invest_site_polygon"
        );
        if (selectedFeatures.length == investPolyonFeats.length) {
          console.log(selectedFeatures);
          if (selectedFeatures.length) {
            let isSelectedFeaturesHasSameSubtype;
            if (selectedFeatures.length) {
              let subTypesLandsOfSelectedFeats = selectedFeatures.map(
                (f) => f.investSiteDataAttributes.SITE_SUBTYPE
              );
              isSelectedFeaturesHasSameSubtype =
                Array.from(new Set(subTypesLandsOfSelectedFeats)).length === 1
                  ? true
                  : false;
              if (isSelectedFeaturesHasSameSubtype)
                subTypesOfLandsOnTable = Array.from(
                  new Set(subTypesLandsOfSelectedFeats)
                )[0];
              else subTypesOfLandsOnTable = 0;
            }
          } else subTypesOfLandsOnTable = 0;
        } else if (adBoardsFeats.length == selectedFeatures.length) {
          selectedAdBoardsGPCodes = adBoardsFeats.map(
            (adFeat) => adFeat.investSiteDataAttributes.GROUP_CODE
          );
          let isSelectedFeaturesHasSameGPCode =
            Array.from(new Set(selectedAdBoardsGPCodes)).length === 1
              ? true
              : false;
          if (isSelectedFeaturesHasSameGPCode) {
            subTypesOfLandsOnTable = 2;
            adBoardData = this.props.tableSettings.result.find((feat) => {
              if (
                feat.tblData &&
                feat.tblData.GROUP_CODE === selectedAdBoardsGPCodes[0]
              ) {
                return feat;
              }
            });
          } //type = 2  --- > ad boards
          else subTypesOfLandsOnTable = 0;
        } else subTypesOfLandsOnTable = 0;
        console.log(subTypesOfLandsOnTable);
        //******************* */
      }
    }
    if (tableSettings && tableSettings.result.length)
      return (
        <Table striped responsive className="firstStepTable">
          <div className="tableIcons">
            <span className="checkAllSpan"> اختيار الكل</span>
            <Checkbox
              id="checkAll"
              checked={this.state.allChecked}
              onChange={this.handleCheckAll}
              className="ml-2 mb-2 pr-2"
              style={{
                lineHeight: "32px",
                borderRight: "1px solid #d4d4d4",
              }}
            />
            {this.state.selectedFeatures.length ? (
              <>
                <Tooltip
                  className="mx-3"
                  placement="top"
                  title=" إلغاء المحدد من الجدول"
                >
                  <i
                    className="fas fa-times"
                    style={{
                      padding: "0.5em",
                      background: "#b54447",
                      color: "white",
                      borderRadius: "0.3em",
                    }}
                    onClick={() => this.openModal("showCancelAllModal", null)}
                  ></i>
                </Tooltip>
                <Modal
                  style={{ textAlign: "right" }}
                  show={this.state.showCancelAllModal}
                  onHide={() => this.closeModal("showCancelAllModal")}
                  backdrop="static"
                  size="lg"
                  aria-labelledby="contained-modal-title-vcenter"
                  centered
                >
                  <Modal.Header>
                    <Modal.Title>
                      هل أنت متأكد من إلغاء جميع الأراضي المحددة بالجدول ؟
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <Button
                      className="cancelbtn"
                      onClick={() => this.closeModal("showCancelAllModal")}
                    >
                      لا
                    </Button>
                    <Button
                      className="addbtn"
                      onClick={() => this.cancelLand(null)}
                    >
                      نعم
                    </Button>
                  </Modal.Body>
                </Modal>
              </>
            ) : null}
            {subTypesOfLandsOnTable === 6 && (
              <>
                <Tooltip placement="topLeft" title={"الصراف الالي"}>
                  <img
                    src={AtmIcon}
                    className="mx-3"
                    style={{ cursor: "pointer", width: "20px", height: "20px" }}
                    onClick={() => this.openModal("showATMmodal", null)}
                  />
                </Tooltip>
                <Modal
                  style={{ textAlign: "right" }}
                  show={this.state.showATMmodal === true && !this.state.landId}
                  onHide={() => this.closeModal("showATMmodal")}
                  backdrop="static"
                  size="lg"
                  aria-labelledby="contained-modal-title-vcenter"
                  centered
                >
                  <Modal.Header>
                    <Modal.Title id="contained-modal-title-vcenter">
                      الصراف الالي
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body className="scrollModal">
                    <AtmForm
                      openModal={this.openModal}
                      closeModal={this.closeModal}
                      id={this.state.landId}
                      showModal={this.state.showATMmodal}
                      landGeoID={null}
                      data={[]}
                      isOneLand={
                        this.state.showATMmodal === true ? false : true
                      }
                    />
                  </Modal.Body>
                </Modal>
              </>
            )}
            {subTypesOfLandsOnTable === 3 && (
              <>
                <Tooltip placement="topLeft" title={"برج الجوال"}>
                  <i
                    className="fas fa-broadcast-tower mx-3"
                    onClick={() => this.openModal("showMobileTower", null)}
                  ></i>
                </Tooltip>

                <Modal
                  style={{ textAlign: "right" }}
                  show={
                    this.state.showMobileTower === true && !this.state.landId
                  }
                  onHide={() => this.closeModal("showMobileTower")}
                  backdrop="static"
                  size="lg"
                  aria-labelledby="contained-modal-title-vcenter"
                  centered
                >
                  <Modal.Header>
                    <Modal.Title id="contained-modal-title-vcenter">
                      برج الجوال
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body className="scrollModal">
                    <MobileTowerForm
                      openModal={this.openModal}
                      closeModal={this.closeModal}
                      id={this.state.landId}
                      showModal={this.state.showMobileTower}
                      landGeoID={null}
                      data={[]}
                      isOneLand={
                        this.state.showMobileTower === true ? false : true
                      }
                    />
                  </Modal.Body>
                </Modal>
              </>
            )}
            {subTypesOfLandsOnTable === 5 && (
              <>
                <Tooltip placement="topLeft" title={"محطة الكهرباء"}>
                  <i
                    className="fas fa-gopuram mx-3"
                    onClick={() =>
                      this.openModal("showElectrictyStation", null)
                    }
                  ></i>
                </Tooltip>
                <Modal
                  style={{ textAlign: "right" }}
                  show={
                    this.state.showElectrictyStation === true &&
                    !this.state.landId
                  }
                  onHide={() => this.closeModal("showElectrictyStation")}
                  backdrop="static"
                  size="lg"
                  aria-labelledby="contained-modal-title-vcenter"
                  centered
                >
                  <Modal.Header>
                    <Modal.Title id="contained-modal-title-vcenter">
                      محطة الكهرباء
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body className="scrollModal">
                    <ElectricityStationForm
                      openModal={this.openModal}
                      closeModal={this.closeModal}
                      id={this.state.landId}
                      showModal={this.state.showElectrictyStation}
                      landGeoID={null}
                      data={[]}
                      isOneLand={
                        this.state.showElectrictyStation === true ? false : true
                      }
                    />
                  </Modal.Body>
                </Modal>
              </>
            )}
            {subTypesOfLandsOnTable === 1 && (
              <>
                <Tooltip placement="topLeft" title={"بيانات المبني"}>
                  <i
                    className="fas fa-city mx-3"
                    onClick={() => this.openModal("showBuildingData", null)}
                  ></i>
                </Tooltip>

                <Modal
                  style={{ textAlign: "right" }}
                  show={
                    this.state.showBuildingData === true && !this.state.landId
                  }
                  onHide={() => this.closeModal("showBuildingData")}
                  backdrop="static"
                  size="lg"
                  aria-labelledby="contained-modal-title-vcenter"
                  centered
                >
                  <Modal.Header>
                    <Modal.Title id="contained-modal-title-vcenter">
                      بيانات المبني
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body className="scrollModal">
                    <BuildingDataForm
                      openModal={this.openModal}
                      closeModal={this.closeModal}
                      id={this.state.landId}
                      showModal={this.state.showBuildingData}
                      landGeoID={null}
                      data={[]}
                      isOneLand={
                        this.state.showBuildingData === true ? false : true
                      }
                    />
                  </Modal.Body>
                </Modal>
              </>
            )}

            {subTypesOfLandsOnTable === 2 && (
              <>
              <span className="m-2">
                <Tooltip
                  placement="topLeft"
                  title={"بيانات المجموعة الإعلانية"}
                >
                  <FontAwesomeIcon icon={faAd} size='lg' onClick={() => this.openModal("showAdvertinsing", null)} />
                  {/* <i
                    className="fas fa-ad"
                    style={{ fontSize: "x-large", verticalAlign: "middle" }}
                    onClick={() => this.openModal("showAdvertinsing", null)}
                  ></i> */}
                </Tooltip>
                </span>
                <Modal
                  style={{ textAlign: "right" }}
                  show={
                    this.state.showAdvertinsing === true && !this.state.landId
                  }
                  onHide={() => this.closeModal("showAdvertinsing")}
                  backdrop="static"
                  size="lg"
                  aria-labelledby="contained-modal-title-vcenter"
                  centered
                >
                  <Modal.Header>
                    <Modal.Title id="contained-modal-title-vcenter">
                      المجموعات الإعلانية
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body className="scrollModal">
                    <AdvertisingForm
                      // openModal={this.openModal}
                      closeModal={this.closeModal}
                      id={this.state.landId}
                      showModal={this.state.showAdvertinsing}
                      landGeoID={null}
                      data={[]}
                      selectedAdBoards={selectedAdBoardsGPCodes}
                      tblData={adBoardData}
                      isOneLand={false}
                    />
                  </Modal.Body>
                </Modal>
              </>
            )}
            {/* <Tooltip placement="topLeft" title={"حدود الموقع"}>
              <i
                className="far fa-map mx-3"
                onClick={() => this.openModal("showLocationBorders", null)}
              ></i>
            </Tooltip> */}
          </div>
          <thead>
            <tr className="resultsHeader">
              <th>إجراءات</th>
              <th>رقم الأرض</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((land, index) => (
              <tr>
                <td className="updateActions">
                  <ul>
                    <li>
                      <Tooltip className="mx-3" placement="top" title="تكبير">
                        <i
                          className="fas fa-search-plus pl-1"
                          onClick={(id) =>
                            this.zoomToLand(land.id ? land.id : land.id)
                          }
                          id={land.id}
                        ></i>
                      </Tooltip>
                    </li>
                    {land.investSiteDataAttributes.SITE_SUBTYPE == 6 && (
                      <li>
                        <Tooltip placement="topLeft" title={"الصراف الالي"}>
                          <img
                            src={AtmIcon}
                            className={
                              // !land.isCompletedFilled.tblData.bool
                              //   ? "mx-3 not-completed-icons"
                              //   :
                              "mx-3"
                            }
                            style={{
                              cursor: "pointer",
                              width: "20px",
                              height: "20px",
                            }}
                            onClick={() =>
                              this.openModal("showATMmodal", land.id)
                            }
                            id={land.id}
                          />
                        </Tooltip>
                        <Modal
                          style={{ textAlign: "right" }}
                          show={
                            this.state.showATMmodal === land.id
                            // ||this.state.showATMmodal
                          }
                          onHide={() => this.closeModal("showATMmodal")}
                          backdrop="static"
                          size="lg"
                          aria-labelledby="contained-modal-title-vcenter"
                          centered
                        >
                          <Modal.Header>
                            <Modal.Title id="contained-modal-title-vcenter">
                              الصراف الالي
                            </Modal.Title>
                          </Modal.Header>
                          <Modal.Body className="scrollModal">
                            <AtmForm
                              openModal={this.openModal}
                              closeModal={this.closeModal}
                              id={this.state.landId}
                              showModal={this.state.showATMmodal}
                              landGeoID={land.id}
                              data={land.tblData}
                              isOneLand={true}
                            />
                          </Modal.Body>
                        </Modal>
                      </li>
                    )}
                    {land.investSiteDataAttributes.SITE_SUBTYPE == 3 && (
                      <li>
                        <Tooltip placement="topLeft" title={"برج الجوال"}>
                          <i
                            className={
                              // !land.isCompletedFilled.tblData.bool
                              //   ? "fas fa-broadcast-tower mx-3 not-completed-icons"
                              //   :
                              "fas fa-broadcast-tower mx-3"
                            }
                            onClick={() =>
                              this.openModal("showMobileTower", land.id)
                            }
                            id={land.id}
                          ></i>
                        </Tooltip>

                        <Modal
                          style={{ textAlign: "right" }}
                          show={this.state.showMobileTower === land.id}
                          onHide={() => this.closeModal("showMobileTower")}
                          backdrop="static"
                          size="lg"
                          aria-labelledby="contained-modal-title-vcenter"
                          centered
                        >
                          <Modal.Header>
                            <Modal.Title id="contained-modal-title-vcenter">
                              برج الجوال
                            </Modal.Title>
                          </Modal.Header>
                          <Modal.Body className="scrollModal">
                            <MobileTowerForm
                              openModal={this.openModal}
                              closeModal={this.closeModal}
                              id={this.state.landId}
                              showModal={this.state.showMobileTower}
                              landGeoID={land.id}
                              data={land.tblData}
                              isOneLand={true}
                            />
                          </Modal.Body>
                        </Modal>
                      </li>
                    )}

                    {land.investSiteDataAttributes.SITE_SUBTYPE == 5 && (
                      <li>
                        <Tooltip placement="topLeft" title={"محطة الكهرباء"}>
                          <i
                            className={
                              // !land.isCompletedFilled.tblData.bool
                              //   ? "fas fa-gopuram mx-3 not-completed-icons"
                              //   :
                              "fas fa-gopuram mx-3"
                            }
                            onClick={() =>
                              this.openModal("showElectrictyStation", land.id)
                            }
                            id={land.id}
                          ></i>
                        </Tooltip>

                        <Modal
                          style={{ textAlign: "right" }}
                          show={this.state.showElectrictyStation === land.id}
                          onHide={() =>
                            this.closeModal("showElectrictyStation")
                          }
                          backdrop="static"
                          size="lg"
                          aria-labelledby="contained-modal-title-vcenter"
                          centered
                        >
                          <Modal.Header>
                            <Modal.Title id="contained-modal-title-vcenter">
                              محطة الكهرباء
                            </Modal.Title>
                          </Modal.Header>
                          <Modal.Body className="scrollModal">
                            <ElectricityStationForm
                              openModal={this.openModal}
                              closeModal={this.closeModal}
                              id={this.state.landId}
                              showModal={this.state.showElectrictyStation}
                              landGeoID={land.id}
                              data={land.tblData}
                              isOneLand={true}
                            />
                          </Modal.Body>
                        </Modal>
                      </li>
                    )}
                    {land.investSiteDataAttributes.SITE_SUBTYPE == 1 && (
                      <li>
                        <Tooltip placement="topLeft" title={"بيانات المبني"}>
                          <i
                            className={
                              // !land.isCompletedFilled.tblData.bool
                              //   ? "fas fa-city mx-3 not-completed-icons"
                              //   :
                              "fas fa-city mx-3"
                            }
                            onClick={() =>
                              this.openModal("showBuildingData", land.id)
                            }
                            id={land.id}
                          ></i>
                        </Tooltip>

                        <Modal
                          style={{ textAlign: "right" }}
                          show={this.state.showBuildingData === land.id}
                          onHide={() => this.closeModal("showBuildingData")}
                          backdrop="static"
                          size="lg"
                          aria-labelledby="contained-modal-title-vcenter"
                          centered
                        >
                          <Modal.Header>
                            <Modal.Title id="contained-modal-title-vcenter">
                              بيانات المبني
                            </Modal.Title>
                          </Modal.Header>
                          <Modal.Body className="scrollModal">
                            <BuildingDataForm
                              openModal={this.openModal}
                              closeModal={this.closeModal}
                              id={this.state.landId}
                              showModal={this.state.showBuildingData}
                              landGeoID={land.id}
                              data={land.tblData}
                              isOneLand={true}
                            />
                          </Modal.Body>
                        </Modal>
                      </li>
                    )}
                    {getLayerIndex(land.layername) ==
                      getLayerIndex("invest_site_polygon") && (
                      <li>
                        <Tooltip placement="topLeft" title={"حدود الموقع"}>
                          <i
                            className={
                              // !land.isCompletedFilled.bordersData.bool
                              //   ? "far fa-map mx-3 not-completed-icons"
                              //   :
                              "far fa-map mx-3"
                            }
                            onClick={() =>
                              this.openModal("showLocationBorders", land.id)
                            }
                            id={land.id}
                          ></i>
                        </Tooltip>
                        <Modal
                          style={{ textAlign: "right" }}
                          show={this.state.showLocationBorders === land.id}
                          onHide={() => this.closeModal("showLocationBorders")}
                          backdrop="static"
                          size="lg"
                          aria-labelledby="contained-modal-title-vcenter"
                          centered
                        >
                          <Modal.Header>
                            <Modal.Title id="contained-modal-title-vcenter">
                              حدود الموقع
                            </Modal.Title>
                          </Modal.Header>
                          <Modal.Body className="scrollModal">
                            <LocationBordersForm
                              openModal={this.openModal}
                              closeModal={this.closeModal}
                              id={this.state.landId}
                              showModal={this.state.showLocationBorders}
                              landGeoID={land.id}
                              LengthsOfBordersPlan={land.bordersLengthFromPlan}
                              data={land.investSiteDataAttributes}
                            />
                          </Modal.Body>
                        </Modal>
                      </li>
                    )}
                    {
                      // land.fieldsForEdit.SITE_COMMON_USE === 15131 &&
                      getLayerIndex(land.layername) ==
                        getLayerIndex("ADVERTISING_BOARDS") &&
                        land.investSiteDataAttributes.GROUP_CODE && (
                          // land.fieldsForEdit.SITE_SUBTYPE === 2&&
                          <li 
                         className="m-2">
                            <Tooltip
                              placement="topLeft"
                              title={"المجموعات الإعلانية"}
                            >
                               <FontAwesomeIcon icon={faAd} size='lg' 
                           onClick={() =>this.openModal("showAdvertinsing", land.id)}
                                id={land.id} />
                            </Tooltip>

                            <Modal
                              style={{ textAlign: "right" }}
                              show={this.state.showAdvertinsing === land.id}
                              onHide={() => this.closeModal("showAdvertinsing")}
                              backdrop="static"
                              size="lg"
                              aria-labelledby="contained-modal-title-vcenter"
                              centered
                            >
                              <Modal.Header>
                                <Modal.Title id="contained-modal-title-vcenter">
                                  المجموعات الإعلانية
                                </Modal.Title>
                              </Modal.Header>
                              <Modal.Body className="scrollModal">
                                <AdvertisingForm
                                  // openModal={this.openModal} 
                                  closeModal={this.closeModal}
                                  id={this.state.landId}
                                  showModal={this.state.showAdvertinsing}
                                  landGeoID={land.id}
                                  data={land.tblData}
                                  mainData={land.investSiteDataAttributes}
                                  isOneLand={true}
                                />
                              </Modal.Body>
                            </Modal>
                          </li>
                        )
                    }

                    {getLayerIndex(land.layername) !==
                      getLayerIndex("ADVERTISING_BOARDS") && (
                      <li>
                        <Tooltip className="mx-3" placement="top" title="إلغاء">
                          <i
                            className="fas fa-times"
                            onClick={() =>
                              this.openModal("showCancelModal", land.id)
                            }
                            id={land.id}
                          ></i>
                        </Tooltip>
                        <Modal
                          style={{ textAlign: "right" }}
                          show={this.state.showCancelModal === land.id}
                          onHide={() => this.closeModal("showCancelModal")}
                          backdrop="static"
                          size="lg"
                          aria-labelledby="contained-modal-title-vcenter"
                          centered
                        >
                          <Modal.Header>
                            <Modal.Title>
                              هل أنت متأكد من إلغاء هذه الأرض؟
                            </Modal.Title>
                          </Modal.Header>
                          <Modal.Body>
                            <Button
                              className="cancelbtn"
                              onClick={() => this.closeModal("showCancelModal")}
                            >
                              لا
                            </Button>
                            <Button
                              className="addbtn"
                              id={land.id}
                              onClick={() => this.cancelLand(land.id)}
                            >
                              نعم
                            </Button>
                          </Modal.Body>
                        </Modal>
                      </li>
                    )}

                    <>
                      <li>
                        <Tooltip className="mx-3" placement="top" title="تعديل">
                          <i
                            className={
                              // !land.isCompletedFilled.mainData.bool
                              //   ? "fas fa-edit mx-3 not-completed-icons"
                              //   :
                              "fas fa-edit"
                            }
                            onClick={() =>
                              this.openModal("showEditModal", land.id)
                            }
                            id={land.id}
                          ></i>
                        </Tooltip>
                        <Modal
                          style={{ textAlign: "right" }}
                          show={this.state.showEditModal === land.id}
                          onHide={() => this.closeModal("showEditModal")}
                          backdrop="static"
                          size="lg"
                          aria-labelledby="contained-modal-title-vcenter"
                          centered
                        >
                          <Modal.Header>
                            <Modal.Title id="contained-modal-title-vcenter">
                              تعديل{" "}
                            </Modal.Title>
                          </Modal.Header>
                          <Modal.Body className="scrollModal">
                            <EditForm
                              openModal={this.openModal}
                              closeModal={this.closeModal}
                              id={this.state.landId}
                              data={land.investSiteDataAttributes}
                              showModal={this.state.showEditModal}
                              layername={land.layername}
                              openLoader={this.props.openLoader}
                              closeLoader={this.props.closeLoader}
                            />{" "}
                          </Modal.Body>
                        </Modal>
                      </li>
                    </>
                  </ul>
                </td>
                <td>
                  {land.layername.toLowerCase() === "invest_site_polygon"
                    ? land.investSiteDataAttributes.PARCEL_PLAN_NO
                      ? land.investSiteDataAttributes.PARCEL_PLAN_NO
                      : "لا يوجد"
                    : land.investSiteDataAttributes.SITE_FIELD_SERIAL
                    ? land.investSiteDataAttributes.SITE_FIELD_SERIAL
                    : "لا يوجد"}
                  <Checkbox
                    id={land.id}
                    key={land.id}
                    name={land.id}
                    value={land.id}
                    checked={land.isChecked}
                    onChange={this.handleCheck}
                    className="ml-3"
                    style={{
                      lineHeight: "32px",
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      );
    else return null;
  }
}

const mapStateToProps = ({ mapUpdate }) => {
  const { tableSettings } = mapUpdate;
  return {
    tableSettings,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    editCountedData: (data) =>
      dispatch({ type: "EDIT_ITEM_FROM_RESULT_COUNTED_TABLE_DATA_SET", data }),
    removeItemFromTable: (id) =>
      dispatch({ type: "REMOVE_ITEM_FROM_RESULT_COUNTED_TABLE_DATA_SET", id }),
    deleteFeatureFromMap: (id) =>
      dispatch({
        type: "DELTE_FEATURE_FROM_COUNTED_TABLE_DATA_SET_AND_MAP",
        id,
      }),
    clearTableData: () => dispatch({ type: "CLEAR_RESULT_TABLE_DATA_SET" }),
    cancelAllSelected: () =>
      dispatch({
        type: "CANCEL_SELECTED_ROWS_FROM_TABLE",
      }),
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FirstStepAddLocFromParcelsTable);

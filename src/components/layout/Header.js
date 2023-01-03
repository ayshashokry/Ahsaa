import React, { Component } from "react";
import { Nav, Container, NavDropdown } from "react-bootstrap";
import { Dropdown, Menu, notification, Tooltip } from "antd";
import FavMenu from "../headerSections/FavMenu";
import CallUsModal from "../modals/CallUsModal";
import MessageModal from "../modals/MessageModal";
import LayersMenu from "../headerSections/LayersMenu";
import IdentifyResult from "../modals/IdentifyResult";
import { getLayerIndex, identify, queryTask } from "../common/mapviewer";
import { groupBy } from "lodash";
import { connect } from "react-redux";
import Media from "react-media";
import Loader from "../loader/index";
import { makeFlashOnAssetsWithSameAuctionNo } from "../map/actions";
import PrintMenu from "../headerSections/PrintMenu";
import { createRef } from "react";
import { notificationMessage } from "../../helpers/utlis/notifications_Func";

class Header extends Component {
  identifyEvent = null;
  constructor(props) {
    super(props);
    this.state = {
      key: "generalSearch",
      showCallUs: false,
      showMessage: false,
      favName: "",
      showIdentify: false,
      showFav: false,
      showBaseMapGallery: false,
      showPrint: false,
      identifyData: null,
      selectedInfo: "",
      showLayers: false,
      showGoogle: false,
      InfoToSelect: [
        { name: "الأراضي الإستثمارية", id: 1 },
        { name: "الأراضي التجارية", id: 2 },
      ],
      loading: false,
      infoOpen: false,
    };
    this.basemapGallRef = createRef();
  }

  onSelect = (e) => {
    let graphicLayerOfMultiSelect = window.__map__.getLayer(
      "highLightGraphicLayer"
    );
    graphicLayerOfMultiSelect.clear();
    // if(e!=="economicStudyFromFeasibility") {
    this.props.disactivateSingleSelect();

    // }
    this.setState({ key: e });
    if (e !== "info") {
      this.setState({ showIdentify: false });
    }
    if (
      e !== "info" &&
      e !== "Fav" &&
      e !== "Print" &&
      e !== "google" &&
      e !== "menu" &&
      e !== "baseMapGallery"
    ) {
      this.props.changeRoute(e);
    }
    if (e == "info" && this.state.showIdentify) {
      this.props.activateInfoIcon(false);
      this.setState({ key: "" });
    }
    if (e === "Fav" && this.state.showFav) {
      this.setState({ key: "" });
    }
    if (e === "menu" && this.state.showLayers) {
      this.setState({ key: "" });
    }
    if (e === "Print" && this.state.showPrint) {
      this.setState({ key: "" });
    }
    if (e === "baseMapGallery") {
      this.setState({ key: "" });
    }
  };
  openCallUsModal = () => {
    this.setState({ showCallUs: true });
  };
  closeCallUsModal = () => {
    this.setState({ showCallUs: false });
  };
  openMessageModal = () => {
    this.setState({ showMessage: true });
  };
  closeMessageModal = () => {
    this.setState({ showMessage: false });
  };

  Identify = (geometry) => {
    let {user} = this.props;
    identify(window.__map__, {
      url: window.__mapUrl__,
      geometry,
      returnGeometry: true,
      tolerance: 5,
    })
      .then(async (identifyData) => {
        console.log(identifyData);
        //check in case of clicking on unkown place out of mapservice
        if (identifyData.length === 0) {
          this.setState({ loading: false });
          this.confirmationSelectLandWithNoLand();
          return;
        }
        //my code
        identifyData = identifyData.filter(
          (layer) =>
            layer.layerId === getLayerIndex("invest_site_polygon") ||
            layer.layerId === getLayerIndex("ADVERTISING_BOARDS")
        );
        let isInvestableSite = identifyData.find(d=>d.feature.attributes['حالة الموقع']=="مستثمرة");
        if(((user&&user.user_type_id!==1)||(!this.props.isAuth))&&isInvestableSite){
          notificationMessage("غير مصرح لك بالاطلاع على معلومات تلك الأرض",5);
          this.setState({ loading: false });
          return
        }
        else{
        if (identifyData.length == 0) {
          this.setState({
            showIdentify: false,
            // infoOpen: false,
            showGoogle: false,
            identifyData: null,
            showLayers: false,
          });
          this.confirmationSelectLandWithNoLand();
          this.setState({ loading: false });
          return;
        }
        console.log(identifyData);
        identifyData = this.mapFieldsToAliases(identifyData);
        console.log(identifyData);
        // var contracts = identifyData
        //   .map((f) => f.feature.attributes["CONTRACT_NUMBER"])
        //   .filter((f) => f && f.toLowerCase() !== "null");

        // identifyData = await this.mapContracts(contracts, identifyData);

        identifyData = groupBy(identifyData, "layerName");

        // if (this.state.infoOpen) {
        //   this.setState({ showIdentify: true });
        // }
        if (Object.keys(identifyData).length) {
          this.setState({ identifyData, showFav: false, showIdentify: true });
        } else this.confirmationSelectLandWithNoLand();
      }
        this.setState({ loading: false }); // for loader in case of identify process
      })
      .catch((e) => {
        this.setState({
          identifyData: null,
          showIdentify: false,
          // infoOpen: false,
        });
        console.error(e);
      });
  };

  mapContracts = async (contracts, identifyData) => {
    return new Promise((resolve, reject) => {
      if (!contracts.length) return resolve(identifyData);

      var layerIndex = window.__tables__.find(
        (t) => getLayerIndex(t.name) === getLayerIndex("tbl_contracts")
      ).id;

      var where = contracts.map((n) => "CONTRACT_NUMBER=" + n).join(" OR ");

      queryTask({
        returnGeometry: false,
        url: `${window.__mapUrl__}/${layerIndex}`,
        where,
        outFields: ["OWNER_NAME", "CONTRACT_NUMBER"],
        callbackResult: ({ features }) => {
          // just an unreasonable precaution
          // this condition will never evaluate by logic
          // but it is a precaution
          if (!features.length) resolve(identifyData);

          features.forEach((f) => {
            var e = identifyData.find(
              (ir) =>
                ir.feature.attributes["CONTRACT_NUMBER"] ===
                f.attributes["CONTRACT_NUMBER"]
            );
            e.feature.attributes["OWNER_NAME"] = f.attributes["OWNER_NAME"];
          });

          resolve(identifyData);
        },
        callbackError: (err) => {
          reject(err);
        },
      });
    });
  };

  mapFieldsToAliases = (identifyData) => {
    const { fields } = this.props;

    return identifyData.map((f) => {
      var { layerName } = f;
      var layerFields = fields[layerName.toLowerCase()];
      var {
        feature: { attributes },
      } = f;

      Object.keys(attributes).forEach((attr) => {
        var fld = layerFields.find((lf) => lf.alias === attr);
        if (fld) attributes[fld.name] = attributes[attr];
      });

      return f;
    });
  };

  confirmationSelectLandWithNoLand = () => {
    const args = {
      description: "لم يتم اختيار اراضي",
      duration: 3,
    };
    this.setState({ loading: false }); //for stop loader in case of there is no land selected
    notification.open(args);
  };

  componentDidUpdate(prevProps, prevState) {
    if ((this.props.routeName !== prevProps.routeName)||(this.props.currentUser!==prevProps.currentUser)) {
       if(this.props.routeName === "favorites"){
        this.setState({key:"favorites"})
       }else{
      this.props.activateInfoIcon(false);
      this.setState({
        showFav: false,
        showGoogle: false,
        showIdentify: false,
        infoOpen: false,
        showPrint: false,
        showBaseMapGallery: false,
      });
      if (
        this.props.routeName == "search" ||
        // this.props.routeName == "favorites" ||
        this.props.routeName == "contactcall"||
        this.props.routeName  == "updateLocation" ||
        this.props.routeName  == "InvestmentReport" ||
        this.props.routeName  == "feasibilityStudy" || 
        this.props.routeName  == "dashboard"
      ) {
        this.setState({ key: "" });
      }
    } 
  }else if(this.state.showFav && !this.props.selectedFeatures.length){
    this.setState({showFav:false})
  }
    // if ((prevState.key == this.state.key) == "info") {
    //   this.setState({ key: "" });
    // }
  }
  openReports = () => {
    const win = window.open("/InvestmentReport", "_blank");
    win.focus();
  };
  closeFav = (e) => {
    this.setState({ showFav: false, key: "" });
  };
  closePrint = (e) => {
    this.setState({ showPrint: false, key: "" });
  };
  openLoader = () => {
    this.setState({ loading: true });
  };
  stopLoader = () => {
    this.setState({ loading: false });
  };
  render() {
    return (
      <div className="Appheader" id={this.props.headerDisplay}>
        {this.state.loading ? <Loader /> : null}
        <Nav activeKey={this.state.key} onSelect={this.onSelect}>
          <>
            {/*** Start Left icons */}
            {/* go to Google maps  */}
            <i
              className=" mx-3 fas fa-question headerIcon headerHelpIcon"
              onClick={this.props.openHelp}
              style={{
                cursor: "pointer",
                transform: "scaleX(-1)",
              }}
            ></i>{" "}
            {this.props.currentUser !== "Guest" && (
              <i
                className="fab fa-google headerIcon mx-3 headerGoogleHelp"
                id={
                  this.state.showGoogle ? "headerIconShow" : "headerIconNotshow"
                }
                title="التصدير إلي جوجل"
                onClick={() => {
                  if (
                    this.props.selectedFeatures.length !== 1 &&
                    window.__map__.getLayer("highLightGraphicLayer").graphics
                      .length !== 1
                  ) {
                    notificationMessage(
                      "برجاء اختيار موقع واحد فقط للذهاب إلى جوجل ",
                      5
                    );
                  } else {
                    let feature = this.props.selectedFeatures[0];
                    let url =
                      "http://maps.google.com/maps?q=" +
                      feature.attributes["SITE_LAT_COORD"] +
                      "," +
                      feature.attributes["SITE_LONG_COORD"];
                    window.open(url, "_blank");
                    this.setState({
                      // showGoogle: !this.state.showGoogle,
                      showFav: false,
                      showIdentify: false,
                      infoOpen: false,
                      showPrint: false,
                      showBaseMapGallery: false,
                    });
                  }
                  if (this.state.infoOpen) {
                    this.props.handleMapClickEvent({
                      cursor: "default",
                      handler: ({ mapPoint }) => {
                        makeFlashOnAssetsWithSameAuctionNo(mapPoint);
                      },
                    });
                  }
                }}
              ></i>
            )}
            {/* favourite icon to add */}
            <i
              className="fas fa-star headerIcon mx-3 headerFavHelp"
              id={this.state.showFav ? "headerIconShow" : "headerIconNotshow"}
              title="المفضلة"
              onClick={(e) => {
                e.preventDefault();
                // this.props.handleMapClickEvent({
                //   cursor: "default",
                //   handler: ({ mapPoint }) => {
                //     makeFlashOnAssetsWithSameAuctionNo(mapPoint);
                //   },
                // });
                // var selectedFeatures = window.__map__.getLayer(
                //   "highLightGraphicLayer"
                // ).graphics;
                if (!this.props.selectedFeatures.length)
                  return this.confirmationSelectLandWithNoLand();
                // if(this.state.infoOpen)
                // this.props.handleMapClickEvent({
                //   cursor: "default",
                //   handler: ({ mapPoint }) => {
                //     makeFlashOnAssetsWithSameAuctionNo(mapPoint);
                //   }
                // });
                this.setState({
                  showFav: !this.state.showFav,
                  showGoogle: false,
                  showIdentify: false,
                  infoOpen: false,
                  showLayers: false,
                  showBaseMapGallery: false,
                });
              }}
            ></i>
            {/* Favourite input */}
            {this.state.showFav && (
              <div className={"showww"}>
                <div className="ant-dropdown-arrow"></div>
                <Container fluid>
                  <FavMenu
                    closeFav={this.closeFav}
                    openLoader={this.props.openLoader}
                    closeLoader={this.props.closeLoader}
                  />
                </Container>
              </div>
            )}
            {/** identify tool */}
            <Dropdown
              visible={this.state.showIdentify}
              // trigger={"click"}
              overlay={
                <Menu className="infoMenu" onClick={(e) => e.stopPropagation()}>
                  <Container fluid>
                    <IdentifyResult
                      showIdentify={this.state.showIdentify}
                      identifyData={this.state.identifyData}
                    />{" "}
                  </Container>
                </Menu>
              }
              placement="bottomLeft"
              arrow
            >
              <i
                className="fas fa-info mx-3 headerIcon headerInquiryHelp"
                onClick={() => {
                  //note showIdentify is still false in case click once again on info icon
                  // this.setState({ infoOpen: !this.state.infoOpen });
                  this.props.disactivateSingleSelect();
                  if (this.state.infoOpen == true) {
                    this.props.activateInfoIcon(false);
                    this.setState({ showIdentify: false, infoOpen: false });
                    this.props.handleMapClickEvent({
                      cursor: "default",
                      handler: ({ mapPoint }) => {
                        makeFlashOnAssetsWithSameAuctionNo(mapPoint);
                      },
                    });
                  } else {
                    this.setState({
                      showFav: false,
                      showLayers: false,
                      showPrint: false,
                      showGoogle: false,
                      showBaseMapGallery: false,
                      infoOpen: true,
                    });
                    this.props.activateInfoIcon(true);
                    notificationMessage("من فضلك اضغط على موقع استثماري من الخريطة لعرض بياناته ")
                    this.props.handleMapClickEvent({
                      cursor: "url('images/mouse-identify.png'),auto",
                      handler: ({ mapPoint }) => {
                        if (!this.state.showIdentify)
                          this.setState({ loading: true }); //for loader in case of identify process

                        this.Identify(mapPoint);
                      },
                    });
                  }
                }}
                id={
                  this.state.infoOpen ? "headerIconShow" : "headerIconNotshow"
                }
                title="الإستعلام"
              ></i>
            </Dropdown>
            {/**basemap gallery */}
            <Dropdown
              overlayClassName={this.state.showBaseMapGallery?"basemap-container":"hide-basemap-container"}
              // trigger={"click"}
              visible={true}
              overlay={
                <Menu className="basemap-Gallery-list">
                  <Container fluid>
                    <div ref={this.basemapGallRef} id="basemapGallery"></div>
                  </Container>
                </Menu>
              }
              placement="bottomLeft"
              arrow
            >
              <i
                id={
                  this.state.showBaseMapGallery
                    ? "headerIconShow"
                    : "headerIconNotshow"
                }
                title="معرض خرائط الأساس"
                className="fas fa-th-large headerIcon mx-3 headermapGalleryHelp"
                onClick={async () => {
                  if (this.state.infoOpen == true) {
                    this.setState({ showIdentify: false, infoOpen: false });
                    this.props.handleMapClickEvent({
                      cursor: "default",
                      handler: ({ mapPoint }) => {
                        makeFlashOnAssetsWithSameAuctionNo(mapPoint);
                      },
                    });
                  }
                  this.setState({
                    showBaseMapGallery: !this.state.showBaseMapGallery,
                    showFav: false,
                    showIdentify: false,
                    showGoogle: false,
                    infoOpen: false,
                    showLayers: false,
                    showPrint: false,
                  });
                }}
              ></i>
            </Dropdown>
            {/**layer menu (TOC) */}
            <Dropdown
              // trigger={"click"}
              visible={this.state.showLayers}
              overlay={
                <Menu className="layersMenu">
                  <Container fluid>
                    <LayersMenu legend={this.props.legend} />
                  </Container>
                </Menu>
              }
              placement="bottomLeft"
              arrow
            >
              <div
                className="esri-icon-drag-horizontal headerIcon mx-3 headerLayersHelp"
                title="الطبقات"
                onClick={() => {
                  if (this.state.infoOpen === true) {
                    this.setState({ showIdentify: false, infoOpen: false });
                    this.props.handleMapClickEvent({
                      cursor: "default",
                      handler: ({ mapPoint }) => {
                        makeFlashOnAssetsWithSameAuctionNo(mapPoint);
                      },
                    });
                  }
                  this.setState({
                    showLayers: !this.state.showLayers,
                    showFav: false,
                    showIdentify: false,
                    infoOpen: false,
                    showPrint: false,
                    showGoogle: false,
                    showBaseMapGallery: false,
                  });
                }}
                id={
                  this.state.showLayers ? "headerIconShow" : "headerIconNotshow"
                }
              ></div>
            </Dropdown>
            {/**Print icon */}
            <i
              title="الحفظ أو الطباعة"
              onClick={() => {
                if (this.state.infoOpen === true) {
                  this.setState({ showIdentify: false, infoOpen: false });
                  this.props.handleMapClickEvent({
                    cursor: "default",
                    handler: ({ mapPoint }) => {
                      makeFlashOnAssetsWithSameAuctionNo(mapPoint);
                    },
                  });
                }
                this.setState({
                  showPrint: !this.state.showPrint,
                  showFav: false,
                  showLayers: false,
                  showGoogle: false,
                  showIdentify: false,
                  infoOpen: false,
                  showBaseMapGallery: false,
                });
              }}
              style={{ position: "relative" }}
              className="fas fa-save headerIcon ml-3 headerSavePrintHelp"
              id={this.state.showPrint ? "headerIconShow" : "headerIconNotshow"}
            >
              {" "}
              {this.state.showPrint ? (
                <div className="showPrint">
                  <div className="ant-dropdown-arrow custom-arrow"></div>
                  <Container fluid>
                    <PrintMenu
                      closePrint={this.closePrint}
                      openLoader={this.props.openLoader}
                      stopLoader={this.props.closeLoader}
                    />
                  </Container>
                </div>
              ) : null}
            </i>{" "}
            <Tooltip title="مساعدة" placement="bottom">
              {" "}
            </Tooltip>
            {/*** End Left icons */}
            {/*** Start right sub titles */}
            {/**search sub titles */}
          </>
          {this.props.routeName === "search" ||
          this.props.routeName === "generalSearch" ||
          this.props.routeName === "coordinates" ||
          this.props.routeName === "nearestLocation" ? (
            <>
              <Nav.Item className="ml-auto headernearLocationHelp">
                <Nav.Link
                  className="pl-5 ml-3"
                  onClick={this.props.handleOpenMenu}
                  eventKey="nearestLocation"
                  title="أقرب موقع "
                >
                  <span>أقرب موقع</span>{" "}
                  <i className="fas fa-location-arrow pl-2"></i>
                </Nav.Link>
              </Nav.Item>
              <Nav.Item
                style={{ borderLeft: "1px solid #d4d6de" }}
                className="headerCooSearchHelp"
              >
                <Nav.Link
                  className="pl-5 ml-3"
                  onClick={this.props.handleOpenMenu}
                  eventKey="coordinates"
                  title="إحداثيات"
                >
                  <span>إحداثيات</span>{" "}
                  <i className="fas fa-directions pl-2"></i>
                </Nav.Link>
              </Nav.Item>
              <Nav.Item
                className="headerGeneralSearchHelp"
                style={{ borderLeft: "1px solid #d4d6de" }}
              >
                <Nav.Link
                  className="pl-5 ml-3"
                  onClick={this.props.handleOpenMenu}
                  eventKey="generalSearch"
                  title=" عام"
                >
                  <span> عام</span>
                  <i className="fas fa-search pl-2"></i>
                </Nav.Link>
              </Nav.Item>
            </>
          ) : this.props.routeName === "favorites" ? (
            <>
              {/**Favourite menu list */}
              <Nav.Item className="ml-auto">
                <Nav.Link
                  onClick={this.props.handleOpenMenu}
                  eventKey="favorites"
                  title=" المفضلة"
                >
                  <span> المفضلة</span> <i className="fas fa-star pl-2"></i>
                </Nav.Link>
              </Nav.Item>
            </>
          ) : this.props.routeName === "home" ||
            this.props.routeName === "InvestmentReport" ||
            this.props.routeName === "dashboard" ? null : this.props
              .routeName === "updateLocation" ||
            this.props.routeName === "addLocationCad" ||
            this.props.routeName === "addLocationCharts" ||
            this.props.routeName === "updateLocationInfo" ? (
            <Media query="(max-width: 768px)">
              {/**adding, update sites */}
              {(matches) =>
                matches ? (
                  <NavDropdown title="" id="nav-dropdown">
                    {" "}
                    <NavDropdown.Item>
                      <Nav.Item className="headeraddLocationCadsHelp">
                        <Nav.Link
                          onClick={this.props.handleOpenMenu}
                          eventKey="addLocationCad"
                          title=" إضافة موقع من الرسم الهندسي"
                        >
                          إضافة موقع من الرسم الهندسي
                        </Nav.Link>
                      </Nav.Item>
                    </NavDropdown.Item>
                    <NavDropdown.Item>
                      <Nav.Item className="headeraddLocationChartsHelp">
                        <Nav.Link
                          onClick={this.props.handleOpenMenu}
                          eventKey="addLocationCharts"
                          title=" إضافة موقع من طبقة الأراضي "
                        >
                          إضافة موقع من طبقة الأراضي
                        </Nav.Link>
                      </Nav.Item>
                    </NavDropdown.Item>
                    <NavDropdown.Item>
                      <Nav.Item className="headerUpdateLocInfoHelp">
                        <Nav.Link
                          onClick={this.props.handleOpenMenu}
                          eventKey="updateLocationInfo"
                          title=" تعديل بيانات موقع "
                        >
                          تعديل بيانات موقع
                        </Nav.Link>
                      </Nav.Item>
                    </NavDropdown.Item>
                  </NavDropdown>
                ) : (
                  <>
                    <Nav.Item className="ml-auto headeraddLocationCadsHelp">
                      <Nav.Link
                        onClick={this.props.handleOpenMenu}
                        eventKey="addLocationCad"
                        title=" إضافة موقع من الرسم الهندسي"
                      >
                        <span>إضافة موقع من الرسم الهندسي</span>{" "}
                        <i className="fas fa-upload pl-2"></i>
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item
                      className="headeraddLocationChartsHelp"
                      style={{ borderLeft: "1px solid #d4d6de" }}
                    >
                      <Nav.Link
                        onClick={this.props.handleOpenMenu}
                        eventKey="addLocationCharts"
                        title=" إضافة موقع من طبقة الأراضي "
                      >
                        <span> إضافة موقع من طبقة الأراضي</span>{" "}
                        <i className="far fa-copy pl-2"></i>
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item
                      className="headerUpdateLocInfoHelp"
                      style={{ borderLeft: "1px solid #d4d6de" }}
                    >
                      <Nav.Link
                        onClick={this.props.handleOpenMenu}
                        eventKey="updateLocationInfo"
                        title=" تعديل بيانات موقع "
                      >
                        <span>تعديل بيانات موقع</span>{" "}
                        <i className="fas fa-sync pl-2"></i>
                      </Nav.Link>
                    </Nav.Item>
                  </>
                )
              }
            </Media>
          ) : this.props.routeName === "feasibilityStudy" ||
            this.props.routeName === "economicStudyFromFeasibility" ||
            this.props.routeName === "pricingFromFeasibility" ||
            this.props.routeName === "suggestionsFromFeasibility" ||
            this.props.routeName === "remarksFromFeasibility" ? (
            <Media query="(max-width: 768px)">
              {(matches) =>
                matches ? (
                  <NavDropdown title="" id="nav-dropdown">
                    {" "}
                    <NavDropdown.Item>
                      <Nav.Item className="headerEcoStudyHelp">
                        <Nav.Link
                          onClick={this.props.handleOpenMenu}
                          eventKey="economicStudyFromFeasibility"
                          title="الدراسة التخطيطية والاقتصادية"
                        >
                          الدراسة التخطيطية والاقتصادية
                        </Nav.Link>
                      </Nav.Item>
                    </NavDropdown.Item>
                    {/***  التسعير  **** */}
                    {/* <NavDropdown.Item>
                      <Nav.Item>
                        <Nav.Link
                          onClick={this.props.handleOpenMenu}
                          eventKey="pricingFromFeasibility"
                          title="التسعير"
                        >
                         التسعير
                        </Nav.Link>
                      </Nav.Item>
                    </NavDropdown.Item> */}
                    <NavDropdown.Item>
                      <Nav.Item className="headerFesSuggestHelp">
                        <Nav.Link
                          onClick={this.props.handleOpenMenu}
                          eventKey="suggestionsFromFeasibility"
                          title="الاقتراحات"
                        >
                          الاقتراحات
                        </Nav.Link>
                      </Nav.Item>
                    </NavDropdown.Item>
                    <NavDropdown.Item>
                      <Nav.Item className="headerFesNotesHelp">
                        <Nav.Link
                          onClick={this.props.handleOpenMenu}
                          eventKey="remarksFromFeasibility"
                          title="الملاحظات"
                        >
                          الملاحظات
                        </Nav.Link>
                      </Nav.Item>
                    </NavDropdown.Item>
                  </NavDropdown>
                ) : (
                  <>
                    <Nav.Item className="ml-auto headerEcoStudyHelp">
                      <Nav.Link
                        onClick={this.props.handleOpenMenu}
                        eventKey="economicStudyFromFeasibility"
                        title=" الدراسة التخطيطية والاقتصادية "
                      >
                        <span> الدراسة التخطيطية والاقتصادية</span>{" "}
                        <i className="far fa-copy pl-2"></i>
                      </Nav.Link>
                    </Nav.Item>
                    {/*** التسعير  **** */}
                    {/* <Nav.Item style={{ borderLeft: "1px solid #d4d6de" }}>
                      <Nav.Link
                        onClick={this.props.handleOpenMenu}
                        eventKey="pricingFromFeasibility"
                        title=" التسعير "
                      >
                        <span> التسعير</span>{" "}
                        <i className="far fa-copy pl-2"></i>
                      </Nav.Link>
                    </Nav.Item> */}
                    <Nav.Item
                      className="headerFesSuggestHelp"
                      style={{ borderLeft: "1px solid #d4d6de" }}
                    >
                      <Nav.Link
                        onClick={this.props.handleOpenMenu}
                        eventKey="suggestionsFromFeasibility"
                        title=" الاقتراحات"
                      >
                        <span>الاقتراحات</span>{" "}
                        <i className="far fa-copy pl-2"></i>
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item
                      className="headerFesNotesHelp"
                      style={{ borderLeft: "1px solid #d4d6de" }}
                    >
                      <Nav.Link
                        onClick={this.props.handleOpenMenu}
                        eventKey="remarksFromFeasibility"
                        title=" الملاحظات "
                      >
                        <span> الملاحظات</span>{" "}
                        <i className="far fa-copy pl-2"></i>
                      </Nav.Link>
                    </Nav.Item>
                  </>
                )
              }
            </Media>
          ) :["siteDetailsSideMenu", 'dblClickSiteDetailsSideMenu','myContractedSites'].includes(this.props.routeName)?null: (
            <>
              <Nav.Item className="ml-auto">
                <Nav.Link
                  className="headermessageHelp"
                  onClick={this.openMessageModal}
                  eventKey="message"
                  title="راسلنا"
                >
                  <span> راسلنا</span> <i className="far fa-envelope pl-2"></i>
                </Nav.Link>
              </Nav.Item>
              <Nav.Item style={{ borderLeft: "1px solid #d4d6de" }}>
                <Nav.Link
                  onClick={this.openCallUsModal}
                  eventKey="callUs"
                  className="headercallUsHelp"
                  title="اتصل بنا"
                >
                  <span> اتصل بنا</span> <i className="fas fa-phone pl-2"></i>
                </Nav.Link>
              </Nav.Item>
            </>
          )}
        </Nav>
        <CallUsModal
          isAuth={this.props.isAuth}
          show={this.state.showCallUs}
          closeCallUsModal={this.closeCallUsModal}
        />
        <MessageModal
          show={this.state.showMessage}
          closeMessageModal={this.closeMessageModal}
        />
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    handleMapClickEvent: ({ cursor, handler }) =>
      dispatch({ type: "MAP_CLICK_EVENT", cursor, handler }),
    activateSingleSelect: (layerName, purposeOfSelect) =>
      dispatch({ type: "ACTIVATE_SINGLE_SELECT", layerName, purposeOfSelect }),
    disactivateSingleSelect: () =>
      dispatch({ type: "DIACTIVATE_SINGLE_SELECT" }),
    emptyTempSelectedFeats: () => dispatch({ type: "EMPTY_DATA_FROM_TEMP" }),
  };
};

const mapStateToProps = ({ mapUpdate }) => {
  const {
    selectedFeatures,
    legend,
    fields,
    currentUser,
    singleSelectActive,
    multiSelectActive,
    auth,
  } = mapUpdate;
  return {
    selectedFeatures,
    legend,
    fields,
    currentUser,
    singleSelectActive,
    multiSelectActive,
    isAuth:auth.isAuth,
    user: auth.user,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);

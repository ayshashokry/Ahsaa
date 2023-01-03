import React, { Component } from "react";
import { connect } from "react-redux";
import { Tooltip, notification } from "antd";
import {
  getLayerIndex,
  LoadModules,
  queryTask,
  highlightFeature,
  handleMultiSelectFeatures,
  handleSingleSelectFeature,
  zoomToLayer,
  highLight,
} from "../common/mapviewer";
import { makeFlashOnAssetsWithSameAuctionNo } from "../map/actions";
import Loader from "../loader/index";
import {
  callbackMultiSelectForNormalSelection,
  callBackMultiSelectFromMapForAddLandsToInvestment,
  callBackMultiSelectFromMapForPricing,
  callBackMultiSelectFromMapForPrintInvestReport,
  callBackMultiSelectFromMapForUpdate,
  handleShowingDetails,
} from "./helpers_Funcs";

import { notificationMessage } from "../../helpers/utlis/notifications_Func";
import { difference } from "lodash";
import ConfirmationModal from "./confirmationModal";
class MapActions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeIcon: 0,
      loading: false,
      mapList: [
        {
          id: 1,
          title: "الخريطة كاملة",
          ClickName: "fullextent",
          icon: <i className="fas fa-1x fa-globe-americas mapFullExHelp"></i>,
        },
        {
          id: 2,
          title: "تكبير",
          ClickName: "zoomin",
          icon: (
            <i id="1" className="fas fa-1x fa-search-plus mapZoomInHelp"></i>
          ),
        },
        {
          id: 3,
          title: "تصغير",
          ClickName: "zoomout",
          icon: (
            <i id="2" className="fas fa-1x fa-search-minus mapZoomOutHelp"></i>
          ),
        },
        {
          id: 4,
          title: "السابق",
          ClickName: "prev",
          icon: (
            <i
              id="3"
              onClick={this.onSelectSpot}
              className="fas fa-1x fa-chevron-left mapPrevHelp"
            ></i>
          ),
        },
        {
          id: 5,
          title: "التالي",
          ClickName: "next",
          icon: <i className="fas fa-1x fa-chevron-right mapNextHelp"></i>,
        },
        {
          id: 6,
          title: "تحريك",
          ClickName: "pan",
          icon: <i className="fas fa-1x fa-arrows-alt mapPanHelp"></i>,
        },
        {
          id: 7,
          title: "تحديد",
          ClickName: "select",
          icon: <i className="fas fa-1x fa-expand mapSelectHelp"></i>,
        },
        {
          id: 8,
          title: "مسح التحديد",
          ClickName: "clear-select",
          icon: <i className="fas fa-1x fa-trash mapRemoveSelectHelp"></i>,
        },
        {
          id: 9,
          title: "إيقاف التحديد",
          ClickName: "stop-select",
          icon: <i className="fas fa-1x fa-times mapStopSelectHelp"></i>,
        },
        {
          id: 10,
          title: "عرض بيانات المواقع الاستثمارية",
          ClickName: "show-more-details",
          icon: <i className="fas fa-list-alt mapShowInfoHelp"></i>,
          // <FcViewDetails size={25} />
        },
        // {
        //   id: 10,
        //   title: "تحديد أكثر من قطعة",
        //   ClickName: "multiple-select",
        //   icon: <i className="fas fa-object-group"></i>,
        // },
        // {
        //   id: 11,
        //   title: "إلغاء تحدد قطعة أرض",
        //   ClickName: "deselect",
        //   icon: <i className="fas fa-object-ungroup"></i>,
        // },
      ],
      disableMultiSelect: null,
      confirmationModalIsShow: false,
    };
  }
  navigator = undefined;
  componentDidUpdate(prevProps, prevState) {
    const {
      handleMapClickEvent,
      currentUser,
      singleSelectActive,
      emptyTempSelectedFeats,
      multiSelectActive,
      mapLoaded,
    } = this.props;
    if (!prevProps.mapLoaded && mapLoaded) {
      this.navigator = undefined;
      this.createNavigator(mapLoaded);
    }
    //in case make logout or login
    if (prevProps.currentUser != currentUser) {
      if (!this.navigator) this.createNavigator(true);
      this.setState({ activeIcon: 0, disableMultiSelect: null });
      if (window.__map__) {
        //reset click event
        handleMapClickEvent({
          cursor: "default",
          handler: ({ mapPoint }) =>
            makeFlashOnAssetsWithSameAuctionNo(mapPoint),
        });
        //remove multiselect handler after draw end
        let selectionToolbar = window.__MultiSelect__;
        selectionToolbar.onDrawEnd = null; //remove drawend handler ==> important
        /**another way */
        // this.state.disableMultiSelect.array.forEach(
        //   this.state.disableMultiSelect.eventListenersArr,
        //   function (handle) {
        //     handle.remove();
        //   }
        // );
      }
    } else if (
      this.props.infoIconActive &&
      singleSelectActive &&
      prevProps.singleSelectActive.isActive &&
      !singleSelectActive.isActive
    ) {
      this.setState({ activeIcon: 0, disableMultiSelect: null });
    }
    //in case user stand on search tab and click on Submit to get results==> disable select icon
    else if (
      (prevProps.singleSelectActive?.isActive &&
      !singleSelectActive.isActive &&
      this.props.routeName === "generalSearch" &&
      this.props.tableSettings?.result?.length)
    ) {
      // this.props.disactivateSingleSelect()
      this.setState({ activeIcon: 0, disableMultiSelect: null });
      //reset click event
      handleMapClickEvent({
        cursor: "default",
        handler: ({ mapPoint }) => makeFlashOnAssetsWithSameAuctionNo(mapPoint),
      });
      this.handleDisableMultiSelect();
      //remove multiselect handler after draw end
      let selectionToolbar = window.__MultiSelect__;
      selectionToolbar.onDrawEnd = null; //remove drawend handler ==> important
    }
    if(singleSelectActive.isActive &&this.props.routeName==='dblClickSiteDetailsSideMenu'){
        this.props.disactivateSingleSelect()
        this.setState({ activeIcon: 0, disableMultiSelect: null });
        //reset click event
        handleMapClickEvent({
          cursor: "default",
          handler: ({ mapPoint }) => makeFlashOnAssetsWithSameAuctionNo(mapPoint),
        });
        this.handleDisableMultiSelect();
        //remove multiselect handler after draw end
        let selectionToolbar = window.__MultiSelect__;
        selectionToolbar.onDrawEnd = null; //remove drawend handler ==> important
    }
    if (
      prevProps.singleSelectActive?.isActive &&
      !singleSelectActive.isActive &&
      this.props.routeName === "nearestLocation"
    ) {
      // this.props.disactivateSingleSelect()
      this.setState({ activeIcon: 0, disableMultiSelect: null });
      //reset click event
      handleMapClickEvent({
        cursor: "default",
        handler: ({ mapPoint }) => makeFlashOnAssetsWithSameAuctionNo(mapPoint),
      });
      this.handleDisableMultiSelect();
      //remove multiselect handler after draw end
      let selectionToolbar = window.__MultiSelect__;
      selectionToolbar.onDrawEnd = null; //remove drawend handler ==> important
    }
    //in single select for feasibility study modal
    //after selecting a site => reset click handler
    else if (
      (singleSelectActive &&
        prevProps.singleSelectActive.isActive &&
        !singleSelectActive.isActive) ||
      (singleSelectActive &&
        prevProps.singleSelectActive.purposeOfSelect &&
        prevProps.singleSelectActive.purposeOfSelect !==
          singleSelectActive.purposeOfSelect)
    ) {
      this.setState({ activeIcon: 0, disableMultiSelect: null });
      if (!this.props.infoIconActive) {
        window.__map__.getLayer("highLightGraphicLayer").clear();
        emptyTempSelectedFeats();
        //reset click event
        handleMapClickEvent({
          cursor: "default",
          handler: ({ mapPoint }) =>
            makeFlashOnAssetsWithSameAuctionNo(mapPoint),
        });
        this.handleDisableMultiSelect();
        //remove multiselect handler after draw end
        let selectionToolbar = window.__MultiSelect__;
        selectionToolbar.onDrawEnd = null; //remove drawend handler ==> important
        // this.state.disableMultiSelect.array.forEach(
        //   this.state.disableMultiSelect.eventListenersArr,
        //   function (handle) {
        //     handle.remove();
        //   }
        // );
      } else {
        //todo (if required): clear all (tableSettings, map from graphics )
      }
    }
    //in case of diactivate multiselect
    else if (
      !multiSelectActive.isActive &&
      prevProps.multiSelectActive.isActive
    ) {
      //reset click event
      handleMapClickEvent({
        cursor: "default",
        handler: ({ mapPoint }) => makeFlashOnAssetsWithSameAuctionNo(mapPoint),
      });
      this.setState({ activeIcon: 0, disableMultiSelect: null });
      this.handleDisableMultiSelect();
      //remove multiselect handler after draw end
      let selectionToolbar = window.__MultiSelect__;
      selectionToolbar.onDrawEnd = null; //remove drawend handler ==> important
    } else if (
      prevState.activeIcon == 7 &&
      multiSelectActive.isActive &&
      !prevProps.multiSelectActive.isActive
    ) {
      this.setState({ activeIcon: 0 });
    }
  }
  componentDidMount() {
    this.props.mapLoaded && this.createNavigator(true);
  }
  createNavigator(mapLoaded) {
    if (mapLoaded && !this.navigator) {
      LoadModules(["esri/toolbars/navigation"]).then(([Navigation]) => {
        this.navigator = new Navigation(window.__map__);
      });
    }
  }

  handleDisableMultiSelect() {
    let selectionToolbar = window.__MultiSelect__;
    if (selectionToolbar) {
      selectionToolbar.deactivate();
      this.navigator.activate("pan");
    }
    {
      //remove multiselect handler after draw end
      selectionToolbar.onDrawEnd = null; //remove drawend handler ==> important
      this.setState({ disableMultiSelect: null });
    }
  }

  handleClick(type, id) {
    const {
      clearSelection,
      handleMapClickEvent,
      activeSigleSelect,
      auth,
      dashboardData,
      showRemarkSuggestTablestate,
      showUpdateTablestate,
      multiSelectActive,
      showResultTablestate,
      routeName,
      tableSettings,
    } = this.props;

    this.navigator?.deactivate();

    switch (type) {
      case "fullextent":
        this.handleDisableMultiSelect();
        handleMapClickEvent({
          cursor: "default",
          handler: ({ mapPoint }) =>
            makeFlashOnAssetsWithSameAuctionNo(mapPoint),
        });
        window.__map__.setExtent(window.__fullExtent__);
        this.setState({ activeIcon: id });
        break;

      case "zoomin":
        this.handleDisableMultiSelect();
        handleMapClickEvent({
          cursor: "url('images/zoom.png'),auto",
          handler: ({ mapPoint }) =>
            makeFlashOnAssetsWithSameAuctionNo(mapPoint),
        });
        // handleMapClickEvent({ cursor: 'zoom-in' })
        this.navigator.activate("zoomin");
        this.setState({ activeIcon: id });

        break;

      case "zoomout":
        this.handleDisableMultiSelect();
        handleMapClickEvent({
          cursor: "url('images/zoomout.png'),auto",
          handler: ({ mapPoint }) =>
            makeFlashOnAssetsWithSameAuctionNo(mapPoint),
        });
        // handleMapClickEvent({ cursor: "zoom-out" })
        this.navigator.activate("zoomout");
        this.setState({ activeIcon: id });

        break;

      case "prev":
        this.handleDisableMultiSelect();
        handleMapClickEvent({
          cursor: "default",
          handler: ({ mapPoint }) =>
            makeFlashOnAssetsWithSameAuctionNo(mapPoint),
        });
        this.navigator.zoomToPrevExtent();
        this.setState({ activeIcon: id });

        break;

      case "next":
        this.handleDisableMultiSelect();
        handleMapClickEvent({
          cursor: "default",
          handler: ({ mapPoint }) =>
            makeFlashOnAssetsWithSameAuctionNo(mapPoint),
        });
        this.navigator.zoomToNextExtent();
        this.setState({ activeIcon: id });

        break;

      case "pan":
        this.handleDisableMultiSelect();
        handleMapClickEvent({
          cursor: "url('images/pan.png'),auto",
          handler: ({ mapPoint }) =>
            makeFlashOnAssetsWithSameAuctionNo(mapPoint),
        });
        // handleMapClickEvent({ cursor: "grab" })
        this.navigator.activate("pan");
        this.setState({ activeIcon: id });

        break;

      case "select":
        //todo: showing confiration message to remove wizards content if user clicks on select icon [done]
        if (
          dashboardData ||
          showRemarkSuggestTablestate ||
          showResultTablestate ||
          (showUpdateTablestate && !multiSelectActive.isActive) ||
          (routeName === "favorites" && tableSettings)||
          (routeName==='dblClickSiteDetailsSideMenu'&&tableSettings)
        )
          this.showingConfirmationModal(true);
        else this.handleSelectClick();
        break;

      case "deselect":
        // this.handleDisableMultiSelect();
        // handleMapClickEvent({
        //   cursor: "default",
        //   handler: (e) => this.deselectFeature(e),
        // });
        // this.setState({ activeIcon: id });
        break;

      case "clear-select":
        this.handleDisableMultiSelect();
        this.props.emptyTempSelectedFeats();
        if (this.props.multiSelectActive.isActive) {
          this.removeAllTempGraphics("graphicLayer_Multi_Select");
        } else {
          //remove highlighting from map
          window.__map__.getLayer("graphicLayer2").clear();
          window.__map__.getLayer("zoomGraphicLayer").clear();
          window.__map__.getLayer("searchGraphicLayer").clear();
          window.__map__.getLayer("highLightGraphicLayer").clear();
          clearSelection();
        }
        handleMapClickEvent({
          cursor: "default",
          handler: ({ mapPoint }) =>
            makeFlashOnAssetsWithSameAuctionNo(mapPoint),
        });
        this.setState({ activeIcon: id });
        break;

      case "stop-select":
        this.handleDisableMultiSelect();
        handleMapClickEvent({
          cursor: "default",
          handler: ({ mapPoint }) =>
            makeFlashOnAssetsWithSameAuctionNo(mapPoint),
        });
        this.setState({ activeIcon: id });

        break;
      case "show-more-details":
        this.handleDisableMultiSelect();
        activeSigleSelect();
        // this.props.showRemarkSuggestTablestate &&
        //   this.props.showRemarkSuggestTable(false);
        // this.props.showResultTablestate && this.props.showResultTable(false);
        // this.props.showUpdateTablestate && this.props.showUpdateTable(false);
        handleMapClickEvent({
          cursor: "url('images/select.png'),auto",
          handler: (e) =>
            this.selectFeature(
              e,
              "highLightGraphicLayer",
              "INVEST_SITE_POLYGON"
            ),
        });
        handleMultiSelectFeatures(
          "INVEST_SITE_POLYGON",
          this,
          callbackMultiSelectForNormalSelection,
          "",
          "highLightGraphicLayer"
        );
        let selectedGraphicLayer = window.__map__.getLayer(
          "highLightGraphicLayer"
        );
        //todo: filter sites based on SITE_STATUS and the current user (done)
        let gids = [],
          isInvestedGrExisting = false;
        if (
          !auth.isAuth ||
          (auth.isAuth && ![1].includes(auth.user.user_type_id))
        ) {
          gids = selectedGraphicLayer.graphics.length
            ? selectedGraphicLayer.graphics
                .filter((f) => f.attributes.SITE_STATUS !== 4)
                .map((item) => item.attributes.SITE_GEOSPATIAL_ID)
            : [];
          let investedSitesGraphics = selectedGraphicLayer.graphics.length
            ? selectedGraphicLayer.graphics.filter(
                (f) => f.attributes.SITE_STATUS == 4
              )
            : [];
          if (investedSitesGraphics.length) {
            isInvestedGrExisting = true;
            investedSitesGraphics.forEach((g) =>
              selectedGraphicLayer.remove(g)
            );
            notificationMessage(
              "بعض الأراضي مستثمرة وليس لك صلاحية رؤية بياناتها",
              4
            );
          }
        } else
          gids = selectedGraphicLayer.graphics.length
            ? selectedGraphicLayer.graphics.map(
                (item) => item.attributes.SITE_GEOSPATIAL_ID
              )
            : [];
        if (!gids.length) {
          !isInvestedGrExisting &&
            notificationMessage(
              "برجاء تحديد موقع استثماري على الاقل من الخريطة لعرض البيانات"
            );
        } else {
          let {
            openLoader,
            closeLoader,
            showSearchResultTable,
            tableSettings,
          } = this.props;
          //close any opened wizard
          this.props.handleShowingDetailsViaMap(true);
          let filteredGids = [];
          if (
            tableSettings?.result.length &&
            this.props.routeName == "siteDetailsSideMenu"
          ) {
            let tblData = tableSettings.result.map((d) => d.data).flat();
            filteredGids = difference(
              gids,
              tblData.map((f) => f.attributes.SITE_GEOSPATIAL_ID)
            );
            if (filteredGids.length) {
              handleShowingDetails(
                filteredGids,
                openLoader,
                closeLoader,
                showSearchResultTable,
                "update"
              );
              this.props.routeName != "siteDetailsSideMenu" &&
                this.props.changeRoute("siteDetailsSideMenu");
            } else
              notificationMessage(
                "لا يوجد مواقع جديدة تم تحديدها لبيان تفاصيلها ",
                3
              );
          } else {
            window.__map__.getLayer("zoomGraphicLayer").clear();

            handleShowingDetails(
              gids,
              openLoader,
              closeLoader,
              showSearchResultTable,
              "add",
              () => {
                this.props.changeRoute("siteDetailsSideMenu");
                this.props.handleOpenMenu();
              }
            );
          }
        }
        break;
    }
  }
  removeAllTempGraphics(graphicLayerName) {
    //1- remove all temp graphics from map
    let graphicLayerOfMultiSelect = window.__map__.getLayer(graphicLayerName);
    let allGraphics = graphicLayerOfMultiSelect.graphics;
    let prevSelectedFeatures = this.props.tempSelectedFeaturesData;
    //remove selected temp graphics
    if (prevSelectedFeatures.length) {
      for (let i = 0; i < prevSelectedFeatures.length; i++) {
        const selectedFeat = prevSelectedFeatures[i];
        for (let j = 0; j < allGraphics.length; j++) {
          const graphic = allGraphics[j];
          if (graphic.attributes.id === selectedFeat.id)
            graphicLayerOfMultiSelect.remove(graphic);
        }
      }
    }
  }
  confirmationSelect = () => {
    const args = {
      description: "برجاءالضغط على طبقة من الخريطة",
      duration: 3,
    };
    notification.open(args);
  };

  selectFeature({ mapPoint }, graphicLayerName, layerName) {
    const {
      addToSelectedFeatures,
      selectedFeatures,
      singleSelectActive,
      multiSelectActive,
      openLoader,
      closeLoader,
    } = this.props;
    openLoader();
    var layerIndex = getLayerIndex(layerName);
    queryTask({
      returnGeometry: true,
      url: `${window.__mapUrl__}/${layerIndex}`,
      geometry: mapPoint,
      outFields: multiSelectActive.isActive
        ? ["*"]
        : [
            "OBJECTID",
            "SITE_GEOSPATIAL_ID",
            "SITE_LAT_COORD",
            "SITE_LONG_COORD",
            "SITE_COMMON_USE",
            "SITE_STATUS",
          ],
      callbackResult: ({ features }) => {
        if (!features.length) {
          closeLoader();
          return this.confirmationSelect();
        }
        console.log(features);
        // here you are allowed to update global state
        // ..
        const featureToSelect = features[0];

        // the next line of code search the already selectedFeatures array
        // and finds out if the new selected feature is within the array
        // if it is not it will dispatch it to the store  ... tricky Yesss I know :)

        // selectedFeatures.some(
        //   (f) =>
        //     f.attributes["OBJECTID"] == featureToSelect.attributes["OBJECTID"]
        // ) || addToSelectedFeatures([featureToSelect]);

        let fs = window.__map__.getLayer(graphicLayerName).graphics;
        let graphicLayer = window.__map__.getLayer(graphicLayerName);

        // add the feature to the highlight layer
        if (singleSelectActive.isActive) {
          let featureAddedBefore = fs.find(
            (feat) =>
              feat.attributes.SITE_GEOSPATIAL_ID ==
              featureToSelect.attributes.SITE_GEOSPATIAL_ID
          );
          if (featureAddedBefore) {
            graphicLayer.remove(featureAddedBefore);
            if (this.props.showingDetailsViaMap) {
              this.props.removeFromSearchTable(
                featureToSelect.attributes.SITE_GEOSPATIAL_ID
              );
              if (selectedFeatures.length === 1)
                this.props.handleShowingDetailsViaMap(false);
            }
            this.props.removeFeatFromSelectedFeats(
              featureAddedBefore.attributes.SITE_GEOSPATIAL_ID
            );
            closeLoader();
            return;
          }
          // fs.push(featureToSelect);
          addToSelectedFeatures([featureToSelect]);
          highlightFeature([...selectedFeatures], window.__map__, {
            isZoom: true,
            layerName: graphicLayerName,
            highlightWidth: 5,
          });
          closeLoader();
        }
        //single select in case of reports
        else if (multiSelectActive.isActive) {
          let featID =
            layerName === "PARCELS"
              ? featureToSelect.attributes.OBJECTID
              : featureToSelect.attributes.SITE_GEOSPATIAL_ID;
          let featureAddedBefore = fs.find(
            (feat) => feat.attributes.id == featID
          );
          if (featureAddedBefore) {
            this.deselectFeatureFunc(
              featureAddedBefore,
              graphicLayer,
              multiSelectActive.layerName
            );
          } else {
            let featToAdd = {
              layername: multiSelectActive.layerName,
              data: [featureToSelect],
              isThereSelection: true,
            };
            //reports multi-select
            if (multiSelectActive.typeUse === "investmentReport") {
              highLight(
                [featureToSelect],
                multiSelectActive.layerName,
                multiSelectActive.typeUse,
                "graphicLayer_Multi_Select"
              );
              callBackMultiSelectFromMapForPrintInvestReport(
                featToAdd,
                multiSelectActive.layerName,
                this
              );
            }
            //in case of select in update sites
            else if (multiSelectActive.typeUse === "updateSites") {
              highLight(
                [featureToSelect],
                multiSelectActive.layerName,
                multiSelectActive.typeUse,
                "graphicLayer_Multi_Select"
              );
              callBackMultiSelectFromMapForUpdate(
                featToAdd,
                multiSelectActive.layerName,
                this
              );
            }
            //in case of select in add new sites
            else if (multiSelectActive.typeUse == "addSites") {
              LoadModules([
                "esri/tasks/query",
                "esri/geometry/Polygon",
                "esri/geometry/projection",
                "esri/SpatialReference",
                "esri/geometry/Point",
              ]).then(
                async ([
                  Query,
                  Polygon,
                  projection,
                  SpatialReference,
                  Point,
                ]) => {
                  highLight(
                    [featureToSelect],
                    multiSelectActive.layerName,
                    multiSelectActive.typeUse,
                    "graphicLayer_Multi_Select"
                  );
                  callBackMultiSelectFromMapForAddLandsToInvestment(
                    featToAdd,
                    multiSelectActive.layerName,
                    this,
                    null,
                    null,
                    Query,
                    Polygon,
                    projection,
                    SpatialReference,
                    Point
                  );
                }
              );
            }
            //reports multi-select
            else if (multiSelectActive.typeUse === "PricingEstimate") {
              highLight(
                [featureToSelect],
                multiSelectActive.layerName,
                multiSelectActive.typeUse,
                "graphicLayer_Multi_Select"
              );
              callBackMultiSelectFromMapForPricing(
                featToAdd,
                multiSelectActive.layerName,
                this
              );
            }
          }
        }
      },
    });
  }
  /**
   * desc: deselect for multi-features
   * @param {*} featureAddedBefore
   * @param {*} graphicLayer
   * @param {*} layerName
   * @returns
   */
  deselectFeatureFunc(featureAddedBefore, graphicLayer, layerName) {
    const {
      tableSettings,
      multiSelectActive,
      showTable,
      tempSelectedFeaturesData,
    } = this.props;
    this.props.openLoader();
    //close table if there is one selected feat
    if (
      ((!tableSettings || (tableSettings && !tableSettings.result.length)) &&
        tempSelectedFeaturesData &&
        tempSelectedFeaturesData.length == 1) ||
      (tableSettings &&
        tableSettings.result.length === 1 &&
        (!tempSelectedFeaturesData || !tempSelectedFeaturesData.length))
    )
      showTable(false);
    graphicLayer.remove(featureAddedBefore);
    this.props.removeFeaturesFromTempSelected(featureAddedBefore.attributes.id);
    if (
      tableSettings &&
      tableSettings.result.length &&
      tableSettings.result.find((f) => {
        switch (multiSelectActive.typeUse) {
          case "addSites":
          case "updateSites":
            return f.id == featureAddedBefore.attributes.id;
          // return f.id == featureAddedBefore.attributes.id;

          case "investmentReport":
            return (
              f.attributes.SITE_GEOSPATIAL_ID ==
              featureAddedBefore.attributes.id
            );
        }
      })
    )
      this.props.removeFeatureFromWizardTable(featureAddedBefore.attributes.id);
    if (tableSettings && tableSettings.result.length > 1)
      zoomToLayer("graphicLayer_Multi_Select", window.__map__, 300);
    this.props.closeLoader();
    return;
  }
  /**
   * desc: deselect for single feature
   * @param {mapPoint} param0
   */
  deselectFeature({ mapPoint }) {
    const { tableSettings } = this.props;
    this.props.openLoader();
    var layerIndex = getLayerIndex("INVEST_SITE_POLYGON");
    queryTask({
      returnGeometry: true,
      url: `${window.__mapUrl__}/${layerIndex}`,
      geometry: mapPoint,
      outFields: ["OBJECTID", "SITE_GEOSPATIAL_ID"],
      callbackResult: ({ features }) => {
        if (!features.length) {
          this.props.closeLoader();
          return this.confirmationSelect();
        }
        console.log(features);
        // here you are allowed to update global state
        // ..
        const featureToSelect = features[0];
        // add the feature to the highlight layer

        var fs = window.__map__.getLayer("graphicLayer_Multi_Select").graphics;
        let graphicLayer = window.__map__.getLayer("graphicLayer_Multi_Select");
        let featureAddedBefore = fs.find(
          (feat) =>
            feat.attributes.id == featureToSelect.attributes.SITE_GEOSPATIAL_ID
        );
        if (featureAddedBefore) {
          graphicLayer.remove(featureAddedBefore);
          this.props.removeFeaturesFromTempSelected(
            featureAddedBefore.attributes.SITE_GEOSPATIAL_ID
          );
          if (
            tableSettings &&
            tableSettings.result.length &&
            tableSettings.result.find(
              (f) =>
                f.attributes.SITE_GEOSPATIAL_ID ==
                featureAddedBefore.attributes.SITE_GEOSPATIAL_ID
            )
          )
            this.props.removeFeatureFromWizardTable(
              featureAddedBefore.attributes.id
            );
          if (tableSettings && tableSettings.result.length > 1)
            zoomToLayer("graphicLayer_Multi_Select", window.__map__, 300);
          this.props.closeLoader();
          return;
        } else {
          notificationMessage("اختر موقع من المواقع المحددة");
          this.props.closeLoader();
        }
      },
    });
  }

  notificationNoData = () => {
    const args = {
      description: "لم يتم اختيار موقع على الخريطة",
      duration: 3,
    };
    notification.open(args);
  };

  notificationDuplicatedData = () => {
    const args = {
      description: "تم اختيار هذه الأرض من قبل",
      duration: 3,
    };
    notification.open(args);
  };
  notificationByAdding = () => {
    const args = {
      description: "تم الإضافة بنجاح بجدول التحديث",
      duration: 3,
    };
    notification.open(args);
  };

  renderComponentMarkup() {
    return (
      <>
        {this.state.loading == true ? <Loader /> : null}
        <div className="mapMenu">
          <ul>
            {this.state.mapList.map((item, index) => {
              if (
                item.id === 10 &&
                (this.props.multiSelectActive.isActive ||
                  (this.props.singleSelectActive.isActive &&
                    this.props.singleSelectActive.purposeOfSelect ===
                      "planningStudy"))
              )
                return;
              else
                return (
                  <React.Fragment key={index}>
                    <li
                      key={index}
                      className={
                        this.state.activeIcon == item.id
                          ? "activeItemLi"
                          : "noactiveItemLi"
                      }
                      onClick={() => this.handleClick(item.ClickName, item.id)}
                      title={item.title}
                    >
                      <Tooltip placement="right">{item.icon}</Tooltip>
                    </li>
                  </React.Fragment>
                );
            })}
          </ul>
        </div>
      </>
    );
  }

  handleSelectClick() {
    const {
      singleSelectActive,
      handleMapClickEvent,
      multiSelectActive,
      activeSigleSelect,
    } = this.props;
    this.handleDisableMultiSelect();
    if (multiSelectActive.isActive) {
      //remove drawend handler ==> important
      let selectionToolbar = window.__MultiSelect__;
      selectionToolbar.onDrawEnd = null;
      /***************** */
      //enable single select
      handleMapClickEvent({
        cursor: "url('images/select.png'),auto",
        handler: (e) =>
          this.selectFeature(
            e,
            "graphicLayer_Multi_Select",
            multiSelectActive.layerName
          ),
      });
      //in case of multi-select in update phase
      if (
        multiSelectActive.layerName !== "PARCELS" &&
        multiSelectActive.typeUse == "updateSites"
      ) {
        // //remove selected temp graphics
        // if (prevSelectedFeatures.length) {
        //   for (let i = 0; i < prevSelectedFeatures.length; i++) {
        //     const selectedFeat = prevSelectedFeatures[i];
        //     for (let j = 0; j < allGraphics.length; j++) {
        //       const graphic = allGraphics[j];
        //       if (graphic.attributes.id === selectedFeat.id)
        //         graphicLayerOfMultiSelect.remove(graphic);
        //     }
        //   }
        // }
        // this.props.emptyTempSelectedFeats();
        handleMultiSelectFeatures(
          multiSelectActive.layerName,
          this,
          callBackMultiSelectFromMapForUpdate,
          multiSelectActive.typeUse
        );
      }

      //in case of multi-select in add lands from Parcels phase
      else if (
        multiSelectActive.layerName === "PARCELS" &&
        multiSelectActive.typeUse == "addSites"
      ) {
        // //remove selected temp graphics
        // if (prevSelectedFeatures.length) {
        //   for (let i = 0; i < prevSelectedFeatures.length; i++) {
        //     const selectedFeat = prevSelectedFeatures[i];
        //     for (let j = 0; j < allGraphics.length; j++) {
        //       const graphic = allGraphics[j];
        //       if (graphic.attributes.id === selectedFeat.id)
        //         graphicLayerOfMultiSelect.remove(graphic);
        //     }
        //   }
        // }
        // this.props.emptyTempSelectedFeats();
        handleMultiSelectFeatures(
          multiSelectActive.layerName,
          this,
          callBackMultiSelectFromMapForAddLandsToInvestment,
          multiSelectActive.typeUse
        );
      }
      //in case of multi-select in estimate pricing entering in feasibility study
      else if (
        multiSelectActive.layerName === "INVEST_SITE_POLYGON" &&
        multiSelectActive.typeUse == "PricingEstimate"
      ) {
        // //remove selected temp graphics
        // if (prevSelectedFeatures.length) {
        //   for (let i = 0; i < prevSelectedFeatures.length; i++) {
        //     const selectedFeat = prevSelectedFeatures[i];
        //     for (let j = 0; j < allGraphics.length; j++) {
        //       const graphic = allGraphics[j];
        //       if (graphic.attributes.id === selectedFeat.id)
        //         graphicLayerOfMultiSelect.remove(graphic);
        //     }
        //   }
        // }
        // this.props.emptyTempSelectedFeats();
        handleMultiSelectFeatures(
          multiSelectActive.layerName,
          this,
          callBackMultiSelectFromMapForPricing,
          multiSelectActive.typeUse
        );
      }
      //for reports
      else if (
        multiSelectActive.typeUse === "investmentReport" &&
        !multiSelectActive.isForFeasibilityStudy
      ) {
        handleMultiSelectFeatures(
          multiSelectActive.layerName,
          this,
          callBackMultiSelectFromMapForPrintInvestReport,
          multiSelectActive.typeUse
        );
      }
      //for feasibility study
      else if (multiSelectActive.isForFeasibilityStudy === "multiSelect") {
        //remove selected temp graphics
        // if (prevSelectedFeatures.length) {
        //   for (let i = 0; i < prevSelectedFeatures.length; i++) {
        //     const selectedFeat = prevSelectedFeatures[i];
        //     for (let j = 0; j < allGraphics.length; j++) {
        //       const graphic = allGraphics[j];
        //       if (graphic.attributes.id === selectedFeat.id)
        //         graphicLayerOfMultiSelect.remove(graphic);
        //     }
        //   }
        // }
        // this.props.emptyTempSelectedFeats();
        handleMultiSelectFeatures(
          multiSelectActive.layerName,
          this,
          callBackMultiSelectFromMapForPrintInvestReport,
          multiSelectActive.typeUse
        );
      }
    } else {
      /**الدراسة التخطيطية والاقتصادية */
      if (
        singleSelectActive.isActive &&
        singleSelectActive.purposeOfSelect === "planningStudy"
      ) {
        handleMapClickEvent({
          cursor: "url('images/select.png'),auto",
          handler: (e) =>
            handleSingleSelectFeature(e.mapPoint, () => {
              // this.setState({ activeIcon: "" });
            }),
        });
      } else if (
        /**عرض السعر */
        singleSelectActive.isActive &&
        singleSelectActive.purposeOfSelect === "showPricing"
      ) {
        handleMapClickEvent({
          cursor: "url('images/select.png'),auto",
          handler: (e) =>
            handleSingleSelectFeature(
              e.mapPoint,
              () => {
                // this.setState({ activeIcon: "" });
              },
              "showPricing"
            ),
        });
      } else {
        activeSigleSelect();
        handleMapClickEvent({
          cursor: "url('images/select.png'),auto",
          handler: (e) =>
            this.selectFeature(
              e,
              "highLightGraphicLayer",
              "INVEST_SITE_POLYGON"
            ),
        });
        handleMultiSelectFeatures(
          "INVEST_SITE_POLYGON",
          this,
          callbackMultiSelectForNormalSelection,
          "",
          "highLightGraphicLayer"
        );
      }
    }
    // handleMapClickEvent({ cursor: "copy", handler: (e) => this.selectFeature(e) })
    this.setState({ activeIcon: 7 });
  }

  showingConfirmationModal(bool) {
    this.setState({ confirmationModalIsShow: bool });
  }
  handleCancelConfirmationModal() {
    this.showingConfirmationModal(false);
    this.setState({ activeIcon: 0 });
    this.handleDisableMultiSelect();
    this.props.handleMapClickEvent({
      cursor: "default",
      handler: ({ mapPoint }) => makeFlashOnAssetsWithSameAuctionNo(mapPoint),
    });
  }
  handleOkConfirmationModal() {
    const {
      dashboardData,
      showRemarkSuggestTablestate,
      showUpdateTablestate,
      clearDataToDashboard,
      showUpdateTable,
      showRemarkSuggestTable,
      showResultTablestate,
      showResultTable,
      handleCloseMenu,
    } = this.props;
    this.props.changeRoute("home");
    dashboardData && clearDataToDashboard();
    showRemarkSuggestTablestate && showRemarkSuggestTable(false);
    showUpdateTablestate && showUpdateTable(false);
    showResultTablestate && showResultTable(false);
    handleCloseMenu();
    this.showingConfirmationModal(false);
    this.handleSelectClick();
  }
  render() {
    const { mapLoaded } = this.props;
    return !mapLoaded ? null : (
      <>
        {this.renderComponentMarkup()}
        <ConfirmationModal
          confirmationModalIsShow={this.state.confirmationModalIsShow}
          handleCancelConfirmationModal={this.handleCancelConfirmationModal.bind(
            this
          )}
          handleOkConfirmationModal={this.handleOkConfirmationModal.bind(this)}
          routeName={this.props.routeName}
        />
      </>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    removeFeatFromSelectedFeats: (gid) =>
      dispatch({ type: "REMOVE_FROM_SELECTED_FEATURES", data: gid }),
    removeFromSearchTable: (id) =>
      dispatch({ type: "REMOVE_FROM_RESULT_TABLE_DATA_SET", id }),
    removeFeaturesFromTempSelected: (id) =>
      dispatch({ type: "REMOVE_FROM_TEMP_SELECTED", id }),
    removeFeatureFromWizardTable: (id) =>
      dispatch({ type: "REMOVE_ITEM_FROM_RESULT_COUNTED_TABLE_DATA_SET", id }),
    addToSelectedFeatures: (features) =>
      dispatch({ type: "ADD_TO_SELECTED_FEATURES", features }),
    clearSelection: () => dispatch({ type: "CLEAR_SELECTED" }),
    handleMapClickEvent: ({ cursor, handler }) =>
      dispatch({ type: "MAP_CLICK_EVENT", cursor, handler }),
    // addLandToCountedTable: (data) =>
    // dispatch({ type: "ADD_TO_TABLE_DATA_SET", data }),
    addSelectedFeaturesToTemp: (data) =>
      dispatch({ type: "ADD_DATA_TO_TEMP", data }),
    activeSigleSelect: () =>
      dispatch({
        type: "ACTIVATE_SINGLE_SELECT",
        purposeOfSelect: "mapSelect",
      }),
    disactivateSingleSelect: () =>
      dispatch({ type: "DIACTIVATE_SINGLE_SELECT" }),
    emptyTempSelectedFeats: () => dispatch({ type: "EMPTY_DATA_FROM_TEMP" }),
    clearDataToDashboard: () => dispatch({ type: "CLEAR_DASHBOARD_DATA" }),
  };
};

const mapStateToProps = ({ mapUpdate }) => {
  const {
    mapLoaded,
    selectedFeatures,
    multiSelectActive,
    singleSelectActive,
    tableSettings,
    tempSelectedFeaturesData,
    currentUser,
    auth,
    dashboardData,
  } = mapUpdate;
  return {
    mapLoaded,
    selectedFeatures,
    multiSelectActive,
    singleSelectActive,
    tableSettings,
    tempSelectedFeaturesData,
    currentUser,
    auth,
    dashboardData,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MapActions);

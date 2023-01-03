import React, { Component } from "react";
import { connect } from "react-redux";
import { Container, Button } from "react-bootstrap";
import { Row, Col, Form, Select, notification } from "antd";
import {
  clearAllGraphicLayers,
  convertEngNumbersToArabic,
  convertNumbersToEnglish,
  getFeatureDomainName,
  getLayerIndex,
  highLight,
  LoadModules,
  queryTask,
  zoomToFeature,
} from "../common/mapviewer";
import { valueToBoolean } from "../navigationToolbar/helpers_Funcs";
import { differenceBy, uniqBy } from "lodash";
import { sortAlphabets } from "../../helpers/utlis/utilzFunc";
import { notificationMessage } from "../../helpers/utlis/notifications_Func";

class InvestmentReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      typeOfReport: "",
      city: "",
      district: "",
      planNumber: "",
      PARCEL_PLAN_NO: "",
      loading: false,
      plans: [],
      districts: [],
      parcels: [],
      wayOfChooseingInvestSite: "",
      locationStatus: "",
    };
    this.FormRef = React.createRef();
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
  componentDidUpdate(prevProps, prevState) {
    console.log({ props: this.props }, { prevProps });
    //clear side menu fields after open report
    if (
      this.props.finishToPrint &&
      this.props.finishToPrint !== prevProps.finishToPrint
    ) {
      this.props.handleFinishButtonToPrint(false);
      this.FormRef.current.resetFields();
      this.setState({
        typeOfReport: null,
        city: null,
        district: null,
        planNumber: null,
        PARCEL_PLAN_NO: null,
        loading: false,
        plans: [],
        districts: [],
        parcels: [],
        wayOfChooseingInvestSite: null,
        locationStatus: null,
      });
    }
    // if (
    //   prevProps.tableSettings &&
    //   ((this.props.tableSettings && !this.props.tableSettings.result.length) ||
    //     !this.props.tableSettings) &&
    //   prevProps.tableSettings.result.length

    //   //  && !this.props.multiSelectActive.isActive
    // ) {
    //   //1- remove all temp graphics from map
    //   this.removeAllTempGraphics("graphicLayer_Multi_Select");
    //   this.props.diActivateMultiSelectButton();
    //   this.props.clearTableData();
    //   this.props.emptyTempSelectedFeats();
    //   // if (!this.state.typeOfReport) {
    //   this.FormRef.current.resetFields();
    //   this.setState({
    //     typeOfReport: null,
    //     city: null,
    //     district: null,
    //     planNumber: null,
    //     PARCEL_PLAN_NO: null,
    //     loading: false,
    //     plans: [],
    //     districts: [],
    //     parcels: [],
    //     wayOfChooseingInvestSite: null,
    //     locationStatus: null,
    //   });
    //   // }
    // }
  }
  componentWillUnmount() {
    // if(!this.props.multiSelectActive.isActive){
    this.props.diActivateMultiSelectButton();
    let selectionToolbar = window.__MultiSelect__;
    selectionToolbar.deactivate();
    window.__map__.enablePan();
    window.__map__.enableMapNavigation();
    // }
    this.props.clearTableData();
    this.props.emptyTempSelectedFeats();
    this.props.showTable(false);
    this.setState(null);
    window.__map__.getLayer("graphicLayer_Multi_Select").clear();
  }
  deSelectCity = (e, field) => {
    switch (field) {
      case "typeOfReport":
        this.props.diActivateMultiSelectButton();
        this.props.emptyTempSelectedFeats();

        this.setState({
          typeOfReport: null,
          plans: [],
          locationStatus: null,
          districts: [],
          district: null,
          planNumber: null,
          city: null,
          PARCEL_PLAN: null,
          wayOfChooseingInvestSite: null,
          parcels: [],
        });
        this.FormRef.current.setFieldsValue({
          city: null,
          district: null,
          planNumber: null,
          PARCEL_PLAN_NO: null,
          locationStatus: null,
          wayOfChooseingInvestSite: null,
          typeOfReport: null,
        });
        break;
      case "locationStatus":
        this.setState({
          locationStatus: null,
        });
        this.FormRef.current.setFieldsValue({
          locationStatus: null,
        });
        break;
      default:
        break;
    }
  };
  handleSelect = (name) => (e) => {
    // this.setState({ [name]: e });
    let whereCondition;
    switch (name) {
      case "typeOfReport":
        if (e) {
          if (e !== this.state.typeOfReport) {
            this.props.diActivateMultiSelectButton();
            window.__map__.getLayer("graphicLayer_Multi_Select").clear();
            this.props.clearTableData();
            this.props.emptyTempSelectedFeats();
            this.props.showTable(false);
            if (!this.state.typeOfReport) {
              this.setState({ typeOfReport: e });
            } else {
              this.setState({
                typeOfReport: e,
                plans: [],
                locationStatus: null,
                districts: [],
                district: null,
                planNumber: null,
                city: null,
                PARCEL_PLAN: null,
                wayOfChooseingInvestSite: null,
                parcels: [],
              });
              this.FormRef.current.setFieldsValue({
                city: null,
                district: null,
                planNumber: null,
                PARCEL_PLAN_NO: null,
                locationStatus: null,
                wayOfChooseingInvestSite: null,
                typeOfReport: e,
              });
            }
          }

          break;
        } else break;

      case "locationStatus":
        if (e !== this.state.locationStatus) {
          this.setState({
            [name]: e,
          });
        }
        break;

      case "city":
        if (e) {
          if (this.state.city) {
            this.FormRef.current.setFieldsValue({
              city: e,
              district: null,
              planNumber: null,
              PARCEL_PLAN_NO: null,
              // wayOfChooseingInvestSite: null,
            });
          }
          this.setState({
            city: e,
            district: "",
            planNumber: "",
            PARCEL_PLAN_NO: "",
            // wayOfChooseingInvestSite: "",
            plans: [],
            districts: [],
            parcels: [],
          });
          this.zoomToParticularArea(`MUNICIPALITY_NAME=${e}`);
          this.catchPlans(e);
          this.catchDistricts(e);
          this.catchParcelPlanNo(e);
        } else {
          this.setState({
            plans: [],
            districts: [],
            district: "",
            planNumber: "",
            city: "",
            PARCEL_PLAN: "",
            parcels: [],
            // wayOfChooseingInvestSite: "",
          });
        }
        break;

      case "planNumber":
        if (e && this.state.city) {
          whereCondition = `MUNICIPALITY_NAME=${this.state.city} AND PLAN_NO='${e}'`;
        } else if (this.state.city && this.state.district) {
          whereCondition = `MUNICIPALITY_NAME=${this.state.city} AND DISTRICT_NAME=${this.state.district}`;
        } else if (this.state.city) {
          whereCondition = `MUNICIPALITY_NAME=${this.state.city}`;
        } else if (this.state.locationStatus)
          whereCondition = `SITE_STATUS=${this.state.locationStatus}`;
        else whereCondition = "";
        if (whereCondition) this.zoomToParticularArea(whereCondition);
        this.setState({ planNumber: e });
        break;
      case "district":
        if (e && this.state.city) {
          whereCondition = `MUNICIPALITY_NAME=${this.state.city} AND DISTRICT_NAME=${e}`;
        } else if (this.state.city && this.state.planNumber) {
          whereCondition = `MUNICIPALITY_NAME=${this.state.city} AND PLAN_NO='${this.state.planNumber}'`;
        } else if (this.state.city) {
          whereCondition = `MUNICIPALITY_NAME=${this.state.city}`;
        } else if (this.state.locationStatus)
          whereCondition = `SITE_STATUS=${this.state.locationStatus}`;
        else whereCondition = "";
        if (whereCondition) this.zoomToParticularArea(whereCondition);
        this.setState({ district: e, planNumber: "", PARCEL_PLAN_NO: "" });
        break;
      case "PARCEL_PLAN_NO":
        let landNo = e ? convertNumbersToEnglish(e) : e;
        if (e && this.state.city) {
          whereCondition = landNo
            ? `MUNICIPALITY_NAME=${
                this.state.city
              } AND PARCEL_PLAN_NO='${landNo}' 
            OR 
            MUNICIPALITY_NAME=${
              this.state.city
            } AND PARCEL_PLAN_NO='${convertEngNumbersToArabic(landNo)}'`
            : `MUNICIPALITY_NAME=${this.state.city}`;
        } else if (this.state.city && this.state.district) {
          whereCondition = `MUNICIPALITY_NAME=${this.state.city} AND DISTRICT_NAME=${this.state.district}`;
        } else if (this.state.city) {
          whereCondition = `MUNICIPALITY_NAME=${this.state.city}`;
        } else whereCondition = "";
        if (whereCondition) this.zoomToParticularArea(whereCondition);
        this.setState({ PARCEL_PLAN_NO: landNo });
        break;
      case "wayOfChooseingInvestSite":
        // LoadModules(["esri/toolbars/navigation"]).then(([Navigation]) => {
        //   let navigator = new Navigation(window.__map__);
        //   navigator.deactivate();
        if (e !== this.state.wayOfChooseingInvestSite) {
          if (!this.state.wayOfChooseingInvestSite) {
            //in case of existing selection for fav or something else
            this.props.clearSelection();
            clearAllGraphicLayers(window.__map__);
            this.props.disactivateSingleSelect();
            //////
            this.setState({ wayOfChooseingInvestSite: e });
          } else {
            this.setState({
              wayOfChooseingInvestSite: e,
              plans: [],
              locationStatus: "",
              districts: [],
              district: "",
              planNumber: "",
              city: "",
              PARCEL_PLAN: "",
              parcels: [],
            });
            this.FormRef.current.setFieldsValue({
              city: null,
              district: null,
              planNumber: null,
              PARCEL_PLAN_NO: null,
              locationStatus: null,
              wayOfChooseingInvestSite: e,
            });
          }
          if (e === "selectFromMap") {
            //in case of existing selection for fav or something else
            this.props.clearSelection();
            clearAllGraphicLayers(window.__map__);
            this.props.disactivateSingleSelect();
            this.FormRef.current.validateFields();
            //////
            this.props.activateMultiSelectButton("invest_site_polygon");
          } else {
            this.props.diActivateMultiSelectButton();
            this.props.emptyTempSelectedFeats();
            // this.deSelectTypeOfEditedData();
            //first remove all temp graphics
            this.removeAllTempGraphics("graphicLayer_Multi_Select");
          }
          break;
        } else break;
      // });
    }
  };
  openReports = () => {
    let featuresIDs = this.props.tableSettings.result.map(
      (f) => f.attributes.SITE_GEOSPATIAL_ID
    );

    let where = `SITE_GEOSPATIAL_ID IN (${featuresIDs.join(',')})`
    this.props.diActivateMultiSelectButton();

    localStorage.setItem("queryCondition", where);
    const win = window.open("/investmentreports", "_blank");
    win.focus();
  };
  catchPlans(selectedMunicipality) {
    var layerIndex = getLayerIndex("Invest_Site_Polygon");
    queryTask({
      returnGeometry: false,
      url: `${window.__mapUrl__}/${layerIndex}`,
      returnDistinctValues: true,
      outFields: ["PLAN_NO"],
      where: `MUNICIPALITY_NAME=${selectedMunicipality} AND PLAN_NO LIKE '%' AND PLAN_NO <> 'بدون' AND PLAN_NO <>'<Null>' AND PLAN_NO <>' ' `,
      callbackResult: ({ features }) => {
        this.setState({ plans: features });
      },
    });
  }

  catchParcelPlanNo(selectedMunicipality) {
    var layerIndex = getLayerIndex("Invest_Site_Polygon");
    queryTask({
      returnGeometry: false,
      url: `${window.__mapUrl__}/${layerIndex}`,
      returnDistinctValues: true,
      outFields: ["PARCEL_PLAN_NO "],
      where: `MUNICIPALITY_NAME=${selectedMunicipality} AND PARCEL_PLAN_NO  LIKE '%' AND PARCEL_PLAN_NO  <> 'بدون' AND PARCEL_PLAN_NO  <>'<Null>' AND PARCEL_PLAN_NO  <>' ' `,
      callbackResult: ({ features }) => {
        this.setState({ parcels: features });
      },
    });
  }

  catchDistricts(selectedMunicipality) {
    var layerIndex = getLayerIndex("Invest_Site_Polygon");
    queryTask({
      returnGeometry: false,
      url: `${window.__mapUrl__}/${layerIndex}`,
      returnDistinctValues: true,
      outFields: ["DISTRICT_NAME"],
      where: `MUNICIPALITY_NAME=${selectedMunicipality} AND DISTRICT_NAME LIKE '%'`,
      callbackResult: ({ features }) => {
        // fix features
        getFeatureDomainName(features, layerIndex).then((districts) => {
          this.setState({ districts });
        });
      },
    });
  }
  renderDomainSelect(fieldname) {
    const { fields } = this.props;
    if (!fields) return null;

    var layername = "Invest_Site_Polygon".toLocaleLowerCase();
    var domain = fields[layername].find((field) => field.name == fieldname)
      .domain.codedValues;
    if (fieldname === "MUNICIPALITY_NAME")
      domain = sortAlphabets(domain, "name");
    return domain.map((cv) => (
      <Select.Option key={cv.code} className="text-right" value={cv.code}>
      {cv.name}
      {fieldname === "SITE_COMMON_USE" ? (
        <img
          className="server-img-icon"
          src={`${window.imagesServerUrl}/${
            cv.code || cv.SITE_COMMON_USE_Code
          }.png`}
          alt="img"
        />
      ) :fieldname==="SITE_STATUS"&&cv.code!==1?(
        <img
        className="server-img-icon-svg"
        src={`${window.imagesServerUrl}/SITE_MAIN_ACTIVITY_FORAS/${
          cv.code==2?"222":cv.code==3?"111":"333"
        }.svg`}
        alt="img"
      />
      ): (
        ""
      )}
    </Select.Option>
    ));
  }
  renderPlans() {
    let { plans } = this.state;
    plans = plans.filter((d) => d.attributes.PLAN_NO);

    return plans.map((p) => (
      <Select.Option
        key={p.attributes.PLAN_NO}
        className="text-right"
        value={p.attributes.PLAN_NO}
      >
        {p.attributes.PLAN_NO}
      </Select.Option>
    ));
  }
  renderParcels() {
    let { parcels } = this.state;
    parcels = parcels.filter((d) => d.attributes.PARCEL_PLAN_NO);

    return parcels.map((p) => (
      <Select.Option
        key={p.attributes.PARCEL_PLAN_NO}
        className="text-right"
        value={p.attributes.PARCEL_PLAN_NO}
      >
        {p.attributes.PARCEL_PLAN_NO}
      </Select.Option>
    ));
  }

  renderDistricts() {
    let { districts } = this.state;
    districts = districts.filter((d) => d.attributes.DISTRICT_NAME);
    return districts.map((d) => (
      <Select.Option
        key={d.attributes.DISTRICT_NAME_Code}
        className="text-right"
        value={d.attributes.DISTRICT_NAME_Code}
      >
        {d.attributes.DISTRICT_NAME}
      </Select.Option>
    ));
  }
  openWizard = () => {
    this.FormRef.current.validateFields();
    let layername = "Invest_Site_Polygon";
    let layerIndex = getLayerIndex(layername);
    //selected from map for investment paper
    if (
      this.props.tempSelectedFeaturesData.length &&
      this.state.typeOfReport === "investmentPaper" &&
      this.state.wayOfChooseingInvestSite === "selectFromMap"
    ) {
      this.props.openLoader();
      if (
        !differenceBy(
          this.props.tempSelectedFeaturesData,
          this.props.tableSettings && this.props.tableSettings.result
            ? this.props.tableSettings.result
            : [],
          "id"
        ).length
      ) {
        this.notificationDuplicatedData();
        this.props.closeLoader();
      } else {
        let tempSelectedFeatsClone = [...this.props.tempSelectedFeaturesData];
        tempSelectedFeatsClone.forEach(
          (feat) => (feat.reportType = "investment")
        );
        this.props.addLandToReportTable(tempSelectedFeatsClone);
        this.notificationByAdding();
        this.props.showTable(true);
        this.props.emptyTempSelectedFeats();
        this.props.closeLoader();
      }
    }
    //selected from map for tech report
    else if (
      this.props.tempSelectedFeaturesData.length &&
      this.state.typeOfReport === "technicalReport" &&
      this.state.wayOfChooseingInvestSite === "selectFromMap"
    ) {
      this.props.openLoader();

      if (
        !differenceBy(
          this.props.tempSelectedFeaturesData,
          this.props.tableSettings && this.props.tableSettings.result
            ? this.props.tableSettings.result
            : [],
          "id"
        ).length
      ) {
        this.notificationDuplicatedData();
        this.props.closeLoader();
      } else {
        let where = this.props.tempSelectedFeaturesData
          .map(
            (feat) => `SITE_GEOSPATIAL_ID=${feat.attributes.SITE_GEOSPATIAL_ID}`
          )
          .join(" or ");
        this.props.openLoader();

        this.filterSitesWithTechnicalReports(
          where,
          "SelectedFromMap",
          this.props.tempSelectedFeaturesData[0].boxGeometry
        );
        // this.props.addLandToReportTable(this.props.tempSelectedFeaturesData);
        // this.notificationByAdding();
        // this.props.showTable(true);
        // // this.props.emptyTempSelectedFeats();
        // this.props.closeLoader();
      }
    }
    //selected from map for feasibility study report
    else if (
      this.props.tempSelectedFeaturesData.length &&
      this.state.typeOfReport === "FeasibilityStudyReport" &&
      this.state.wayOfChooseingInvestSite === "selectFromMap"
    ) {
      this.props.openLoader();
      if (
        !differenceBy(
          this.props.tempSelectedFeaturesData,
          this.props.tableSettings && this.props.tableSettings.result
            ? this.props.tableSettings.result
            : [],
          "id"
        ).length
      ) {
        this.notificationDuplicatedData();
        this.props.closeLoader();
      } else {
        let where = this.props.tempSelectedFeaturesData
          .map(
            (feat) => `SITE_GEOSPATIAL_ID=${feat.attributes.SITE_GEOSPATIAL_ID}`
          )
          .join(" or ");
        this.filterSitesWithFeasibilityStudy(
          where,
          "SelectedFromMap",
          this.props.tempSelectedFeaturesData[0].boxGeometry
        );
        // let tempSelectedFeatsClone = [...this.props.tempSelectedFeaturesData];
        // tempSelectedFeatsClone.forEach(
        //   (feat) => (feat.reportType = "feasibilityStudy")
        // );
        // this.props.addLandToReportTable(tempSelectedFeatsClone);
        // this.notificationByAdding();
        // this.props.showTable(true);
        // this.props.emptyTempSelectedFeats();
        // this.props.closeLoader();
      }
    }
    //investment report from side menu
    else if (
      this.state.city &&
      this.state.typeOfReport === "investmentPaper"
      // &&this.state.wayOfChooseingInvestSite
      // && this.state.wayOfChooseingInvestSite!=="selectFromMap"
    ) {
      this.props.openLoader();

      queryTask({
        returnGeometry: true,
        url: `${window.__mapUrl__}/${layerIndex}`,
        outFields: ["*"],
        where: this.composeWhere(),
        callbackResult: ({ features }) => {
          let existingFeatures = [];
          if (this.props.tableSettings)
            existingFeatures = this.props.tableSettings.result;
          console.log(features);
          if (features.length) {
            let existingFeaturesAttributes = existingFeatures;
            let fetchedFeaturesAttributes = features;
            let areNewFeatures = differenceBy(
              fetchedFeaturesAttributes,
              existingFeaturesAttributes,
              "attributes.SITE_GEOSPATIAL_ID"
            );
            if (areNewFeatures.length) {
              areNewFeatures = uniqBy(areNewFeatures, "attributes.SITE_GEOSPATIAL_ID");
              LoadModules([
                "esri/graphic",
                "esri/symbols/SimpleFillSymbol",
                "esri/symbols/SimpleLineSymbol",
                "esri/Color",
                "esri/graphicsUtils",
              ]).then(
                async ([
                  Graphic,
                  SimpleFillSymbol,
                  SimpleLineSymbol,
                  Color,
                  graphicsUtils,
                ]) => {
                  let graphicLayer = window.__map__.getLayer(
                    "graphicLayer_Multi_Select"
                  );
                  areNewFeatures.forEach(async (feat) => {
                    var sfs = new SimpleFillSymbol(
                      SimpleFillSymbol.STYLE_SOLID,
                      new SimpleLineSymbol(
                        SimpleLineSymbol.STYLE_SOLID,
                        new Color([255, 120, 125]),
                        5
                      ),
                      new Color([255, 224, 0, 0.7])
                    );
                    let graphic = new Graphic(
                      feat.geometry,
                      sfs,

                      {
                        id: feat.attributes.SITE_GEOSPATIAL_ID,
                        SITE_GEOSPATIAL_ID: feat.attributes.SITE_GEOSPATIAL_ID,
                      }
                    );
                    graphicLayer.add(graphic);
                  });
                  let feats = window.__map__.getLayer(
                    "graphicLayer_Multi_Select"
                  ).graphics;
                  let featsExtent = graphicsUtils.graphicsExtent(feats);
                  window.__map__.setExtent(featsExtent.expand(3));
                }
              );
              areNewFeatures = [...areNewFeatures].map((f) => {
                f.isChecked = false;
                f.reportType = "investment";
                f.id = f.attributes.SITE_GEOSPATIAL_ID;
                return f;
              });
              this.props.addLandToReportTable(areNewFeatures);
              this.props.showTable(true);
              this.notificationByAdding();
              this.props.emptyTempSelectedFeats();
            } else this.notificationDuplicatedData();
            this.props.closeLoader();
          } else {
            this.notificationNotMatchedLands();
            this.props.closeLoader();
          }
          // });
        },
        callbackError: (err) => {
          this.props.closeLoader();
          this.notificationSomethingWrong();
          console.log(err);
        },
      });
      console.log(this.composeWhere());
    }
    //tech report from side menu
    else if (
      this.state.city &&
      this.state.typeOfReport === "technicalReport"
      // &&this.state.wayOfChooseingInvestSite
      // && this.state.wayOfChooseingInvestSite!=="selectFromMap"
    ) {
      this.props.openLoader();
      this.filterSitesWithTechnicalReports(this.composeWhere());
    }
    //feasibility study report from side menu
    else if (
      this.state.city &&
      // this.state.PARCEL_PLAN_NO &&
      this.state.typeOfReport === "FeasibilityStudyReport"
      // &&this.state.wayOfChooseingInvestSite
      // && this.state.wayOfChooseingInvestSite!=="selectFromMap"
    ) {
      this.filterSitesWithFeasibilityStudy(this.composeWhere());
      // queryTask({
      //   returnGeometry: true,
      //   url: `${window.__mapUrl__}/${layerIndex}`,
      //   outFields: ["*"],
      //   where: this.composeWhere(),
      //   callbackResult: ({ features }) => {
      //     let existingFeatures = [];
      //     if (this.props.tableSettings)
      //       existingFeatures = this.props.tableSettings.result;
      //     console.log(features);
      //     if (features.length) {
      //       let existingFeaturesAttributes = existingFeatures;
      //       let fetchedFeaturesAttributes = features;
      //       let areNewFeatures = differenceBy(
      //         fetchedFeaturesAttributes,
      //         existingFeaturesAttributes,
      //         "attributes.SITE_GEOSPATIAL_ID"
      //       );
      //       if (areNewFeatures.length) {
      //         LoadModules([
      //           "esri/graphic",
      //           "esri/symbols/SimpleFillSymbol",
      //           "esri/symbols/SimpleLineSymbol",
      //           "esri/Color",
      //           "esri/graphicsUtils",
      //         ]).then(
      //           async ([
      //             Graphic,
      //             SimpleFillSymbol,
      //             SimpleLineSymbol,
      //             Color,
      //             graphicsUtils,
      //           ]) => {
      //             let graphicLayer = window.__map__.getLayer(
      //               "graphicLayer_Multi_Select"
      //             );
      //             areNewFeatures.forEach(async (feat) => {
      //               var sfs = new SimpleFillSymbol(
      //                 SimpleFillSymbol.STYLE_SOLID,
      //                 new SimpleLineSymbol(
      //                   SimpleLineSymbol.STYLE_SOLID,
      //                   new Color([255, 120, 125]),
      //                   5
      //                 ),
      //                 new Color([255, 224, 0, 0.7])
      //               );
      //               let graphic = new Graphic(
      //                 feat.geometry,
      //                 sfs,

      //                 {
      //                   id: feat.attributes.SITE_GEOSPATIAL_ID,
      //                   SITE_GEOSPATIAL_ID: feat.attributes.SITE_GEOSPATIAL_ID,
      //                 }
      //               );
      //               graphicLayer.add(graphic);
      //             });
      //             let feats = window.__map__.getLayer(
      //               "graphicLayer_Multi_Select"
      //             ).graphics;
      //             let featsExtent = graphicsUtils.graphicsExtent(feats);
      //             window.__map__.setExtent(featsExtent.expand(3));
      //           }
      //         );
      //         areNewFeatures = [...areNewFeatures].map((f) => {
      //           f.isChecked = false;
      //           f.reportType = "feasibilityStudy";
      //           f.id = f.attributes.SITE_GEOSPATIAL_ID;
      //           return f;
      //         });
      //         this.props.addLandToReportTable(areNewFeatures);
      //         this.props.showTable(true);
      //         this.notificationByAdding();
      //         this.props.emptyTempSelectedFeats();
      //       } else this.notificationDuplicatedData();
      //       this.props.closeLoader();
      //     } else {
      //       this.notificationNotMatchedLands();
      //       this.props.closeLoader();
      //     }
      //     // });
      //   },
      //   callbackError: (err) => {
      //     this.props.closeLoader();
      //     this.notificationSomethingWrong();
      //     console.log(err);
      //   },
      // });
    }
    //if select map chosen but no select
    else if (
      this.state.wayOfChooseingInvestSite == "selectFromMap" &&
      !this.props.tempSelectedFeaturesData.length
    ) {
      this.notificationByInformSelectSite();
      this.props.closeLoader();
    }
  };
  notificationByInformSelectSite = () => {
    const args = {
      description: "من فضلك اختر موقع من الخريطة",
      duration: 5,
    };
    notification.open(args);
  };
  notificationByAdding = () => {
    const args = {
      description: "تم الإضافة بنجاح بجدول التقارير",
      duration: 5,
    };
    notification.open(args);
  };

  notificationNotMatchedLands = () => {
    const args = {
      description: "عفواً لا يوجد أراضي استثمارية مطابقة للبيانات المدخلة",
      duration: 5,
    };
    notification.open(args);
  };

  notificationDuplicatedData = () => {
    const args = {
      description: "تم اختيار هذه الأرض من قبل",
      duration: 5,
    };
    notification.open(args);
  };
  notificationSomethingWrong = () => {
    const args = {
      description: "عفواً حدث خطأً ما أثناء العملية. حاول مرة أخرى",
      duration: 5,
    };
    notification.open(args);
  };
  notificationNotFoundSitesWithReports = () => {
    const args = {
      description: "عفواً لا توجد تقارير للمواقع الاستثمارية المختارة",
      duration: 5,
    };
    notification.open(args);
  };
  zoomToParticularArea = async (whereCondition) => {
    var layerIndex = getLayerIndex("Invest_Site_Polygon");
    this.props.openLoader(); //for loader in case of zooimng
    await queryTask({
      returnGeometry: true,
      url: `${window.__mapUrl__}/${layerIndex}`,
      outFields: ["OBJECTID", "SITE_GEOSPATIAL_ID"],
      where: whereCondition,
      callbackResult: ({ features }) => {
        if (features.length) {
          zoomToFeature(features, window.__map__, 150, () =>
            setTimeout(() => {
              window.__map__._fixedPan(-20, window.__map__.height * 0.1);
            }, 100)
          );
          this.props.closeLoader(); //for loader in case of zooimng
        } else this.props.closeLoader();
      },
    });
  };

  composeWhere() {
    const { city, district, planNumber, PARCEL_PLAN_NO, locationStatus } =
      this.state;
    var where = `MUNICIPALITY_NAME=${city}`;
    if (district) where += ` AND DISTRICT_NAME=${district}`;

    if (PARCEL_PLAN_NO && planNumber && city)
      where = `MUNICIPALITY_NAME=${city} AND (PARCEL_PLAN_NO='${PARCEL_PLAN_NO}' OR PARCEL_PLAN_NO='${convertEngNumbersToArabic(
        PARCEL_PLAN_NO
      )}')`;
    else if (planNumber && city)
      where = `MUNICIPALITY_NAME=${city} AND PLAN_NO='${planNumber}'`;
    else if (PARCEL_PLAN_NO && city)
      where = `MUNICIPALITY_NAME=${city} AND (PARCEL_PLAN_NO='${PARCEL_PLAN_NO}' OR PARCEL_PLAN_NO='${convertEngNumbersToArabic(
        PARCEL_PLAN_NO
      )}')`;
    if (locationStatus) where += ` AND SITE_STATUS=${locationStatus}`;
    return where;
  }

  filterSitesWithTechnicalReports(where, isFromSelectedSiteOnMap, boxGeometry) {
    let layerIndex = getLayerIndex("invest_site_polygon");
    let layerIndexOfBuildingDetailsTbl = getLayerIndex("TBL_BUILD_DETAILS");
    let feauresNumber;
    LoadModules(["esri/tasks/query"]).then(async ([Query]) => {
      new Promise((resolve, reject) => {
        let params = {
          where: where,
        };
        if (!boxGeometry)
          queryTask({
            ...params,
            returnGeometry: true,
            url: `${window.__mapUrl__}/${layerIndex}`,
            outFields: ["SITE_GEOSPATIAL_ID,PARCEL_PLAN_NO,PLAN_NO,OBJECTID"],
            callbackResult: ({ features }) => {
              if (features.length) {
                feauresNumber = features.length;
                // let geoSpatialIDs = features.map(feat=>feat.attributes.SITE_GEOSPATIAL_ID);
                resolve(features);
              } else resolve([]);
            },
            callbackError: (err) => {
              console.log(err);
              resolve([]);
            },
          });
        else if (
          this.props.tempSelectedFeaturesData &&
          this.props.tempSelectedFeaturesData.length
        ) {
          feauresNumber = this.props.tempSelectedFeaturesData.length;
          resolve(this.props.tempSelectedFeaturesData);
        } else resolve([]);
      }).then((res) => {
        if (res.length)
          queryTask({
            returnGeometry: true,
            url: `${window.__mapUrl__}/${layerIndexOfBuildingDetailsTbl}`,
            outFields: ["*"],
            where: `SITE_GEOSPATIAL_ID IN (${res
              .map((feat) => feat.attributes.SITE_GEOSPATIAL_ID)
              .map((id) => `${id}`)
              .join(" , ")})`,
            callbackResult: ({ features }) => {
              let existingFeatures = [];
              if (this.props.tableSettings)
                existingFeatures = this.props.tableSettings.result;
              // console.log(features);

              let polygonSites = features;
              //  intersectionBy(
              //   res,
              //   features,
              //   "attributes.SITE_GEOSPATIAL_ID"
              // );
              let existingFeaturesAttributes = existingFeatures;
              let areNewFeatures = differenceBy(
                polygonSites,
                existingFeaturesAttributes,
                "attributes.SITE_GEOSPATIAL_ID"
              );
              if (areNewFeatures.length && !isFromSelectedSiteOnMap) {
              areNewFeatures = uniqBy(areNewFeatures, "attributes.SITE_GEOSPATIAL_ID");
                LoadModules([
                  "esri/graphic",
                  "esri/symbols/SimpleFillSymbol",
                  "esri/symbols/SimpleLineSymbol",
                  "esri/Color",
                  "esri/graphicsUtils",
                ]).then(
                  async ([
                    Graphic,
                    SimpleFillSymbol,
                    SimpleLineSymbol,
                    Color,
                    graphicsUtils,
                  ]) => {
                    let graphicLayer = window.__map__.getLayer(
                      "graphicLayer_Multi_Select"
                    );
                    areNewFeatures.forEach(async (feat) => {
                      var sfs = new SimpleFillSymbol(
                        SimpleFillSymbol.STYLE_SOLID,
                        new SimpleLineSymbol(
                          SimpleLineSymbol.STYLE_SOLID,
                          new Color([255, 120, 125]),
                          5
                        ),
                        new Color([255, 224, 0, 0.7])
                      );
                      let graphic = new Graphic(
                        feat.geometry,
                        sfs,

                        {
                          id: feat.attributes.SITE_GEOSPATIAL_ID,
                          SITE_GEOSPATIAL_ID:
                            feat.attributes.SITE_GEOSPATIAL_ID,
                        }
                      );
                      graphicLayer.add(graphic);
                    });
                    let feats = window.__map__.getLayer(
                      "graphicLayer_Multi_Select"
                    ).graphics;
                    let featsExtent = graphicsUtils.graphicsExtent(feats);
                    window.__map__.setExtent(featsExtent.expand(3));
                  }
                );
                areNewFeatures = [...areNewFeatures].map((f) => {
                  let siteData = res.find(
                    (item) =>
                      item.attributes.SITE_GEOSPATIAL_ID ===
                      f.attributes.SITE_GEOSPATIAL_ID
                  );
                  let featCopy = { ...siteData };
                  featCopy.isChecked = false;
                  featCopy.reportType = "tech";
                  featCopy.id = featCopy.attributes.SITE_GEOSPATIAL_ID;
                  return featCopy;
                });
                this.props.addLandToReportTable(areNewFeatures);
                this.props.showTable(true);
                this.notificationByAdding();
              } else if (areNewFeatures.length && isFromSelectedSiteOnMap) {
              areNewFeatures = uniqBy(areNewFeatures, "attributes.SITE_GEOSPATIAL_ID");
                let graphicLayerOfMultiSelect = window.__map__.getLayer(
                  "graphicLayer_Multi_Select"
                );
                // graphicLayerOfMultiSelect.clear();
                let graphicsClone = [...graphicLayerOfMultiSelect.graphics];
                graphicsClone.forEach((gr) => {
                  if (
                    [...areNewFeatures, ...existingFeatures]
                      .map((feat) => feat.attributes.SITE_GEOSPATIAL_ID)
                      .includes(gr.attributes.SITE_GEOSPATIAL_ID)
                  )
                    return;
                  else graphicLayerOfMultiSelect.remove(gr);
                });

                // highLight(
                //   areNewFeatures,
                //   "invest_site_polygon",
                //   true,
                //   "graphicLayer_Multi_Select"
                // );
                // let objectIdsOfSelectedFeatures = areNewFeatures.map(feat=>feat.attributes.OBJECTID);
                // for (let i = 0; i < graphicLayerOfMultiSelect.graphics.length; i++) {
                //   console.log(i, graphicLayerOfMultiSelect.graphics.length);
                //   // const graphic = graphicLayerOfMultiSelect.graphics[i];
                //   // if(!includes(objectIdsOfSelectedFeatures,graphic.attributes.id)){
                //   //   graphicLayerOfMultiSelect.remove(graphic);
                //   // }
                // }
                areNewFeatures = [...areNewFeatures].map((f) => {
                  let siteData = res.find(
                    (item) =>
                      item.attributes.SITE_GEOSPATIAL_ID ===
                      f.attributes.SITE_GEOSPATIAL_ID
                  );
                  let featCopy = { ...siteData };
                  featCopy.isChecked = false;
                  featCopy.reportType = "tech";
                  featCopy.id = featCopy.attributes.SITE_GEOSPATIAL_ID;
                  return featCopy;
                });
                this.props.addLandToReportTable(areNewFeatures);
                this.props.showTable(true);
                this.notificationByAdding();
                this.props.emptyTempSelectedFeats();
              } else {
                // this.notificationDuplicatedData();
                // isFromSelectedSiteOnMap &&
                //   window.__map__.getLayer("graphicLayer_Multi_Select").clear();
                let graphicLayer = window.__map__.getLayer(
                  "graphicLayer_Multi_Select"
                );
                let graphicsClone = [...graphicLayer.graphics];
                graphicsClone.forEach((gr) => {
                  if (
                    this.props.tableSettings &&
                    this.props.tableSettings.result.length
                  ) {
                    if (
                      this.props.tableSettings.result
                        .map((feat) => feat.attributes.SITE_GEOSPATIAL_ID)
                        .includes(gr.attributes.SITE_GEOSPATIAL_ID)
                    )
                      return;
                    else graphicLayer.remove(gr);
                  } else {
                    window.__map__
                      .getLayer("graphicLayer_Multi_Select")
                      .clear();
                  }
                });
                this.notificationNotFoundSitesWithReports();
                this.props.emptyTempSelectedFeats();
              }
              this.props.closeLoader();

              // });
            },
            callbackError: (err) => {
              console.log(err, err.code);
              if (err.code == 400)
                notificationMessage(
                  "عدد المواقع المختارة قد تجاوز الحد المسموح به- لا يمكن طباعة التقرير"
                );
              else this.notificationSomethingWrong();
              this.props.closeLoader();
              this.props.emptyTempSelectedFeats();
              let graphicLayer = window.__map__.getLayer(
                "graphicLayer_Multi_Select"
              );
              graphicLayer.clear();
            },
          });
        else {
          this.props.emptyTempSelectedFeats();
          this.notificationNotFoundSitesWithReports();
          this.closeLoader();
        }
      });
    });
  }
  filterSitesWithFeasibilityStudy(where, isFromSelectedSiteOnMap, boxGeometry) {
    let layerIndex = getLayerIndex("invest_site_polygon");
    let feauresNumber;
    new Promise((resolve, reject) => {
      let params = {
        where: where,
      };
      //check if selected from map with one click
      if (!boxGeometry)
        queryTask({
          ...params,
          returnGeometry: true,
          url: `${window.__mapUrl__}/${layerIndex}`,
          outFields: ["SITE_GEOSPATIAL_ID,PARCEL_PLAN_NO,PLAN_NO,OBJECTID"],
          callbackResult: ({ features }) => {
            if (features.length) {
              feauresNumber = features.length;
              // let geoSpatialIDs = features.map(feat=>feat.attributes.SITE_GEOSPATIAL_ID);
              resolve(features);
            } else resolve([]);
          },
          callbackError: (err) => {
            console.log(err);
            resolve([]);
          },
        });
      //if selected from map with draw box
      else if (
        this.props.tempSelectedFeaturesData &&
        this.props.tempSelectedFeaturesData.length
      ) {
        feauresNumber = this.props.tempSelectedFeaturesData.length;
        resolve(this.props.tempSelectedFeaturesData);
      } else resolve([]);
    }).then((res) => {
      console.log(res);
      let layerIndexOfInvestStudyTbl = getLayerIndex("TBL_INVEST_STUDY");
      queryTask({
        returnGeometry: true,
        url: `${window.__mapUrl__}/${layerIndexOfInvestStudyTbl}`,
        outFields: ["*"],
        where: `SITE_GEOSPATIAL_ID IN (${res
          .map((feat) => feat.attributes.SITE_GEOSPATIAL_ID)
          .map((id) => `${id}`)
          .join(" , ")})`,
        callbackResult: ({ features }) => {
          let existingFeatures = [];
          if (this.props.tableSettings)
            existingFeatures = this.props.tableSettings.result;
          console.log(features);
          if (features.length) {
            let polygonSites = features;
            let existingFeaturesAttributes = existingFeatures;
            let areNewFeatures = differenceBy(
              polygonSites,
              existingFeaturesAttributes,
              "attributes.SITE_GEOSPATIAL_ID"
            );
            if (areNewFeatures.length && !isFromSelectedSiteOnMap) {
              areNewFeatures = uniqBy(areNewFeatures, "attributes.SITE_GEOSPATIAL_ID");
              LoadModules([
                "esri/graphic",
                "esri/symbols/SimpleFillSymbol",
                "esri/symbols/SimpleLineSymbol",
                "esri/Color",
                "esri/graphicsUtils",
              ]).then(
                async ([
                  Graphic,
                  SimpleFillSymbol,
                  SimpleLineSymbol,
                  Color,
                  graphicsUtils,
                ]) => {
                  let graphicLayer = window.__map__.getLayer(
                    "graphicLayer_Multi_Select"
                  );
                  areNewFeatures.forEach(async (feat) => {
                    var sfs = new SimpleFillSymbol(
                      SimpleFillSymbol.STYLE_SOLID,
                      new SimpleLineSymbol(
                        SimpleLineSymbol.STYLE_SOLID,
                        new Color([255, 120, 125]),
                        5
                      ),
                      new Color([255, 224, 0, 0.7])
                    );
                    let graphic = new Graphic(
                      feat.geometry,
                      sfs,

                      {
                        id: feat.attributes.SITE_GEOSPATIAL_ID,
                        SITE_GEOSPATIAL_ID: feat.attributes.SITE_GEOSPATIAL_ID,
                      }
                    );
                    graphicLayer.add(graphic);
                  });
                  let feats = window.__map__.getLayer(
                    "graphicLayer_Multi_Select"
                  ).graphics;
                  let featsExtent = graphicsUtils.graphicsExtent(feats);
                  window.__map__.setExtent(featsExtent.expand(3));
                }
              );
              areNewFeatures = [...areNewFeatures].map((f) => {
                let siteData = res.find(
                  (item) =>
                    item.attributes.SITE_GEOSPATIAL_ID ===
                    f.attributes.SITE_GEOSPATIAL_ID
                );
                let featCopy = { ...siteData };
                // featCopy.attributes = {...featCopy.attributes, ...siteData.attributes}
                featCopy.isChecked = false;
                featCopy.reportType = "feasibilityReport";
                featCopy.id = featCopy.attributes.SITE_GEOSPATIAL_ID;
                return featCopy;
              });
              this.props.addLandToReportTable(areNewFeatures);
              this.props.showTable(true);
              this.notificationByAdding();
              this.props.emptyTempSelectedFeats();
            } else if (areNewFeatures.length && isFromSelectedSiteOnMap) {
              areNewFeatures = uniqBy(areNewFeatures, "attributes.SITE_GEOSPATIAL_ID"); 
              //there are new selected features to add to wizard
              let graphicLayerOfMultiSelect = window.__map__.getLayer(
                "graphicLayer_Multi_Select"
              );
              let graphicsClone = [...graphicLayerOfMultiSelect.graphics];
              graphicsClone.forEach((gr) => {
                if (
                  [...areNewFeatures, ...existingFeatures]
                    .map((feat) => feat.attributes.SITE_GEOSPATIAL_ID)
                    .includes(gr.attributes.SITE_GEOSPATIAL_ID)
                )
                  return;
                else graphicLayerOfMultiSelect.remove(gr);
              });
              // highLight(
              //   areNewFeatures,
              //   "invest_site_polygon",
              //   "investmentReport",
              //   "graphicLayer_Multi_Select"
              // );
              areNewFeatures = [...areNewFeatures].map((f) => {
                let siteData = res.find(
                  (item) =>
                    item.attributes.SITE_GEOSPATIAL_ID ===
                    f.attributes.SITE_GEOSPATIAL_ID
                );
                let featCopy = { ...siteData };
                // featCopy.attributes = {...featCopy.attributes, ...siteData.attributes}

                featCopy.isChecked = false;
                featCopy.reportType = "feasibilityReport";
                featCopy.id = featCopy.attributes.SITE_GEOSPATIAL_ID;
                return featCopy;
              });
              this.props.addLandToReportTable(areNewFeatures);
              this.props.emptyTempSelectedFeats();
              this.props.showTable(true);
              this.notificationByAdding();
            } else {
              let graphicLayer = window.__map__.getLayer(
                "graphicLayer_Multi_Select"
              );
              let graphicsClone = [...graphicLayer.graphics];
              graphicsClone.forEach((gr) => {
                if (
                  this.props.tableSettings &&
                  this.props.tableSettings.result.length
                ) {
                  if (
                    this.props.tableSettings.result
                      .map((feat) => feat.attributes.SITE_GEOSPATIAL_ID)
                      .includes(gr.attributes.SITE_GEOSPATIAL_ID)
                  )
                    return;
                  else graphicLayer.remove(gr);
                } else {
                  window.__map__.getLayer("graphicLayer_Multi_Select").clear();
                }
              });
              this.notificationNotFoundSitesWithReports();
              this.props.emptyTempSelectedFeats();
            }
            this.props.closeLoader();
          } else {
            // isFromSelectedSiteOnMap &&
            //   window.__map__.getLayer("graphicLayer_Multi_Select").clear();
            let graphicLayerOfMultiSelect = window.__map__.getLayer(
              "graphicLayer_Multi_Select"
            );
            let graphicsClone = [...graphicLayerOfMultiSelect.graphics];
            graphicsClone.forEach((gr) => {
              if (
                !res
                  .map((feat) => feat.attributes.SITE_GEOSPATIAL_ID)
                  .includes(gr.attributes.SITE_GEOSPATIAL_ID)
              )
                return;
              else graphicLayerOfMultiSelect.remove(gr);
            });

            this.notificationNotFoundSitesWithReports();
            this.props.closeLoader();
          }
        },
        callbackError: (err) => {
          console.log(err, err.code);
          if (err.code == 400) {
            notificationMessage(
              "عدد المواقع المختارة قد تجاوز الحد المسموح به- لا يمكن طباعة التقرير"
            );
          } else this.notificationSomethingWrong();
          this.props.closeLoader();
          window.__map__.getLayer("graphicLayer_Multi_Select").clear();
        },
      });
    });
  }

  deSelectTypeOfEditedData = (e) => {
    this.props.diActivateMultiSelectButton();
    this.setState({
      plans: [],
      locationStatus: null,
      districts: [],
      district: null,
      planNumber: null,
      city: null,
      PARCEL_PLAN: null,
      wayOfChooseingInvestSite: null,
      parcels: [],
    });
    this.FormRef.current.setFieldsValue({
      city: null,
      district: null,
      planNumber: null,
      PARCEL_PLAN_NO: null,
      locationStatus: null,
      wayOfChooseingInvestSite: null,
      // typeOfReport:null
    });
  };
  render() {
    return (
      <div className="coordinates mb-4 reportsHelp">
        {/* {this.state.loading == true ? <Loader /> : null} */}
        <h3 className="mb-2">إصدار التقارير </h3>
        <Container>
          <Form
            className="GeneralForm"
            layout="vertical"
            name="validate_other_report"
            ref={this.FormRef}
          >
            <Form.Item
              hasFeedback={this.state.typeOfReport ? true : false}
              name="typeOfReport"
              rules={[
                {
                  message: "من فضلك اختر نوع التقرير",
                  required: true,
                },
              ]}
            >
              <Select
                name="typeOfReport"
                allowClear
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
                className="dont-show"
                onSelect={this.handleSelect("typeOfReport")}
                value={this.state.typeOfReport}
                onDeselect={(e) => this.deSelectCity(e, "typeOfReport")}
                onClear={(e) => this.deSelectCity(e, "typeOfReport")}
                placeholder="نوع التقارير"
                getPopupContainer={(trigger) => trigger.parentNode}
              >
                <Select.Option
                  key={1}
                  className="text-right"
                  value={"investmentPaper"}
                >
                  الصحفية الاستثمارية
                </Select.Option>
                <Select.Option
                  key={2}
                  className="text-right"
                  value={"technicalReport"}
                >
                  التقرير الفني
                </Select.Option>
                <Select.Option
                  key={3}
                  className="text-right"
                  value={"FeasibilityStudyReport"}
                >
                  تقرير دراسة الجدوى
                </Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              hasFeedback={this.state.wayOfChooseingInvestSite ? true : false}
              name="wayOfChooseingInvestSite"
              // rules={[
              //   {
              //     message: "من فضلك اختر طريقة اختيار الموقع الاستثماري",
              //     required: true,
              //   },
              // ]}
            >
              <Select
                allowClear
                name="wayOfChooseingInvestSite"
                showSearch
                onDeselect={this.deSelectTypeOfEditedData}
                onClear={this.deSelectTypeOfEditedData}
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
                className="dont-show"
                onSelect={this.handleSelect("wayOfChooseingInvestSite")}
                value={this.state.wayOfChooseingInvestSite}
                placeholder=" طريقة اختيار الموقع الاستثماري"
                getPopupContainer={(trigger) => trigger.parentNode}
              >
                <Select.Option
                  key="landNo"
                  className="text-right"
                  value="landNo"
                >
                  ادخال بيانات الموقع الاستثماري
                </Select.Option>
                <Select.Option
                  key="selectFromMap"
                  className="text-right"
                  value="selectFromMap"
                >
                  التحديد من الخريطة مباشرة
                </Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              // hasFeedback={this.state.wayOfChooseingInvestSite!=="selectFromMap"?true:false}
              name="locationStatus"
              // rules={[
              //   {
              //     message: "إختر حالة الموقع",
              //     required: true,
              //   },
              // ]}
            >
              <Select
                allowClear
                showSearch
                filterOption={(input, option) =>
                  {
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
                  // option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  // 0
                }
                className="dont-show"
                onSelect={this.handleSelect("locationStatus")}
                value={this.state.locationStatus}
                onDeselect={(e) => this.deSelectCity(e, "locationStatus")}
                onClear={(e) => this.deSelectCity(e, "locationStatus")}
                placeholder="حالة الموقع "
                name="locationStatus"
                getPopupContainer={(trigger) => trigger.parentNode}
              >
                {this.renderDomainSelect("SITE_STATUS")}
              </Select>
            </Form.Item>
            <Form.Item
              hasFeedback={this.state.city ? true : false}
              name="city"
              rules={
                this.state.wayOfChooseingInvestSite !== "selectFromMap"
                  ? [
                      {
                        message: "من فضلك ادخل البلدية",
                        required: true,
                      },
                    ]
                  : null
              }
            >
              <Select
                name="city"
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
                onSelect={this.handleSelect("city")}
                value={this.state.city}
                onDeselect={this.deSelectCity("typeOfReport")}
                onClear={this.deSelectCity("typeOfReport")}
                placeholder="البلدية"
                getPopupContainer={(trigger) => trigger.parentNode}
              >
                {this.renderDomainSelect("MUNICIPALITY_NAME")}
              </Select>
            </Form.Item>

            <Form.Item
              // hasFeedback
              name="district"
            >
              <Select
                allowClear
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
                className="dont-show"
                onChange={this.handleSelect("district")}
                value={this.state.district}
                placeholder="الحي"
                getPopupContainer={(trigger) => trigger.parentNode}
              >
                {this.renderDistricts()}
              </Select>
            </Form.Item>
            <Form.Item
              // hasFeedback
              name="planNumber"
            >
              <Select
                name="planNumberSelect"
                allowClear
                showSearch
                filterOption={(input, option) => {
                  return (
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0 ||
                    option.children
                      .toLowerCase()
                      .indexOf(convertNumbersToEnglish(input.toLowerCase())) >=
                      0 ||
                    option.children
                      .toLowerCase()
                      .indexOf(
                        convertEngNumbersToArabic(input.toLowerCase())
                      ) >= 0
                  );
                }}
                className="dont-show"
                onChange={this.handleSelect("planNumber")}
                value={this.state.planNumber}
                placeholder="رقم المخطط"
                getPopupContainer={(trigger) => trigger.parentNode}
              >
                {this.renderPlans()}
              </Select>
            </Form.Item>

            {this.state.wayOfChooseingInvestSite === "landNo" && (
              <Row>
                <Col
                  sm={
                    this.state.typeOfReport === "FeasibilityStudyReport"
                      ? 24
                      : 20
                  }
                >
                  <Form.Item
                    hasFeedback
                    name="PARCEL_PLAN_NO"
                    rules={
                      // this.state.typeOfReport === "FeasibilityStudyReport" &&
                      // this.state.wayOfChooseingInvestSite === "landNo"
                      //   ? [
                      //       {
                      //         message: "من فضلك أدخل رقم الأرض",
                      //         required: true,
                      //       },
                      //     ]
                      //   :
                      []
                    }
                  >
                    <Select
                      name="PARCEL_PLAN_NO"
                      allowClear
                      showSearch
                      filterOption={(input, option) => {
                        return (
                          option.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0 ||
                          option.children
                            .toLowerCase()
                            .indexOf(
                              convertNumbersToEnglish(input.toLowerCase())
                            ) >= 0 ||
                          option.children
                            .toLowerCase()
                            .indexOf(
                              convertEngNumbersToArabic(input.toLowerCase())
                            ) >= 0
                        );
                      }}
                      className="dont-show"
                      onChange={this.handleSelect("PARCEL_PLAN_NO")}
                      value={this.state.PARCEL_PLAN_NO}
                      placeholder="رقم الأرض"
                      getPopupContainer={(trigger) => trigger.parentNode}
                    >
                      {this.renderParcels()}
                    </Select>
                  </Form.Item>
                </Col>
                {this.state.typeOfReport !== "FeasibilityStudyReport" && (
                  <Col sm={4} className="openReportWizardBtn">
                    <Form.Item>
                      <Button
                        onClick={this.openWizard}
                        disabled={
                          !(
                            valueToBoolean(this.state.city) &&
                            valueToBoolean(this.state.PARCEL_PLAN_NO)
                          )
                        } //must be == not !==
                      >
                        {" "}
                        <i
                          className="fas fa-plus-circle mt-3 "
                          name="fraction"
                        ></i>
                      </Button>
                    </Form.Item>
                  </Col>
                )}
              </Row>
            )}
            {this.state.wayOfChooseingInvestSite === "selectFromMap" && (
              <>
                <span
                  className="row p-2"
                  style={{
                    // textAlign: "right",
                    width: "90%",
                    whiteSpace: "pre-wrap",
                    textAlign: "start",
                    margin: "auto",
                    direction: "rtl",
                    display: "flow-root",
                  }}
                >
                  * حدد قطعة الأرض من الخريطة من خلال زر التحديد يسار الخريطة
                  <i
                    className="fas fa-1x fa-expand ml-2"
                    style={{
                      marginRight: "15px",
                      background: "black",
                      color: "white",
                      padding: "6px",
                    }}
                  ></i>
                  ثم اضغط اضافة
                </span>
                <span
                  className="row p-2"
                  style={{
                    // textAlign: "right",
                    width: "90%",
                    whiteSpace: "pre-wrap",
                    textAlign: "start",
                    margin: "auto",
                    direction: "rtl",
                    display: "flow-root",
                  }}
                >
                  * ولإلغاء التحديد من الخريطة من زر التحديد بالضغط على الموقع
                  المحدد
                </span>
              </>
            )}
            <Row>
              <Col span={24}>
                <Form.Item>
                  <Button
                    // disabled={
                    //   (state.wayOfChooseingInvestSite==="selectFromMap"||state.typeOfEditedData==="ADVERTISING_BOARDS")&&props.tempSelectedFeaturesData.length
                    //     ? false:
                    //     (state.wayOfChooseingInvestSite==="selectFromMap"||state.typeOfEditedData==="ADVERTISING_BOARDS")&&props.tempSelectedFeaturesData.length===0 ?
                    //     true:false
                    // }
                    disabled={
                      this.state.wayOfChooseingInvestSite === "selectFromMap" &&
                      !this.props.tempSelectedFeaturesData.length &&
                      this.state.typeOfReport
                    }
                    onClick={this.openWizard}
                    className="SearchBtn mt-3"
                    size="large"
                    htmltype="submit"
                  >
                    إضافة للتقرير
                  </Button>
                </Form.Item>
              </Col>
              {/* <Col span={24}>
                <Button
                  className="SearchBtn mt-3"
                  size="large"
                  htmlType="submit"
                  // disabled={this.state.city == "" ? true : false}
                onClick={this.openWizard} 
                >
                    {" "}
                    التالي
                </Button> 
              </Col>
                */}
              {/* <Col span={12}>
                <Button
                  className="SearchBtn mt-3"
                  size="large"
                  // htmlType="submit"
                  disabled={!this.props.finishToPrint}
                >
                  <Link onClick={this.openReports} style={{ color: "#fff" }}>
                    {" "}
                    طباعة الصحيفة
                  </Link>
                </Button>
              </Col> */}
            </Row>
          </Form>
        </Container>
      </div>
    );
  }
}
const mapStateToProps = ({ mapUpdate }) => {
  const {
    fields,
    currentUser,
    tableSettings,
    tempSelectedFeaturesData,
    multiSelectActive,
  } = mapUpdate;
  return {
    fields,
    currentUser,
    tableSettings,
    tempSelectedFeaturesData,
    multiSelectActive,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    addLandToReportTable: (data) =>
      dispatch({ type: "ADD_TO_TABLE_DATA_SET", data }),
    clearTableData: () => dispatch({ type: "CLEAR_RESULT_TABLE_DATA_SET" }),
    activateMultiSelectButton: (layerName) =>
      dispatch({
        type: "ACTIVATE_MULTI_SELECT",
        layerName,
        typeUse: "investmentReport",
      }),
    diActivateMultiSelectButton: () =>
      dispatch({ type: "DIACTIVATE_MULTI_SELECT" }),
    emptyTempSelectedFeats: () => dispatch({ type: "EMPTY_DATA_FROM_TEMP" }),
    disactivateSingleSelect: () =>
      dispatch({ type: "DIACTIVATE_SINGLE_SELECT" }),
    clearSelection: () => dispatch({ type: "CLEAR_SELECTED" }),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(InvestmentReport);

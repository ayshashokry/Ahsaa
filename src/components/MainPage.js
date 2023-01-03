import React, { Component } from "react";
import NavBar from "./layout/NavBar";
import Header from "./layout/Header";
import SearchResultTable from "./Tables/SearchResultTable";
import MapComponent from "./map";
import MapActions from "./navigationToolbar";
import SearchTableIconModal from "./modals/SearchTableIconModal";
import SideMenu from "./layout/SideMenu";
import UpdateLocationWizard from "./wizard/UpdateLocationWizard";
import { connect } from "react-redux";
import Loader from "./loader";
import AddLocationFromParcelsWizard from "./wizard/AddLocationFromParcelsWizard";
import InvestmentReportWizard from "./wizard/InvestmentReportWizard";
import RemarksSuggestionsSearch from "./Tables/RemarksSuggestionTable/RemarksSuggestionsSearch";
import PrintSuggestReport from "./reports/feasibilityStudyReports/PrintSuggestReport";
import PlanningStudy from "./modals/FeasibilityStudy/Modals/PlanningStudy";
import FeasibilityModalsContainer from "./modals/FeasibilityStudy/FeasibilityModalsContainer";
import ShowingPriceTable from "./Tables/FeasibilityStudyTables/ShowingPriceTable";
import DashboardWizard from "./wizard/DashboardWizard/DashboardWizard";
import MainPageHelp from "./helpTooltip/MainPageHelp";
import HeaderHelp from "./helpTooltip/HeaderHelp";

export class MainPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      routeName: "generalSearch",
      openMenu: true,
      sideMenuDisplay: "block",
      selectedSpotonMap: null,
      infoIconActive: false,
      showResultTablestate: false,
      showUpdateTablestate: false,
      showRemarkSuggestTablestate: false,
      headerDisplay: "headerShown",
      loading: false,
      finishToPrint: false,
      printSuggestionReport: false,
      showPlanningStudy: false,
      showingDetailsViaMap: false,
      run: true,
      isInvestableSitesChosen: false,
    };
    this.navigationProps = {
      history: this.props.history,
      location: this.props.location,
      match: this.props.match,
    };
  }
  setIsInvestableSite(bool) {
    this.setState({ isInvestableSitesChosen: bool });
  }
  //this is in case of switch users (during login or logout) close any sidemenu
  componentDidUpdate(prevProps, prevState) {
    let prevCurrentUser = prevProps.currentUser;
    let currentUser = this.props.currentUser;
    if (prevCurrentUser !== currentUser) {
      this.setState({
        routeName: "generalSearch",
        openMenu: true,
        sideMenuDisplay: "block",
        selectedSpotonMap: null,
        infoIconActive: false,
        showResultTablestate: false,
        showRemarkSuggestTablestate: false,
        showUpdateTablestate: false,
        headerDisplay: "headerShown",
        loading: false,
        showPlanningStudy: false,
        finishToPrint: false,
        showingDetailsViaMap: false,
      });
    }
  }
  showResultTable = (show) => {
    this.setState({
      showResultTablestate: show,
      showUpdateTablestate: false,
      showRemarkSuggestTablestate: false,
    });
  };
  showUpdateTable = (show) => {
    this.setState({
      showUpdateTablestate: show,
      showResultTablestate: false,
      showRemarkSuggestTablestate: false,
    });
  };
  showRemarkSuggestTable = (show) => {
    this.setState({
      showRemarkSuggestTablestate: show,
      showResultTablestate: false,
      showUpdateTablestate: false,
    });
  };
  handleOpenMenu = (e) => {
    this.setState({ openMenu: true, sideMenuDisplay: "block" });
  };
  handleCloseMenu = (e) => {
    window.__map__.getLayer("highLightGraphicLayer") &&
      window.__map__.getLayer("highLightGraphicLayer").graphics.length &&
      window.__map__.getLayer("highLightGraphicLayer").clear();
    this.setState({
      openMenu: false,
      sideMenuDisplay: "none",
      showResultTablestate: false,
      showUpdateTablestate: false,
      showRemarkSuggestTablestate: false,
      showingDetailsViaMap: false,
    });
  };
  changeRoute = (route) => {
    this.setState({
      routeName: route,
      showResultTablestate: false,
      showUpdateTablestate: false,
      showRemarkSuggestTablestate: false,
      showingDetailsViaMap: false,
    });
  };
  isMenuOpen = (state) => {
    this.setState({ openMenu: state.isOpen });
    return state.isOpen;
  };
  onSelectSpot = (e) => {
    this.setState({ selectedSpotonMap: e.target.id });
  };
  openHeader = (e) => {
    this.setState({ headerDisplay: "headerShown" });
  };
  closeHeader = (e) => {
    this.setState({ headerDisplay: "headerHidden", key: "" });
  };
  openLoader = () => {
    this.setState({ loading: true });
  };
  closeLoader = () => {
    this.setState({ loading: false });
  };

  handleFinishButtonToPrint = (bool) => {
    this.setState({ finishToPrint: bool });
  };

  goToPrintSuggestionReportPage = () => {
    this.setState({ printSuggestionReport: true });
  };
  backFromPrintSuggestionToSuggestionWizard = () => {
    this.setState({
      printSuggestionReport: false,
      showRemarkSuggestTablestate: true,
    });
  };
  handleShowingDetailsViaMap(show) {
    this.setState({ showingDetailsViaMap: show });
  }
  activateInfoIcon(active) {
    this.setState({ infoIconActive: active });
  }
  openHelp = (e) => {
    e.preventDefault();
    localStorage.removeItem("showHelp");
    localStorage.removeItem("showUpdateLocationHelp");
    localStorage.removeItem("showContactHelp");
    localStorage.removeItem("showFesStudyHelp");
    localStorage.removeItem("showsearchHelp");
    this.setState(
      {
        run: false,
      },
      () => this.setState({ run: true })
    );
    this.forceUpdate();
  };

  render() {
    return (
      <div style={{ overflowY: "hidden" }}>
        {this.state.loading || !this.props.mapLoaded ? (
          // || this.props.featuresLoading
          <Loader />
        ) : null}

        {this.state.printSuggestionReport ? (
          <PrintSuggestReport
            {...this.navigationProps}
            backFromPrintSuggestionToSuggestionWizard={
              this.backFromPrintSuggestionToSuggestionWizard
            }
          />
        ) : (
          <>
            {/* Tooltip Help */}
            {this.state.run && (
              <>
                {!localStorage.getItem("showHelp") && <MainPageHelp />}
                {!localStorage.getItem("showContactHelp") &&
                  this.state.routeName === "contactcall" && (
                    <HeaderHelp routeName={this.state.routeName} />
                  )}
                {!localStorage.getItem("showdashboardHelp") &&
                  this.state.routeName === "dashboard" && (
                    <HeaderHelp routeName={this.state.routeName} />
                  )}{" "}
                {!localStorage.getItem("showreportsHelp") &&
                  this.state.routeName === "InvestmentReport" && (
                    <HeaderHelp routeName={this.state.routeName} />
                  )}
                {!localStorage.getItem("showUpdateLocationHelp") &&
                  this.state.routeName === "updateLocation" && (
                    <HeaderHelp routeName={this.state.routeName} />
                  )}
                {!localStorage.getItem("showsearchHelp") &&
                  (this.state.routeName === "search" ||
                    this.state.routeName === "generalSearch") && (
                    <HeaderHelp routeName={this.state.routeName} />
                  )}
                {!localStorage.getItem("showFesStudyHelp") &&
                  this.state.routeName === "feasibilityStudy" && (
                    <HeaderHelp routeName={this.state.routeName} />
                  )}
              </>
            )}
            <NavBar
              openHelp={this.openHelp}
              handleOpenMenu={this.handleOpenMenu}
              openHeader={this.openHeader}
              changeRoute={this.changeRoute}
              handleCloseMenu={this.handleCloseMenu}
              routeName={this.state.routeName}
              {...this.navigationProps}
            />

            {this.state.headerDisplay === "headerHidden" ? (
              <i
                onClick={this.openHeader}
                className="fas fa-chevron-down headerArrow"
                style={{ top: "55px" }}
              ></i>
            ) : (
              <i
                onClick={this.closeHeader}
                className="fas fa-chevron-up headerArrow"
                style={{ top: "93px" }}
              ></i>
            )}

            <Header
              openHelp={this.openHelp}
              openHeader={this.openHeader}
              headerDisplay={this.state.headerDisplay}
              closeHeader={this.closeHeader}
              isMenuOpen={this.isMenuOpen}
              changeRoute={this.changeRoute}
              routeName={this.state.routeName}
              handleOpenMenu={this.handleOpenMenu}
              handleCloseMenu={this.handleCloseMenu}
              selectedSpotonMap={this.state.selectedSpotonMap}
              openLoader={this.openLoader}
              closeLoader={this.closeLoader}
              activateInfoIcon={this.activateInfoIcon.bind(this)}
              {...this.navigationProps}
            />
            <div id="outer-container" style={{ height: "90vh" }}>
              {this.state.sideMenuDisplay === "block" ? (
                <SideMenu
                  setIsInvestableSite={this.setIsInvestableSite.bind(this)}
                  headerDisplay={this.state.headerDisplay}
                  routeName={this.state.routeName}
                  handleOpenMenu={this.handleOpenMenu}
                  openMenu={this.state.openMenu}
                  isMenuOpen={this.isMenuOpen}
                  handleCloseMenu={this.handleCloseMenu}
                  selectedSpotonMap={this.state.selectedSpotonMap}
                  showResultTable={this.showResultTable}
                  showUpdateTable={this.showUpdateTable}
                  showRemarkSuggestTable={this.showRemarkSuggestTable}
                  openLoader={this.openLoader}
                  closeLoader={this.closeLoader}
                  finishToPrint={this.state.finishToPrint}
                  printSuggestionReport={this.state.printSuggestionReport}
                  handleFinishButtonToPrint={this.handleFinishButtonToPrint}
                  isInvestableSitesChosen={this.state.isInvestableSitesChosen}
                  {...this.navigationProps}
                />
              ) : null}

              <main
                id="page-wrap"
                style={{ height: "100%" }}
                className={
                  (this.state.routeName === "info" ? "changeCursor" : "",
                  this.state.openMenu ? "esriOpen" : "esriClose",
                  this.state.openMenu &&
                    ([
                      "siteDetailsSideMenu",
                      "dblClickSiteDetailsSideMenu",
                      "nearestLocation",
                      "generalSearch",
                    ].includes(this.state.routeName)
                      ? "pageWrap33"
                      : [
                          "remarksFromFeasibility",
                          "suggestionsFromFeasibility",
                        ].includes(this.state.routeName)
                      ? "pageWrap23"
                      : "pageWrap20"))
                }
              >
                {/**Esri Map Component */}
                <MapComponent
                  fireLoaderOnZooming={this.fireLoaderOnZooming}
                  openMenu={this.state.openMenu}
                  handleOpenMenu={this.handleOpenMenu}
                  changeRoute={this.changeRoute}
                  routeName={this.state.routeName}
                  openLoader={this.openLoader}
                  closeLoader={this.closeLoader}
                  handleCloseMenu={this.handleCloseMenu}
                  isInvestableSitesChosen={this.state.isInvestableSitesChosen}
                  showRemarkSuggestTablestate={
                    this.state.showRemarkSuggestTablestate
                  }
                  showRemarkSuggestTable={this.showRemarkSuggestTable}
                  showResultTablestate={this.state.showResultTablestate}
                  showResultTable={this.showResultTable}
                  showUpdateTablestate={this.state.showUpdateTablestate}
                  showUpdateTable={this.showUpdateTable}
                  {...this.navigationProps}
                />
                <canvas id="myCanvas" className="canvas-line-zoom" />
              </main>
              {/* {(this.state.showResultTablestate === true &&
                this.state.routeName === "nearestLocation") ||
              (this.state.showResultTablestate === true &&
                this.state.routeName === "generalSearch") ||
              (this.state.showResultTablestate === true &&
                this.state.showingDetailsViaMap) ? (
                <SearchResultTable
                  openLoader={this.openLoader}
                  closeLoader={this.closeLoader}
                  openMenu={this.state.openMenu}
                  showingDetailsViaMap={this.state.showingDetailsViaMap}
                  {...this.navigationProps}
                />
              ) : null} */}
              {this.props.isShowingPricing ? (
                <ShowingPriceTable
                  openLoader={this.openLoader}
                  closeLoader={this.closeLoader}
                  openMenu={this.state.openMenu}
                  {...this.navigationProps}
                />
              ) : null}

              {(this.state.showRemarkSuggestTablestate === true &&
                this.state.routeName === "remarksFromFeasibility") ||
              (this.state.showRemarkSuggestTablestate === true &&
                this.state.routeName === "suggestionsFromFeasibility") ? (
                <RemarksSuggestionsSearch
                  openLoader={this.openLoader}
                  closeLoader={this.closeLoader}
                  openMenu={this.state.openMenu}
                  routeName={this.state.routeName}
                  printSuggestionReport={this.state.printSuggestionReport}
                  {...this.navigationProps}
                />
              ) : null}
              {this.state.showUpdateTablestate === true &&
              this.state.routeName === "updateLocationInfo" ? (
                <UpdateLocationWizard
                  showTable={this.showUpdateTable}
                  openLoader={this.openLoader}
                  closeLoader={this.closeLoader}
                  handleShowingDetailsViaMap={this.handleShowingDetailsViaMap.bind(
                    this
                  )}
                  showingDetailsViaMap={this.state.showingDetailsViaMap}
                  infoIconActive={this.state.infoIconActive}
                  {...this.navigationProps}
                />
              ) : (this.state.showUpdateTablestate === true &&
                  this.state.routeName === "addLocationCad") ||
                (this.state.showUpdateTablestate === true &&
                  this.state.routeName === "addLocationCharts") ? (
                <AddLocationFromParcelsWizard
                  showTable={this.showUpdateTable}
                  openLoader={this.openLoader}
                  closeLoader={this.closeLoader}
                  {...this.navigationProps}
                />
              ) : this.state.showUpdateTablestate === true &&
                this.state.routeName === "InvestmentReport" ? (
                <InvestmentReportWizard
                  reportWizard
                  openLoader={this.openLoader}
                  closeLoader={this.closeLoader}
                  showTable={this.showUpdateTable}
                  handleFinishButtonToPrint={this.handleFinishButtonToPrint}
                  {...this.navigationProps}
                />
              ) : this.state.showUpdateTablestate === true &&
                this.state.routeName === "dashboard" ? (
                <DashboardWizard
                  reportWizard
                  openLoader={this.openLoader}
                  closeLoader={this.closeLoader}
                  showTable={this.showUpdateTable}
                  handleFinishButtonToPrint={this.handleFinishButtonToPrint}
                  {...this.navigationProps}
                />
              ) : null}
              {[
                "remarksFromFeasibility",
                "suggestionsFromFeasibility",
              ].includes(this.state.routeName) ? (
                <SearchTableIconModal
                  openLoader={this.openLoader}
                  closeLoader={this.closeLoader}
                  {...this.navigationProps}
                />
              ) : null}
              <FeasibilityModalsContainer
                openLoader={this.openLoader}
                closeLoader={this.closeLoader}
                goToPrintSuggestionReportPage={
                  this.goToPrintSuggestionReportPage
                }
                printSuggestionReport={this.state.printSuggestionReport}
                {...this.navigationProps}
              />
              <MapActions
                showTable={this.showUpdateTable}
                routeName={this.state.routeName}
                showSearchResultTable={this.showResultTable}
                openLoader={this.openLoader}
                closeLoader={this.closeLoader}
                handleShowingDetailsViaMap={this.handleShowingDetailsViaMap.bind(
                  this
                )}
                handleCloseMenu={this.handleCloseMenu}
                handleOpenMenu={this.handleOpenMenu}
                changeRoute={this.changeRoute}
                infoIconActive={this.state.infoIconActive}
                // routeName={this.state.routeName}
                showingDetailsViaMap={this.state.showingDetailsViaMap}
                showRemarkSuggestTablestate={
                  this.state.showRemarkSuggestTablestate
                }
                showRemarkSuggestTable={this.showRemarkSuggestTable}
                showResultTablestate={this.state.showResultTablestate}
                showResultTable={this.showResultTable}
                showUpdateTablestate={this.state.showUpdateTablestate}
                showUpdateTable={this.showUpdateTable}
                {...this.navigationProps}
              />
              {/**Plan Study (Feasibility Study)  */}
              {this.props.singleSelectActive.isActive &&
                this.props.singleSelectActive.purposeOfSelect ===
                  "planningStudy" &&
                this.props.selectedFeatures.length === 1 && (
                  <PlanningStudy
                    openLoader={this.openLoader}
                    closeLoader={this.closeLoader}
                    {...this.navigationProps}
                  />
                )}
              {/***************** */}
            </div>
          </>
        )}
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    //feasibility study
    clearSuggestionDataOfReport: () =>
      dispatch({ type: "CLEAR_SUGGESTION_DATA_OF_REPORT" }),
  };
};

const mapStateToProps = ({ mapUpdate }) => {
  let { auth, selectedFeatures, singleSelectActive } = mapUpdate;
  let isShowingPricing =
    selectedFeatures.length === 1 &&
    singleSelectActive.purposeOfSelect === "showPricing"
      ? true
      : false;
  return {
    user: auth.user,
    isAuth: auth.isAuth,
    currentUser: mapUpdate.currentUser,
    selectedFeatures,
    singleSelectActive,
    isShowingPricing,
    mapLoaded: mapUpdate.mapLoaded,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MainPage);

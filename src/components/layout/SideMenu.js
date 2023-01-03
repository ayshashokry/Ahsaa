import React, { useState, useEffect, useRef } from "react";
import { elastic as Menu } from "react-burger-menu";
import AddLocationFromCAD from "../sidemenuSections/AddLocationFromCAD";
import AddLocationFromCharts from "../sidemenuSections/AddLocationFromCharts";
import CoordinatesSearch from "../sidemenuSections/CoordinatesSearch";
import Favorites from "../sidemenuSections/Favorites";
import GeneralSearch from "../sidemenuSections/GeneralSearch";
import InvestmentReport from "../sidemenuSections/InvestmentReport";
import NearestLocationSearch from "../sidemenuSections/NearestLocationSearch";
import RemarksSuggestSearchByDate from "../sidemenuSections/FeasibilityStudy/RemarksSuggestSearchByDate";
import UpdateLocationInfo from "../sidemenuSections/UpdateLocationInfo";
import PriceEstimate from "../sidemenuSections/FeasibilityStudy/PriceEstimate";
import PlanningEconomicStudy from "../sidemenuSections/FeasibilityStudy/PlanningEconomicStudy";
import DashboardSideMenus from "../sidemenuSections/Dashboard/DashboardSideMenus";
import { connect } from "react-redux";
import SearchResultMenu from "../sidemenuSections/SerarchResults/SearchResultMenu";
import SearchResultDetails from "../sidemenuSections/SerarchResults/SearchResultDetails";
import Loader from "../loader";
import MyContractedSites from "../sidemenuSections/MyContractedSites";

function SideMenu(props) {
  const userRef = useRef();
  const sideMenuRef = useRef();
  /**Double click on favorite items */
  const [dblclickOnFavMenu, setDblClicknFavMenu] = useState(false);
  //show cards menu
  const [dblclickOnMapResultMenuShown, setDblClickOpenResultMenu] =
    useState(false);
  //show card details
  const [dblclickOnMapResultDetailsShown, setDblClickOpenResultDetails] =
    useState(false);

  /*General Search Functions*/
  const [GeneralSearchInputsShown, setGeneralOpenSearchInputs] = useState(true);
  const [GeneralResultMenuShown, setGeneralOpenResultMenu] = useState(false);
  const [GeneralResultDetailsShown, setGeneralOpenResultDetails] =
    useState(false);

  const [NearestSearchInputsShown, setNearestOpenSearchInputs] = useState(true);
  const [NearestResultMenuShown, setNearestOpenResultMenu] = useState(false);
  const [NearestResultDetailsShown, setNearestOpenResultDetails] =
    useState(false);

  //handle showing cards details in fav menu
  const handleDoubleClickOnFavItems = (bool) => {
    setDblClicknFavMenu(bool);
  };
  //for general search menu
  //fired on click on menu (القائمة)
  const OpenGeneralResultMenu = (e) => {
    setGeneralOpenResultMenu(true);
    setGeneralOpenSearchInputs(false);
    setGeneralOpenResultDetails(false);
    props.clearSelectedFeatureData();
  };
  //fired click on search for opportunity
  const OpenGeneralSearchInputs = (e) => {
    setGeneralOpenResultMenu(false);
    setGeneralOpenSearchInputs(true);
    setGeneralOpenResultDetails(false);
    //clear tableSettings from redux
    props.showResultTable(false);
    props.clearTableData();
    //clear selected card data
    props.clearSelectedFeatureData();
    //remove highlighting from map
    window.__map__.getLayer("zoomGraphicLayer").clear();
    window.__map__.getLayer("searchGraphicLayer").clear();
  };
  const OpenGeneralResultdetails = (feature, layername) => {
    setGeneralOpenResultMenu(false);
    setGeneralOpenSearchInputs(false);
    setGeneralOpenResultDetails({
      feature,
      layername,
    });
  };
  /////////////////////////////
  //for search nearest site
  //fired on click on menu (القائمة)
  const OpenNearestResultMenu = (e) => {
    setNearestOpenResultMenu(true);
    setNearestOpenSearchInputs(false);
    setNearestOpenResultDetails(false);
  };
  //fired click on search for opportunity
  const OpenNearestSearchInputs = (e) => {
    setDblClickOpenResultMenu(false);
    // setDblClickOnMapInputs(false);
    setDblClickOpenResultDetails(false);

    setNearestOpenResultMenu(false);
    setNearestOpenSearchInputs(true);
    setNearestOpenResultDetails(false);
    //clear tableSettings from redux
    props.showResultTable(false);
    props.clearTableData();
    //clear selected card data
    props.clearSelectedFeatureData();
    //remove highlighting from map
    window.__map__.getLayer("zoomGraphicLayer").clear();
    window.__map__.getLayer("searchGraphicLayer").clear();
    window.__map__.getLayer("graphicLayer2").clear(); //clear buffer
  };
  const OpenNearestResultdetails = (feature, layername) => {
    setNearestOpenResultMenu(false);
    setNearestOpenSearchInputs(false);
    setNearestOpenResultDetails({
      feature,
      layername,
    });
  };
  ////////////////////////////
  //for double click map event to display sites details
  //fired click on search for opportunity
  const OpenDoubleClickMapSideMenu = (e) => {
    //reset general, nearest seach side menu
    setGeneralOpenResultMenu(false);
    setGeneralOpenSearchInputs(false);
    setGeneralOpenResultDetails(false);
    setNearestOpenResultMenu(false);
    setNearestOpenSearchInputs(false);
    setNearestOpenResultDetails(false);
    //set only side menu of dbl click on ma[]
    setDblClickOpenResultMenu(true);
    // setDblClickOnMapInputs(true);
    setDblClickOpenResultDetails(false);
    //clear tableSettings from redux
    // props.clearTableData();
    //clear selected card data
    props.clearSelectedFeatureData();
    //remove highlighting from map
    window.__map__.getLayer("zoomGraphicLayer").clear();
    // window.__map__.getLayer("searchGraphicLayer").clear();
  };
  const OpenDblClickOnMapResultdetails = (feature, layername) => {
    //reset all side menus
    setGeneralOpenResultMenu(false);
    setGeneralOpenSearchInputs(false);
    setGeneralOpenResultDetails(false);
    setNearestOpenResultMenu(false);
    setNearestOpenSearchInputs(false);
    setNearestOpenResultDetails(false);
    //set only dbl click on map
    setDblClickOpenResultMenu(false);
    // setDblClickOnMapInputs(false);
    setDblClickOpenResultDetails({
      feature,
      layername,
    });
  };
  //////////////////////////////
  useEffect(() => {
    if (window.__map__) removeGraphicsOnMap();
    setNearestOpenSearchInputs(true);
    setGeneralOpenSearchInputs(true);
    // setDblClickOnMapInputs(true);
    setNearestOpenResultMenu(false);
    setNearestOpenResultDetails(false);
    setGeneralOpenResultMenu(false);
    setGeneralOpenResultDetails(false);
    setDblClickOpenResultDetails(false);
    setDblClickOpenResultMenu(true);
  }, [props.routeName]);
  useEffect(() => {
    return () => {
      //clear tableSettings from redux
      props.clearTableData();
      //clear selected card data
      props.clearSelectedFeatureData();
      if (window.__map__) {
        //remove highlighting from map
        removeGraphicsOnMap();
        //reset fav items showing cards
        handleDoubleClickOnFavItems(false);
      }
    };
  }, []);
  useEffect(()=>{
    let prevUser = userRef.current || {};
    let currentUserr = props.user;
    if(Object.keys(prevUser).length&&!Object.keys(currentUserr).length){
      if (window.__map__) removeGraphicsOnMap();
      setNearestOpenSearchInputs(true);
      setGeneralOpenSearchInputs(true);
      // setDblClickOnMapInputs(true);
      setNearestOpenResultMenu(false);
      setNearestOpenResultDetails(false);
      setGeneralOpenResultMenu(false);
      setGeneralOpenResultDetails(false);
      setDblClickOpenResultDetails(false);
      setDblClickOpenResultMenu(true);
    }
    userRef.current = props.user;
  },[props.user])
  useEffect(()=>{
    //logic of scroll top in case of select low card in the menu list items
    let sideMenuElem = document.getElementsByClassName("bm-item-list")[0]
    if(GeneralResultMenuShown||GeneralResultDetailsShown||dblclickOnMapResultMenuShown||dblclickOnMapResultDetailsShown||
      NearestResultMenuShown|| NearestResultDetailsShown || dblclickOnFavMenu) {
    if (sideMenuElem) sideMenuElem.scrollTop = 0;
      }
  },[GeneralResultMenuShown,GeneralResultDetailsShown,dblclickOnMapResultMenuShown,dblclickOnMapResultDetailsShown,
    NearestResultMenuShown,NearestResultDetailsShown,dblclickOnFavMenu])
  const removeGraphicsOnMap = () => {
    //remove highlighting from map
    window.__map__.getLayer("zoomGraphicLayer").clear();
    window.__map__.getLayer("searchGraphicLayer").clear();
    window.__map__.getLayer("graphicLayer2").clear(); //clear buffer in nearest search
  };
  return (
    <Menu
      onClose={props.handleCloseMenu}
      onStateChange={props.isMenuOpen}
      width={
        props.routeName === "remarksFromFeasibility" ||
        props.routeName === "suggestionsFromFeasibility"||
        props.routeName === "myContractedSites"
          ? "23%"
          : ['siteDetailsSideMenu', 'dblClickSiteDetailsSideMenu','nearestLocation','generalSearch'].includes(props.routeName)||
            dblclickOnFavMenu
          ? "33%"
          : "20%"
      }
      className={props.headerDisplay === "headerShown" ? "menuu" : ""}
      // id={props.openMenu ? "menuOpen" : "menuClose"}
      customBurgerIcon={<i className=" fas fa-chevron-left"></i>}
      customCrossIcon={<i className=" fas fa-chevron-right"></i>}
      noOverlay
      right
      // ref={sideMenuRef}
      isOpen={props.openMenu}
      pageWrapId={"page-wrap"}
      outerContainerId={"outer-container"}
    >
      {props.routeName === "generalSearch" ? (
        <GeneralSearch
          isInvestableSitesChosen={props.isInvestableSitesChosen}
          showTable={props.showResultTable}
          setIsInvestableSite={props.setIsInvestableSite}
          openLoader={props.openLoader}
          closeLoader={props.closeLoader}
          generalOpenResultdetails={OpenGeneralResultdetails}
          generalOpenResultMenu={OpenGeneralResultMenu}
          generalOpenSearchInputs={OpenGeneralSearchInputs}
          generalResultMenuShown={GeneralResultMenuShown}
          generalResultDetailsShown={GeneralResultDetailsShown}
          generalSearchInputsShown={GeneralSearchInputsShown}
        />
      ) : props.routeName === "coordinates" ? (
        <CoordinatesSearch
          openLoader={props.openLoader}
          closeLoader={props.closeLoader}
        />
      ) : props.routeName === "nearestLocation" ? (
        <NearestLocationSearch
          showTable={props.showResultTable}
          selectedSpotonMap={props.selectedSpotonMap}
          openLoader={props.openLoader}
          closeLoader={props.closeLoader}
          nearestOpenResultdetails={OpenNearestResultdetails}
          nearestOpenResultMenu={OpenNearestResultMenu}
          nearestOpenSearchInputs={OpenNearestSearchInputs}
          nearestResultMenuShown={NearestResultMenuShown}
          nearestResultDetailsShown={NearestResultDetailsShown}
          nearestSearchInputsShown={NearestSearchInputsShown}
        />
      ) : props.routeName === "favorites" ? (
        <Favorites
          openLoader={props.openLoader}
          closeLoader={props.closeLoader}
          dblclickOnFavMenu={dblclickOnFavMenu}
          handleDoubleClickOnFavItems={handleDoubleClickOnFavItems}
        />
      ) : props.routeName === "updateLocationInfo" ? (
        <UpdateLocationInfo
          showTable={props.showUpdateTable}
          openLoader={props.openLoader}
          closeLoader={props.closeLoader}
        />
      ) : props.routeName === "addLocationCharts" ? (
        <AddLocationFromCharts
          showTable={props.showUpdateTable}
          openLoader={props.openLoader}
          closeLoader={props.closeLoader}
        />
      ) : props.routeName === "addLocationCad" ? (
        <AddLocationFromCAD
          showTable={props.showUpdateTable}
          openLoader={props.openLoader}
          closeLoader={props.closeLoader}
        />
      ) : props.routeName === "InvestmentReport" ? (
        <InvestmentReport
          showTable={props.showUpdateTable}
          openLoader={props.openLoader}
          closeLoader={props.closeLoader}
          finishToPrint={props.finishToPrint}
          handleFinishButtonToPrint={props.handleFinishButtonToPrint}
        />
      ) : props.routeName === "dashboard" ? (
        <DashboardSideMenus
          showTable={props.showUpdateTable}
          openLoader={props.openLoader}
          closeLoader={props.closeLoader}
          finishToPrint={props.finishToPrint}
          handleFinishButtonToPrint={props.handleFinishButtonToPrint}
        />
      ) : props.routeName === "remarksFromFeasibility" ||
        props.routeName === "suggestionsFromFeasibility" ? (
        <RemarksSuggestSearchByDate
          titleHeader={
            props.routeName === "remarksFromFeasibility"
              ? "الملاحظات"
              : "الاقتراحات"
          }
          showTable={props.showRemarkSuggestTable}
          openLoader={props.openLoader}
          closeLoader={props.closeLoader}
          printSuggestionReport={props.printSuggestionReport}
        />
      ) : props.routeName === "pricingFromFeasibility" ? (
        <PriceEstimate
          showTable={props.showRemarkSuggestTable}
          routeName={props.routeName}
          openLoader={props.openLoader}
          closeLoader={props.closeLoader}
        />
      ) : props.routeName === "economicStudyFromFeasibility" ? (
        <PlanningEconomicStudy
          showTable={props.showRemarkSuggestTable}
          routeName={props.routeName}
          openLoader={props.openLoader}
          closeLoader={props.closeLoader}
        />
      ) : props.routeName === "myContractedSites"?(
        <MyContractedSites
        closeLoader = {props.closeLoader}
        openLoader = {props.openLoader}
        user={props.user}
        routeName={props.routeName}
        />
      ):
      ["siteDetailsSideMenu", 'dblClickSiteDetailsSideMenu'].includes(props.routeName) ? (
        props.tableSettings?.result?.map((r) => r.data)?.flat().length > 1 ? (
          //  &&dblclickOnMapResultMenuShown
          <>
            <div className="searchStepsWizard ">
              <nav class="breadcrumbs">
                {dblclickOnMapResultDetailsShown ? (
                  <li
                    onClick={OpenDblClickOnMapResultdetails}
                    className={
                      dblclickOnMapResultDetailsShown
                        ? "breadcrumbs__item breadcrumbs__itemActive third"
                        : "breadcrumbs__item third"
                    }
                  >
                    النتائج
                  </li>
                ) : null}
                {dblclickOnMapResultMenuShown ||
                dblclickOnMapResultDetailsShown ? (
                  <li
                    onClick={OpenDoubleClickMapSideMenu}
                    className={
                      dblclickOnMapResultMenuShown
                        ? "breadcrumbs__item breadcrumbs__itemActive second"
                        : "breadcrumbs__item second"
                    }
                  >
                    القائمة
                  </li>
                ) : null}
              </nav>
            </div>
            {/* {dblclickOnMapResultMenuShown&& <SearchResultMenu
          // OpenSearchInputs={setDblClickOnMapInputs}
          OpenResultdetails={OpenDblClickOnMapResultdetails}
          />} */}
            {dblclickOnMapResultMenuShown ? (
              <SearchResultMenu
                // OpenSearchInputs={setDblClickOnMapInputs}
                routeName={props.routeName}
                OpenResultdetails={OpenDblClickOnMapResultdetails}
              />
            ) : props.tableSettings?.result &&
              (props.tableSettings?.result?.map((r) => r.data)?.flat()
                .length === 1 ||
                dblclickOnMapResultDetailsShown) ? (
              <SearchResultDetails
                // OpenSearchInputs={setDblClickOnMapInputs}
                OpenResultMenu={OpenDoubleClickMapSideMenu}
                showData={
                  dblclickOnMapResultDetailsShown
                    ? dblclickOnMapResultDetailsShown
                    : {
                        feature: props.tableSettings.result.find(
                          (r) => r.data.length
                        ).data[0],
                        layername: props.tableSettings.result.find(
                          (r) => r.data.length
                        ).layername,
                      }
                }
                openLoader = {props.openLoader}
                closeLoader = {props.closeLoader}
              />
            ) : (
              <Loader />
            )}
          </>
        ) : props.tableSettings?.result &&
          props.tableSettings?.result?.map((r) => r.data)?.flat().length ===
            1 ? (
          <>
            <h2 className="text-center"> بيانات الموقع المحدد</h2>
            <SearchResultDetails
              // OpenSearchInputs={setDblClickOnMapInputs}
              OpenResultMenu={OpenDoubleClickMapSideMenu}
              showData={
                dblclickOnMapResultDetailsShown
                  ? dblclickOnMapResultDetailsShown
                  : {
                      feature: props.tableSettings.result.find(
                        (r) => r.data.length
                      ).data[0],
                      layername: props.tableSettings.result.find(
                        (r) => r.data.length
                      ).layername,
                    }
              }
              openLoader = {props.openLoader}
              closeLoader = {props.closeLoader}
            />
          </>
        ) :
        null
      ) : null}
    </Menu>
  );
}
const mapDispatchToProps = (dispatch) => {
  return {
    clearSelectedFeatureData: () =>
      dispatch({ type: "CLOSE_TABLE_ICON_MODAL" }),
    clearTableData: () => dispatch({ type: "CLEAR_RESULT_TABLE_DATA_SET" }),
  };
};
const mapStateToProps = ({ mapUpdate }) => {
  return {
    tableSettings: mapUpdate.tableSettings,
    user:mapUpdate.auth?.user
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(SideMenu);

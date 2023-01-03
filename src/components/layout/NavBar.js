import React, { useState, useRef } from "react";
import { Nav, Button } from "react-bootstrap";
import logo from "../../assets/images/Logo1.png";
import { Link, useHistory, NavLink } from "react-router-dom";
import { Dropdown, Menu, notification } from "antd";
import Media from "react-media";
import { connect } from "react-redux";
import AvatarImg from "../../assets/images/avatarImg.png";
import { useEffect } from "react";

function NavBar(props) {
  const [key, setKey] = useState("search");
  const prevRouteName = useRef();
  const prevCurrentUser = useRef();
  const history = useHistory();
  prevRouteName.current = "generalSearch";
  const onSelect = (e) => {
    setKey(e);
    props.clearSelectedFeatures();
    props.emptyTempSelectedFeats();
    props.disactivateSingleSelect();
    props.changeRoute(e);
    if (
      [
        "search",
        "contactcall",
        "updateLocation",
        "InvestmentReport",
        "feasibilityStudy",
      ].includes(e)
    ) {
      props.openHeader();
    } else if (["dashboard", "favorites", "myContractedSites"].includes(e))
      props.handleOpenMenu();
  };
  const openReports = (e) => {
    props.handleOpenMenu();
    // const win = window.open("/InvestmentReport", "_blank");
    // win.focus();
  };

  const confirmationLogout = () => {
    const args = {
      description: "تم تسجيل الخروج بنجاح",
      duration: 5,
      placement: "bottomLeft",
      bottom: 5,
    };
    notification.open(args);
  };
  const handleLogout = () => {
    //reset basemap
    if (window.__baseMapGallery) window.__baseMapGallery.select("1");
    //reset to home extent
    window.__map__.setExtent(window.__fullExtent__);
    //clear selected features on map
    let graphicsLayers = [
      "highLightGraphicLayer",
      "graphicLayer1",
      "graphicLayer2",
      "graphicLayer_Invest_Site_Polygon",
      "graphicLayer_AD_Boards",
      "graphicLayer_Multi_Select",
      "Features_From_CAD",
      "zoomGraphicLayer",
      "searchGraphicLayer",
    ];
    graphicsLayers.forEach((layer) => window.__map__.getLayer(layer).clear());
    // if(window.__baseMapGallery){
    // window.__baseMapGallery.destroy();
    // window.__map__.setBasemap("osm")
    // window.__baseMapGallery = undefined;
    // }
    props.makeLogout();
    // setKey("search")
    props.clearSelectedFeatures();
    history.push("/");
    props.changeRoute("home");
    confirmationLogout();
  };
  useEffect(() => {
    if (
      !["siteDetailsSideMenu", "dblClickSiteDetailsSideMenu"].includes(
        prevRouteName.current
      ) &&
      ["siteDetailsSideMenu", "dblClickSiteDetailsSideMenu"].includes(
        props.routeName
      )
    ) {
      setKey("");
      prevRouteName.current = props.routeName;
    } else if (
      props.routeName == "home" &&
      prevCurrentUser.current !== props.currentUser
    ) {
      setKey("search");
    } else if (props.routeName == "home") {
      setKey("home");
    }
  }, [props.routeName]);
  useEffect(() => {
    prevCurrentUser.current = props.currentUser;
  }, [props.currentUser]);
  return (
    <div className="navBar userNav">
      <Nav activeKey={key} onSelect={onSelect}>
        {props.auth.isAuth ? (
          <React.Fragment>
            <Dropdown
              getPopupContainer={(trigger) => trigger.parentNode}
              trigger={["click"]}
              overlayStyle={{ marginTop: "25px" }}
              overlay={
                <Menu className="userDropDown mt-3">
                  <Media query="(max-width: 992px)">
                    {(matches) =>
                      matches ? (
                        <>
                          <Menu.Item>
                            <Nav.Link
                              onClick={props.handleCloseMenu}
                              eventKey="home"
                              title="الرئيسية"
                              className="navitem navMainHelp"
                            >
                              <i
                                style={{ fontSize: "18px" }}
                                className="pl-2 fa-x fas fa-home"
                              ></i>
                              الرئيسية
                            </Nav.Link>
                          </Menu.Item>
                          <hr />
                          <Menu.Item>
                            <Nav.Link
                              onClick={props.handleCloseMenu}
                              eventKey="search"
                              title="بحث"
                              className="navitem navSearchHelp"
                            >
                              {" "}
                              <i
                                style={{ fontSize: "18px" }}
                                className="pl-2 fa-x fas fa-search"
                              ></i>
                              بحث
                            </Nav.Link>
                          </Menu.Item>
                          <hr />{" "}
                          <Menu.Item>
                            <Nav.Link
                              onClick={props.handleCloseMenu}
                              eventKey="favorites"
                              title="قائمة المفضلة"
                              className="navitem navFavHelp"
                            >
                              {" "}
                              <i
                                style={{ fontSize: "18px" }}
                                className="pl-2 fa-x fas fa-heart"
                              ></i>
                              قائمة المفضلة
                            </Nav.Link>
                          </Menu.Item>
                          <hr />
                          {props.auth.user &&
                            props.auth.user.groups
                              ?.map((g) => g.id)
                              .includes(5) && (
                              <>
                                <Menu.Item>
                                  {" "}
                                  <Nav.Link
                                    onClick={props.handleCloseMenu}
                                    eventKey="updateLocation"
                                    title="حصر وتعديل الموقع"
                                    className="navitem navUpdateLocationHelp"
                                  >
                                    <i
                                      style={{ fontSize: "18px" }}
                                      className="pl-2 fa-x fas fa-edit"
                                    ></i>
                                    حصر وتعديل الموقع
                                  </Nav.Link>
                                </Menu.Item>
                                <hr />
                              </>
                            )}
                          {/**دراسة جدوى أولية */}
                          {props.auth.user &&
                            props.auth.user.groups
                              ?.map((g) => g.id)
                              .includes(3) && (
                              <>
                                <Menu.Item>
                                  <Nav.Link
                                    onClick={props.handleCloseMenu}
                                    eventKey="feasibilityStudy"
                                    title="دراسة جدوى أولية"
                                    className="navitem navFeasStudyHelp"
                                  >
                                    <i
                                      style={{ fontSize: "18px" }}
                                      className="pl-2 fa-x fas fa-edit"
                                    ></i>
                                    دراسة جدوى أولية
                                  </Nav.Link>
                                </Menu.Item>
                                <hr />
                              </>
                            )}
                          {props.auth.user &&
                            props.auth.user.groups
                              ?.map((g) => g.id)
                              .includes(2) && (
                              <>
                                <Menu.Item>
                                  {" "}
                                  <Nav.Link
                                    onClick={openReports}
                                    eventKey="InvestmentReport"
                                    title="تقارير"
                                    className="navitem navReportsHelp"
                                  >
                                    <i
                                      style={{ fontSize: "18px" }}
                                      className="pl-2 fa-x far fa-newspaper"
                                    ></i>
                                    تقارير
                                  </Nav.Link>
                                </Menu.Item>
                              </>
                            )}
                          {/**لوحة الإحصائيات */}
                          {props.auth.user &&
                            props.auth.user.groups
                              ?.map((g) => g.id)
                              .includes(4) && (
                              <>
                                <hr />
                                <Menu.Item>
                                  <Nav.Link
                                    onClick={props.handleCloseMenu}
                                    eventKey="dashboard"
                                    title="لوحة الإحصائيات"
                                    className="navitem navDashboardHelp"
                                  >
                                    <i
                                      style={{ fontSize: "18px" }}
                                      className="pl-2 fa-x far fa-newspaper"
                                    ></i>
                                    لوحة الإحصائيات
                                  </Nav.Link>
                                </Menu.Item>
                              </>
                            )}
                          {/**عقودي للمستثمر */}
                          {props.auth.user &&
                            [2].includes(props.auth.user.user_type_id) && (
                              <>
                                <hr />
                                <Menu.Item>
                                  <Nav.Link
                                    onClick={props.handleCloseMenu}
                                    eventKey="myContractedSites"
                                    title="عقودي"
                                    // className="navitem navDashboardHelp"
                                    className="navitem"
                                  >
                                    <i
                                      style={{ fontSize: "18px" }}
                                      className="pl-2 fa-x far fa-newspaper"
                                    ></i>
                                    عقودي
                                  </Nav.Link>
                                </Menu.Item>
                              </>
                            )}
                          <hr />
                          <Menu.Item>
                            <Link to="/contact">
                              <Nav.Link
                                onClick={props.handleCloseMenu}
                                eventKey="contactcall"
                                title="تواصل معنا"
                                className="navitem navContactHelp"
                              >
                                <i
                                  style={{ fontSize: "18px" }}
                                  className="pl-2 fa-x fas fa-phone"
                                ></i>
                                تواصل معنا
                              </Nav.Link>
                            </Link>
                          </Menu.Item>
                          <hr />
                          {props.auth.user.is_super_admin === 1 ? (
                            <Menu.Item>
                              <Nav.Link
                                eventKey="admin"
                                title="إدارة النظام"
                                className="navitem navAdminHelp"
                              >
                                <i
                                  style={{ fontSize: "18px" }}
                                  className="pl-2 fa-x fas fa-user-cog"
                                ></i>
                                إدارة النظام
                              </Nav.Link>
                            </Menu.Item>
                          ) : null}
                          <hr />
                          <Menu.Item
                            style={{ cursor: "pointer" }}
                            className="navitem "
                            onClick={handleLogout}
                          >
                            {" "}
                            <Nav.Link>
                              <i
                                style={{ fontSize: "18px" }}
                                className="pl-2 fa-x fas fa-sign-out-alt"
                              ></i>
                              تسجيـل خـروج
                            </Nav.Link>
                          </Menu.Item>
                          <hr />
                        </>
                      ) : (
                        <>
                          <Menu.Item
                            style={{ cursor: "pointer" }}
                            className="navitem "
                            onClick={handleLogout}
                          >
                            <i
                              style={{ fontSize: "18px" }}
                              className="pl-2 fa-x fas fa-sign-out-alt"
                            ></i>
                            تسجيـل خروج
                          </Menu.Item>
                        </>
                      )
                    }
                  </Media>
                </Menu>
              }
              placement="bottomLeft"
              arrow
            >
              <Button className="userNameBtn ml-3 p-0 pt-3">
                <span className=" ">{props.auth.user.name}</span>
                <i className="mr-2 fas fa-chevron-down"></i>
              </Button>
            </Dropdown>{" "}
            <img
              style={{ width: "auto", height: "30px" }}
              src={AvatarImg}
              className="img-fluid ml-2 mt-2"
              alt="userPhoto"
            />
            {/* <i className="fas fa-bell ml-3 notificationIco"></i> */}
          </React.Fragment>
        ) : (
          <Link to="/Login" className="loginButton">
            تسجيل الدخول
          </Link>
        )}

        <Media query="(max-width: 992px)">
          {(matches) =>
            matches ? null : (
              <div className="m-auto nav">
                {props.auth.user.is_super_admin === 1 ? (
                  <Nav.Item className=" ahsaaNavLink navAdminHelp">
                    <NavLink
                      eventKey="admin"
                      role="button"
                      title="إدارة النظام"
                      to="/admin"
                      activeClassName="adminLinkActive"
                      className="adminLink nav-link"
                    >
                      إدارة النظام
                    </NavLink>
                  </Nav.Item>
                ) : null}
                <Nav.Item className={"ahsaaNavLink navContactHelp"}>
                  <Link to="/contact">
                    {" "}
                    <Nav.Link
                      onClick={props.handleCloseMenu}
                      eventKey="contactcall"
                      title="تواصل معنا"
                    >
                      تواصل معنا
                    </Nav.Link>
                  </Link>
                </Nav.Item>
                {/**لوحة الإحصائيات */}
                {props.auth.user &&
                  props.auth.user.groups?.map((g) => g.id).includes(4) && (
                    <>
                      <Nav.Item className="ahsaaNavLink navDashboardHelp">
                        <Nav.Link
                          onClick={props.handleCloseMenu}
                          eventKey="dashboard"
                          title="لوحة الإحصائيات"
                        >
                          لوحة الإحصائيات
                        </Nav.Link>
                      </Nav.Item>
                    </>
                  )}
                {/**لوحة الإحصائيات */}
                {props.auth.user && [2].includes(props.auth.user.user_type_id) && (
                  <>
                    <Nav.Item className="ahsaaNavLink navDashboardHelp">
                      <Nav.Link
                        onClick={props.handleCloseMenu}
                        eventKey="myContractedSites"
                        title="عقودي"
                      >
                        عقودي
                      </Nav.Link>
                    </Nav.Item>
                  </>
                )}
                {props.auth.user &&
                  props.auth.user.groups?.map((g) => g.id).includes(2) && (
                    <>
                      <Nav.Item className="ahsaaNavLink navReportsHelp">
                        <Nav.Link
                          onClick={openReports}
                          eventKey="InvestmentReport"
                          title="تقارير"
                        >
                          تقارير
                        </Nav.Link>
                      </Nav.Item>
                    </>
                  )}
                {/**دراسة جدوى أولية */}
                {props.auth.user &&
                  props.auth.user.groups?.map((g) => g.id).includes(3) && (
                    <>
                      <Nav.Item className="ahsaaNavLink navFeasStudyHelp">
                        <Nav.Link
                          onClick={props.handleCloseMenu}
                          eventKey="feasibilityStudy"
                          title="دراسة جدوى أولية"
                        >
                          دراسة جدوى أولية
                        </Nav.Link>
                      </Nav.Item>
                    </>
                  )}
                {props.auth.user &&
                  props.auth.user.groups?.map((g) => g.id).includes(5) && (
                    <>
                      <Nav.Item className="ahsaaNavLink navUpdateLocationHelp">
                        <Nav.Link
                          onClick={props.handleCloseMenu}
                          eventKey="updateLocation"
                          title="حصر وتعديل الموقع"
                        >
                          حصر وتعديل الموقع
                        </Nav.Link>
                      </Nav.Item>
                    </>
                  )}
                <Nav.Item className="ahsaaNavLink navFavHelp">
                  <Nav.Link
                    onClick={props.handleCloseMenu}
                    eventKey="favorites"
                    title="قائمة المفضلة"
                  >
                    قائمة المفضلة
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item className="ahsaaNavLink navSearchHelp">
                  <Nav.Link
                    onClick={props.handleCloseMenu}
                    eventKey="search"
                    title="بحث"
                  >
                    بحث
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item className="ahsaaNavLink  navMainHelp ">
                  <Nav.Link
                    onClick={props.handleCloseMenu}
                    eventKey="home"
                    title="الرئيسية"
                  >
                    الرئيسية
                  </Nav.Link>
                </Nav.Item>
              </div>
            )
          }
        </Media>

        <Nav.Item className="">
          <Nav.Link
            className="navTitle"
            onClick={props.handleCloseMenu}
            eventKey="home"
            style={{ cursor: "pointer" }}
          >
            الخـريطـة الإسـتثـمـاريـة
          </Nav.Link>
        </Nav.Item>
        <Nav.Item className="navLogo ">
          <img
            src={logo}
            style={{ height: "50px", width: "50px" }}
            alt="logo"
            className="img-fluid"
          />
        </Nav.Item>
      </Nav>
    </div>
  );
}
const mapStateToProps = ({ mapUpdate }) => {
  const { currentUser, auth } = mapUpdate;
  return {
    currentUser,
    auth,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    makeLogout: (user) =>
      dispatch({
        type: "LOGOUT",
        data: user,
      }),
    clearSelectedFeatures: () => dispatch({ type: "CLEAR_SELECTED" }),
    disactivateSingleSelect: () =>
      dispatch({ type: "DIACTIVATE_SINGLE_SELECT" }),
    emptyTempSelectedFeats: () => dispatch({ type: "EMPTY_DATA_FROM_TEMP" }),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(NavBar);

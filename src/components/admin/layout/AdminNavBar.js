import React from "react";
import { Nav, Button } from "react-bootstrap";
import logo from "../../../assets/images/Logo1.png";
import { useHistory, NavLink } from "react-router-dom";
import { Dropdown, Menu, notification } from "antd";
import { connect } from "react-redux";
import AvatarImg from "../../../assets/images/avatarImg.png";
function AdminNavBar(props) {
  const history = useHistory();
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
    //clear selected features on map

    // if(window.__baseMapGallery){
    // window.__baseMapGallery.destroy();
    // window.__map__.setBasemap("osm")
    // window.__baseMapGallery = undefined;
    // }
    props.makeLogout();
    props.clearSelectedFeatures();
    history.push("/");
    confirmationLogout();
  };
  return (
    <div expand="lg" className="navBar userNav adminNav" fixed="top">
      <Nav>
        {props.auth.isAuth ? (
          <React.Fragment>
            <Dropdown
              getPopupContainer={(trigger) => trigger.parentNode}
              trigger={["click"]}
              overlayStyle={{ marginTop: "25px" }}
              overlay={
                <Menu className="userDropDown mt-3">
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
                </Menu>
              }
              placement="bottomLeft"
              arrow
            >
              <Button className="userNameBtn ml-3 p-0 pt-3">
                <span className=" ">{props.auth.user.name}</span>
                <i className="mr-2 fas fa-chevron-down"></i>
              </Button>
            </Dropdown>
            <img
              style={{ width: "auto", height: "30px" }}
              src={AvatarImg}
              className="img-fluid ml-2 mt-2"
              alt="userPhoto"
            />
            {/* <i className="fas fa-bell ml-3 notificationIco"></i> */}
          </React.Fragment>
        ) : null}
        <Nav.Item >
          <NavLink
            to="/"
            className="adminLink nav-link"
            style={{ color: "#000000" }}
          >
            الرئيسية
          </NavLink>
        </Nav.Item>
        <Nav.Item className="navLogo ml-auto">
          <img
            src={logo}
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
export default connect(mapStateToProps, mapDispatchToProps)(AdminNavBar);

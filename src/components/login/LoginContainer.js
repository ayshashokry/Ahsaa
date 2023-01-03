import React, { Component } from "react";
import { connect } from "react-redux";
//Packages

import LoginForm from "./LoginForm";
import LoginTypes from "./LoginTypes";
import ForgetPassword from "./ForgetPassword";
import LoginNavbar from "./LoginNavbar";
import { Redirect } from "react-router-dom";
class LoginContainer extends Component {
  render() {
    console.log(this.props.location.pathname.substring(7));
    const { isAuth } = this.props;
    if (!isAuth)
      return (
        <div style={{ height: "105vh" }} className="logP">
          <LoginNavbar />
          <div className="loginPage">
            <div className="layer">
              <LoginForm />
            </div>
          </div>
        </div>
      );
    else return <Redirect path to="/" />;
  }
}

const mapStateToProps = ({ mapUpdate }) => {
  let { auth } = mapUpdate;
  return {
    isAuth: auth.isAuth
  };
};
export default connect(mapStateToProps)(LoginContainer);

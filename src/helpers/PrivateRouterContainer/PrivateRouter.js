import React from "react";
import { connect } from "react-redux";
import { Route, Redirect } from "react-router-dom";

//mapping
import { mapDispatchToProps, mapStateToProps } from './PrivateRouterMapping'

const PrivateRouter = ({ component: Component, isAuth,  checkAuthintication, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) =>
        isAuth ? <Component {...rest} {...props } isAuth={isAuth} /> : <Redirect push to="Login" />
      }
    />
  );
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PrivateRouter)

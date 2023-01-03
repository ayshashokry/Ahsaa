import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom"; // add Switch
import MainPage from "./components/MainPage";
//prints components
import PrintAhsaComponent from "./components/reports/PrintAhsaComponent";
import DashboardReportComponent from "./components/reports/Dashboard/DashboardReportComponent";
import PrintTechReportAhsaComponent from "./components/reports/TechReports/PrintTechReportAhsaComponent";
import TechReportInDetailsComponent from "./components/reports/TechReports/TechReportInDetails";
import FeasibilityStudyReport from "./components/reports/feasibilityStudyReports/FeasibilityStudyReport";
//login components
import LoginForm from "./components/login/LoginForm";
import ForgetPassword from "./components/login/ForgetPassword";
//Private Route
import PrivateRoute from "./helpers/PrivateRouterContainer/PrivateRouter";

//styles
import "./App.css";
import AdminMainPage from "./components/admin/AdminMainPage";
import ServerErrPage from "./sharedPages/ServerErr";
import UnauthPage from "./sharedPages/UnauthPage";
import NotFoundPage404 from "./sharedPages/404";
class App extends Component {
  render() {
    return (
      <Router basename={process.env.PUBLIC_URL}>
        <main
        // className="App"
        >
          <Route exact path="/" component={MainPage} />
          <Route exact path="/contact" component={MainPage} />
          {/* <PrivateRoute exact path="/:roleId" component={MainPage} /> */}
          <PrivateRoute
            exact
            path="/investmentreports"
            component={PrintAhsaComponent}
          />
          <PrivateRoute
            exact
            path="/mainDashboard"
            component={DashboardReportComponent}
          />
          <PrivateRoute
            exact
            path="/feasibilityStudyreports"
            component={FeasibilityStudyReport}
          />
          <PrivateRoute
            exact
            path="/investmenttechreports"
            component={PrintTechReportAhsaComponent}
          />
          <PrivateRoute
            exact
            path="/investTechReportDetails"
            component={TechReportInDetailsComponent}
          />
          <PrivateRoute exact path="/admin" component={AdminMainPage} />
          <Route exact path="/Login" component={LoginForm} />
          <Route
            exact
            path="/Login/ForgetPassword"
            component={ForgetPassword}
          />
        </main>{" "}
        <Route exact path="/serverErr" component={ServerErrPage} />
        <Route exact path="/unauthPage" component={UnauthPage} />
        <Route exact path="/404notfound" component={NotFoundPage404} />
        {/* <Route exact path="/InvestmentReport" component={InvestmentReport} /> */}
      </Router>
    );
  }
}

export default App;

import React from "react";
import { Redirect } from 'react-router-dom'
//Packages
import { Container } from "react-bootstrap";
import { Row, Col } from "antd";
import { Link } from "react-router-dom";
import engoffice from "../../assets/images/engOffice.png";
import employee from "../../assets/images/employee.png";
import investor from "../../assets/images/investor.png";

import loginLogo from "../../assets/images/loginLogo.png";
import { connect } from "react-redux";
function LoginTypes(props) {
  if(props.isAuth) return(
    <Redirect path to="/" />
    )
    else
  return (
    <div className="text-center">
      <img alt="logo" src={loginLogo} className='mb-5' />
      <Container>
        <Row justify="center">
          {" "}
          <Col
            sm={{ span: 24 }}
            xs={{ span: 24 }}
            md={{ span:4 }}
            className='mx-5'
          >
            <Link to="/Login/Employee">
              {" "}
              <div className="accountBox text-center py-4 px-1 mb-5 mx-2 mt-2">
                <img alt="personIcon" className="img-fluid" src={employee} />
                <h6 className="pt-4">موظف أمانة</h6>
              </div>{" "}
            </Link>
          </Col>{" "}
          <Col
            sm={{ span: 24 }}
            xs={{ span: 24 }}
            md={{ span:4 }}
            className='mx-5'
          >
            <Link to="/Login/EngOffice">
              {" "}
              <div className="accountBox text-center py-4 px-1 mb-5 mx-2 mt-2">
                <img alt="engIcon" className="img-fluid" src={engoffice} />
                <h6 className="pt-4">مكتب هندسي</h6>
              </div>{" "}
            </Link>
          </Col>{" "}
          <Col
            sm={{ span: 24 }}
            xs={{ span: 24 }}
            md={{ span:4 }}
            className='mx-5'
          >
            <Link to="/Login/Investor">
              {" "}
              <div className="accountBox text-center py-4 px-1 mb-5 mx-2 mt-2">
                <img alt="engIcon" className="img-fluid" src={investor} />
                <h6 className="pt-4">مستثمر</h6>
              </div>{" "}
            </Link>
          </Col>{" "}
        </Row>
      </Container>
    </div>
  );
}
const mapStateToProps = ({ mapUpdate }) => {
    let {auth} = mapUpdate;
  return {
    isAuth:auth.isAuth
  };
};
export default connect(mapStateToProps)(LoginTypes)
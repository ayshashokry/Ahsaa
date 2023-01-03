import React, { Component } from "react";
import { Container } from "react-bootstrap";
import { Form, Input, Row, Col, Button, notification } from "antd";
import { Link } from "react-router-dom";
import logo from "../../assets/images/loginminilogo.png";
import LoginNavbar from "./LoginNavbar";

export default class ForgetPassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      errorMsg: "",
      loading: false
    };
  }
  handleUserInput = e => {
    const name = e.target.name;
    const value = e.target.value;
    this.setState({ [name]: value, errorMsg: "" });
  };
  confirmationPassword = () => {
    const args = {
      description:
        "تم إرسال رسالة نصية بكلمة المرور إلي رقم الجوال المسجل لدينا",
      duration: 5,
      placement: "bottomLeft",
      bottom: 5
    };
    notification.open(args);
  };
  systemProblem = () => {
    const args = {
      description: "حدث خطأ في النظام, من فضلك حاول في وقت لاحق",
      duration: 30,
      placement: "bottomLeft",
      bottom: 5
    };
    notification.open(args);
  };
  Send = async e => {};
  render() {
    return (
      <div style={{ height: "105vh" }} className="logP">
        <LoginNavbar />
        <div className="loginPage">
          <div className="layer">
            <Container className="loginBox">
              {/* {this.state.loading ? <Loader /> : null} */}
              <div className="text-center">
                <img alt="logo" src={logo} />
              </div>
              <h5 className="pb-2">نسيت كلمة المرور</h5>
              <Form
                className="mt-4 px-2"
                layout="vertical"
                name="validate_other"
                //   onFinish={onFinish}
              >
                <Container>
                  <Row>
                    <p className="pb-4 addEmail">
                      من فضلك أدخل البريد الإلكتروني لإستعادة كلمة المرور
                    </p>
                    <Col span={24}>
                      <Form.Item
                        name="email"
                        label="البريد الإلكتروني"
                        hasFeedback
                        rules={[
                          {
                            required: true,
                            message: "من فضلك ادخل البريد الإلكتروني"
                          },
                          {
                            pattern: new RegExp(
                              /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                            ),
                            message: "البريد الإلكتروني غير صحيح"
                          }
                        ]}
                      >
                        <Input
                          name="email"
                          type="email"
                          onChange={this.handleUserInput}
                          value={this.state.email}
                          placeholder="البريد الإلكتروني"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  {this.state.errorMsg !== "" ? (
                    <p className="errMsg">{this.state.errorMsg}</p>
                  ) : null}
                  <Row className="formButtons pt-2 ">
                    <Col span={24} style={{ textAlign: "center" }}>
                      <Button
                        htmlType="submit"
                        className=" signInBtn"
                        onClick={this.Send}
                      >
                        إرسال
                      </Button>
                    </Col>
                  </Row>

                  <Row className="formRoutes py-2">
                    <Col span={24} style={{ textAlign: "center" }}>
                      <p>
                        <span className="formQuestion pl-2">هل لديك حساب؟</span>
                        <Link to="/Login">
                          <span className="formAnswer">تسجيل دخول</span>
                        </Link>
                      </p>
                    </Col>
                  </Row>
                </Container>
              </Form>
            </Container>
          </div>
        </div>
      </div>
    );
  }
}

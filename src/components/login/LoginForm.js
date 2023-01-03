import React, { Component } from "react";
import { Container } from "react-bootstrap";
import { Form, Input, Row, Col, Button, notification, Select } from "antd";
import { Redirect } from "react-router-dom";
import axios from "axios";
// import { API_URL } from "../../config";
import { mapDispatchToProps, mapStateToProps } from "./mapping";
import { connect } from "react-redux";
import logo from "../../assets/images/loginminilogo.png";
import LoginNavbar from "./LoginNavbar";
import OTPVerificationForm from "./OTPVerificationForm";
import { notificationMessage } from "../../helpers/utlis/notifications_Func";

class LoginForm extends Component {
  componentDidMount() {
    /**
     * this condition is for:
     *  in case of open login page with auth user
     *  */
    if (this.formRef && this.formRef.current)
      this.formRef.current.setFieldsValue({ selectedLoginType: 1 });
  }
  constructor(props) {
    super(props);
    this.state = {
      empNumber: "",
      password: "",
      errorMsg: "",
      selectedLoginType: 1,
      loginTypes: [
        { id: 1, name: "موظف أمانة" },
        { id: 2, name: "مستثمر" },
        { id: 3, name: "مكتب هندسي" },
      ],
      investTypes: [
        { id: 1, name: "فرد" },
        { id: 2, name: "شركة" },
        { id: 3, name: "خليجي" },
      ],
      selectedInvestType: "",
      loading: false,
      idNumber: "",
      commercialRegNumber: "",
      showOtpForm: false,
      otpDataRequest: null,
    };
    this.formRef = React.createRef();
  }
  handleUserInput = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    this.setState({ [name]: value, errorMsg: "" });
  };
  confirmationLogin = () => {
    const args = {
      description: "تم تسجيل الدخول بنجاح",
      duration: 5,
      placement: "bottomLeft",
      bottom: 5,
    };
    notification.open(args);
  };
  showingErrorInSignIn = () => {
    const args = {
      description: "بيانات غير صحيحة رجاء المحاولة مرة أخرى",
      duration: 5,
      placement: "bottomLeft",
      bottom: 5,
    };
    notification.open(args);
  };
  somethingWrongHappened = () => {
    const args = {
      description: "حدث خطأ أثناء تسجيل الدخول رجاء المحاولة مرة أخرى",
      duration: 5,
      placement: "bottomLeft",
      bottom: 5,
    };
    notification.open(args);
  };
  Signin = async (e) => {
    const { clearSelectedFeatures } = this.props;
    let obj =
      // this.state.selectedLoginType == 2
      //   ? // ? this.state.selectedInvestType == 2
      //     {
      //       username: this.state.commercialRegNumber,
      //       password: this.state.password,
      //     }
      //   : // : {
      //     //     username: this.state.idNumber,
      //     //     password: this.state.password
      //     //   }
      {
        username: this.state.empNumber,
        password: this.state.password,
      };
    obj.userType = this.state.selectedLoginType;
    this.setState({ loading: true });
    axios
      .post(`${window.API_URL}` + `Authenticate/send-otp`, {
        ...obj,
        refererIP: window.origin,
      })
      .then((response) => {
        if (response) {
          if (response.status === 200) {
            let data = response.data;
            this.setState({
              loading: false,
              showOtpForm: true,
              otpDataRequest: obj,
            });
            // makeLogin(data);
            clearSelectedFeatures();
            notificationMessage("تم إرسال كود ال OTP لهاتفك المحمول", 5);
            // console.log(this.props);
            // this.props.history.push("/");
          }
        }
      })
      .catch((error) => {
        this.setState({ loading: false });
        // console.log(error);
        // console.log(error.response);
        if (error) {
          if (error.response && error.response.status == 401) {
            this.showingErrorInSignIn();
            // this.formRef.current.resetFields();
            // this.setState({ empNumber: "", password: "", errorMsg: "" });
          } else {
            this.somethingWrongHappened();
          }
        }
        // this.props.history.push(this.props.history.location.pathname);

        // if (error.response.data.StatusCode == 201) {
        //   message.error(t("Duplicate User Name"));
        // } else if (error.response.data.StatusCode == 203) {
        //   message.error(t("Duplicate Email"));
        // } else
        // if (error.response.data.StatusCode == 206) {
        //   message.error(t("Invalid user or password"));
        // } else if (error.response.data.StatusCode == 204) {
        //   message.error(t("Invalid Email"));
        // } else if (error.response.data.StatusCode == 207) {
        //   message.error(t("User Already Exists"));
        // } else {
        //   message.error(t("error happened"));
        // }
      });
  };
  handleChangeLoginType = (e) => {
    this.formRef.current.resetFields();
    this.setState({
      selectedLoginType: e,
      selectedInvestType: null,
      idNumber: null,
      commercialRegNumber: null,
      empNumber: null,
      password: null,
    });
    this.formRef.current.setFieldsValue({
      selectedLoginType: e,
    });
  };
  handleChangeInvestType = (e) => {
    // this.formRef.current.resetFields();
    this.setState({
      selectedInvestType: e,
      idNumber: "",
      commercialRegNumber: "",
      password: "",
    });

    this.formRef.current.setFieldsValue({
      selectedInvestType: e,
      idNumber: "",
      commercialRegNumber: "",
      password: "",
    });
  };
  handleClearState() {
    if (this.formRef && this.formRef.current)
      this.formRef.current.resetFields();
    this.setState({
      empNumber: "",
      password: "",
      errorMsg: "",
      selectedLoginType: 1,
      selectedInvestType: "",
      loading: false,
      idNumber: "",
      commercialRegNumber: "",
      showOtpForm: false,
      otpDataRequest: null,
    });
  }
  handleSubmitFromOTPForm(data) {
    this.handleClearState();
    this.props.makeLogin(data);
    this.props.history.push("/");
    this.confirmationLogin();
  }
  render() {
    if (this.props.isAuth) return <Redirect path to="/" />;
    else if (this.state.showOtpForm)
      return (
        <OTPVerificationForm
          otpDataRequest={this.state.otpDataRequest}
          handleClearState={this.handleClearState.bind(this)}
          handleSubmitFromOTPForm={this.handleSubmitFromOTPForm.bind(this)}
        />
      );
    else
      return (
        <div style={{ height: "105vh" }} className="logP">
          <LoginNavbar />
          <div className="loginPage">
            <div className="layer">
              <Container className="loginBox">
                <div className="text-center">
                  <img alt="logo" src={logo} />
                </div>
                <h5>تسجيل الدخول</h5>
                {/* {this.state.loading ? <Loader /> : null}{" "} */}
                <Form
                  className="mt-4 px-2"
                  layout="vertical"
                  name="validate_other"
                  onFinish={this.Signin}
                  ref={this.formRef}
                >
                  <Container>
                    <Row>
                      <Col span={24} className="">
                        <Form.Item
                          rules={[
                            {
                              message: "من فضلك ادخل نوع المستخدم",
                              required: true,
                            },
                          ]}
                          name="selectedLoginType"
                          // hasFeedback
                          label="نوع المستخدم"
                        >
                          <Select
                            onChange={this.handleChangeLoginType}
                            initialValue={this.state.selectedLoginType}
                            value={this.state.selectedLoginType}
                            placeholder="أختر نوع المستخدم"
                            getPopupContainer={(trigger) => trigger.parentNode}
                          >
                            {this.state.loginTypes.map((info, index) => (
                              <Select.Option
                                value={info.id}
                                key={index}
                                id={info.id}
                              >
                                {info.name}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        {
                          <Form.Item
                            rules={[
                              {
                                message: "من فضلك ادخل اسم المستخدم",
                                required: true,
                              },
                            ]}
                            name="empNumber"
                            // hasFeedback
                            label="اسم المستخدم"
                          >
                            <Input
                              name="empNumber"
                              onChange={this.handleUserInput}
                              value={this.state.empNumber}
                              placeholder="اسم المستخدم"
                            />
                          </Form.Item>
                          //  : this.state.selectedLoginType === 2 ? (
                          //   <Form.Item
                          //     rules={[
                          //       {
                          //         message: "من فضلك ادخل نوع المستثمر",
                          //         required: true
                          //       }
                          //     ]}
                          //     name="selectedInvestType"
                          //     // hasFeedback
                          //     label="نوع المستثمر"
                          //   >
                          //     <Select
                          //       name="selectedInvestType"
                          //       onChange={this.handleChangeInvestType}
                          //       value={this.state.selectedInvestType}
                          //       placeholder="أختر نوع المستثمر"
                          //       getPopupContainer={trigger => trigger.parentNode}
                          //     >
                          //       {this.state.investTypes.map((info, index) => (
                          //         <Select.Option
                          //           value={info.id}
                          //           key={index}
                          //           id={info.id}
                          //         >
                          //           {info.name}
                          //         </Select.Option>
                          //       ))}
                          //     </Select>
                          //   </Form.Item>
                          // ):
                          // null
                        }
                      </Col>
                    </Row>
                    {/* {this.state.selectedLoginType === 2 ? (
                      <Row>
                        <Col span={24}>
                          {this.state.selectedInvestType == 1 ||
                          this.state.selectedInvestType == 3 ? (
                            <Form.Item
                              rules={[
                                {
                                  message: "من فضلك ادخل رقم الهوية",
                                  required: true
                                }
                              ]}
                              name="idNumber"
                              // hasFeedback
                              label="رقم الهوية"
                            >
                              <Input
                                name="idNumber"
                                onChange={this.handleUserInput}
                                value={this.state.idNumber}
                                placeholder="رقم الهوية"
                              />
                            </Form.Item>
                          ) : this.state.selectedInvestType == 2 ? 
                          ( 
                          <Form.Item
                            rules={[
                              {
                                message: "من فضلك ادخل رقم السجل التجارى",
                                required: true,
                              },
                            ]}
                            name="commercialRegNumber"
                            // hasFeedback
                            label="رقم السجل التجارى"
                          >
                            <Input
                              name="commercialRegNumber"
                              onChange={this.handleUserInput}
                              value={this.state.commercialRegNumber}
                              placeholder="رقم السجل التجارى"
                            />
                          </Form.Item>
                           )  
                           : null} 
                        </Col>
                      </Row>
                    ) : null} */}
                    <Row>
                      <Col span={24}>
                        <Form.Item
                          className="passwordInputt"
                          rules={[
                            {
                              message: "من فضلك ادخل كلمة المرور",
                              required: true,
                            },
                          ]}
                          name="password"
                          // hasFeedback
                          label="كلمة المرور"
                        >
                          <Input.Password
                            size="large"
                            name="password"
                            onChange={this.handleUserInput}
                            value={this.state.password}
                            placeholder="كلمة المرور"
                          />
                        </Form.Item>
                      </Col>
                      {this.state.errorMsg !== "" ? (
                        <p className="errMsg">{this.state.errorMsg}</p>
                      ) : null}
                    </Row>
                    <Row className="formButtons formRoutes">
                      <Col span={24} style={{ textAlign: "center" }}>
                        <Button
                          htmlType="submit"
                          className=" signInBtn"
                          loading={this.state.loading}
                        >
                          تسجيل الدخول
                        </Button>
                      </Col>
                      {/* <Link to="/Login/ForgetPassword">
                <p style={{ cursor: "pointer", marginBottom: "0" }}>
                  نسيت كلمة المرور؟
                </p>
              </Link> */}
                      {/* <Col span={24} style={{ textAlign: "center" }}>
                  <p>
                    <span className="formQuestion pl-2">
                      هل تريد العودة لتسجيل الدخول؟
                    </span>
                    <Link to="/Login/Types">
                      <span className="formAnswer">تسجيل دخول</span>
                    </Link>
                  </p>
                </Col> */}
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
export default connect(mapStateToProps, mapDispatchToProps)(LoginForm);

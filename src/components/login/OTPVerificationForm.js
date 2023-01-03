import React, { Component } from "react";
import { Container } from "react-bootstrap";
import {
  Form,
  Input,
  Row,
  Col,
  Button,
  notification,
  Select
} from "antd";
import { Redirect } from "react-router-dom";
import axios from "axios";
// import { API_URL } from "../../config";
import { mapDispatchToProps, mapStateToProps } from "./mapping";
import { connect } from "react-redux";
import logo from "../../assets/images/loginminilogo.png";
import LoginNavbar from "./LoginNavbar";
import { notificationMessage } from "../../helpers/utlis/notifications_Func";

class OTPVerificationForm extends Component {
  componentDidMount() {
    this.formOTPRef.current.setFieldsValue({ otpCode:"" });
    this.setState({
      loading: false,
      otpCode:"",
      errorMsg: "",
    })
  }
  componentWillUnmount(){
    this.props.handleClearState();
  }
  constructor(props) {
    super(props);
    this.state = {
      otpCode:"",
      errorMsg: "",
      loading: false,
    };
    this.formOTPRef = React.createRef();
  }
  handleUserInput = e => {
    const name = e.target.name;
    const value = e.target.value;
    this.setState({ [name]: value, errorMsg: "" });
  };
  confirmationLogin = () => {
    const args = {
      description: "تم تسجيل الدخول بنجاح",
      duration: 5,
      placement: "bottomLeft",
      bottom: 5
    };
    notification.open(args);
  };
  
  somethingWrongHappened = () => {
    const args = {
      description: "حدث خطأ أثناء تسجيل الدخول رجاء المحاولة مرة أخرى",
      duration: 5,
      placement: "bottomLeft",
      bottom: 5
    };
    notification.open(args);
  };
  Signin = async e => {
    let errors = this.formOTPRef.current.getFieldsError();
    if(errors.length&&errors[0].errors.length) return;
    let obj = {
      otp:this.state.otpCode,
      username:this.props.otpDataRequest.username,
      password:this.props.otpDataRequest.password,
      userType:this.props.otpDataRequest.userType
    };
    this.setState({ loading: true });
    axios
      .post(`${window.API_URL}` + `Authenticate/otp-login`, {...obj, refererIP:window.origin})
      .then(response => {
        if (response) {
          let data = response.data;
          this.formOTPRef.current.resetFields();
          this.setState({ loading: false,otpCode:"" });
          this.props.handleSubmitFromOTPForm(data);
        }
      })
      .catch(error => {
        this.setState({ loading: false });
        // console.log(error);
        // console.log(error.response);
        if (error) {
          if (error.response && error.response.status == 401) {
            notificationMessage("الكود ليس صحيحاً برجاء ادخل الكود المرسل  ",5)
            // this.formOTPRef.current.resetFields();
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
 
  render() {
    if (this.props.isAuth) return <Redirect path to="/" />;
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
                  ref={this.formOTPRef}
                >
                  <Container>
                    <Row>
                      <Col span={24} className="">
                        <Form.Item
                          rules={[
                            {
                              message: "من فضلك ادخل كود ال OTP",
                              required: true
                            },{
                              message: "من فضلك أدخل كود مكون من 4 أرقام فقط",
                              len:4,
                              pattern:new RegExp("^[0-9]{4}$")
                            },
                            // {
                            //     message:"من فضلك أدخل ارقاماً فقط",
                              //   type:'number'
                            // }
                          ]}
                          name="otpCode"
                          // hasFeedback
                          label="كود ال OTP"
                        >
                         <Input
                              name="otpCode"
                              onChange={this.handleUserInput}
                              value={this.state.otpCode}
                              placeholder="OTPكود الـ "
                            />
                        </Form.Item>
                      </Col>
                     
                    </Row>
                  
                  
                    {/* <Row className="formButtons formRoutes"> */}
                      <div style={{
                        display:"flex",
                        flexDirection:'row',
                        justifyContent:'space-around',
                      }}
                      className="mt-4"
                      >

                        <Button
                          htmlType="submit"
                          className=" signInBtn"
                          loading={this.state.loading}
                        >
                          تسجيل الدخول
                        </Button>
                        <Button
                          // htmlType="submit"
                          className=" signInBtn"
                          loading={this.state.loading}
                          onClick={()=>this.props.handleClearState()}
                        >
                          رجوع
                        </Button>
                        </div>
                    {/* </Row> */}
                  </Container>
                </Form>
              </Container>
            </div>
          </div>
        </div>
      );
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(OTPVerificationForm);

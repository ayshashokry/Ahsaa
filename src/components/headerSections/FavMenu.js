import React, { Component } from "react";
import { Form, Input, Button, notification } from "antd";
import Axios from "axios";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { uniq } from 'lodash'
import { notificationMessage } from "../../helpers/utlis/notifications_Func";
class FavMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      favName: "",
      loading: false,
      userDefinedBool:false   //used in case of update favName in each new select
    };
    this.formRef = React.createRef();
  }
  componentDidMount(){
    // debugger
    let commonUseCodes = this.props.selectedFeatures.map(f=>f.attributes.SITE_COMMON_USE);
    let isSame = uniq(commonUseCodes)
    if(isSame.length===1){
      let siteCommonUse = this.getDomainName("INVEST_SITE_POLYGON", "SITE_COMMON_USE",commonUseCodes[0])
      this.formRef.current.setFieldsValue({favName:siteCommonUse})
      this.setState({favName:siteCommonUse})
    }
  }
  componentDidUpdate(){
    //todo: logic of change favName if user selects sites with different common use at the same time when the fav form is open (done)
    let commonUseCodesCurrent = this.props.selectedFeatures.map(f=>f.attributes.SITE_COMMON_USE);
    let isSame = uniq(commonUseCodesCurrent)
    if(isSame.length!==1&&this.state.favName&&!this.state.userDefinedBool)
    {     
      this.formRef.current.setFieldsValue({favName:null})
      this.setState({favName:''})
    }
  }
  componentWillUnmount(){
    this.setState({
      favName:""
    });
    this.formRef.current.resetFields();
  }
  // comment
  confirmationSelectLand = () => {
    const args = {
      description: "برجاء اختيار قطعة ارض على الاقل",
      duration: 3,
    };
    notification.open(args);
  };
  confirmationAddFav = () => {
    const args = {
      description: "تم الإضافة للمفضلة بنجاح",
      duration: 3,
    };
    notification.open(args);
  };
  confirmationErrorInAddFav = () => {
    const args = {
      description: "حدث خطأ. برجاء المحاولة مرة أخرى",
      duration: 3,
    };
    notification.open(args);
  };
  addToFav = async (e) => {
    e.preventDefault();
    const { favName } = this.state;

    if (!favName) {
      this.formRef.current.validateFields();
      return;
    }

    const { addBookmark, isAuth, token, openLoader, closeLoader } = this.props;
    openLoader();
    if (!isAuth) {
      await addBookmark(
        {
          name: favName,
          // extent:currentExtent
          geoSpatialIDs: this.props.selectedFeatures.map(
            (f) => f.attributes.SITE_GEOSPATIAL_ID
          ),
          // features: selectedFeatures
          // window.__map__
          //   .getLayer("zoomGraphicLayer")
          //   .graphics.map((g) => ({
          //     geometry: g.geometry,
          //     attributes: g.attributes,
          // })),
        },
        isAuth
      );
      closeLoader();
      this.formRef.current.resetFields();
      this.confirmationAddFav();
      this.setState({ favName: "" });
      this.props.closeFav();
    } else {
      //use bookmark API to add
      openLoader();
      let bookMark = {
        title: favName,
        sites: this.props.selectedFeatures.map((f) => {
          return {
            site_spatial_id: f.attributes.SITE_GEOSPATIAL_ID.toString(),
          };
        }),
      };
      console.log(bookMark);
      try {
        let res = await Axios.post(`${window.API_URL}` + `bookmark`, bookMark, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        let data = res.data;
        console.log(data);
        if (data) {
          addBookmark(
            {
              name: data.title,
              geoSpatialIDs: data.sites.map((feat) => feat.site_spatial_id),
              id: data.id,
            },
            isAuth
          );
        }
        closeLoader();
        this.formRef.current.resetFields();
        this.confirmationAddFav();
        this.setState({ favName: "" });
        this.props.closeFav();
      } catch (err) {
        console.log(err);
        console.log(err ? err.response : "asd");
        if (err.response.status === 401) {
          this.setState({ favName: "" });
        if(this.formRef&&this.formRef.current) this.formRef.current.resetFields();
          this.props.closeFav();
          //push to login
          setTimeout(() => {
            notificationMessage("يجب إعادة تسجيل الدخول");
            closeLoader();
            this.props.history.replace("/Login");
            this.props.removeUserFromApp();
          }, 1000);
        } else {
          this.confirmationErrorInAddFav();
          closeLoader();
        }
      }
    }
  };

  handleFavName = (e) => {
    e.stopPropagation();
    e.preventDefault();
    this.setState({ favName: e.target.value,
      userDefinedBool:e.target.value?true:false });
  };
  getDomainName = (layername, fieldname, code) => {
    let fieldValue;
    layername = layername.toLocaleLowerCase();

    let domain = this.props.fields[layername].find(
      (field) => field.name == fieldname
    ).domain;
    //check if there is a domain or null
    if (domain) {
      domain = domain.codedValues;
      if (code) fieldValue = domain.find((domain) => domain.code === code)?
                              domain.find((domain) => domain.code === code).name:
                              code;
      else fieldValue = "بدون";
    } else fieldValue = code;

    return fieldValue;
  };
  render() {
    return (
      <Form
        onClick={(e) => e.stopPropagation()}
        ref={this.formRef}
        layout="vertical"
        name="validate_other"
        onFinish={() => this.addToFav()}
      >
        <Form.Item
          className="mt-3"
          rules={[
            {
              message: "من فضلك ادخل الاسم أولا",
              required: true,
            },
          ]}
          name="favName"
          hasFeedback
        >
          <Input
            name="favName"
            value={this.state.favName}
            onChange={this.handleFavName}
            placeholder="الإسم "
          />
        </Form.Item>
        <Button
          onClick={this.addToFav}
          className="SearchBtn mb-4"
          size="large"
          htmlType="submit"
          loading={this.state.loading}
        >
          أضف للمفضلة
        </Button>
      </Form>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addBookmark: (data, isAuth) =>
      dispatch({ type: "ADD_BOOKMARK", data, isAuth }),
    removeUserFromApp: () => dispatch({ type: "LOGOUT" }),
  };
};

const mapStateToProps = ({ mapUpdate }) => {
  const { selectedFeatures, auth, fields } = mapUpdate;
  return {
    selectedFeatures,
    isAuth: auth.isAuth,
    token: auth.user ? auth.user.token : "",
    fields
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(FavMenu)
);

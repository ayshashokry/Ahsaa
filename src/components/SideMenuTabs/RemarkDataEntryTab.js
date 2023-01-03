import axios from "axios";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import {
  Row,
  Col,
  Input,
  Form,
  Button,
  Select,
  notification,
  Upload,
  Modal as ModalAntD,
} from "antd";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";

import { Container, Modal } from "react-bootstrap";
import { withRouter } from "react-router";
import { checkTokenExpiration } from "../../redux/reducers/map";
import { useRef } from "react";
import { notificationMessage } from "../../helpers/utlis/notifications_Func";

function RemarkDataEntryTab({
  selectedFeatureOnSearchTable,
  user,
  openLoader,
  closeLoader,
  history,
  removeUserFromApp,
  tabName,
}) {
  const [remarkTypes, setRemarkTypes] = useState([]);
  const [formData, setFormData] = useState({
    remark_type_id: "",
    remark_details: "",
    fileList: [],
  });
  const formRef = useRef(null);
  const [previewImage, setPreviewImage] = useState("");
  const [previewVisible, setPreviewVisible] = useState(false);
  useEffect(() => {
    return () => {
      cancelHandler();
    };
  }, []);
  const cancelHandler = () => {
    // setRemarkTypes([]);
    setFormData({
      remark_type_id: "",
      remark_details: "",
      fileList: [],
    });
    setPreviewImage("");
    setPreviewImage(false);
    formRef.current&&formRef.current.resetFields();
  };
  //utils function
  function getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }
  //
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
  };
  const fetchRemarkTypes = async () => {
    let res = await axios.get(`${window.API_URL}` + "api/remarktype", {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });
    console.log(res);
    let typesOfRermarks = res.data;
    console.log(res);
    setRemarkTypes(typesOfRermarks.results);
  };
  const handleCancel = () => setPreviewVisible(false);

  useEffect(() => {
    fetchRemarkTypes();
  }, []);

  const confirmationSend = () => {
    const args = {
      description: "تم الإرسال بنجاح",
      duration: 3,
    };
    notification.open(args);
  };
  const handleChange = (name) => (value) => {
    if (name === "remark_type_id") setFormData({ ...formData, [name]: value });
    else setFormData({ ...formData, [name]: value.target.value });
  };
  const postData = () => {
    const {
      feature: { attributes },
      layername,
    } = selectedFeatureOnSearchTable;
    // let { client, captcha } = this.state;

    let url = `${window.API_URL}api/remark`;
    let selectedFeaturesClone = selectedFeatureOnSearchTable
      ? [
          {
            invest_spatial_id: attributes.SITE_GEOSPATIAL_ID,
            feature_class_name: layername,
          },
        ]
      : [];
    let errors = formRef.current
      .getFieldsError()
      .filter((item) => item.errors.length);
    if (!errors.length) {
      let postedData = {
        // client:null,
        // captcha:null,
        user_id: user ? user.id : null,
        use_name: user.username,
        use_email: user.email,
        use_phone: user.mobile,
        remark_type_id: formData.remark_type_id,
        remark_details: formData.remark_details,
        remark_investment: selectedFeaturesClone,
        remark_image: formData.fileList
          ? (formData.fileList || []).map((img) => {
              return {
                path: img.response[0].data,
              };
            })
          : null,
      };
      openLoader();
      checkTokenExpiration(user).then((res) => {
        if (!res) {
          setTimeout(() => {
            notificationMessage("يجب إعادة تسجيل الدخول");
            closeLoader();
            history.replace("/Login");
            removeUserFromApp();
          }, 1000);
        } else {
          axios
            .post(url, postedData, {
              headers: {
                Authorization: `Bearer ${user.token}`,
              },
            })
            .then((response) => {
              var { success } = response.data;
              closeLoader();
              if (!success) {
                showNotification(
                  `لقد تخطيت العدد المسموح به من الملاحظات`,
                  "warning"
                );
                cancelHandler();
                formRef.current.resetFields();
                //this.props.resetUserRemark();
              } else {
                showNotification("تم ارسال الملاحظة بنجاح", "success");
                cancelHandler();
                formRef.current.resetFields();
              }
            })
            .catch((err) => {
              cancelHandler();
              formRef.current.resetFields();
              if (err.response.status === 401) {
                setTimeout(() => {
                  showNotification("يجب إعادة تسجيل الدخول مرة أخرى");
                  closeLoader();
                  history.replace("/Login");
                  removeUserFromApp();
                }, 1000);
              } else {
                showNotification("حدث خطأ اثناء الارسال", "error");
                closeLoader();
              }
            });
        }
      });
    }
  };
  const handleUploadImage = ({ fileList }) => {
    setFormData({
      ...formData,
      fileList,
    });
  };
  const handleRemoveImage = (file) => {
    let fileListClone = [...formData.fileList];
    // fileListClone.splice()
    fileListClone.splice(fileListClone.indexOf(file), 1);
    setFormData({
      ...formData,
      fileListClone,
    });
  };
  const showNotification = (msg, type, duration = 3) => {
    const args = {
      description: msg,
      duration: duration,
    };
    notification.open(args);
  };
  return (
    <>
      <Container className="RemarkForm">
        <Form
          ref={formRef}
          layout="vertical"
          name="validate_other"
          onFinish={postData}
        >
          <Row>
            {" "}
            <Col span={24}>
              <Form.Item
                hasFeedback
                name="remark_type_id"
                rules={[
                  {
                    message: " من فضلك اختر نوع الملاحظة",
                    required: true,
                  },
                ]}
              >
                <Select
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                  className="dont-show"
                  onChange={handleChange("remark_type_id")}
                  value={formData.remark_type_id}
                  placeholder="نوع الملاحظة"
                  getPopupContainer={(trigger) => trigger.parentNode}
                >
                  {remarkTypes.length &&
                    remarkTypes.map((remark) => (
                      <Select.Option
                        key={remark.id}
                        className="text-right"
                        value={remark.id}
                      >
                        {remark.name}
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={24} className="msg">
              <Form.Item
                name="remark_details"
                rules={[
                  {
                    message: " من فضلك ادخل ملاحظاتك",
                    required: true,
                  },
                ]}
              >
                <Input.TextArea
                  showCount
                  onChange={handleChange("remark_details")}
                  maxLength={500}
                  rows={2}
                  name="remark_details"
                  placeholder="الملاحظات"
                  value={formData.remark_details}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item>
                <Upload
                  name="fileUpload"
                  onPreview={handlePreview}
                  showUploadList={true}
                  fileList={formData.fileList}
                  listType="picture-card"
                  maxCount={8}
                  onChange={handleUploadImage}
                  accept="image/*"
                  type="file"
                  action={window.API_URL + "uploadMultifiles"}
                  onRemove={handleRemoveImage}
                  className="uploadBtn-pic-card"
                >
                  {formData.fileList.length >= 8 ? null : (
                    //   <div>
                    //   <PlusOutlined />
                    //   <div style={{ marginTop: 8 }}>Upload</div>
                    // </div>
                    <div>
                      <Button block className="attachImgBtn">
                        {/* <div className="ant-upload-text"> */}
                        إرفاق صورة <CloudUploadIcon />
                        {/* </div> */}
                      </Button>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </Col>
          </Row>
          <div className="formButtons pt-4">
            <Button
              // onClick={sendMessage}
              className="addbtn"
              size="large"
              htmlType="submit"
            >
              إرسال
            </Button>
            <Button className="cancelbtn" size="large" onClick={cancelHandler}>
              إلغاء
            </Button>
          </div>
        </Form>
      </Container>
      <ModalAntD
        visible={previewVisible}
        footer={null}
        onCancel={handleCancel}
        zIndex={999999}
        closable
      >
        <img alt="example" style={{ width: "100%" }} src={previewImage} />
      </ModalAntD>
    </>
  );
}

const mapDispatchToProps = (dispatch) => {
  return {
    removeUserFromApp: () => dispatch({ type: "LOGOUT" }),
  };
};
const mapStateToProps = ({ mapUpdate }) => {
  return {
    user: mapUpdate.auth.user,
    isAuth: mapUpdate.auth.isAuth,
    selectedFeatureOnSearchTable:mapUpdate.selectedFeatureOnSearchTable
  };
};
export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(RemarkDataEntryTab)
);

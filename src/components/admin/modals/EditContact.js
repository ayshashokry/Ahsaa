import React, { useEffect, useState } from "react";
import { Modal, Container } from "react-bootstrap";
import { Form, Row, Col, Input, Select, Button, notification } from "antd";
import axios from "axios";
import { formValues } from "redux-form";

export default function EditContact(props) {
  const [formValues, setFormValues] = useState({
    phone: props.contactData.phone,
    site: props.contactData.site,
    mobile: props.contactData.mobile,
    email: props.contactData.mail,
    fax: props.contactData.fax,
  });
  useEffect(() => {
    setFormValues({
      ...formValues,
      phone: props.contactData.phone,
      site: props.contactData.site,
      mobile: props.contactData.mobile,
      email: props.contactData.mail,
      fax: props.contactData.fax,
    });
  }, [props.contactData]);
  const confirmationEdit = () => {
    const args = {
      description: "تم تعديل بيانات الاتصال بنجاح",
      duration: 5,
      placement: "bottomLeft",
      bottom: 5,
    };
    notification.open(args);
  };

  const editDep = (e) => {
    if (
      formValues.phone !== undefined &&
      formValues.mobile !== "" &&
      formValues.fax !== ""
    ) {
      props.setEditLoading(true);
      axios
        .put(
          window.API_URL + `Contacts/${props.contactData.id}`,
          {
            id: props.contactData.id,
            site:
              formValues.site == undefined || formValues.site == ""
                ? props.contactData.site
                : formValues.site,
            phone:
              formValues.phone == undefined || formValues.phone == ""
                ? props.contactData.phone
                : formValues.phone,
            mobile:
              formValues.mobile == undefined || formValues.mobile == ""
                ? props.contactData.mobile
                : formValues.mobile,
            mail:
              formValues.email == undefined || formValues.email == ""
                ? props.contactData.mail
                : formValues.email,
            fax:
              formValues.fax == undefined || formValues.fax == ""
                ? props.contactData.fax
                : formValues.fax,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${localStorage.userToken}`,
            },
          }
        )
        .then((res) =>
          axios
            .get(window.API_URL + "Contacts/GetAll", {
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${localStorage.userToken}`,
              },
            })
            .then((res1) => {
              props.getContactData(res1.data.results[0]);
              confirmationEdit();
              props.setEditLoading(false);
            })
        );
      props.closeeditmodal();
    }
  };

  const handleChangeData = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };
  return (
    <Modal
      keyboard={false}
      onHide={props.closeeditmodal}
      show={props.showEdit}
      backdrop="static"
      className="adminModal"
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Container fluid style={{ textAlign: "right", backgroundColor: "#fff" }}>
        <div>
          <h5 className="px-5 pt-4">
            <span>
              <i
                className="fas fa-times fa-1x"
                onClick={props.closeeditmodal}
                style={{
                  textAlign: "left",
                  float: "left",
                  cursor: "pointer",
                }}
              ></i>
            </span>
            تعديل بيانات الاتصال
          </h5>
        </div>
        <hr />
        <Form
          initialValues={{
            email: props.contactData.mail,
            fax: props.contactData.fax,
            phone: props.contactData.phone,
            mobile: props.contactData.mobile,
            site: props.contactData.site,
          }}
          className="my-4 px-md-5 regForms"
          layout="vertical"
          name="validate_other"
        >
          <Row>
            <Col span={24} className="px-2 phoneNum">
              <Form.Item
                name="mobile"
                hasFeedback
                label="رقم الجوال"
                rules={[
                  {
                    message: "من فضلك أدخل رقم الجوال",
                    required: true,
                    max: "9999",
                  },
                  {
                    max: 9,
                    message: "رقم الجوال لا يزيد عن 9 أرقام",
                  },
                  {
                    min: 9,
                    message: "رقم الجوال لا يقل عن 9 أرقام",
                  },
                  {
                    pattern: new RegExp(/^5/),
                    message: "يجب أن يبدأ رقم الجوال بالرقم 5",
                  },
                  {
                    pattern: new RegExp(/^[\d]{0,9}$/),
                    message: "من فضلك قم بادخال ارقام فقط",
                  },
                ]}
              >
                <Input
                  addonAfter="966"
                  // type="number"
                  onChange={handleChangeData}
                  name="mobile"
                  value={formValues.mobile}
                  placeholder="ادخل رقم الجوال"
                />
              </Form.Item>
            </Col>
            <Col span={24} className="px-2 phoneNum">
              <Form.Item
                name="phone"
                hasFeedback
                label="رقم الهاتف"
                rules={[
                  {
                    message: "من فضلك أدخل رقم الهاتف",
                    required: true,
                  },
                  {
                    max: 9,
                    message: "رقم الهاتف لا يزيد عن 9 أرقام",
                  },
                  {
                    min: 9,
                    message: "رقم الهاتف لا يقل عن 9 أرقام",
                  },
                  {
                    pattern: new RegExp(/^[\d]{0,9}$/),
                    message: "من فضلك قم بادخال ارقام فقط",
                  },
                ]}
              >
                <Input
                  addonAfter="966"
                  // type="number"
                  onChange={handleChangeData}
                  name="phone"
                  value={formValues.phone}
                  placeholder="ادخل رقم الهاتف"
                />
              </Form.Item>
            </Col>
            <Col span={24} className="px-2">
              <Form.Item
                name="fax"
                hasFeedback
                label="الفاكس"
                rules={[
                  {
                    pattern: new RegExp(/^[\d]{0,9}$/),
                    message: "من فضلك قم بادخال ارقام فقط",
                  },
                  {
                    required: true,
                    message: "من فضلط قم بادخال الفاكس",
                  },
                ]}
              >
                <Input
                  name="fax"
                  onChange={handleChangeData}
                  value={formValues.fax}
                  placeholder="الفاكس"
                />
              </Form.Item>
            </Col>
            <Col span={24} className="px-2">
              <Form.Item
                name="email"
                label="البريد الإلكتروني"
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: "من فضلك ادخل البريد الإلكتروني",
                  },
                  {
                    pattern: new RegExp(
                      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                    ),
                    message: "البريد الإلكتروني غير صحيح",
                  },
                ]}
              >
                <Input
                  type="email"
                  name="email"
                  onChange={handleChangeData}
                  value={formValues.email}
                  placeholder=" ادخل البريد الإلكتروني"
                />
              </Form.Item>
            </Col>
            <Col span={24} className="px-2">
              <Form.Item
                name="site"
                label="الموقع الإلكتروني"
                rules={[
                  {
                    pattern: new RegExp(
                      /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi
                    ),
                    message: "من فضلك أدخل موقع إلكتروني صحيح",
                  },
                ]}
              >
                <Input
                  name="site"
                  onChange={handleChangeData}
                  value={formValues.site}
                  placeholder="الموقع الإلكتروني"
                />
              </Form.Item>
            </Col>
          </Row>
          <Button className="addbtn" htmlType="submit" onClick={editDep}>
            نعم
          </Button>{" "}
          <Button className="cancelbtn" onClick={props.closeeditmodal}>
            لا
          </Button>
        </Form>
      </Container>
    </Modal>
  );
}

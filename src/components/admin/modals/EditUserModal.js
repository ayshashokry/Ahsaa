import React, { useEffect, useState } from "react";
import { Modal, Container } from "react-bootstrap";
import { Form, Row, Col, Input, Select, Button, notification } from "antd";
import axios from "axios";
export default function EditUserModal(props) {
  const [groups, setSelectedGroups] = useState(props.rowdata.groups);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    console.log(props);
    setSelectedGroups(props.rowdata.groups);
  }, []);
  const handleSelectGroup = (selectGroups, e) => {
    const selectedG = props.groups.filter((g) => {
      return e.find((x) => x.id === g.id);
    });
    setSelectedGroups(selectedG);
  };
  const confirmationEdit = () => {
    const args = {
      description: "تم تعديل المستخدم بنجاح",
      duration: 5,
      placement: "bottomLeft",
      bottom: 5,
    };
    notification.open(args);
  };

  const editDep = (e) => {
    props.setEditLoading(true);
    if (groups.length !== 0) {      //in case edit permissions group
      axios
        .put(
          window.API_URL + `user/${props.id}`,
          {
            ...props.rowdata,
            groups: groups,
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
            .get(window.API_URL + "get-all-users", {
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${localStorage.userToken}`,
              },
            })
            .then((res1) => {
              props.getTableData(res1.data.Value);
              props.setEditLoading(false);
              props.closeeditmodal();
            })
        );
    } else {        //in case remove all permissions group
      axios
        .put(
          window.API_URL + `user/${props.id}`,
          {
            ...props.rowdata,
            groups: null,
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
            .get(window.API_URL + "get-all-users", {
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${localStorage.userToken}`,
              },
            })
            .then((res1) => {
              props.getTableData(res1.data.Value);
              props.setEditLoading(false);
              confirmationEdit();
            })
            );
          }
          props.closeeditmodal();
        };
        const { Option } = Select;
        
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
            تعديل وظائف المستخدم
          </h5>
        </div>
        <hr />
        <Form
          initialValues={{
            name: props.rowdata.name,
            email: props.rowdata.email,
            phone: props.rowdata.phone,
            mobile: props.rowdata.mobile,
            groups: props.rowdata.groups,
          }}
          className="my-4 px-md-5 regForms"
          layout="vertical"
          name="validate_other"
        >
          <Row>
            <Col span={24} className="px-2">
              <Form.Item name="name" label="الإسم">
                <Input name="name" disabled />
              </Form.Item>
            </Col>{" "}
            <Col span={24} className="px-2">
              <Form.Item name="email" label="البريد الإلكتروني">
                <Input name="email" disabled />
              </Form.Item>
            </Col>
            {props.rowdata.phone !== null ? (
              <Col span={24} className="px-2">
                <Form.Item name="phone" label="رقم الهاتف">
                  <Input name="phone" disabled />
                </Form.Item>
              </Col>
            ) : null}{" "}
            {props.rowdata.mobile !== null ? (
              <Col span={24} className="px-2">
                <Form.Item name="mobile" label="رقم الجوال">
                  <Input name="mobile" disabled />
                </Form.Item>
              </Col>
            ) : null}
            <Col span={24} className="px-2">
              <Form.Item
                rules={[
                  {
                    message: "من فضلك ادخل الوظائف",
                    required: true,
                  },
                ]}
                hasFeedback
                label="الوظائف"
              >
                <Select
                  name="groups"
                  mode="multiple"
                  showSearch
                  className="userJobsSelect"
                  allowClear
                  onChange={handleSelectGroup}
                  defaultValue={
                    props.rowdata.groups !== undefined &&
                    props.rowdata.groups !== null
                      ? props.rowdata.groups.map((x) => x.name)
                      : []
                  }
                  placeholder="اختر الوظائف"
                  getPopupContainer={(trigger) => trigger.parentNode}
                >
                  {props.groups && props.groups.length !== 0
                    ? props.groups.map((group, index) => (
                        <Option
                          value={group.name}
                          key={index}
                          id={group.id}
                          name={group.name}
                        >
                          {group.name}
                        </Option>
                      ))
                    : null}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Button className="addbtn" onClick={editDep}>
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

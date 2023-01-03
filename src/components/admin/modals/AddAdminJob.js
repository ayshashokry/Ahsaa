import React, { useState, useRef } from "react";
import axios from "axios";
import { Modal, Container } from "react-bootstrap";
import { Form, Row, Col, Input, Checkbox, Button, notification } from "antd";
export default function AddAdminJob(props) {
  const [name, setName] = useState("");
  const formRef = useRef(null);

  const handleUserInput = (e) => {
    setName(e.target.value);
  };
  const confirmationAdd = () => {
    const args = {
      description: "تم إضافة الوظيفة بنجاح",
      duration: 5,
      placement: "bottomLeft",
      bottom: 5,
    };
    notification.open(args);
  };
  const addDep = (e) => {
    props.setEditLoading(true);

    if (name !== "") {
      axios
        .post(
          window.API_URL + "groups",
          { name: name },
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
            .get(window.API_URL + "groups/getall", {
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${localStorage.userToken}`,
              },
            })
            .then((res) => {
              props.getTableData(res.data.results);
              confirmationAdd();
              props.setEditLoading(false);
            })
        );
      setName("");
      props.closeAdd();
    }
  };

  return (
    <Modal
      keyboard={false}
      onHide={props.closeAdd}
      show={props.showAdd}
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
                onClick={props.closeAdd}
                style={{
                  textAlign: "left",
                  float: "left",
                  cursor: "pointer",
                }}
              ></i>
            </span>
            إضافة وظيفة جديدة
          </h5>
        </div>
        <hr />
        <Form
          className="my-4 px-md-5 regForms"
          layout="vertical"
          name="validate_other"
        >
          <Row>
            <Col span={24} className="px-2">
              <Form.Item
                name="name"
                hasFeedback
                label="الإسم"
                rules={[{ required: true, message: "من فضلك ادخل الإسم" }]}
              >
                <Input
                  name="name"
                  onChange={handleUserInput}
                  value={name}
                  placeholder="الإسم"
                />
              </Form.Item>
            </Col>
          </Row>
          <Button className="addbtn" onClick={addDep}>
            نعم
          </Button>{" "}
          <Button className="cancelbtn" onClick={props.closeAdd}>
            لا
          </Button>
        </Form>
      </Container>
    </Modal>
  );
}

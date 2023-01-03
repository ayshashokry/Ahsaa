import React, { useEffect, useState } from "react";
import { Modal, Container } from "react-bootstrap";
import { Form, Row, Col, Input, Select, Button, notification } from "antd";
import axios from "axios";
export default function EditJob(props) {
  const [formValues, setFormValues] = useState({
    name: props.rowdata.name,
  });

  const confirmationEdit = () => {
    const args = {
      description: "تم تعديل اسم الوظيفة بنجاح",
      duration: 5,
      placement: "bottomLeft",
      bottom: 5,
    };
    notification.open(args);
  };

  const editDep = (e) => {
    props.setEditLoading(true);
    axios
      .put(
        window.API_URL + `groups/${props.rowdata.id}`,
        {
          id: props.rowdata.id,
          name:
            formValues.name == undefined || formValues.name == ""
              ? props.rowdata.name
              : formValues.name,
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
          .get(window.API_URL + "groups/getall", {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${localStorage.userToken}`,
            },
          })
          .then((res) => {
            props.getTableData(res.data.results);
            confirmationEdit();
            props.setEditLoading(false);
          })
      );
    props.closeeditmodal();
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
            تعديل بيانات الوظيفة
          </h5>
        </div>
        <hr />
        <Form
          initialValues={{
            name: props.rowdata.name,
          }}
          className="my-4 px-md-5 regForms"
          layout="vertical"
          name="validate_other"
        >
          <Row>
            <Col span={24} className="px-2">
              <Form.Item
                name="name"
                hasFeedback
                label="اسم الوظيفة"
                rules={[
                  {
                    message: "من فضلك ادخل اسم الوظيفة",
                    required: true,
                  },
                ]}
              >
                <Input
                  name="name"
                  onChange={handleChangeData}
                  value={formValues.name}
                  placeholder="اسم الوظيفة"
                />
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

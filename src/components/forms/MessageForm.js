import React, { useState } from "react";
import { Form, Row, Col, Input, Button, notification } from "antd";
import { Container } from "react-bootstrap";

export default function MessageForm(props) {
  const [formData, setFormData] = useState({
    firstName: "",
    secondName: "",
    thirdName: "",
    phoneNumber: "",
    email: "",
    message: "",
  });

  const handleChange = ({ target: { name, value } }) => {
    setFormData({ ...formData, hasChanged: true, [name]: value });
  };
  const confirmationSend = () => {
    const args = {
      description: "تم الإرسال بنجاح",
      duration: 3,
    };
    notification.open(args);
  };
  const sendMessage = (e) => {
    confirmationSend();
    props.onHide();
  };

  return (
    <Container className="MessageForm">
      <Form layout="vertical" name="validate_other" onFinish={sendMessage}>
        <Row>
          {" "}
          <Col md={{ span: 7 }}>
            <Form.Item
              rules={[
                {
                  message: "من فضلك ادخل الاسم الأول",
                  required: true,
                },
              ]}
              name="firstName"
              hasFeedback
              // help="Should be combination of numbers & alphabets"
            >
              <Input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="الإسم الأول"
              />
            </Form.Item>
          </Col>{" "}
          <Col md={{ span: 8 }} className="mr-2 ml-2">
            <Form.Item
              rules={[
                {
                  message: "من فضلك ادخل الاسم الثاني",
                  required: true,
                },
              ]}
              name="secondName"
              hasFeedback
              // help="Should be combination of numbers & alphabets"
            >
              <Input
                name="secondName"
                value={formData.secondName}
                onChange={handleChange}
                placeholder="الإسم الثاني"
              />
            </Form.Item>
          </Col>{" "}
          <Col md={{ span: 8 }} className="mr-1">
            <Form.Item
              rules={[
                {
                  message: "من فضلك ادخل الاسم الثالث",
                  required: true,
                },
              ]}
              name="thirdName"
              hasFeedback
              // help="Should be combination of numbers & alphabets"
            >
              <Input
                name="thirdName"
                onChange={handleChange}
                value={formData.thirdName}
                placeholder="الإسم الثالث"
              />
            </Form.Item>
          </Col>{" "}
          <Row>
            <Col span={24}>
              <Form.Item
                rules={[
                  {
                    message: "من فضلك ادخل رقم الجوال",
                    required: true,
                  },
                ]}
                name="phoneNumber"
                hasFeedback
              >
                <Input
                  type="number"
                  name="phoneNumber"
                  onChange={handleChange}
                  value={formData.phoneNumber}
                  placeholder="رقم الجوال"
                />
              </Form.Item>
            </Col>{" "}
            <Col span={24}>
              <Form.Item
                rules={[
                  {
                    type: "email",
                    message: " من فضلك ادخل بريد إلكتروني صحيح",
                    required: true,
                  },
                ]}
                name="email"
                hasFeedback
              >
                <Input
                  name="email"
                  //   onChange={onChange}
                  //   value={email}
                  placeholder=" البريد الإلكتروني ex: saed@ahsaa.gov.sa"
                />
              </Form.Item>
            </Col>
            <Col span={24} className="msg">
              <Form.Item
                name="message"
                rules={[
                  {
                    message: " من فضلك ادخل الرسالة",
                    required: true,
                  },
                ]}
              >
                <Input.TextArea
                  showCount
                  maxLength={500}
                  name="message"
                  placeholder="الرسالة"
                  // value={message}
                />
              </Form.Item>
            </Col>
          </Row>
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
          <Button className="cancelbtn" size="large" onClick={props.onHide}>
            إلغاء
          </Button>
        </div>
      </Form>
    </Container>
  );
}

import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import { Row, Col, Form, Input } from "antd";
import { getFeatureDomainName, queryTask } from "../../common/mapviewer";
export default function LocationBordersNatureForm(props) {
  const [formData, onSetForm] = useState({
    northDescription: "",
    southDescription: "",
    eastDescription: "",
    westDescription: "",
  });
  useEffect(() => {
    const getBordersData = async () => {
      let layerIndex = 1; //INVEST_SITE_BOUNDARY
      await queryTask({
        returnGeometry: false,
        url: `${window.__mapUrl__}/${layerIndex}`,
        outFields: [
          "NORTH_BOUNDARY_LENGTH,NORTH_BOUNDARY_DESC,EAST_BOUNDARY_LENGTH,EAST_BOUNDARY_DESC,WEST_BOUNDARY_LENGTH,WEST_BOUNDARY_DESC,SOUTH_BOUNDARY_LENGTH,SOUTH_BOUNDARY_DESC",
        ],
        where: `SITE_GEOSPATIAL_ID=${props.landGeoID}`,
        callbackResult: ({ features }) => {
            console.log(features);
        },
        callbackError: (err) => {
          console.error(err);
        },
      });
    };
    getBordersData();
  }, []);
  const onChange = (e) => {
    const value = e.target.value;
    onSetForm({
      formData: { ...formData, [e.target.name]: e.target.value },
    });
  };
  return (
    <Container className="addManiTaskForm WizardForm">
      <Form
        layout="vertical"
        name="validate_other"
        //   onFinish={onFinish}
      >
        <Row>
          <Col span={12} className="px-3">
            <Form.Item
              //   rules={[
              //     {
              //       message: "من فضلك ادخل اسم المهمة",
              //       required: true,
              //     },
              //   ]}
              name="northDescription"
              hasFeedback
              label="وصف الشمال"
            >
              <Input.TextArea
                name="northDescription"
                onChange={onChange}
                value={formData.northDescription}
                placeholder="إدخل وصف الشمال "
              />
            </Form.Item>
          </Col>
          <Col span={12} className="px-3">
            <Form.Item
              //   rules={[
              //     {
              //       message: "من فضلك ادخل اسم المهمة",
              //       required: true,
              //     },
              //   ]}
              name="southDescription"
              hasFeedback
              label="وصف الجنوب"
            >
              <Input.TextArea
                name="southDescription"
                onChange={onChange}
                value={formData.southDescription}
                placeholder="إدخل وصف الجنوب "
              />
            </Form.Item>
          </Col>{" "}
          <Col span={12} className="px-3">
            <Form.Item
              //   rules={[
              //     {
              //       message: "من فضلك ادخل اسم المهمة",
              //       required: true,
              //     },
              //   ]}
              name="eastDescription"
              hasFeedback
              label="وصف الشرق"
            >
              <Input.TextArea
                name="eastDescription"
                onChange={onChange}
                value={formData.eastDescription}
                placeholder="إدخل وصف الشرق "
              />
            </Form.Item>
          </Col>{" "}
          <Col span={12} className="px-3">
            <Form.Item
              //   rules={[
              //     {
              //       message: "من فضلك ادخل اسم المهمة",
              //       required: true,
              //     },
              //   ]}
              name="westDescription"
              hasFeedback
              label="وصف الغرب"
            >
              <Input.TextArea
                name="westDescription"
                onChange={onChange}
                value={formData.westDescription}
                placeholder="إدخل وصف الغرب "
              />
            </Form.Item>
          </Col>{" "}
        </Row>

        {/* <Row className="formButtons pt-4">
          <Col span={12} style={{ textAlign: "right" }}>
            <Button
              className="addbtn"
              size="large"
              onClick={addNewCategory}
              htmlType="submit"
            >
              إضافة
            </Button>
          </Col>
          <Col span={12}>
            <Button className="cancelbtn" size="large" onClick={props.onHide}>
              إلغاء
            </Button>
          </Col>
        </Row> */}
      </Form>
    </Container>
  );
}

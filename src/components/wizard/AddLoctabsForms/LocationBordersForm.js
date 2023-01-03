import React, { useState, useEffect } from "react";
import { Container, Modal, Table } from "react-bootstrap";
import { Row, Col, Form, Button, Input, notification } from "antd";
import { queryTask, getFeatureDomainName } from "../../common/mapviewer";
import Loader from "../../loader";
import { connect } from "react-redux";
function LocationBordersForm(props) {
  const [loading, setLoading] = useState(false);
  const [formData, onSetForm] = useState(() => {
    let bordersData =
      //borders from site
      {
        NORTH_BOUNDARY_DESC: "",
        SOUTH_BOUNDARY_DESC: "",
        EAST_BOUNDARY_DESC: "",
        WEST_BOUNDARY_DESC: "",
        NORTH_BOUNDARY_LENGTH: "",
        SOUTH_BOUNDARY_LENGTH: "",
        EAST_BOUNDARY_LENGTH: "",
        WEST_BOUNDARY_LENGTH: "",
        //borders from plan
        EAST_BOUNDARY_DESCRIPTION: "",
        SOUTH_BOUNDARY_DESCRIPTION: "",
        NORTH_BOUNDARY_DESCRIPTION: "",
        WEST_BOUNDARY_DESCRIPTION: "",
      };
    if (props.data) {
      Object.keys(bordersData).forEach((item) => {
        bordersData[item] = props.data[item];
      });
    }
    return bordersData;
  });
  useEffect(() => {
  
    return () =>{
      console.log("will mount");
      return null
      }
  }, [])
  // useEffect(() => {
  //   //there are 2 related props -- > data contains describtion from plan and site and lengths from site,
  //   //  --- > LengthsOfBordersPlan
  //   const getBordersData = async () => {
  //     let bordersData = {};
  //     setLoading(true);
  //     let layerIndexOfBoundary = 3; //INVEST_SITE_BOUNDARY  //will take length of borders from plan
  //     let layersArray = [layerIndexOfBoundary];
  //     let promises = layersArray.map((layerIndex) => {
  //       return new Promise((resolve, reject) => {
  //         queryTask({
  //           returnGeometry: false,
  //           url: `${window.__mapUrl__}/${layerIndex}`,
  //           outFields: ["*"],
  //           where: `SITE_GEOSPATIAL_ID=${props.landGeoID}`,
  //           callbackResult: ({ features }) => {
  //             if (features.length) resolve({ data: features });
  //             else resolve({ data: [] });
  //           },
  //           callbackError: (err) => {
  //             reject(err);
  //           },
  //         });
  //       });
  //     });
  //     Promise.all(promises)
  //       .then((result) => {
  //         console.log("Data of borders (both)", result);
  //         //for borders from site
  //         if (result.length)
  //           result.forEach((item) => {
  //             let attributes = item.data[0].attributes;
  //             Object.keys(formData).forEach((itemForm) => {
  //               bordersData[itemForm] = attributes[itemForm];
  //             });
  //           });
  //         Object.keys(formData).forEach((item) => {
  //           bordersData[item] = props.data[item];
  //         });
  //         setLoading(false);
  //         onSetForm({ ...formData, ...bordersData });
  //       })
  //       .catch((err) => {
  //         setLoading(false);
  //         console.error(err);
  //       });
  //   };
  //   // getBordersData()
  //     let bordersData = {};
  //   if (props.data) {
  //     setLoading(true);
  //     Object.keys(formData).forEach((item) => {
  //       bordersData[item] = props.data[item];
  //     });
  //     setLoading(false);
  //     onSetForm({ ...formData, ...bordersData });
  //   }
  //   return null
  // }, []);

  const notificationNoData = () => {
    const args = {
      description: "تم التعديل بنجاح",
      duration: 3,
    };
    notification.open(args);
  };
  const onChange = (e) => {
    const value = e.target.value;
    if (
      ["NORTH_BOUNDARY_LENGTH" ,
      "SOUTH_BOUNDARY_LENGTH",
      "EAST_BOUNDARY_LENGTH",
      "WEST_BOUNDARY_LENGTH"].includes(e.target.name)
    )
      onSetForm({ ...formData, [e.target.name]: parseFloat(value) });
    else onSetForm({ ...formData, [e.target.name]: value });
  };
  const onSubmit = (e) => {
       const validateFieldValue=(value)=>{
      if(value) return true
      else return false
    }
    let validationCodition =true
      //borders from site
      // validateFieldValue(formData.NORTH_BOUNDARY_DESC) &&
      // validateFieldValue(formData.SOUTH_BOUNDARY_DESC) &&
      // validateFieldValue(formData.EAST_BOUNDARY_DESC) &&
      // validateFieldValue(formData.WEST_BOUNDARY_DESC) &&
      // validateFieldValue(formData.NORTH_BOUNDARY_LENGTH) &&
      // validateFieldValue(formData.SOUTH_BOUNDARY_LENGTH) &&
      // validateFieldValue(formData.EAST_BOUNDARY_LENGTH) &&
      // validateFieldValue(formData.WEST_BOUNDARY_LENGTH) &&
      // //borders from plan
      // validateFieldValue(formData.EAST_BOUNDARY_DESCRIPTION) &&
      // validateFieldValue(formData.SOUTH_BOUNDARY_DESCRIPTION) &&
      // validateFieldValue(formData.NORTH_BOUNDARY_DESCRIPTION) &&
      // validateFieldValue(formData.WEST_BOUNDARY_DESCRIPTION);

    if (validationCodition) {
      let dataOfBorders = {};
      Object.entries(formData).forEach(item=>{
        if(item[1]) dataOfBorders[item[0]]=item[1];
        });
      props.editAttributes(props.id, "investSiteDataAttributes", dataOfBorders);
      props.editAttributes(props.id, "bordersDescFromPlan", {
        EAST_BOUNDARY_DESCRIPTION:formData.EAST_BOUNDARY_DESCRIPTION,
        SOUTH_BOUNDARY_DESCRIPTION:formData.SOUTH_BOUNDARY_DESCRIPTION,
        NORTH_BOUNDARY_DESCRIPTION:formData.NORTH_BOUNDARY_DESCRIPTION,
        WEST_BOUNDARY_DESCRIPTION:formData.WEST_BOUNDARY_DESCRIPTION,
      });
      
        //mark main data as completed
        let tableSettingsClone = { ...props.tableSettings };
        let currentFeature = tableSettingsClone.result.find(
          (f) => f.id === props.id
        );
        currentFeature.isCompletedFilled.bordersData.bool = true;
        props.markMainDataAsCompleted(tableSettingsClone);
  /*****************/
      notificationNoData();
      onSetForm({
        //borders from site
        NORTH_BOUNDARY_DESC: "",
        SOUTH_BOUNDARY_DESC: "",
        EAST_BOUNDARY_DESC: "",
        WEST_BOUNDARY_DESC: "",
        NORTH_BOUNDARY_LENGTH: "",
        SOUTH_BOUNDARY_LENGTH: "",
        EAST_BOUNDARY_LENGTH: "",
        WEST_BOUNDARY_LENGTH: "",
        //borders from plan
        EAST_BOUNDARY_DESCRIPTION: "",
        SOUTH_BOUNDARY_DESCRIPTION: "",
        NORTH_BOUNDARY_DESCRIPTION: "",
        WEST_BOUNDARY_DESCRIPTION: "",
      });
      props.closeModal("showLocationBorders");
    }
  };
  return (
    <>
      {loading ? <Loader /> : null}
      <Form
        layout="vertical"
        name="validate_other"
        //   onFinish={onFinish}
        initialValues={{
          NORTH_BOUNDARY_DESC: formData.NORTH_BOUNDARY_DESC
            ? formData.NORTH_BOUNDARY_DESC
            : null,
          SOUTH_BOUNDARY_DESC: formData.SOUTH_BOUNDARY_DESC
            ? formData.SOUTH_BOUNDARY_DESC
            : null,
          EAST_BOUNDARY_DESC: formData.EAST_BOUNDARY_DESC
            ? formData.EAST_BOUNDARY_DESC
            : null,
          WEST_BOUNDARY_DESC: formData.WEST_BOUNDARY_DESC
            ? formData.WEST_BOUNDARY_DESC
            : null,
          NORTH_BOUNDARY_LENGTH: formData.NORTH_BOUNDARY_LENGTH
            ? formData.NORTH_BOUNDARY_LENGTH
            : null,
          SOUTH_BOUNDARY_LENGTH: formData.SOUTH_BOUNDARY_LENGTH
            ? formData.SOUTH_BOUNDARY_LENGTH
            : null,
          EAST_BOUNDARY_LENGTH: formData.EAST_BOUNDARY_LENGTH
            ? formData.EAST_BOUNDARY_LENGTH
            : null,
          WEST_BOUNDARY_LENGTH: formData.WEST_BOUNDARY_LENGTH
            ? formData.WEST_BOUNDARY_LENGTH
            : null,
          //borders from plan
          EAST_BOUNDARY_DESCRIPTION: formData.EAST_BOUNDARY_DESCRIPTION
            ? formData.EAST_BOUNDARY_DESCRIPTION
            : null,
          SOUTH_BOUNDARY_DESCRIPTION: formData.SOUTH_BOUNDARY_DESCRIPTION
            ? formData.SOUTH_BOUNDARY_DESCRIPTION
            : null,
          NORTH_BOUNDARY_DESCRIPTION: formData.NORTH_BOUNDARY_DESCRIPTION
            ? formData.NORTH_BOUNDARY_DESCRIPTION
            : null,
          WEST_BOUNDARY_DESCRIPTION: formData.WEST_BOUNDARY_DESCRIPTION
            ? formData.WEST_BOUNDARY_DESCRIPTION
            : null,
        }}
      >
        <Table className="locationTable" responsive>
          <thead>
            <tr className="resultsHeader">
              <th></th> <th>من المخطط </th> <th colspan="2">من الطبيعة </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>وصف الشمال</td>
              <td>
                <Form.Item
                  hasFeedback
                  label="وصف الحد من المخطط "
                  // rules={[
                  //   {
                  //     message: " أدخل وصف الحد الشمالي من المخطط",
                  //     required: true,
                  //   },
                  // ]}
                  name="NORTH_BOUNDARY_DESCRIPTION"
                >
                  <Input.TextArea
                    name="NORTH_BOUNDARY_DESCRIPTION"
                    onChange={onChange}
                    value={formData.NORTH_BOUNDARY_DESCRIPTION}
                    placeholder=" إدخل الوصف من المخطط  "
                  />
                </Form.Item>
              </td>
              <td>
                {" "}
                <Form.Item
                  hasFeedback
                  label="وصف الحد من الطبيعة "
                  // rules={[
                  //   {
                  //     message: " أدخل وصف الحد الشمالي من الطبيعة",
                  //     required: true,
                  //   },
                  // ]}
                  name="NORTH_BOUNDARY_DESC"
                >
                  <Input.TextArea
                    name="NORTH_BOUNDARY_DESC"
                    onChange={onChange}
                    value={formData.NORTH_BOUNDARY_DESC}
                    placeholder="إدخل الوصف من الطبيعة "
                  />
                </Form.Item>
              </td>
              <td>
                {" "}
                <Form.Item
                  hasFeedback
                  label="طول الحد من الطبيعة "
                  // rules={[
                  //   {
                  //     message: " أدخل طول الحد الشمالي من الطبيعة",
                  //     required: true,
                  //   },
                  // ]}
                  name="NORTH_BOUNDARY_LENGTH"
                >
                  <Input
                    name="NORTH_BOUNDARY_LENGTH"
                    type='number'
                    onChange={onChange}
                    value={formData.NORTH_BOUNDARY_LENGTH}
                    placeholder=" طول الحد الشمالي"
                  />
                </Form.Item>
              </td>
            </tr>
            <tr>
              <td>وصف الجنوب</td>
              <td>
                <Form.Item
                  hasFeedback
                  //  label="وصف الحد الجنوبي من الطبيعة "
                  // rules={[
                  //   {
                  //     message: " أدخل وصف الحد الجنوبي من الطبيعة",
                  //     required: true,
                  //   },
                  // ]}
                  name="SOUTH_BOUNDARY_DESCRIPTION"
                >
                  <Input.TextArea
                    name="SOUTH_BOUNDARY_DESCRIPTION"
                    onChange={onChange}
                    value={formData.SOUTH_BOUNDARY_DESCRIPTION}
                    placeholder=" إدخل الوصف من المخطط  "
                  />
                </Form.Item>
              </td>
              <td>
                {" "}
                <Form.Item
                  hasFeedback
                  //  label="وصف الحد الجنوبي من الطبيعة "
                  // rules={[
                  //   {
                  //     message: " أدخل وصف الحد الجنوبي من المخطط",
                  //     required: true,
                  //   },
                  // ]}
                  name="SOUTH_BOUNDARY_DESC"
                >
                  <Input.TextArea
                    name="SOUTH_BOUNDARY_DESC"
                    onChange={onChange}
                    value={formData.SOUTH_BOUNDARY_DESC}
                    placeholder="إدخل الوصف من الطبيعة "
                  />
                </Form.Item>
              </td>
              <td>
                {" "}
                <Form.Item
                  hasFeedback
                  //  label="طول الحد الجنوبي من الطبيعة "
                  // rules={[
                  //   {
                  //     message: " أدخل طول الحد الجنوبي من المخطط",
                  //     required: true,
                  //   },
                  // ]}
                  name="SOUTH_BOUNDARY_LENGTH"
                >
                  <Input
                    name="SOUTH_BOUNDARY_LENGTH"
                    onChange={onChange}
                    type='number'
                    value={formData.SOUTH_BOUNDARY_LENGTH}
                    placeholder=" طول الحد الجنوبي"
                  />
                </Form.Item>
              </td>
            </tr>{" "}
            <tr>
              <td>وصف الشرق</td>
              <td>
                <Form.Item
                  hasFeedback
                  //  label="وصف الحد الشرقي من الطبيعة "
                  // rules={[
                  //   {
                  //     message: " أدخل وصف الحد الشرقي من المخطط",
                  //     required: true,
                  //   },
                  // ]}
                  name="EAST_BOUNDARY_DESCRIPTION"
                >
                  <Input.TextArea
                    name="EAST_BOUNDARY_DESCRIPTION"
                    onChange={onChange}
                    value={formData.EAST_BOUNDARY_DESCRIPTION}
                    placeholder=" إدخل الوصف من المخطط  "
                  />
                </Form.Item>
              </td>
              <td>
                {" "}
                <Form.Item
                  hasFeedback
                  //  label="وصف الحد الشرقي من الطبيعة "
                  // rules={[
                  //   {
                  //     message: " أدخل وصف الحد الشرقي من الطبيعة",
                  //     required: true,
                  //   },
                  // ]}
                  name="EAST_BOUNDARY_DESC"
                >
                  <Input.TextArea
                    name="EAST_BOUNDARY_DESC"
                    onChange={onChange}
                    value={formData.EAST_BOUNDARY_DESC}
                    placeholder="إدخل الوصف من الطبيعة "
                  />
                </Form.Item>
              </td>
              <td>
                {" "}
                <Form.Item
                  hasFeedback
                  //  label="طول الحد الشرقي من الطبيعة "
                  // rules={[
                  //   {
                  //     message: " أدخل طول الحد الشرقي من الطبيعة",
                  //     required: true,
                  //   },
                  // ]}
                  name="EAST_BOUNDARY_LENGTH"
                >
                  <Input
                    name="EAST_BOUNDARY_LENGTH"
                    onChange={onChange}
                    type='number'
                    value={formData.EAST_BOUNDARY_LENGTH}
                    placeholder=" طول الحد الشرقي"
                  />
                </Form.Item>
              </td>
            </tr>{" "}
            <tr>
              <td>وصف الغرب</td>
              <td>
                <Form.Item
                  hasFeedback
                  //  label="وصف الحد الغربي من المخطط "
                  // rules={[
                  //   {
                  //     message: " أدخل وصف الحد الغربي من المخطط",
                  //     required: true,
                  //   },
                  // ]}
                  name="WEST_BOUNDARY_DESCRIPTION"
                >
                  <Input.TextArea
                    name="WEST_BOUNDARY_DESCRIPTION"
                    onChange={onChange}
                    value={formData.WEST_BOUNDARY_DESCRIPTION}
                    placeholder=" إدخل الوصف من المخطط  "
                  />
                </Form.Item>
              </td>
              <td>
                {" "}
                <Form.Item
                  hasFeedback
                  //  label="وصف الحد الغربي من الطبيعة "
                  // rules={[
                  //   {
                  //     message: " أدخل وصف الحد الغربي من الطبيعة",
                  //     required: true,
                  //   },
                  // ]}
                  name="WEST_BOUNDARY_DESC"
                >
                  <Input.TextArea
                    name="WEST_BOUNDARY_DESC"
                    onChange={onChange}
                    value={formData.WEST_BOUNDARY_DESC}
                    placeholder="إدخل الوصف من الطبيعة "
                  />
                </Form.Item>
              </td>
              <td>
                {" "}
                <Form.Item
                  hasFeedback
                  //  label="طول الحد الغربي من الطبيعة "
                  // rules={[
                  //   {
                  //     message: " أدخل طول الحد الغربي من الطبيعة",
                  //     required: true,
                  //   },
                  // ]}
                  name="WEST_BOUNDARY_LENGTH"
                >
                  <Input
                    name="WEST_BOUNDARY_LENGTH"
                    type='number'
                    onChange={onChange}
                    value={formData.WEST_BOUNDARY_LENGTH}
                    placeholder=" طول الحد الغربي"
                  />
                </Form.Item>
              </td>
            </tr>
          </tbody>
        </Table>
        <Button
          id={props.id}
          onClick={onSubmit}
          className="addbtn mb-3"
          size="large"
          htmlType="submit"
        >
          حفظ
        </Button>
        <Button
          className="addbtn"
          onClick={() => props.closeModal("showLocationBorders")}
          size="large"
        >
          إلغاء
        </Button>
      </Form>
    </>
  );
}
const mapDispatchToProps = (dispatch) => {
  return {
    editAttributes: (id, nameOfProperty, data) =>
      dispatch({
        type: "EDIT_ATTRIBUTES_FOR_FEATURE_IN_COUNTED_TABLE_DATA_SET",
        id,
        nameOfProperty,
        data,
      }),
      markMainDataAsCompleted: (data) =>
      dispatch({
        type: "EDIT_ITEM_FROM_RESULT_COUNTED_TABLE_DATA_SET",
        data,
      }),
  };
};
const mapStateToProps = ({ mapUpdate }) => {
const {tableSettings} = mapUpdate;
return {
  tableSettings
}
}
export default connect(mapStateToProps, mapDispatchToProps)(LocationBordersForm);

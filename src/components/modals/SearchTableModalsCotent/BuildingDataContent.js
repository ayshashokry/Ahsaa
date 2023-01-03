import { Component } from "react";
import { Table, Button, Modal } from "react-bootstrap";

class BuildingDataContent extends Component {
  render() {
    const { selectedFeatureOnSearchTable, closeModal } = this.props;
    const {
      feature: { attributes },
    } = selectedFeatureOnSearchTable;
    return (
      <Modal
        backdrop="static"
        className="addTaskModal"
        show={selectedFeatureOnSearchTable != null}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header>
          <Modal.Title id="contained-modal-title-vcenter">
            بيانات المبني
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table responsive className="locationTable">
            <thead>
              <tr>
                <th>الرمز البريدى</th>
                <th>عدد الوحدات</th>
                <th>عدد الادوار</th>
                <th>حالة المبنى</th>
                <th>مادة البناء</th>
                <th>مساحة المبنى</th>
                <th>كود المبنى</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  {!attributes["BLD_POST_CODE"] ||
                  attributes["BLD_POST_CODE"].toString().toLowerCase() ===
                    "null" ||
                  attributes["BLD_POST_CODE"].toString().trim() == ""
                    ? "بدون"
                    : attributes["BLD_POST_CODE"]}
                </td>
                <td>
                  {!attributes["BLD_NO_UNITS"] ||
                  attributes["BLD_NO_UNITS"].toString().toLowerCase() ===
                    "null" ||
                  attributes["BLD_NO_UNITS"].toString().trim() == ""
                    ? "بدون"
                    : attributes["BLD_NO_UNITS"]}
                </td>
                <td>
                  {!attributes["BLD_NO_FLOORS"] ||
                  attributes["BLD_NO_FLOORS"].toString().toLowerCase() ===
                    "null" ||
                  attributes["BLD_NO_FLOORS"].toString().trim() == ""
                    ? "بدون"
                    : attributes["BLD_NO_FLOORS"]}
                </td>
                <td>
                  {!attributes["BLD_STATUS"] ||
                  attributes["BLD_STATUS"].toString().toLowerCase() ===
                    "null" ||
                  attributes["BLD_STATUS"].toString().trim() == ""
                    ? "بدون"
                    : attributes["BLD_STATUS"]}
                </td>
                <td>
                  {!attributes["BLD_MATRIAL"] ||
                  attributes["BLD_MATRIAL"].toString().toLowerCase() ===
                    "null" ||
                  attributes["BLD_MATRIAL"].toString().trim() == ""
                    ? "بدون"
                    : attributes["BLD_MATRIAL"]}
                </td>
                <td>
                  {!attributes["BLD_AREA"] ||
                  attributes["BLD_AREA"].toString().toLowerCase() === "null" ||
                  attributes["BLD_AREA"].toString().trim() == ""
                    ? "بدون"
                    : parseFloat(attributes["BLD_AREA"]).toFixed(2)}
                </td>
                <td>
                  {!attributes["BLD_CODE"] ||
                  attributes["BLD_CODE"].toString().toLowerCase() === "null" ||
                  attributes["BLD_CODE"].toString().trim() == ""
                    ? "بدون"
                    : attributes["BLD_CODE"]}
                </td>
              </tr>
            </tbody>
          </Table>
          <Button
            onClick={() => closeModal()}
            className="addbtn mb-3"
            size="large"
            htmlType="submit"
          >
            موافق
          </Button>
        </Modal.Body>
      </Modal>
    );
  }
}

export default BuildingDataContent;

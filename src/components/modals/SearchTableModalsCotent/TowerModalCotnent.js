import { Component } from "react";
import { Table, Button, Modal } from "react-bootstrap";

class TowersModalContent extends Component {
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
            بيانات أبراج الجوال
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table responsive className="locationTable">
            <thead>
              <tr>
                <th>مزود الخدمة</th>
                <th>الارتفاع</th>
                <th>نوع البرج</th>
                <th>كود البرج</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  {!attributes["TOWER_SERVICE_PROVIDER"] ||
                  attributes["TOWER_SERVICE_PROVIDER"]
                    .toString()
                    .toLowerCase() === "null" ||
                  attributes["TOWER_SERVICE_PROVIDER"].toString().trim() == ""
                    ? "بدون"
                    : attributes["TOWER_SERVICE_PROVIDER"]}{" "}
                </td>
                <td>
                  {!attributes["TOWER_HEIGHT"] ||
                  attributes["TOWER_HEIGHT"].toString().toLowerCase() ===
                    "null" ||
                  attributes["TOWER_HEIGHT"].toString().trim() == ""
                    ? "بدون"
                    : attributes["TOWER_HEIGHT"]}
                </td>
                <td>
                  {!attributes["TOWER_TYPE"] ||
                  attributes["TOWER_TYPE"].toString().toLowerCase() ===
                    "null" ||
                  attributes["TOWER_TYPE"].toString().trim() == ""
                    ? "بدون"
                    : attributes["TOWER_TYPE"]}
                </td>
                <td>
                  {!attributes["TOWER_LOCATION_CODE"] ||
                  attributes["TOWER_LOCATION_CODE"].toString().toLowerCase() ===
                    "null" ||
                  attributes["TOWER_LOCATION_CODE"].toString().trim() == ""
                    ? "بدون"
                    : attributes["TOWER_LOCATION_CODE"]}
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

export default TowersModalContent;

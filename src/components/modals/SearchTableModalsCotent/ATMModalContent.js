import { Component } from "react";
import { Table, Button, Modal } from "react-bootstrap";

class AtmModalContent extends Component {
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
            بيانات الصراف الآلي
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table responsive className="locationTable">
            <thead>
              <tr>
                <th>النوع</th>
                <th>الاسم</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  {!attributes["TYPE"] ||
                  attributes["TYPE"].toString().toLowerCase() === "null" ||
                  attributes["TYPE"].toString().trim() == ""
                    ? "بدون"
                    : attributes["TYPE"]}
                </td>
                <td>
                  {!attributes["NAME"] ||
                  attributes["NAME"].toString().toLowerCase() === "null" ||
                  attributes["NAME"].toString().trim() == ""
                    ? "بدون"
                    : attributes["NAME"]}
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

export default AtmModalContent;

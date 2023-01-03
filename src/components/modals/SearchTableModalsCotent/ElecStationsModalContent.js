import { Component } from "react";
import { Table, Button, Modal } from "react-bootstrap";

class ElecStationsModalContent extends Component {
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
            بيانات محطات الكهرباء
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table responsive className="locationTable">
            <thead>
              <tr>
                <th>نوع محطة الكهرباء</th>
                <th>اسم المحطة</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  {!attributes["ELEC_TYPE"] ||
                  attributes["ELEC_TYPE"].toString().toLowerCase() === "null" ||
                  attributes["ELEC_TYPE"].toString().trim() == ""
                    ? "بدون"
                    : attributes["ELEC_TYPE"]}{" "}
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

export default ElecStationsModalContent;

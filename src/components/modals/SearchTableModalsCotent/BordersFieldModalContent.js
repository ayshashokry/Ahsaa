import { Component } from "react";
import { Table, Button, Modal } from "react-bootstrap";

class BordersNatModalContent extends Component {
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
            حدود الموقع من الطبيعة
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table responsive className="locationTable">
            <thead>
              <tr>
                <th>وصف الحد</th>
                <th>طول الحد - م</th>
                <th>اتجاه الحد</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  {!attributes["NORTH_BOUNDARY_DESC"] ||
                  attributes["NORTH_BOUNDARY_DESC"].toString().toLowerCase() ===
                    "null" ||
                  attributes["NORTH_BOUNDARY_DESC"].toString().trim() == ""
                    ? "بدون"
                    : attributes["NORTH_BOUNDARY_DESC"]}
                </td>
                <td>
                  {!attributes["NORTH_BOUNDARY_LENGTH"] ||
                  attributes["NORTH_BOUNDARY_LENGTH"]
                    .toString()
                    .toLowerCase() === "null" ||
                  attributes["NORTH_BOUNDARY_LENGTH"].toString().trim() == ""
                    ? "بدون"
                    : parseFloat(attributes["NORTH_BOUNDARY_LENGTH"]).toFixed(
                        2
                      )}
                </td>
                <td>الشمالى</td>
              </tr>
              <tr>
                <td>
                  {!attributes["SOUTH_BOUNDARY_DESC"] ||
                  attributes["SOUTH_BOUNDARY_DESC"].toString().toLowerCase() ===
                    "null" ||
                  attributes["SOUTH_BOUNDARY_DESC"].toString().trim() == ""
                    ? "بدون"
                    : attributes["SOUTH_BOUNDARY_DESC"]}
                </td>
                <td>
                  {!attributes["SOUTH_BOUNDARY_LENGTH"] ||
                  attributes["SOUTH_BOUNDARY_LENGTH"]
                    .toString()
                    .toLowerCase() === "null" ||
                  attributes["SOUTH_BOUNDARY_LENGTH"].toString().trim() == ""
                    ? "بدون"
                    : parseFloat(attributes["SOUTH_BOUNDARY_LENGTH"]).toFixed(
                        2
                      )}
                </td>
                <td>الجنوبي</td>
              </tr>
              <tr>
                <td>
                  {!attributes["EAST_BOUNDARY_DESC"] ||
                  attributes["EAST_BOUNDARY_DESC"].toString().toLowerCase() ===
                    "null" ||
                  attributes["EAST_BOUNDARY_DESC"].toString().trim() == ""
                    ? "بدون"
                    : attributes["EAST_BOUNDARY_DESC"]}
                </td>
                <td>
                  {!attributes["EAST_BOUNDARY_LENGTH"] ||
                  attributes["EAST_BOUNDARY_LENGTH"]
                    .toString()
                    .toLowerCase() === "null" ||
                  attributes["EAST_BOUNDARY_LENGTH"].toString().trim() == ""
                    ? "بدون"
                    : parseFloat(attributes["EAST_BOUNDARY_LENGTH"]).toFixed(2)}
                </td>
                <td>الشرقي</td>
              </tr>{" "}
              <tr>
                <td>
                  {!attributes["WEST_BOUNDARY_DESC"] ||
                  attributes["WEST_BOUNDARY_DESC"].toString().toLowerCase() ===
                    "null" ||
                  attributes["WEST_BOUNDARY_DESC"].toString().trim() == ""
                    ? "بدون"
                    : attributes["WEST_BOUNDARY_DESC"]}
                </td>
                <td>
                  {!attributes["WEST_BOUNDARY_LENGTH"] ||
                  attributes["WEST_BOUNDARY_LENGTH"]
                    .toString()
                    .toLowerCase() === "null" ||
                  attributes["WEST_BOUNDARY_LENGTH"].toString().trim() == ""
                    ? "بدون"
                    : parseFloat(attributes["WEST_BOUNDARY_LENGTH"]).toFixed(2)}
                </td>
                <td>الغربي</td>
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

export default BordersNatModalContent;

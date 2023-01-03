import { Component } from "react";
import { Table, Button, Modal } from "react-bootstrap";

class BordersPlanModalContent extends Component {
  render() {
    const { selectedFeatureOnSearchTable, closeModal } = this.props;
    const { features, borderDescirbtion } = selectedFeatureOnSearchTable;
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
            حدود الموقع من المخطط
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
              {
              !features.length?(
                ["الشمالي","الجنوبي","الشرقي","الغربي"].map(row=>(

                  <tr>
                  <td>بدون</td>
                  <td>بدون</td>
                  <td>{row}</td>
                </tr>
                  )) 
              ):
              features.map((feat) => (
                <tr>
                  <td>
                    {feat.attributes["BOUNDARY_DIRECTION_Code"]===1?
                    !borderDescirbtion["NORTH_BOUNDARY_DESCRIPTION"] ||
                    borderDescirbtion["NORTH_BOUNDARY_DESCRIPTION"]
                      .toString()
                      .toLowerCase() === "null" ||
                    borderDescirbtion["NORTH_BOUNDARY_DESCRIPTION"].toString().trim() ==
                      ""
                      ? "بدون"
                      : borderDescirbtion["NORTH_BOUNDARY_DESCRIPTION"]
                      :
                      feat.attributes["BOUNDARY_DIRECTION_Code"]===3?
                      !borderDescirbtion["SOUTH_BOUNDARY_DESCRIPTION"] ||
                      borderDescirbtion["SOUTH_BOUNDARY_DESCRIPTION"]
                        .toString()
                        .toLowerCase() === "null" ||
                      borderDescirbtion["SOUTH_BOUNDARY_DESCRIPTION"].toString().trim() ==
                        ""
                        ? "بدون"
                        : borderDescirbtion["SOUTH_BOUNDARY_DESCRIPTION"]
                        :
                        feat.attributes["BOUNDARY_DIRECTION_Code"]===2?
                      !borderDescirbtion["EAST_BOUNDARY_DESCRIPTION"] ||
                      borderDescirbtion["EAST_BOUNDARY_DESCRIPTION"]
                        .toString()
                        .toLowerCase() === "null" ||
                      borderDescirbtion["EAST_BOUNDARY_DESCRIPTION"].toString().trim() ==
                        ""
                        ? "بدون"
                        : borderDescirbtion["EAST_BOUNDARY_DESCRIPTION"]
                        :!borderDescirbtion["WEST_BOUNDARY_DESCRIPTION"] ||
                        borderDescirbtion["WEST_BOUNDARY_DESCRIPTION"]
                          .toString()
                          .toLowerCase() === "null" ||
                        borderDescirbtion["WEST_BOUNDARY_DESCRIPTION"].toString().trim() ==
                          ""
                          ? "بدون"
                          : borderDescirbtion["WEST_BOUNDARY_DESCRIPTION"]
                    }
                  </td>
                  <td>
                    {!feat.attributes["BOUNDARY_LENGTH"] ||
                    feat.attributes["BOUNDARY_LENGTH"]
                      .toString()
                      .toLowerCase() === "null" ||
                    feat.attributes["BOUNDARY_LENGTH"].toString().trim() == ""
                      ? "بدون"
                      : parseFloat(feat.attributes["BOUNDARY_LENGTH"]).toFixed(
                          2
                        )}
                  </td>
                  <td>
                    { feat.attributes["BOUNDARY_DIRECTION_Code"] == 1
                      ? "الشمالي"
                      : feat.attributes["BOUNDARY_DIRECTION_Code"] == 3
                      ? "الجنوبي"
                      : feat.attributes["BOUNDARY_DIRECTION_Code"] == 2
                      ? "الشرقي"
                      :  feat.attributes["BOUNDARY_DIRECTION_Code"] == 4?"الغربي":
                      "بدون"
                      }
                  </td>
                </tr>
              ))}
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

export default BordersPlanModalContent;

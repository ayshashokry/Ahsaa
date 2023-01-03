import { Component } from "react";
import { Table, Button, Modal } from "react-bootstrap";
import _ from 'lodash';
class CoordinateContent extends Component {
  render() {
    const { selectedFeatureOnSearchTable, closeModal } = this.props;
    const {
      features
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
            إحداثيات المبني
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table responsive className="locationTable">
            <thead>
              <tr>
                <th>إحداثي دائرة العرض </th>
                <th>إحداثي خط الطول </th>
                <th>رقم الركن </th>
              </tr>
            </thead>
            <tbody>
              {features.length?(
                features.map(feat=>(
              <tr>
          
              <td>
                  {!feat.attributes["YGCS_COORD"] ||
                  feat.attributes["YGCS_COORD"].toString().toLowerCase() === "null" ||
                  feat.attributes["YGCS_COORD"].toString().trim() == ""
                    ? "بدون"
                    :isNaN(Number(feat.attributes["YGCS_COORD"]))?feat.attributes["YGCS_COORD"]
                    : parseFloat(feat.attributes["YGCS_COORD"]).toFixed(4)}
                </td>
             
                <td>
                  {!feat.attributes["XGCS_COORD"] ||
                  feat.attributes["XGCS_COORD"].toString().toLowerCase() === "null" ||
                  feat.attributes["XGCS_COORD"].toString().trim() == ""
                    ? "بدون"
                    :isNaN(Number(feat.attributes["XGCS_COORD"]))?feat.attributes["XGCS_COORD"]
                    : parseFloat(feat.attributes["XGCS_COORD"]).toFixed(4)}
                </td>
                <td>
                  {!feat.attributes["CORNER_NO"] ||
                  feat.attributes["CORNER_NO"].toString().toLowerCase() === "null" ||
                  feat.attributes["CORNER_NO"].toString().trim() == ""
                    ? "بدون"
                    : (feat.attributes["CORNER_NO"])}
                </td>
              </tr>
                ))
              ):(
                <>
                <tr>
                    <td>بدون</td>
                    <td>بدون</td>
                    <td>بدون</td>
                </tr>
                  </>
              )}

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

export default CoordinateContent;

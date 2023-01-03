import { Component } from "react";
import { Table, Button, Modal } from "react-bootstrap";
import _ from 'lodash'
import moment from "moment-hijri";
class ADGroupModalContent extends Component {
  render() {
    const { selectedFeatureOnSearchTable, closeModal } = this.props;
    let attributes;
    if(selectedFeatureOnSearchTable.feature.length)
    attributes= selectedFeatureOnSearchTable.feature[0].attributes;
    // console.log(moment(new Date()),moment);
    return (
      <Modal
        backdrop="static"
        className="addTaskModal"
        show={selectedFeatureOnSearchTable != null}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        dialogClassName="ADBoards-Group-modal-90w"
        centered
      >
        <Modal.Header>
          <Modal.Title id="contained-modal-title-vcenter">
            بيانات المجموعة الإعلانية
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table responsive className="locationTable">
            <thead>
              <tr>
                <th>مساحة اللوحة داخل المجموعة</th>
                <th>عرض اللوحة داخل المجموعة</th>
                <th>طول اللوحة داخل المجموعة</th>
                <th>وصف المجموعة الإعلانية</th>
                <th>تاريخ اعداد المجموعة الدعائية</th>
                <th>حالة الاضاءة</th>
                <th>عدد الاوجه</th>
                <th>عدد اللوحات</th>
                <th>عدد المواقع</th>
                <th>نوع اللوحة</th>
                <th>كود المجموعة </th>
              </tr>
            </thead>
            <tbody>
              {selectedFeatureOnSearchTable.feature.length?(
              <tr>

                <td>
                  {!attributes["GROUP_BOARD_AREA"] ||
                  attributes["GROUP_BOARD_AREA"].toString().toLowerCase() ===
                    "null" ||
                  attributes["GROUP_BOARD_AREA"].toString().trim() == ""
                    ? "بدون"
                    : attributes["GROUP_BOARD_AREA"]}
                </td>
                <td>
                  {!attributes["GROUP_BOARD_WIDTH"] ||
                  attributes["GROUP_BOARD_WIDTH"].toString().toLowerCase() ===
                    "null" ||
                  attributes["GROUP_BOARD_WIDTH"].toString().trim() == ""
                    ? "بدون"
                    : attributes["GROUP_BOARD_WIDTH"]}
                </td>
                <td>
                  {!attributes["GROUP_BOARD_LENGTH"] ||
                  attributes["GROUP_BOARD_LENGTH"].toString().toLowerCase() ===
                    "null" ||
                  attributes["GROUP_BOARD_LENGTH"].toString().trim() == ""
                    ? "بدون"
                    : attributes["GROUP_BOARD_LENGTH"]}
                </td>
                <td>
                  {!attributes["GROUP_DESCRIPTION"] ||
                  attributes["GROUP_DESCRIPTION"].toString().toLowerCase() ===
                    "null" ||
                  attributes["GROUP_DESCRIPTION"].toString().trim() == ""
                    ? "بدون"
                    : attributes["GROUP_DESCRIPTION"]}
                </td>
                <td>
                  {!attributes["GROUP_BOARD_PERPDATE"] ||
                  attributes["GROUP_BOARD_PERPDATE"]
                    .toString()
                    .toLowerCase() === "null" ||
                  attributes["GROUP_BOARD_PERPDATE"].toString().trim() == ""
                    ? "بدون"
                    : moment(attributes["GROUP_BOARD_PERPDATE"]).format('iYYYY/iM/iD')}
                </td>
                <td>
                  {!attributes["LIGHT_STATUS"] ||
                  attributes["LIGHT_STATUS"].toString().toLowerCase() ===
                    "null" ||
                  attributes["LIGHT_STATUS"].toString().trim() == ""
                    ? "بدون"
                    : attributes["LIGHT_STATUS"]}
                </td>
                <td>
                  {!attributes["FRONTBOARD_NO"] ||
                  attributes["FRONTBOARD_NO"].toString().toLowerCase() ===
                    "null" ||
                  attributes["FRONTBOARD_NO"].toString().trim() == ""
                    ? "بدون"
                    : attributes["FRONTBOARD_NO"]}
                </td>
                <td>
                  {!attributes["BOARD_NO"] ||
                  attributes["BOARD_NO"].toString().toLowerCase() === "null" ||
                  attributes["BOARD_NO"].toString().trim() == ""
                    ? "بدون"
                    : attributes["BOARD_NO"]}
                </td>
                <td>
                  {!attributes["SITE_NO"] ||
                  attributes["SITE_NO"].toString().toLowerCase() === "null" ||
                  attributes["SITE_NO"].toString().trim() == ""
                    ? "بدون"
                    : attributes["SITE_NO"]}
                </td>
                <td>
                  {!attributes["BOARD_TYPE"] ||
                  attributes["BOARD_TYPE"].toString().toLowerCase() ===
                    "null" ||
                  attributes["BOARD_TYPE"].toString().trim() == ""
                    ? "بدون"
                    : attributes["BOARD_TYPE"]}
                </td>
                <td>
                  {!attributes["GROUP_CODE"] ||
                  attributes["GROUP_CODE"].toString().toLowerCase() ===
                    "null" ||
                  attributes["GROUP_CODE"].toString().trim() == ""
                    ? "بدون"
                    : attributes["GROUP_CODE"]}
                </td>

                
              </tr>
              ):(
              <tr>
                {_.range(1,12).map(row=>(
                  <td key={row}>بدون</td>
                ))}
              </tr>
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

export default ADGroupModalContent;

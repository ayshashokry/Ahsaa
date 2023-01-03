import { Component } from "react";
import { Table, Button, Modal } from "react-bootstrap";
import { connect } from "react-redux";

class BuildingDetailsContent extends Component {
  renderDomainName = (fieldname, code) => {
    const { fields } = this.props;
    if (!fields) return null;

    var layername = "TBL_BUILD_DETAILS".toLocaleLowerCase();
    var domain = fields[layername].find((field) => field.name == fieldname)
      .domain.codedValues;
    let domainName = domain.find((cv) => cv.code === code);
    console.log(domainName);
    if (domainName) return domainName.name;
  };

  render() {
    const { selectedFeatureOnSearchTable, closeModal } = this.props;
    const {
      feature,
    } = selectedFeatureOnSearchTable;

    return (
      <Modal
        backdrop="static"
        className="addTaskModal buildingDetailsModal"
        show={selectedFeatureOnSearchTable != null}
        size="xl"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header>
          <Modal.Title id="contained-modal-title-vcenter">
            تفاصيل الموقع من الطبيعة
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table responsive className="locationTable">
            <thead>
              <tr>
                <th> خدمة الطريق مسفلت</th>
                <th> خدمة هاتف التليفون</th>
                <th> شبكة صرف المواد الخطرة</th>
                <th>توفر خدمة الغاز</th>
                <th>توفر خدمة الكهرباء </th>
                <th>توفر خدمة شبكة الصرف الصحي </th>
                <th>توفر خدمة المياه</th>
                <th>عدد الوحدات</th>
                <th>عدد الادوار</th>
                <th>الإستخدام الفعلي</th>
                <th>حالة الدور</th>
                <th>حالة المبني</th>
                <th>حالة الموقع</th>
                <th>نوع الموقع</th>
                <th>استخدام المبنى</th>
              </tr>
            </thead>
            <tbody>
              {feature.length?feature.map((feat, index)=>
              <tr key={index}>
                <td>
                  {!feat.attributes["SITE_UTL_ASPHALT"] ||
                  feat.attributes["SITE_UTL_ASPHALT"].toString().toLowerCase() ===
                    "null" ||
                  feat.attributes["SITE_UTL_ASPHALT"].toString().trim() == "" 
                  ||
                  feat.attributes["SITE_UTL_ASPHALT"].toString().toLowerCase() == "0"
                    ? "بدون"
                    : "متوفر"}
                </td>
                <td>
                  {!feat.attributes["SITE_UTL_TELEPHONE"] ||
                  feat.attributes["SITE_UTL_TELEPHONE"].toString().toLowerCase() ===
                    "null" ||
                  feat.attributes["SITE_UTL_TELEPHONE"].toString().trim() == "" ||
                  feat.attributes["SITE_UTL_TELEPHONE"].toString().toLowerCase() == "0"
                    ? "بدون"
                    : "متوفر"}
                </td>
                <td>
                  {!feat.attributes["SITE_UTL_HAZARD"] ||
                  feat.attributes["SITE_UTL_HAZARD"].toString().toLowerCase() ===
                    ("null" || "0") ||
                  feat.attributes["SITE_UTL_HAZARD"].toString().trim() == ""
                    ? "بدون"
                    : "متوفر"}
                </td>
                <td>
                  {!feat.attributes["SITE_UTL_GAS"] ||
                  feat.attributes["SITE_UTL_GAS"].toString().toLowerCase() ===
                    ("null" || "0") ||
                  feat.attributes["SITE_UTL_GAS"].toString().trim() == ""
                    ? "بدون"
                    : "متوفر"}
                </td>
                <td>
                  {!feat.attributes["SITE_UTL_ELECT"] ||
                  feat.attributes["SITE_UTL_ELECT"].toString().toLowerCase() ===
                    ("null" || "0") ||
                  feat.attributes["SITE_UTL_ELECT"].toString().trim() == ""
                    ? "بدون"
                    : "متوفر"}
                </td>
                <td>
                  {!feat.attributes["SITE_UTL_SWG"] ||
                  feat.attributes["SITE_UTL_SWG"].toString().toLowerCase() ===
                    ("null" || "0") ||
                  feat.attributes["SITE_UTL_SWG"].toString().trim() == ""
                    ? "بدون"
                    : "متوفر"}
                </td>
                <td>
                  {!feat.attributes["SITE_UTL_WATER"] ||
                  feat.attributes["SITE_UTL_WATER"].toString().toLowerCase() ===
                    ("null" || "0") ||
                  feat.attributes["SITE_UTL_WATER"].toString().trim() == ""
                    ? "بدون"
                    : "متوفر"}
                </td>
                <td>
                  {!feat.attributes["BUILD_UNIT_COUNT"] ||
                  feat.attributes["BUILD_UNIT_COUNT"].toString().toLowerCase() ===
                    "null" ||
                  feat.attributes["BUILD_UNIT_COUNT"].toString().trim() == ""
                    ? "بدون"
                    : feat.attributes["BUILD_UNIT_COUNT"]}
                </td>
                <td>
                  {!feat.attributes["BUILD_FLOOR_COUNT"] ||
                  feat.attributes["BUILD_FLOOR_COUNT"].toString().toLowerCase() ===
                    "null" ||
                  feat.attributes["BUILD_FLOOR_COUNT"].toString().trim() == ""
                    ? "بدون"
                    : feat.attributes["BUILD_FLOOR_COUNT"]}
                </td>
                <td>
                  {!feat.attributes["BUILD_ACTUAL_USE"] ||
                  feat.attributes["BUILD_ACTUAL_USE"].toString().toLowerCase() ===
                    "null" ||
                  feat.attributes["BUILD_ACTUAL_USE"].toString().trim() == ""
                    ? "بدون"
                    : feat.attributes["BUILD_ACTUAL_USE"]}
                </td>
                <td>
                  {!feat.attributes["FLOOR_STATUS"] ||
                  feat.attributes["FLOOR_STATUS"].toString().toLowerCase() ===
                    "null" ||
                  feat.attributes["FLOOR_STATUS"].toString().trim() == ""
                    ? "بدون"
                    : this.renderDomainName("FLOOR_STATUS",feat.attributes["FLOOR_STATUS"])}
                </td>
                <td>
                  {!feat.attributes["BUILDING_STATUS"] ||
                  feat.attributes["BUILDING_STATUS"].toString().toLowerCase() ===
                    "null" ||
                  feat.attributes["BUILDING_STATUS"].toString().trim() == ""
                    ? "بدون"
                    : this.renderDomainName("BUILDING_STATUS",feat.attributes["BUILDING_STATUS"])}
                </td>
                <td>
                  {!feat.attributes["LOCATION_STATUS"] ||
                  feat.attributes["LOCATION_STATUS"].toString().toLowerCase() ===
                    "null" ||
                  feat.attributes["LOCATION_STATUS"].toString().trim() == ""
                    ? "بدون"
                    : this.renderDomainName("LOCATION_STATUS",feat.attributes["LOCATION_STATUS"])}
                </td>
                <td>
                  {!feat.attributes["BUILD_TYPE"] ||
                  feat.attributes["BUILD_TYPE"].toString().toLowerCase() ===
                    "null" ||
                  feat.attributes["BUILD_TYPE"].toString().trim() == ""
                    ? "بدون"
                    : this.renderDomainName("BUILD_TYPE",feat.attributes["BUILD_TYPE"])}
                </td>
                <td>
                  {!feat.attributes["BUILD_USE"] ||
                  feat.attributes["BUILD_USE"].toString().toLowerCase() === "null" ||
                  feat.attributes["BUILD_USE"].toString().trim() == ""
                    ? "بدون"
                    : this.renderDomainName("BUILD_USE",feat.attributes["BUILD_USE"])}
                </td>
              </tr>
            ):"لا يوجد بيانات"}
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
const mapStateToProps = ({ mapUpdate }) => {
  const {  fields } = mapUpdate;
  return {
    fields
  };
};

export default connect(mapStateToProps,null)(BuildingDetailsContent);

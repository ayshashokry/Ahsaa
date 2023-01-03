import React, { useEffect, useState } from "react";
import { connect } from "react-redux";

function BuildingDetailsTab(props) {
  const { selectedFeatureOnSearchTable, tabName } = props;
  const [feature, setShownData] = useState([]);

  useEffect(() => {
    if (
      selectedFeatureOnSearchTable?.feature &&
      tabName === "BuildingDetailsInfo"
    ) {
      setShownData(selectedFeatureOnSearchTable?.feature);
    } else setShownData([]);
  }, [selectedFeatureOnSearchTable]);
  const renderDomainName = (fieldname, code) => {
    const { fields } = props;
    if (!fields) return null;

    var layername = "TBL_BUILD_DETAILS".toLocaleLowerCase();
    var domain = fields[layername].find((field) => field.name == fieldname)
      .domain.codedValues;
    let domainName = domain.find((cv) => cv.code === code);
    console.log(domainName);
    if (domainName) return domainName.name;
  };
  if (feature.length)
    return (
      <>
        {/* <thead>
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
            </thead> */}
        <tbody>
          {feature.length
            ? feature.map((feat, index) => (
                <>
                  <tr key={index + "asdxx"}>
                    <td>
                      {!feat.attributes["LOCATION_STATUS"] ||
                      feat.attributes["LOCATION_STATUS"]
                        .toString()
                        .toLowerCase() === "null" ||
                      feat.attributes["LOCATION_STATUS"].toString().trim() == ""
                        ? "بدون"
                        : renderDomainName(
                            "LOCATION_STATUS",
                            feat.attributes["LOCATION_STATUS"]
                          )}
                    </td>
                    <th>حالة الموقع</th>
                  </tr>
                  <tr key={index + "asdn"}>
                    <td>
                      {!feat.attributes["BUILDING_STATUS"] ||
                      feat.attributes["BUILDING_STATUS"]
                        .toString()
                        .toLowerCase() === "null" ||
                      feat.attributes["BUILDING_STATUS"].toString().trim() == ""
                        ? "بدون"
                        : renderDomainName(
                            "BUILDING_STATUS",
                            feat.attributes["BUILDING_STATUS"]
                          )}
                    </td>
                    <th>حالة المبني</th>
                  </tr>

                  <tr key={index + "asdk"}>
                    <td>
                      {!feat.attributes["FLOOR_STATUS"] ||
                      feat.attributes["FLOOR_STATUS"]
                        .toString()
                        .toLowerCase() === "null" ||
                      feat.attributes["FLOOR_STATUS"].toString().trim() == ""
                        ? "بدون"
                        : renderDomainName(
                            "FLOOR_STATUS",
                            feat.attributes["FLOOR_STATUS"]
                          )}
                    </td>{" "}
                    <th>حالة الدور</th>
                  </tr>
                  <tr key={index + "asdi"}>
                    <td>
                      {!feat.attributes["BUILD_ACTUAL_USE"] ||
                      feat.attributes["BUILD_ACTUAL_USE"]
                        .toString()
                        .toLowerCase() === "null" ||
                      feat.attributes["BUILD_ACTUAL_USE"].toString().trim() ==
                        ""
                        ? "بدون"
                        : feat.attributes["BUILD_ACTUAL_USE"]}
                    </td>{" "}
                    <th>الإستخدام الفعلي</th>
                  </tr>
                  <tr key={index + "asdp"}>
                    <td>
                      {!feat.attributes["BUILD_FLOOR_COUNT"] ||
                      feat.attributes["BUILD_FLOOR_COUNT"]
                        .toString()
                        .toLowerCase() === "null" ||
                      feat.attributes["BUILD_FLOOR_COUNT"].toString().trim() ==
                        ""
                        ? "بدون"
                        : feat.attributes["BUILD_FLOOR_COUNT"]}
                    </td>
                    <th>عدد الادوار</th>
                  </tr>
                  <tr key={index + "asdy"}>
                    <td>
                      {!feat.attributes["BUILD_UNIT_COUNT"] ||
                      feat.attributes["BUILD_UNIT_COUNT"]
                        .toString()
                        .toLowerCase() === "null" ||
                      feat.attributes["BUILD_UNIT_COUNT"].toString().trim() ==
                        ""
                        ? "بدون"
                        : feat.attributes["BUILD_UNIT_COUNT"]}
                    </td>{" "}
                    <th>عدد الوحدات</th>
                  </tr>
                  <tr key={index + "asdt"}>
                    <td>
                      {!feat.attributes["SITE_UTL_WATER"] ||
                      feat.attributes["SITE_UTL_WATER"]
                        .toString()
                        .toLowerCase() === ("null" || "0") ||
                      feat.attributes["SITE_UTL_WATER"].toString().trim() == ""
                        ? "بدون"
                        : "متوفر"}
                    </td>
                    <th>توفر خدمة المياه</th>
                  </tr>
                  <tr key={index + "asdr"}>
                    <td>
                      {!feat.attributes["SITE_UTL_SWG"] ||
                      feat.attributes["SITE_UTL_SWG"]
                        .toString()
                        .toLowerCase() === ("null" || "0") ||
                      feat.attributes["SITE_UTL_SWG"].toString().trim() == ""
                        ? "بدون"
                        : "متوفر"}
                    </td>
                    <th>توفر خدمة شبكة الصرف الصحي </th>
                  </tr>
                  <tr key={index + "asde"}>
                    <td>
                      {!feat.attributes["SITE_UTL_ELECT"] ||
                      feat.attributes["SITE_UTL_ELECT"]
                        .toString()
                        .toLowerCase() === ("null" || "0") ||
                      feat.attributes["SITE_UTL_ELECT"].toString().trim() == ""
                        ? "بدون"
                        : "متوفر"}
                    </td>
                    <th>توفر خدمة الكهرباء </th>
                  </tr>
                  <tr key={index + "asdq"}>
                    <td>
                      {!feat.attributes["SITE_UTL_GAS"] ||
                      feat.attributes["SITE_UTL_GAS"]
                        .toString()
                        .toLowerCase() === ("null" || "0") ||
                      feat.attributes["SITE_UTL_GAS"].toString().trim() == ""
                        ? "بدون"
                        : "متوفر"}
                    </td>
                    <th>توفر خدمة الغاز</th>
                  </tr>
                  <tr key={index + "asdas"}>
                    <td>
                      {!feat.attributes["SITE_UTL_HAZARD"] ||
                      feat.attributes["SITE_UTL_HAZARD"]
                        .toString()
                        .toLowerCase() === ("null" || "0") ||
                      feat.attributes["SITE_UTL_HAZARD"].toString().trim() == ""
                        ? "بدون"
                        : "متوفر"}
                    </td>
                    <th> شبكة صرف المواد الخطرة</th>
                  </tr>

                  <tr key={index + "asds"}>
                    <td>
                      {!feat.attributes["SITE_UTL_TELEPHONE"] ||
                      feat.attributes["SITE_UTL_TELEPHONE"]
                        .toString()
                        .toLowerCase() === "null" ||
                      feat.attributes["SITE_UTL_TELEPHONE"].toString().trim() ==
                        "" ||
                      feat.attributes["SITE_UTL_TELEPHONE"]
                        .toString()
                        .toLowerCase() == "0"
                        ? "بدون"
                        : "متوفر"}
                    </td>
                    <th> خدمة هاتف التليفون</th>
                  </tr>

                  <tr key={index + "asd"}>
                    <td>
                      {!feat.attributes["SITE_UTL_ASPHALT"] ||
                      feat.attributes["SITE_UTL_ASPHALT"]
                        .toString()
                        .toLowerCase() === "null" ||
                      feat.attributes["SITE_UTL_ASPHALT"].toString().trim() ==
                        "" ||
                      feat.attributes["SITE_UTL_ASPHALT"]
                        .toString()
                        .toLowerCase() == "0"
                        ? "بدون"
                        : "متوفر"}
                    </td>
                    <th> خدمة الطريق مسفلت</th>
                  </tr>

                  <tr>
                    <td>
                      {!feat.attributes["BUILD_TYPE"] ||
                      feat.attributes["BUILD_TYPE"].toString().toLowerCase() ===
                        "null" ||
                      feat.attributes["BUILD_TYPE"].toString().trim() == ""
                        ? "بدون"
                        : renderDomainName(
                            "BUILD_TYPE",
                            feat.attributes["BUILD_TYPE"]
                          )}
                    </td>
                    <th>نوع الموقع</th>
                  </tr>
                  <tr>
                    <td>
                      {!feat.attributes["BUILD_USE"] ||
                      feat.attributes["BUILD_USE"].toString().toLowerCase() ===
                        "null" ||
                      feat.attributes["BUILD_USE"].toString().trim() == ""
                        ? "بدون"
                        : renderDomainName(
                            "BUILD_USE",
                            feat.attributes["BUILD_USE"]
                          )}
                    </td>
                    <th>استخدام المبنى</th>
                  </tr>
                </>
              ))
            : "لا يوجد بيانات"}
        </tbody>
      </>
    );
  else
    return (
      <div style={{ textAlign: "center" }} className="m-5">
        <h5>لا يوجد بيانات للعرض</h5>
      </div>
    );
}

const mapStateToProps = ({ mapUpdate }) => {
  const { fields } = mapUpdate;
  return {
    fields,
  };
};

export default connect(mapStateToProps, null)(BuildingDetailsTab);

import React, { useState, useEffect } from "react";
import _ from "lodash";
import moment from "moment-hijri";
function ADGroubTab(props) {
  const { selectedFeatureOnSearchTable, tabName } = props;
  let [attributes, setAttributes] = useState();
  useEffect(() => {
    if (
      selectedFeatureOnSearchTable?.feature?.length &&
      tabName == "AD borders"
    )
      setAttributes(selectedFeatureOnSearchTable.feature[0].attributes);
    else setAttributes(null);
  }, [selectedFeatureOnSearchTable]);
  if (attributes)
    return (
      <>
        {/* <thead>
              <tr> */}
        {/* <th>مساحة اللوحة داخل المجموعة</th> */}
        {/* <th>عرض اللوحة داخل المجموعة</th> */}
        {/* <th>طول اللوحة داخل المجموعة</th> */}
        {/* <th>وصف المجموعة الإعلانية</th> */}
        {/* <th>تاريخ اعداد المجموعة الدعائية</th> */}
        {/* <th>حالة الاضاءة</th> */}
        {/* <th>عدد الاوجه</th> */}
        {/* <th>عدد اللوحات</th> */}
        {/* <th>عدد المواقع</th> */}
        {/* <th>نوع اللوحة</th> */}
        {/* <th>كود المجموعة </th> */}
        {/* </tr>
            </thead> */}
        <tbody>
          {selectedFeatureOnSearchTable.feature.length ? (
            <>
              <tr>
                <td>
                  {!attributes["GROUP_CODE"] ||
                  attributes["GROUP_CODE"].toString().toLowerCase() ===
                    "null" ||
                  attributes["GROUP_CODE"].toString().trim() == ""
                    ? "بدون"
                    : attributes["GROUP_CODE"]}
                </td>
                <th>كود المجموعة </th>
              </tr>
              <tr>
                <td>
                  {!attributes["BOARD_TYPE"] ||
                  attributes["BOARD_TYPE"].toString().toLowerCase() ===
                    "null" ||
                  attributes["BOARD_TYPE"].toString().trim() == ""
                    ? "بدون"
                    : attributes["BOARD_TYPE"]}
                </td>
                <th>نوع اللوحة</th>
              </tr>
              <tr>
                <td>
                  {!attributes["SITE_NO"] ||
                  attributes["SITE_NO"].toString().toLowerCase() === "null" ||
                  attributes["SITE_NO"].toString().trim() == ""
                    ? "بدون"
                    : attributes["SITE_NO"]}
                </td>
                <th>عدد المواقع</th>
              </tr>
              <tr>
                <td>
                  {!attributes["BOARD_NO"] ||
                  attributes["BOARD_NO"].toString().toLowerCase() === "null" ||
                  attributes["BOARD_NO"].toString().trim() == ""
                    ? "بدون"
                    : attributes["BOARD_NO"]}
                </td>
                <th>عدد اللوحات</th>
              </tr>
              <tr>
                <td>
                  {!attributes["FRONTBOARD_NO"] ||
                  attributes["FRONTBOARD_NO"].toString().toLowerCase() ===
                    "null" ||
                  attributes["FRONTBOARD_NO"].toString().trim() == ""
                    ? "بدون"
                    : attributes["FRONTBOARD_NO"]}
                </td>
                <th>عدد الاوجه</th>
              </tr>

              <tr>
                <td>
                  {!attributes["LIGHT_STATUS"] ||
                  attributes["LIGHT_STATUS"].toString().toLowerCase() ===
                    "null" ||
                  attributes["LIGHT_STATUS"].toString().trim() == ""
                    ? "بدون"
                    : attributes["LIGHT_STATUS"]}
                </td>
                <th>حالة الاضاءة</th>
              </tr>

              <tr>
                <td>
                  {!attributes["GROUP_BOARD_PERPDATE"] ||
                  attributes["GROUP_BOARD_PERPDATE"]
                    .toString()
                    .toLowerCase() === "null" ||
                  attributes["GROUP_BOARD_PERPDATE"].toString().trim() == ""
                    ? "بدون"
                    : moment(attributes["GROUP_BOARD_PERPDATE"]).format(
                        "iYYYY/iM/iD"
                      )}
                </td>
                <th>تاريخ اعداد المجموعة الدعائية</th>
              </tr>
              <tr>
                <td>
                  {!attributes["GROUP_DESCRIPTION"] ||
                  attributes["GROUP_DESCRIPTION"].toString().toLowerCase() ===
                    "null" ||
                  attributes["GROUP_DESCRIPTION"].toString().trim() == ""
                    ? "بدون"
                    : attributes["GROUP_DESCRIPTION"]}
                </td>
                <th>وصف المجموعة الإعلانية</th>
              </tr>

              <tr>
                <td>
                  {!attributes["GROUP_BOARD_LENGTH"] ||
                  attributes["GROUP_BOARD_LENGTH"].toString().toLowerCase() ===
                    "null" ||
                  attributes["GROUP_BOARD_LENGTH"].toString().trim() == ""
                    ? "بدون"
                    : attributes["GROUP_BOARD_LENGTH"]}
                </td>
                <th>طول اللوحة داخل المجموعة</th>
              </tr>

              <tr>
                <td>
                  {!attributes["GROUP_BOARD_WIDTH"] ||
                  attributes["GROUP_BOARD_WIDTH"].toString().toLowerCase() ===
                    "null" ||
                  attributes["GROUP_BOARD_WIDTH"].toString().trim() == ""
                    ? "بدون"
                    : attributes["GROUP_BOARD_WIDTH"]}
                </td>
                <th>عرض اللوحة داخل المجموعة</th>
              </tr>
              <tr>
                <td>
                  {!attributes["GROUP_BOARD_AREA"] ||
                  attributes["GROUP_BOARD_AREA"].toString().toLowerCase() ===
                    "null" ||
                  attributes["GROUP_BOARD_AREA"].toString().trim() == ""
                    ? "بدون"
                    : attributes["GROUP_BOARD_AREA"]}
                </td>
                <th>مساحة اللوحة داخل المجموعة</th>
              </tr>
            </>
          ) : (
            <tr>
              {_.range(1, 12).map((row) => (
                <td key={row}>بدون</td>
              ))}
            </tr>
          )}
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

export default ADGroubTab;

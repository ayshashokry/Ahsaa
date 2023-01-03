import React, { useEffect, useState } from "react";

function TowerTab(props) {
  const { selectedFeatureOnSearchTable, tabName } = props;
  let [attributes, setShownData] = useState({});
  useEffect(() => {
    if (
      selectedFeatureOnSearchTable?.feature?.attributes &&
      tabName == "towers info"
    ) {
      const {
        feature: { attributes },
      } = selectedFeatureOnSearchTable;
      setShownData(attributes);
    } else setShownData({});
  }, [selectedFeatureOnSearchTable]);
  if (selectedFeatureOnSearchTable)
    return (
      <>
        {/* <thead>
          <tr>
            <th>مزود الخدمة</th>
            <th>الارتفاع</th>
            <th>نوع البرج</th>
            <th>كود البرج</th>
          </tr>
        </thead> */}
        <tbody>
          <tr>
            <td>
              {!attributes["TOWER_LOCATION_CODE"] ||
              attributes["TOWER_LOCATION_CODE"].toString().toLowerCase() ===
                "null" ||
              attributes["TOWER_LOCATION_CODE"].toString().trim() == ""
                ? "بدون"
                : attributes["TOWER_LOCATION_CODE"]}
            </td>
            <th>كود البرج</th>
          </tr>
          <tr>
            <td>
              {!attributes["TOWER_TYPE"] ||
              attributes["TOWER_TYPE"].toString().toLowerCase() === "null" ||
              attributes["TOWER_TYPE"].toString().trim() == ""
                ? "بدون"
                : attributes["TOWER_TYPE"]}
            </td>
            <th>نوع البرج</th>
          </tr>

          <tr>
            <td>
              {!attributes["TOWER_HEIGHT"] ||
              attributes["TOWER_HEIGHT"].toString().toLowerCase() === "null" ||
              attributes["TOWER_HEIGHT"].toString().trim() == ""
                ? "بدون"
                : attributes["TOWER_HEIGHT"]}
            </td>
            <th>الارتفاع</th>
          </tr>
          <tr>
            <td>
              {!attributes["TOWER_SERVICE_PROVIDER"] ||
              attributes["TOWER_SERVICE_PROVIDER"].toString().toLowerCase() ===
                "null" ||
              attributes["TOWER_SERVICE_PROVIDER"].toString().trim() == ""
                ? "بدون"
                : attributes["TOWER_SERVICE_PROVIDER"]}{" "}
            </td>
            <th>مزود الخدمة</th>
          </tr>
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

export default TowerTab;

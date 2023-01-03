import React, { useState, useEffect } from "react";

function BuildingDataContentTab(props) {
  const { selectedFeatureOnSearchTable, tabName } = props;
  let [attributes, setShownData] = useState({});
  useEffect(() => {
    if (
      selectedFeatureOnSearchTable?.feature?.attributes &&
      tabName == "BuildingDataInfo"
    ) {
      const {
        feature: { attributes },
      } = selectedFeatureOnSearchTable;
      setShownData(attributes);
    } else setShownData({});
  }, [selectedFeatureOnSearchTable]);

  if (Object.keys(attributes).length)
    return (
      <>
        <tbody>
          <tr>
            <td>
              {!attributes["BLD_CODE"] ||
              attributes["BLD_CODE"].toString().toLowerCase() === "null" ||
              attributes["BLD_CODE"].toString().trim() == ""
                ? "بدون"
                : attributes["BLD_CODE"]}
            </td>
            <th>كود المبنى</th>
          </tr>

          <tr>
            <td>
              {!attributes["BLD_AREA"] ||
              attributes["BLD_AREA"].toString().toLowerCase() === "null" ||
              attributes["BLD_AREA"].toString().trim() == ""
                ? "بدون"
                : parseFloat(attributes["BLD_AREA"]).toFixed(2)}
            </td>
            <th>مساحة المبنى</th>
          </tr>

          <tr>
            <td>
              {!attributes["BLD_MATRIAL"] ||
              attributes["BLD_MATRIAL"].toString().toLowerCase() === "null" ||
              attributes["BLD_MATRIAL"].toString().trim() == ""
                ? "بدون"
                : attributes["BLD_MATRIAL"]}
            </td>
            <th>مادة البناء</th>
          </tr>
          <tr>
            <td>
              {!attributes["BLD_STATUS"] ||
              attributes["BLD_STATUS"].toString().toLowerCase() === "null" ||
              attributes["BLD_STATUS"].toString().trim() == ""
                ? "بدون"
                : attributes["BLD_STATUS"]}
            </td>
            <th>حالة المبنى</th>
          </tr>
          <tr>
            <td>
              {!attributes["BLD_NO_FLOORS"] ||
              attributes["BLD_NO_FLOORS"].toString().toLowerCase() === "null" ||
              attributes["BLD_NO_FLOORS"].toString().trim() == ""
                ? "بدون"
                : attributes["BLD_NO_FLOORS"]}
            </td>
            <th>عدد الادوار</th>
          </tr>

          <tr>
            <td>
              {!attributes["BLD_NO_UNITS"] ||
              attributes["BLD_NO_UNITS"].toString().toLowerCase() === "null" ||
              attributes["BLD_NO_UNITS"].toString().trim() == ""
                ? "بدون"
                : attributes["BLD_NO_UNITS"]}
            </td>
            <th>عدد الوحدات</th>
          </tr>
          <tr>
            <td>
              {!attributes["BLD_POST_CODE"] ||
              attributes["BLD_POST_CODE"].toString().toLowerCase() === "null" ||
              attributes["BLD_POST_CODE"].toString().trim() == ""
                ? "بدون"
                : attributes["BLD_POST_CODE"]}
            </td>
            <th>الرمز البريدى</th>
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

export default BuildingDataContentTab;

import React, { useEffect, useState } from "react";

function AtmTab(props) {
  const { selectedFeatureOnSearchTable, tabName } = props;
  let [attributes, setShownData] = useState({});
  useEffect(() => {
    if (
      selectedFeatureOnSearchTable?.feature?.attributes &&
      tabName == "atmInfo"
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
        <thead>
          <tr>
            <th>النوع</th>
            <th>الاسم</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              {!attributes["TYPE"] ||
              attributes["TYPE"].toString().toLowerCase() === "null" ||
              attributes["TYPE"].toString().trim() == ""
                ? "بدون"
                : attributes["TYPE"]}
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
      </>
    );
  else
    return (
      <div style={{ textAlign: "center" }} className="m-5">
        <h5>لا يوجد بيانات للعرض</h5>
      </div>
    );
}

export default AtmTab;

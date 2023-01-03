import React, { useState, useEffect } from "react";

function ElecStationTab(props) {
  const { selectedFeatureOnSearchTable, closeModal } = props;
  let [attributes, setShownData] = useState({});
  useEffect(() => {
    if (selectedFeatureOnSearchTable?.feature) {
      const {
        feature: { attributes },
      } = selectedFeatureOnSearchTable;
      setShownData(attributes);
    }
  }, [selectedFeatureOnSearchTable]);
  if (selectedFeatureOnSearchTable)
    return (
      <>
        <thead>
          <tr>
            <th>نوع محطة الكهرباء</th>
            <th>اسم المحطة</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              {!attributes["ELEC_TYPE"] ||
              attributes["ELEC_TYPE"].toString().toLowerCase() === "null" ||
              attributes["ELEC_TYPE"].toString().trim() == ""
                ? "بدون"
                : attributes["ELEC_TYPE"]}{" "}
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

export default ElecStationTab;

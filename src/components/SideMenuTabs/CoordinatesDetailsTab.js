import React, { useState, useEffect } from "react";

function CoordinatesDetailsTab(props) {
  let { selectedFeatureOnSearchTable, tabName } = props;
  let [shownData, setShownData] = useState({});
  useEffect(() => {
    if (selectedFeatureOnSearchTable && tabName == "coordinates info") {
      setShownData(selectedFeatureOnSearchTable);
    }
  }, [selectedFeatureOnSearchTable]);
  if (Object.keys(shownData).length)
    return (
      <>
        <thead>
          <tr>
            <th>إحداثي دائرة العرض </th>
            <th>إحداثي خط الطول </th>
            <th>رقم الركن </th>
          </tr>
        </thead>
        <tbody>
          {shownData?.features?.length ? (
            shownData.features.map((feat) => (
              <tr>
                <td>
                  {!feat.attributes["YGCS_COORD"] ||
                  feat.attributes["YGCS_COORD"].toString().toLowerCase() ===
                    "null" ||
                  feat.attributes["YGCS_COORD"].toString().trim() == ""
                    ? "بدون"
                    : isNaN(Number(feat.attributes["YGCS_COORD"]))
                    ? feat.attributes["YGCS_COORD"]
                    : parseFloat(feat.attributes["YGCS_COORD"]).toFixed(4)}
                </td>

                <td>
                  {!feat.attributes["XGCS_COORD"] ||
                  feat.attributes["XGCS_COORD"].toString().toLowerCase() ===
                    "null" ||
                  feat.attributes["XGCS_COORD"].toString().trim() == ""
                    ? "بدون"
                    : isNaN(Number(feat.attributes["XGCS_COORD"]))
                    ? feat.attributes["XGCS_COORD"]
                    : parseFloat(feat.attributes["XGCS_COORD"]).toFixed(4)}
                </td>
                <td>
                  {!feat.attributes["CORNER_NO"] ||
                  feat.attributes["CORNER_NO"].toString().toLowerCase() ===
                    "null" ||
                  feat.attributes["CORNER_NO"].toString().trim() == ""
                    ? "بدون"
                    : feat.attributes["CORNER_NO"]}
                </td>
              </tr>
            ))
          ) : (
            <>
              <tr>
                <td>بدون</td>
                <td>بدون</td>
                <td>بدون</td>
              </tr>
            </>
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

export default CoordinatesDetailsTab;

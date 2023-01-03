import React, { useState, useEffect } from "react";

function BorderFromPlanTab(props) {
  const { selectedFeatureOnSearchTable, tabName } = props;
  let [shownData, setShownData] = useState({});
  useEffect(() => {
    if (
      selectedFeatureOnSearchTable?.features &&
      tabName == "bordersFromPlan"
    ) {
      setShownData(selectedFeatureOnSearchTable);
    } else setShownData({});
  }, [selectedFeatureOnSearchTable]);
  if (Object.keys(shownData).length)
    return (
      <>
        <thead>
          <tr>
            <th>وصف الحد</th>
            <th>طول الحد - م</th>
            <th>اتجاه الحد</th>
          </tr>
        </thead>
        <tbody>
          {!shownData?.features?.length
            ? ["الشمالي", "الجنوبي", "الشرقي", "الغربي"].map((row) => (
                <tr>
                  <td>بدون</td>
                  <td>بدون</td>
                  <td>{row}</td>
                </tr>
              ))
            : shownData.features.map((feat) => (
                <tr>
                  <td>
                    {feat.attributes["BOUNDARY_DIRECTION_Code"] === 1
                      ? !shownData.borderDescirbtion[
                          "NORTH_BOUNDARY_DESCRIPTION"
                        ] ||
                        shownData.borderDescirbtion[
                          "NORTH_BOUNDARY_DESCRIPTION"
                        ]
                          .toString()
                          .toLowerCase() === "null" ||
                        shownData.borderDescirbtion[
                          "NORTH_BOUNDARY_DESCRIPTION"
                        ]
                          .toString()
                          .trim() == ""
                        ? "بدون"
                        : shownData.borderDescirbtion[
                            "NORTH_BOUNDARY_DESCRIPTION"
                          ]
                      : feat.attributes["BOUNDARY_DIRECTION_Code"] === 3
                      ? !shownData.borderDescirbtion[
                          "SOUTH_BOUNDARY_DESCRIPTION"
                        ] ||
                        shownData.borderDescirbtion[
                          "SOUTH_BOUNDARY_DESCRIPTION"
                        ]
                          .toString()
                          .toLowerCase() === "null" ||
                        shownData.borderDescirbtion[
                          "SOUTH_BOUNDARY_DESCRIPTION"
                        ]
                          .toString()
                          .trim() == ""
                        ? "بدون"
                        : shownData.borderDescirbtion[
                            "SOUTH_BOUNDARY_DESCRIPTION"
                          ]
                      : feat.attributes["BOUNDARY_DIRECTION_Code"] === 2
                      ? !shownData.borderDescirbtion[
                          "EAST_BOUNDARY_DESCRIPTION"
                        ] ||
                        shownData.borderDescirbtion["EAST_BOUNDARY_DESCRIPTION"]
                          .toString()
                          .toLowerCase() === "null" ||
                        shownData.borderDescirbtion["EAST_BOUNDARY_DESCRIPTION"]
                          .toString()
                          .trim() == ""
                        ? "بدون"
                        : shownData.borderDescirbtion[
                            "EAST_BOUNDARY_DESCRIPTION"
                          ]
                      : !shownData.borderDescirbtion[
                          "WEST_BOUNDARY_DESCRIPTION"
                        ] ||
                        shownData.borderDescirbtion["WEST_BOUNDARY_DESCRIPTION"]
                          .toString()
                          .toLowerCase() === "null" ||
                        shownData.borderDescirbtion["WEST_BOUNDARY_DESCRIPTION"]
                          .toString()
                          .trim() == ""
                      ? "بدون"
                      : shownData.borderDescirbtion[
                          "WEST_BOUNDARY_DESCRIPTION"
                        ]}
                  </td>
                  <td>
                    {!feat.attributes["BOUNDARY_LENGTH"] ||
                    feat.attributes["BOUNDARY_LENGTH"]
                      .toString()
                      .toLowerCase() === "null" ||
                    feat.attributes["BOUNDARY_LENGTH"].toString().trim() == ""
                      ? "بدون"
                      : parseFloat(feat.attributes["BOUNDARY_LENGTH"]).toFixed(
                          2
                        )}
                  </td>
                  <td>
                    {feat.attributes["BOUNDARY_DIRECTION_Code"] == 1
                      ? "الشمالي"
                      : feat.attributes["BOUNDARY_DIRECTION_Code"] == 3
                      ? "الجنوبي"
                      : feat.attributes["BOUNDARY_DIRECTION_Code"] == 2
                      ? "الشرقي"
                      : feat.attributes["BOUNDARY_DIRECTION_Code"] == 4
                      ? "الغربي"
                      : "بدون"}
                  </td>
                </tr>
              ))}
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

export default BorderFromPlanTab;

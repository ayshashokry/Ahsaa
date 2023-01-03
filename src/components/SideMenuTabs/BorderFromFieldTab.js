import React from "react";
import { useState } from "react";
import { useEffect } from "react";

function BorderFromFieldTab(props) {
  const { selectedFeatureOnSearchTable, tabName } = props;
  const [attributes, setAttributes] = useState();

  useEffect(() => {
    if (
      selectedFeatureOnSearchTable?.feature?.attributes &&
      tabName === "bordersFromField"
    ) {
      const {
        feature: { attributes },
      } = selectedFeatureOnSearchTable;
      setAttributes(attributes);
    } else setAttributes(null);
  }, [selectedFeatureOnSearchTable]);
  if (attributes)
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
          <tr>
            <td>
              {!attributes["NORTH_BOUNDARY_DESC"] ||
              attributes["NORTH_BOUNDARY_DESC"].toString().toLowerCase() ===
                "null" ||
              attributes["NORTH_BOUNDARY_DESC"].toString().trim() == ""
                ? "بدون"
                : attributes["NORTH_BOUNDARY_DESC"]}
            </td>
            <td>
              {!attributes["NORTH_BOUNDARY_LENGTH"] ||
              attributes["NORTH_BOUNDARY_LENGTH"].toString().toLowerCase() ===
                "null" ||
              attributes["NORTH_BOUNDARY_LENGTH"].toString().trim() == ""
                ? "بدون"
                : parseFloat(attributes["NORTH_BOUNDARY_LENGTH"]).toFixed(2)}
            </td>
            <td>الشمالى</td>
          </tr>
          <tr>
            <td>
              {!attributes["SOUTH_BOUNDARY_DESC"] ||
              attributes["SOUTH_BOUNDARY_DESC"].toString().toLowerCase() ===
                "null" ||
              attributes["SOUTH_BOUNDARY_DESC"].toString().trim() == ""
                ? "بدون"
                : attributes["SOUTH_BOUNDARY_DESC"]}
            </td>
            <td>
              {!attributes["SOUTH_BOUNDARY_LENGTH"] ||
              attributes["SOUTH_BOUNDARY_LENGTH"].toString().toLowerCase() ===
                "null" ||
              attributes["SOUTH_BOUNDARY_LENGTH"].toString().trim() == ""
                ? "بدون"
                : parseFloat(attributes["SOUTH_BOUNDARY_LENGTH"]).toFixed(2)}
            </td>
            <td>الجنوبي</td>
          </tr>
          <tr>
            <td>
              {!attributes["EAST_BOUNDARY_DESC"] ||
              attributes["EAST_BOUNDARY_DESC"].toString().toLowerCase() ===
                "null" ||
              attributes["EAST_BOUNDARY_DESC"].toString().trim() == ""
                ? "بدون"
                : attributes["EAST_BOUNDARY_DESC"]}
            </td>
            <td>
              {!attributes["EAST_BOUNDARY_LENGTH"] ||
              attributes["EAST_BOUNDARY_LENGTH"].toString().toLowerCase() ===
                "null" ||
              attributes["EAST_BOUNDARY_LENGTH"].toString().trim() == ""
                ? "بدون"
                : parseFloat(attributes["EAST_BOUNDARY_LENGTH"]).toFixed(2)}
            </td>
            <td>الشرقي</td>
          </tr>{" "}
          <tr>
            <td>
              {!attributes["WEST_BOUNDARY_DESC"] ||
              attributes["WEST_BOUNDARY_DESC"].toString().toLowerCase() ===
                "null" ||
              attributes["WEST_BOUNDARY_DESC"].toString().trim() == ""
                ? "بدون"
                : attributes["WEST_BOUNDARY_DESC"]}
            </td>
            <td>
              {!attributes["WEST_BOUNDARY_LENGTH"] ||
              attributes["WEST_BOUNDARY_LENGTH"].toString().toLowerCase() ===
                "null" ||
              attributes["WEST_BOUNDARY_LENGTH"].toString().trim() == ""
                ? "بدون"
                : parseFloat(attributes["WEST_BOUNDARY_LENGTH"]).toFixed(2)}
            </td>
            <td>الغربي</td>
          </tr>
        </tbody>
      </>
    );
  else
    return (
      <div style={{ textAlign: "center" }} className="m-5">
        <h5>لا توجد بيانات للعرض</h5>
      </div>
    );
}

export default BorderFromFieldTab;

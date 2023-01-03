import React from "react";
import { useState } from "react";
import { connect } from "react-redux";
import _ from "lodash";
import { useEffect } from "react";
function SiteMainDetaillsTab(props) {
  const { tableSettings, selectedFeatureOnSearchTable, tabName } = props;
  // const { columns } = tableSettings;
  let [shownData, setShownData] = useState();
  useEffect(() => {
    if (selectedFeatureOnSearchTable && tabName == "mainData") {
      setShownData(selectedFeatureOnSearchTable);
    } else setShownData(undefined);
  }, [selectedFeatureOnSearchTable]);
  const getDomainName = (layername, fieldname, code) => {
    let fieldValue;
    layername = layername.toLocaleLowerCase();

    let domain = props.fields[layername].find(
      (field) => field.name == fieldname
    ).domain;
    //check if there is a domain or null
    if (domain) {
      domain = domain.codedValues;
      if (code)
        fieldValue = domain.find((domain) => domain.code === code)
          ? domain.find((domain) => domain.code === code).name
          : code;
      else fieldValue = "بدون";
    } else fieldValue = code;

    return fieldValue;
  };
  if (shownData && tableSettings?.columns)
    return tableSettings.columns.map((c, ic) =>
      // hide area for users rather than employee
      props.currentUser !== "Employee" && c.name === "SITE_AREA" ? null : (
        <tr key={ic + "asdasd"}>
          <td
            key={ic + "23aeasd"}
            // onMouseOver={this.drawLineWithZoom.bind(
            //   this,
            //   feature
            // )}
          >
            {!shownData.feature.attributes[c.name] ||
            shownData.feature.attributes[c.name].toString().toLowerCase() ===
              "null" ||
            shownData.feature.attributes[c.name].toString().toLowerCase() ===
              "<null>" ||
            shownData.feature.attributes[c.name].toString().trim() == ""
              ? "بدون"
              : c.name == "SITE_AREA"
              ? parseFloat(shownData.feature.attributes[c.name]).toFixed(2)
              : // shownData.feature.attributes[c.name]
                getDomainName(
                  shownData.layername,
                  c.name,
                  shownData.feature.attributes[c.name]
                )}
          </td>

          <th key={ic} id={c.name}>
            {c.alias}
          </th>
        </tr>
      )
    );
  else return null;
}

const mapStateToProps = ({ mapUpdate }) => {
  const { tableSettings, currentUser, fields } = mapUpdate;
  return {
    tableSettings,
    currentUser,
    fields,
    //   selectedFeatureOnSearchTable
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    sortTableData: (data) => dispatch({ type: "RESULT_TABLE_DATA_SET", data }),
    clearTableData: () => dispatch({ type: "CLEAR_RESULT_TABLE_DATA_SET" }),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SiteMainDetaillsTab);

import React, { useState, useEffect } from "react";
import { Table } from "react-bootstrap";
import { connect } from "react-redux";

function FinalStepAddLocFromParcelsTable(props) {
  console.log(props);
  const [shownData, setShowndata] = useState(() => {
    let shownData = [];
    if (props.result.length)
      shownData = props.result.map((land) => {
        let data = {};
        if(land.layername.toLocaleLowerCase()=="invest_site_polygon"){
        //delete fields related to coords from shown data
        data.newMainData = land.investSiteDataAttributes;
        switch (land.investSiteDataAttributes.SITE_SUBTYPE) {
          case 1:
            //buildings
            data.tableData = {
              newData: land.tblData,
              tblName: "TBL_BUILDING_DATA",
            };
            break;

          case 3:
            //mobile towers
            data.tableData = {
              newData: land.tblData,
              tblName: "TBL_TOWERS",
            };

            break;
          case 5:
            //elec stations
            data.tableData = {
              newData: land.tblData,
              tblName: "TBL_ELEC_STATION",
            };

            break;
          case 6:
            //atm
            data.tableData = {
              newData: land.tblData,
              tblName: "TBL_ATM",
            };

            break;
        }
      }else if(land.layername.toUpperCase()=="ADVERTISING_BOARDS"){
        data.newMainData = land.investSiteDataAttributes;
            data.tableData = {
              newData: land.tblData,
              tblName: "TBL_BOARDS_GROUP",
            };

          }
      data.layername = land.layername;
      return data;
      });
    return shownData;
  });
  let getDomainName = (layername, fieldname, code) => {
    let fieldValue;

    layername = layername.toLocaleLowerCase();
    let alias = props.fields[layername].find((field) => field.name == fieldname)
      .alias;
    let domain = props.fields[layername].find(
      (field) => field.name == fieldname
    ).domain;
    //check if there is a domain or null
    if (domain) {
      domain = domain.codedValues;
      if (code) fieldValue = domain.find((domain) => domain.code === code)?
      domain.find((domain) => domain.code === code).name:code;
      else fieldValue = "بدون";
    } else fieldValue = code;

    return {
      value: fieldValue,
      alias: alias,
    };
  };

  let displayMainFields = (land) => {
    console.log(land);
    let fieldsWithDomains = ["MUNICIPALITY_NAME", "DISTRICT_NAME"];
    let displayFields = [];
    let layername = land.layername.toLocaleLowerCase();
    for (let i = 0; i < fieldsWithDomains.length; i++) {
      const field = fieldsWithDomains[i];
      let domainValues = getDomainName(
        layername,
        field,
        land.newMainData[field]
      );
      displayFields.push({
        after: domainValues.value,
        name: domainValues.alias,
      });
    }

    let fieldsWithValues =
      layername.toUpperCase() == "ADVERTISING_BOARDS"
        ? ["PLAN_NO"]
        : ["PARCEL_PLAN_NO", "PLAN_NO"];
    for (let i = 0; i < fieldsWithValues.length; i++) {
      const fieldName = fieldsWithValues[i];
      let alias = props.fields[layername].find(
        (field) => field.name == fieldName
      ).alias;
      let valueAfter;
      valueAfter = land.newMainData[fieldName];
      displayFields.push({
        after: valueAfter?valueAfter:"بدون",
        name: alias,
      });
    }
    return displayFields.map((item, index) => (
      <tr key={index}>
        <td>{item.after}</td>
        <td>{item.name}</td>
      </tr>
    ));
  };
  let getAliasOfField = (fieldName, layername) => {
    layername = layername.toLocaleLowerCase();
    let alias = props.fields[layername].find((field) => field.name == fieldName)
      .alias;
    return alias;
  };

  return (
    <div>
      <Table striped responsive className="lastStepTable">
        <thead>
          <tr className="resultsHeader">
            <th>التعديل</th>
            <th className="landNum">رقم الأرض</th>
          </tr>
        </thead>
        <tbody className="lastStepBody">
          {shownData.map((land, index) => (
            <tr key={index}>
              <td>
                <Table striped responsive className="lastStepTable">
                  <thead>
                    <tr
                      style={{ backgroundColor: "#fff" }}
                      className="resultsHeader"
                    >
                      <th> بعد</th>
                      <th>الحقل </th>
                    </tr>
                  </thead>
                  <tbody className="">
                    {displayMainFields(land)}
                    {land.newMainData &&
                      Object.entries(land.newMainData).map((f) => {
                        if (
                          ![
                            "PARCEL_PLAN_NO",
                            "MUNICIPALITY_NAME",
                            "DISTRICT_NAME",
                            "PLAN_NO",
                            "SITE_LAT_COORD",
                            "SITE_LONG_COORD",
                            "SITE_XUTM_COORD",
                            "SITE_YUTM_COORD",
                            "SITE_GEOSPATIAL_ID",
                            "OBJECTID"
                          ].includes(f[0])
                        )
                          return (
                            <tr key={f[0]}>
                              <td>
                                {f[1]
                                  ? getDomainName(land.layername, f[0], f[1]) //f[0]=field name, f[1]= value
                                      .value
                                  : "بدون"}
                              </td>

                              <td>{getAliasOfField(f[0], land.layername)}</td>
                            </tr>
                          );
                        else return null;
                      })}
                    {(land.tableData&&(land.tableData.newData))
                      ? Object.entries(land.tableData.newData).map((f) => {
                        if(["OBJECTID"].includes(f[0])) return 
                        else
                          return (
                            <tr key={f[0]}>
                              <td>
                                {f[1]
                                  ? getDomainName(
                                      land.tableData.tblName,
                                      f[0],
                                      f[1]
                                    ).value
                                  : "بدون"}
                              </td>

                              <td>
                                {getAliasOfField(f[0], land.tableData.tblName)}
                              </td>
                            </tr>
                          );
                        })
                      : null}
                  </tbody>
                </Table>
              </td>
              <td className="landNum">
                {land.newMainData &&
                Object.entries(land.newMainData).find(
                  (f) => f[0] === "PARCEL_PLAN_NO"
                ) &&
                !["" || null || "<NULL>"].includes(
                  land.newMainData.PARCEL_PLAN_NO
                )
                  ? land.newMainData.PARCEL_PLAN_NO
                  :land.newMainData.PLAN_NO?land.newMainData.PLAN_NO: "لا يوجد"}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

const mapStateToProps = ({ mapUpdate }) => {
  const { fields, currentUser, tableSettings, multiSelectActive } = mapUpdate;
  let result = []
  if(tableSettings)
  result = tableSettings.result;

  return {
    fields,
    currentUser,
    result,
    multiSelectActive,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    clearTableData: () => dispatch({ type: "CLEAR_RESULT_TABLE_DATA_SET" }),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FinalStepAddLocFromParcelsTable);

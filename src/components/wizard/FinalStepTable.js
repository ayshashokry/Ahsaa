import moment from "moment-hijri";

import React, { useState } from "react";
import { Table, Container, Modal } from "react-bootstrap";
import { connect } from "react-redux";
import { getLayerIndex } from "../common/mapviewer";

function FinalStepTable(props) {
  let getDomainName = (layername, fieldname, code) => {
    console.log( fieldname, code);
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
      let domainValues = getDomainName(layername, field, land.mainData[field]);
      displayFields.push({
        after: domainValues.value,
        before: domainValues.value,
        name: domainValues.alias,
      });
    }
    //check this by adding polygons and ad boards in the same table 
    let fieldsWithValues =
      land.layername.toUpperCase() == "ADVERTISING_BOARDS"
        ? ["PLAN_NO"]
        : ["PARCEL_PLAN_NO", "PLAN_NO"];
    for (let i = 0; i < fieldsWithValues.length; i++) {
      const fieldName = fieldsWithValues[i];
      let alias = props.fields[layername].find(
        (field) => field.name == fieldName
      ).alias;
      let valueAfter;
      //in case of there is a change in Parcel Plan No
      if (
        fieldName === "PARCEL_PLAN_NO"&&land.newMainData &&
        land.newMainData.find((item) => item.name === "PARCEL_PLAN_NO")
      ) {
        valueAfter = land.newMainData.find(
          (item) => item.name === "PARCEL_PLAN_NO"
        ).after;
      }
      let value = land.mainData[fieldName]?land.mainData[fieldName]:"لا يوجد";
      displayFields.push({
        after: valueAfter ? valueAfter : value,
        before: value,
        name: alias,
      });
    }
    return displayFields.map((item, index) =>{ 
      return(
      <tr key={index}>
        <td>{item.after}</td>
        <td>{item.before}</td>
        <td>{item.name}</td>
      </tr>
    )});
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
          {props.shownData.map((land, index) => (
            <tr key={index}>
              <td>
                <Table striped responsive className="lastStepTable">
                  <thead>
                    <tr
                      style={{ backgroundColor: "#fff" }}
                      className="resultsHeader"
                    >
                      <th> بعد</th>
                      <th>قبل </th> <th>الحقل </th>
                    </tr>
                  </thead>
                  <tbody className="">
                    {displayMainFields(land)}
                    {land.newMainData &&
                      land.newMainData.map((f) => {
                        if(["OBJECTID"].includes(f.name)) return 
                        if (f.name !== "PARCEL_PLAN_NO")
                          return (
                            <tr key={f.name}>
                              <td>
                                {f.after
                                  ? getDomainName(
                                      land.layername,
                                      f.name,
                                      f.after
                                    ).value
                                  : "بدون"}
                              </td>
                              <td>
                                {f.before
                                  ? getDomainName(
                                      land.layername,
                                      f.name,
                                      f.before
                                    ).value
                                  : "بدون"}
                              </td>{" "}
                              <td>{getAliasOfField(f.name, land.layername)}</td>
                            </tr>
                          );
                        else return null;
                      })}
                    {land.tableData
                      ? land.tableData.newData.map((f) => {
                        if(["OBJECTID"].includes(f.name)) return 
                        if(f.name==="GROUP_BOARD_PERPDATE")
                        return(
                          <tr key={f.name}>
                            <td>
                              {moment(f.after).format('iYYYY/iM/iD')
                                ? moment(getDomainName(
                                    land.tableData.tblName,
                                    f.name,
                                    f.after
                                  ).value).format('iYYYY/iM/iD')
                                : "بدون"}
                            </td>
                            <td>
                              {moment(f.before).format('iYYYY/iM/iD')
                                ? moment(getDomainName(
                                    land.tableData.tblName,
                                    f.name,
                                    f.before
                                  ).value).format('iYYYY/iM/iD')
                                : "بدون"}
                            </td>{" "}
                            <td>
                              {getAliasOfField(f.name, land.tableData.tblName)}
                            </td>
                          </tr>
                        )
                      else {
                        return(
                          <tr key={f.name}>
                            <td>
                              {f.after
                                ? getDomainName(
                                    land.tableData.tblName,
                                    f.name,
                                    f.after
                                  ).value
                                : "بدون"}
                            </td>
                            <td>
                              {f.before
                                ? getDomainName(
                                    land.tableData.tblName,
                                    f.name,
                                    f.before
                                  ).value
                                : "بدون"}
                            </td>{" "}
                            <td>
                              {getAliasOfField(f.name, land.tableData.tblName)}
                            </td>
                          </tr>
                        )
                      }})
                      : null}
                  </tbody>
                </Table>
              </td>
              <td className="landNum">
                {(land.newMainData&&land.newMainData.find((f) => f.name === "PARCEL_PLAN_NO"))
                  ? land.newMainData.PARCEL_PLAN_NO
                  : 
                  land.mainData.PARCEL_PLAN_NO
                  ? land.mainData.PARCEL_PLAN_NO
                  : 
                  ((land.newMainData&&land.newMainData.find((f) => f.name === "PLAN_NO"))
                  &&
                  land.newMainData.PLAN_NO)
                  ? land.newMainData.PLAN_NO
                  :
                  
                  ((land.mainData&&Object.keys(land.mainData).find((f) => f === "PLAN_NO"))
                  &&land.mainData.PLAN_NO)
                  ?land.mainData.PLAN_NO:
                  "لا يوجد"}
                  
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

  let difference1 = (obj1, obj2) => {
    let keyFound = [];
    if (obj1)
      Object.entries(obj1).forEach((item) => {
        if (obj1[item[0]] !== obj2[item[0]]) {
          let oldValue = obj2[item[0]];
          keyFound.push({
            name: item[0],
            after: item[1],
            before: oldValue,
          });
        }
      });
    return keyFound.length ? keyFound : -1;
  };
  let shownData = result.map((land) => {
    let data = {};
    data.mainData = land.fieldsBeforeEdit;
    if (difference1(land.fieldsForEdit, land.fieldsBeforeEdit) != -1)
      data.newMainData = difference1(land.fieldsForEdit, land.fieldsBeforeEdit);
    else data.newMainData = null;
    if (getLayerIndex(land.layername) == getLayerIndex("Invest_Site_Polygon")) {
      switch (land.fieldsForEdit.SITE_SUBTYPE) {
        case 1:
          //buildings
          if (
            difference1(
              land.buildingDataAfter,
              land.buildingDataBefore ? land.buildingDataBefore : {}
            ) != -1
          )
            data.tableData = {
              newData: difference1(
                land.buildingDataAfter,
                land.buildingDataBefore ? land.buildingDataBefore : {}
              ),
              tblName: "TBL_BUILDING_DATA",
            };
          else data.tableData = null;

          break;
        case 2:
          //ad boards
          //
          if (
            difference1(
              land.adBoardsDataAfter,
              land.adBoardsDataBefore ? land.adBoardsDataBefore : {}
            ) != -1
          )
            data.tableData = {
              newData: difference1(
                land.adBoardsDataAfter,
                land.adBoardsDataBefore ? land.adBoardsDataBefore : {}
              ),
              tblName: "TBL_BOARDS_GROUP",
            };
          else data.tableData = null;
          break;
        case 3:
          //mobile towers
          if (
            difference1(
              land.towerDataAfter,
              land.towerDataBefore ? land.towerDataBefore : {}
            ) != -1
          )
            data.tableData = {
              newData: difference1(
                land.towerDataAfter,
                land.towerDataBefore ? land.towerDataBefore : {}
              ),
              tblName: "TBL_TOWERS",
            };
          else data.tableData = null;
          break;
        case 5:
          //elec stations
          if (
            difference1(
              land.elecStationDataAfter,
              land.elecStationDataBefore ? land.elecStationDataBefore : {}
            ) != -1
          )
            data.tableData = {
              newData: difference1(
                land.elecStationDataAfter,
                land.elecStationDataBefore ? land.elecStationDataBefore : {}
              ),
              tblName: "TBL_ELEC_STATION",
            };
          else data.tableData = null;
          break;
        case 6:
          //atm
          if (
            difference1(
              land.atmDataAfter,
              land.atmDataBefore ? land.atmDataBefore : {}
            ) != -1
          )
            data.tableData = {
              newData: difference1(
                land.atmDataAfter,
                land.atmDataBefore ? land.atmDataBefore : {}
              ),
              tblName: "TBL_ATM",
            };
          else data.tableData = null;
          break;
        default:
          break;
      }
    } else {
      if (
        difference1(
          land.adBoardsDataAfter,
          land.adBoardsDataBefore ? land.adBoardsDataBefore : {}
        ) != -1
      )
        data.tableData = {
          newData: difference1(
            land.adBoardsDataAfter,
            land.adBoardsDataBefore ? land.adBoardsDataBefore : {}
          ),
          tblName: "TBL_BOARDS_GROUP",
        };
      else data.tableData = null;
    }
    data.layername = land.layername;
    return data;
  });
  return {
    fields,
    currentUser,
    tableSettings,
    shownData,
    multiSelectActive,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    clearTableData: () => dispatch({ type: "CLEAR_RESULT_TABLE_DATA_SET" }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FinalStepTable);

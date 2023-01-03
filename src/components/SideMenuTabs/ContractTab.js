import React, { useState } from "react";
import {
  INVESTOR_DATA,
  CONTRACTS_MAIN_DATA,
  CONTRACT_INSTALLMENT_DATA,
} from "./helpers/ContractTabsFields";
function ContractTab(props) {
  const { shownData, dataTypeName, user } = props;
  const [displayedData] = useState(() => {
    return dataTypeName === "contractMainData"
      ? CONTRACTS_MAIN_DATA.filter(
          (item) =>
            item.permissions.includes(user.user_type_id) ||
            item.groupPermissions.find((item) =>
              user.groups?.map((i) => i.id).includes(item)
            )||item.fieldName==="CONTRACT_FILE"
        )
      : dataTypeName === "investorData"
      ? INVESTOR_DATA.filter(
          (item) =>
            item.permissions.includes(user.user_type_id) ||
            item.groupPermissions.find((item) =>
              user.groups?.map((i) => i.id).includes(item)
            )
        )
      : CONTRACT_INSTALLMENT_DATA.filter(
          (item) =>
            item.permissions.includes(user.user_type_id) ||
            item.groupPermissions.find((item) =>
              user.groups?.map((i) => i.id).includes(item)
            )
        );
  });
  if (shownData && dataTypeName === "contractInstallmentData")
    return shownData.length ? (
      shownData.map((installData) =>
        displayedData.map((item, index) => (
          <>
            <tr
              key={index + "a"}
              style={{
                borderBottom: index == displayedData.length - 1 ? "solid" : "",
              }}
            >
              <td>
                {!installData[item.fieldName] ||
                installData[item.fieldName].toString().toLowerCase() ===
                  "null" ||
                installData[item.fieldName].toString().trim() == ""
                  ? "بدون"
                  : item.fieldName === "PAYFLG"
                  ? installData[item.fieldName] == 0
                    ? "غير مسدد"
                    : "مسدد"
                  : installData[item.fieldName]}{" "}
              </td>

              <th key={index + "cont"}>{item.alias}</th>
            </tr>
          </>
        ))
      )
    ) : (
      <div style={{ textAlign: "center" }} className="m-5">
        <h5>لا يوجد بيانات </h5>
      </div>
    );
  else if (shownData)
    return displayedData.length ? (
      displayedData.map((item, index) => (
        <>
          <tr key={index + "a"}>
            <td>
              {item.fieldName==="CONTRACT_FILE"?
                  <span style={{color:'blue', cursor:'pointer'}} title="تحميل الملف" onClick={()=>{
      let contractUrl = `${window.API_FILES_URL}contracts/${shownData['SITE_GEOSPATIAL_ID']}.pdf`
                    window.open(contractUrl, "_blank");

                  }}>تحميل ملف العقد</span>
                  // <a href={`${window.API_FILES_URL}contracts/${shownData['SITE_GEOSPATIAL_ID']}.pdf`} download="contract">تحميل مرفق العقد</a>
                  :!shownData[item.fieldName] ||
              shownData[item.fieldName].toString().toLowerCase() === "null" ||
              shownData[item.fieldName].toString().trim() == ""
                ? "بدون"
                : shownData[item.fieldName]}{" "}
            </td>

            <th key={index + "cont"}>{item.alias}</th>
          </tr>
        </>
      ))
    ) : (
      <div style={{ textAlign: "center" }} className="m-5">
        <h5>لا يوجد بيانات </h5>
      </div>
    );
  else
    return (
      <div style={{ textAlign: "center" }} className="m-5">
        <h5>لا يوجد بيانات للعرض</h5>
      </div>
    );
}

export default ContractTab;

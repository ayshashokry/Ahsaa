import React, { useState, useEffect } from "react";
import { Table } from "react-bootstrap";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { Tooltip, Button } from "antd";
import axios from "axios";

import { connect } from "react-redux";
import ContractTab from "../../SideMenuTabs/ContractTab";
//contracts icons
import ContractIcon from "../../../assets/images/contractIcon.svg";
import ContractInstallIcon from "../../../assets/images/contractInstallment.svg";

function ContractResultDetails(props) {
  const [selectedTab, setSelectedTab] = useState(0);
  // const [shownData, setShownData] = useState(props?.showData);
  const [contractInfo, setContractInfo] = useState({
    data: props?.shownData,
    contract_id: props?.shownData?.CONTRACT_ID,
    installmentData: [],
  });

  const fetchContractInstallment = async (contractId) => {
    try{
    props.openLoader();
    let contractInstallment = await axios.get(
      window.API_URL +
        `contract-installment?contract_id=${contractInfo.contract_id}`,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${props.user.token}`,
        },
      }
    );
    setContractInfo({
      ...contractInfo,
      installmentData: contractInstallment?.data,
    });
    props.closeLoader();
  }catch(err){
    console.log(err);
    props.closeLoader();
  }
  };
  return (
    <div className="generalResultDetails">
      <Tabs
        defaultFocus={false}
        selectedIndex={selectedTab}
        onSelect={(x) => setSelectedTab(x)}
      >
        <TabList>
          {props.shownData ? (
            <>
              <Tab>
                <Tooltip title={"بيانات العقود"} placement="top">
                  <Button className="tooltipButton">
                    <img
                      src={ContractIcon}
                      alt="contract icon"
                      className="svg"
                      style={{
                        width: "25px",
                        height: "25px",
                      }}
                    />
                  </Button>
                </Tooltip>
              </Tab>

              <Tab>
                <Tooltip title={"بيانات استحقاقات العقد"} placement="top">
                  <Button
                    className="tooltipButton"
                    onClick={() => {
                      contractInfo.contract_id &&
                        fetchContractInstallment(contractInfo.contract_id);
                    }}
                  >
                    <img
                      src={ContractInstallIcon}
                      alt="contract install icon"
                      className="svg"
                      style={{
                        width: "25px",
                        height: "25px",
                      }}
                    />
                  </Button>
                </Tooltip>
              </Tab>
            </>
          ) : null}
        </TabList>

        {/**Contract info tab */}
        {
          <>
            <TabPanel>
              <Table striped responsive hover className="mt-2">
                <ContractTab
                  shownData={contractInfo.data}
                  dataTypeName={"contractMainData"}
                  user={props.user}
                />
              </Table>
            </TabPanel>

            {/**************** */}
            {/**Contract installment info tab */}
            <TabPanel>
              <Table striped responsive hover className="mt-2">
                <ContractTab
                  shownData={contractInfo.installmentData}
                  dataTypeName={"contractInstallmentData"}
                  user={props.user}
                />
              </Table>
            </TabPanel>
            {/**************** */}
          </>
        }
      </Tabs>
    </div>
  );
}
const mapStateToProps = ({ mapUpdate }) => {
  return {
    actions: mapUpdate.tableSettings?.actions,
    fields: mapUpdate.fields,
    selectedFeatureOnSearchTable: mapUpdate.selectedFeatureOnSearchTable,
    user: mapUpdate?.auth?.user,
  };
};
export default connect(mapStateToProps)(ContractResultDetails);

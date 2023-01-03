import React, { useState,useEffect } from "react";
import { Table } from "react-bootstrap";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip, Button } from "antd";
import axios from "axios";

import {
  // faBorderAll,
  // faBuilding,
  // faFilePdf,
  faInfo,
  // faSearchPlus,
  // faSitemap,
} from "@fortawesome/free-solid-svg-icons";
// import { faGoogle } from "@fortawesome/free-brands-svg-icons";
// import { faFile } from "@fortawesome/free-regular-svg-icons";
import { connect } from "react-redux";
// import RemarksSuggestMainTable from "../../Tables/RemarksSuggestionTable/RemarksSuggestMainTable";
// import SearchResultTable from "../../Tables/SearchResultTable";
import SiteMainDetaillsTab from "../../SideMenuTabs/SiteMainDetaillsTab";
import RemarksSuggestionTab from "../../SideMenuTabs/RemarksSuggestionTab";
import BorderFromFieldTab from "../../SideMenuTabs/BorderFromFieldTab";
import BorderFromPlanTab from "../../SideMenuTabs/BorderFromPlanTab";
import ADGroubTab from "../../SideMenuTabs/ADGroubTab";
import AtmTab from "../../SideMenuTabs/AtmTab";
import BuildingDataContentTab from "../../SideMenuTabs/BuildingDataContentTab";
import BuildingDetailsTab from "../../SideMenuTabs/BuildingDetailsTab";
import TowerTab from "../../SideMenuTabs/TowerTab";
import ElecStationTab from "../../SideMenuTabs/ElecStationTab";
import CoordinatesDetailsTab from "../../SideMenuTabs/CoordinatesDetailsTab";
import RemarkDataEntryTab from "../../SideMenuTabs/RemarkDataEntryTab";
import BuildingImageTab from "../../SideMenuTabs/BuildingImageTab";
import SuggestionDataEntryTab from "../../SideMenuTabs/SuggestionDataEntryTab";
import ContractTab from '../../SideMenuTabs/ContractTab';
//contracts icons
import ContractIcon from '../../../assets/images/contractIcon.svg'
import ContractInstallIcon from '../../../assets/images/contractInstallment.svg'
import InvestorIcon from '../../../assets/images/investorIcon.svg'
function SearchResultDetails(props) {
  const [selectedTab, setSelectedTab] = useState(0);
  const [shownData, setShownData] = useState(props?.showData);
  const [iconsData] = useState(
    props?.actions
    );
  const [contractInfo, setContractInfo] = useState({
    data:undefined,
    contract_id:'',
    installmentData:[]
  })
  useEffect(()=>{
    console.log(props?.showData);
    if(props?.showData?.feature?.attributes?.SITE_STATUS===4){
      let geoSpatialID = props.showData.feature.attributes.SITE_GEOSPATIAL_ID;
      props.openLoader();
      fetchContractInfo(geoSpatialID)
    }
  },[])
  const fetchContractInfo =async(geoSpatialID)=>{
    try{
    let contractInfo = await axios.get(window.API_URL+`contract-info?spatial_id=${geoSpatialID}`,{
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${props.user.token}`,
      },
    })
    let contract_id = contractInfo?.data[0]?.CONTRACT_ID;
    setContractInfo({
      data:contractInfo?.data[0],
      contract_id
    })
    props.closeLoader();
  }catch(err){
    console.log(err);
    props.closeLoader();
  }
  };
  const fetchContractInstallment = async(contractId)=>{
    try{

      props.openLoader();
      let contractInstallment = await axios.get(window.API_URL+`contract-installment?contract_id=${contractInfo.contract_id}`,{
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${props.user.token}`,
      },
    });
    setContractInfo({
      ...contractInfo, 
      installmentData:contractInstallment?.data
    })
    props.closeLoader();
  }catch(err){
    console.log(err);
    props.closeLoader();
  }
  }
  return (
    <div className="generalResultDetails">
      <Tabs
        defaultFocus={false}
        selectedIndex={selectedTab}
        onSelect={(x) => setSelectedTab(x)}
      >
        <TabList>
          <Tab>
            <Tooltip title={"النتائج"} placement="top">
              <Button className="tooltipButton">
                <FontAwesomeIcon
                  icon={faInfo}
                  style={{
                    cursor: "pointer",
                  }}
                />
              </Button>
            </Tooltip>
          </Tab>
          { shownData?.feature?.attributes?.SITE_STATUS===4?(
            <>
                      <Tab>
            <Tooltip title={"بيانات العقود"} placement="top">
              <Button className="tooltipButton">
              <img
              src={ContractIcon}
              alt="contract icon"
              className='svg'
              style={{
                width: "25px",
                height: "25px",
              }}
            />
              </Button>
            </Tooltip>
          </Tab>
          {(props.user.groups
                              ?.map((g) => g.id)
                              .includes(6))&&<Tab>
            <Tooltip title={"بيانات المستثمر"} placement="top">
              <Button className="tooltipButton">
              <img
              src={InvestorIcon}
              className='svg'
              alt="investor icon"
              style={{
                width: "25px",
                height: "25px",
              }}
            />
              </Button>
            </Tooltip>
          </Tab>}
          <Tab>
            <Tooltip title={"بيانات استحقاقات العقد"} placement="top">
              <Button className="tooltipButton" onClick={()=>{
                contractInfo.contract_id&&fetchContractInstallment(contractInfo.contract_id)
                }}>
              <img
              src={ContractInstallIcon}
              alt="contract install icon"
              className='svg'
              style={{
                width: "25px",
                height: "25px",
              }}
            />
              </Button>
            </Tooltip>
          </Tab>
            </>
          ):null  }
          {iconsData.map((ic, index) => {
            if (
              ic.canRender &&
              ic.canRender(shownData.feature, shownData.layername)
            ) {
              return (
                <Tab>
                  <Tooltip
                    title={
                      typeof ic.alias == "string"
                        ? ic.alias
                        : ic.alias(shownData.feature)
                    }
                    placement="top"
                  >
                    <span
                      className="btn tooltipButton"
                      onClick={() =>
                        ic.action(shownData.feature, shownData.layername)
                      }
                    >
                      {ic.icon}
                    </span>
                  </Tooltip>
                </Tab>
              );
            }else return null
          })}
        </TabList>
        <TabPanel>
          <Table striped responsive hover className="mt-2">
            {shownData && (
              <SiteMainDetaillsTab selectedFeatureOnSearchTable={shownData} tabName={"mainData"} />
            )}
          </Table>
        </TabPanel>
        {/**Contract info tab */}
       {
         shownData?.feature?.attributes?.SITE_STATUS===4 ?<> 
       <TabPanel>
          <Table striped responsive hover className="mt-2">
            <ContractTab  
            shownData={contractInfo.data}
            dataTypeName={'contractMainData'}
            user={props.user}
            />
          </Table>
        </TabPanel>
        {/**************** */}
         {/**investor info tab */}
         {(props.user.groups
                              ?.map((g) => g.id)
                              .includes(6))&&<TabPanel>
          <Table striped responsive hover className="mt-2">
          <ContractTab  
            shownData={contractInfo.data}
            dataTypeName={'investorData'}
            user={props.user}
            />
          </Table>
        </TabPanel>}
        {/**************** */}
         {/**Contract installment info tab */}
         <TabPanel>
          <Table striped responsive hover className="mt-2">
          <ContractTab  
            shownData={contractInfo.installmentData}
            dataTypeName={'contractInstallmentData'}
            user={props.user}
            />
          </Table>
        </TabPanel>
        {/**************** */}
        </>:null}
        {iconsData.map((icon, index) => {
           if (
            icon.canRender &&
            icon.canRender(shownData.feature, shownData.layername)
          ) {
            if (
              icon.name === "bordersFromField" &&
              props?.selectedFeatureOnSearchTable?.name === "Border_Field_Info"
            )
              return (
                <TabPanel>
                  <Table striped responsive hover className="mt-2">
                    <BorderFromFieldTab
                      selectedFeatureOnSearchTable={
                        props.selectedFeatureOnSearchTable
                      }
                      tabName={"bordersFromField"}
                    />
                  </Table>
                </TabPanel>
              );
            else if (
              icon.name === "bordersFromPlan" &&
              props?.selectedFeatureOnSearchTable?.name === "Border_Plan_Info"
            ) {
              return (
                <TabPanel>
                  <Table striped responsive hover className="mt-2">
                    <BorderFromPlanTab
                      selectedFeatureOnSearchTable={
                        props.selectedFeatureOnSearchTable
                      }
                      tabName={"bordersFromPlan"}
                    />
                  </Table>
                </TabPanel>
              );
            } else if (icon.name === "AD borders") {
              return (
                <TabPanel>
                  <Table striped responsive hover className="mt-2">
                    <ADGroubTab
                      selectedFeatureOnSearchTable={
                        props.selectedFeatureOnSearchTable
                      }
                      tabName="AD borders"
                    />
                  </Table>
                </TabPanel>
              );
            } else if (icon.name === "atmInfo") {
              return (
                <TabPanel>
                  <Table striped responsive hover className="mt-2">
                    <AtmTab
                      selectedFeatureOnSearchTable={
                        props.selectedFeatureOnSearchTable
                      }
                      tabName="atmInfo"
                    />
                  </Table>
                </TabPanel>
              );
            } else if (icon.name === "BuildingDataInfo") {
              return (
                <TabPanel>
                  <Table striped responsive hover className="mt-2">
                    <BuildingDataContentTab
                      selectedFeatureOnSearchTable={
                        props.selectedFeatureOnSearchTable
                      }
                      tabName="BuildingDataInfo"
                    />
                  </Table>
                </TabPanel>
              );
            } else if (icon.name === "BuildingDetailsInfo") {
              return (
                <TabPanel>
                  <Table striped responsive hover className="mt-2">
                    <BuildingDetailsTab
                      selectedFeatureOnSearchTable={
                        props.selectedFeatureOnSearchTable
                      }
                      tabName="BuildingDetailsInfo"
                    />
                  </Table>
                </TabPanel>
              );
            } else if (icon.name === "BuildingImages") {
              //ask how to display it
              return (
                <TabPanel>
                  <Table striped responsive hover className="mt-2">
                    <BuildingImageTab
                      selectedFeatureOnSearchTable={
                        props.selectedFeatureOnSearchTable
                      }
                      tabName="BuildingImages"
                    />
                  </Table>
                </TabPanel>
              );
            } else if (icon.name === "towers info") {
              return (
                <TabPanel>
                  <Table striped responsive hover className="mt-2">
                    <TowerTab
                      selectedFeatureOnSearchTable={
                        props.selectedFeatureOnSearchTable
                      }
                      tabName="towers info"
                    />
                  </Table>
                </TabPanel>
              );
            } else if (icon.name === "elec stations info") {
              return (
                <TabPanel>
                  <Table striped responsive hover className="mt-2">
                    <ElecStationTab
                      selectedFeatureOnSearchTable={
                        props.selectedFeatureOnSearchTable
                      }
                    />
                  </Table>
                </TabPanel>
              );
            } else if (icon.name === "coordinates info") {
              return (
                <TabPanel>
                  <Table striped responsive hover className="mt-2">
                    <CoordinatesDetailsTab
                      selectedFeatureOnSearchTable={
                        props.selectedFeatureOnSearchTable
                      }
                      tabName="coordinates info"
                    />
                  </Table>
                </TabPanel>
              );
            } else if (
              typeof icon.name == "string" &&
              ["zoom", "OpenInGoogle"].includes(icon.name)
            ) {
              //it is for data entry form of remark, suggetions + zoom icon + open in google icon
              return (
                <TabPanel>
                  <Table striped responsive hover className="mt-2">
                    {shownData && (
                      <SiteMainDetaillsTab
                        selectedFeatureOnSearchTable={shownData}
                        tabName={"mainData"}
                      />
                    )}
                  </Table>
                </TabPanel>
              );
            } else if (
              typeof icon.name == "function" &&
              shownData.layername.toLocaleLowerCase() === "invest_site_polygon" &&
              ["suggestion", "remark"].includes(icon.name(shownData.feature))
            ) {
              return (
                <TabPanel>
                  {<h3 style={{textAlign:'center'}}> {icon.alias(shownData.feature)}</h3>}
                  <Table striped responsive hover className="mt-2">
                  {icon.name(shownData.feature)==="remark"?
                  <RemarkDataEntryTab 
                  tabName={"remark"}
                  openLoader={props.openLoader}
                  closeLoader={props.closeLoader}
                  />:
                  <SuggestionDataEntryTab 
                  tabName={"suggestion"} 
                  openLoader={props.openLoader}
                  closeLoader={props.closeLoader}
                  />
                  }
                  </Table>
                </TabPanel>
              );
            } if (
              typeof icon.name == "function" &&
              shownData.layername.toLocaleLowerCase() === "invest_site_polygon" &&
              ["showAllsuggestions", "showAllremarks"].includes(
                icon.name(shownData.feature)
              )
            ) {
              return (
                <TabPanel>
                    <RemarksSuggestionTab tabName={icon.name(shownData.feature)} />
                </TabPanel>
              );
            } 
            else
              return (
                <TabPanel>
                  <Table striped responsive hover className="mt-2">
                    {shownData && (
                      <SiteMainDetaillsTab
                        selectedFeatureOnSearchTable={shownData}
                      />
                    )}
                  </Table>
                </TabPanel>
              );
          }else return null
        })}
      </Tabs>
    </div>
  );
}
const mapStateToProps = ({ mapUpdate }) => {
  return {
    actions: mapUpdate.tableSettings?.actions,
    fields: mapUpdate.fields,
    selectedFeatureOnSearchTable: mapUpdate.selectedFeatureOnSearchTable,
    user:mapUpdate?.auth?.user
  };
};
export default connect(mapStateToProps)(SearchResultDetails);

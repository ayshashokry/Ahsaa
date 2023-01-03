import React, {useEffect,useState } from "react";
import axios from 'axios';
import Loader from "../loader";
import ContractResultDetails from "./ContractsResults/ContractResultDetails";
import ContractResultMenu from "./ContractsResults/ContractResultMenu";

function MyContractedSites(props) {
  const [contractedSites, setContractedSites] = useState(undefined);
  const [selectedSite, setSelectedSite] = useState(undefined);
  useEffect(() => {
      //fetch contracts of investor
    let rentId = props.user.name;
      fetchContractInfo(rentId)
    

    return () => {
      setContractedSites(undefined);
      setSelectedSite(undefined);
    };
  }, []);
  const fetchContractInfo =async(investorID)=>{
    try{
    let contractInfo = await axios.get(window.API_URL+`contract-info?rent_id=${investorID}`,{
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${props.user.token}`,
      },
    })
    setContractedSites(contractInfo?.data);
    
  }catch(err){
    setContractedSites({})
  }
  // let contract_id = contractInfo?.data[0]?.CONTRACT_ID;
    // setContractInfo({
    //   data:contractInfo?.data[0],
    //   contract_id
    // })
    // props.closeLoader();

  };
  const handleClickOnMenuTab =(data)=>{
    setSelectedSite(data);
  }

  if (!contractedSites) return <Loader />;
  else if(Object.keys(contractedSites).length)
    return (
      <>
        <div className="searchStepsWizard ">
          <nav class="breadcrumbs">
            {selectedSite ? (
              <li
                className={
                    selectedSite
                    ? "breadcrumbs__item breadcrumbs__itemActive third"
                    : "breadcrumbs__item third"
                }
              >
                النتائج
              </li>
            ) : null}
            {contractedSites?.length ? (
              <li
                onClick={()=>handleClickOnMenuTab()}
                className={
                  !selectedSite
                    ? "breadcrumbs__item breadcrumbs__itemActive second"
                    : "breadcrumbs__item second"
                }
              >
                القائمة
              </li>
            ) : null}
          </nav>
        </div>

        {(contractedSites?.length&&!selectedSite) ? (
          <ContractResultMenu
            menuData = {contractedSites}
            routeName={props.routeName}
            OpenResultdetails={handleClickOnMenuTab}
            openLoader={props.openLoader}
            closeLoader={props.closeLoader}
          />
        ): contractedSites.length===0?
        <div className="text-center">
        <h3>لا توجد عقود مسجلة</h3 >
        </div>
        
        
        : selectedSite ? (
          <ContractResultDetails
            // OpenSearchInputs={setDblClickOnMapInputs}
            OpenResultMenu={handleClickOnMenuTab}
            shownData={selectedSite}
            openLoader={props.openLoader}
            closeLoader={props.closeLoader}
          />
        ) : (
          <Loader />
        )}
      </>
    );
    else
    return (
      <div style={{ textAlign: "center" }} className="m-5">
        <h5>لا يوجد بيانات للعرض</h5>
      </div>
    );
}

export default MyContractedSites;

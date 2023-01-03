import React, { useState } from "react";
import { Tabs, Tab, Container, Table } from "react-bootstrap";
import { Dropdown, Menu, Form, Select, notification } from "antd";
import AtmForm from "./tabsForms/AtmForm";
import AdvertisingForm from "./tabsForms/AdvertisingForm";
import BuildingDataForm from "./tabsForms/BuildingDataForm";
import MobileTowerForm from "./tabsForms/MobileTowerForm";
import ElectricityStationForm from "./tabsForms/ElectricityStationForm";
// import LocationBordersPlanForm from "./tabsForms/LocationBordersPlanForm";
export default function LocationDataTabs(props) {
  const [key, setActiveKey] = useState("");
  const onSelect = (e) => {
    setActiveKey(e);
  };

  return (
    <div className="locationTabs ">
      {/* <Tabs defaultActiveKey="all" id="uncontrolled-tab-example">
        <Tab eventKey="atm" title="الصراف الالي">
          <AtmForm />
        </Tab>
        <Tab eventKey="advertising" title="المجموعات الاعلانية">
          <AdvertisingForm />
        </Tab>
        <Tab eventKey="building" title="بيانات المبني">
          <BuildingDataForm />
        </Tab>
       
        <Tab eventKey="locationBordersPlan" title=" حدود الموقع من المخطط">
        </Tab>
        <Tab eventKey="mobileTower" title="برج الجوال ">
          <MobileTowerForm />
        </Tab>
        <Tab eventKey="electricityStation" title="محطة الكهرباء">
          <ElectricityStationForm />
        </Tab>
      </Tabs> */}
    </div>
  );
}

import React, { useState } from "react";
import AdminContact from "./AdminContent/AdminContact";
import AdminPageContent from "./AdminContent/AdminPageContent";
import Users from "./AdminContent/Users";
import AdminNavBar from "./layout/AdminNavBar";
import AdminSideMenu from "./layout/AdminSideMenu";
import { Row, Col } from "antd";
import userIcon from "../../assets/images/usersIcon.png";
import ContactIcon from "../../assets/images/admincontact.png";
import JobsIcon from "../../assets/images/groupIcon.png";
import AdminJobs from "./AdminContent/AdminJobs";

export default function AdminMainPage(props) {
  const [sideOpened, setSideOpened] = useState(true);
  const [selectedLink, setSelectedLink] = useState(1);
  const [sideLinks] = useState([
    {
      id: 1,
      name: "المستخدمين",
      icon: userIcon,
      iconWidth: "40px",
      component: <Users />,
    },
    {
      id: 2,
      name: "الوظائف",
      icon: JobsIcon,
      iconWidth: "35px",
      component: <AdminJobs />,
    },
    {
      id: 3,
      name: "معلومات الاتصال",
      icon: ContactIcon,
      iconWidth: "40px",
      component: <AdminContact isAuth={props.isAuth} />,
    },
  ]);
  const openSideMenu = (e) => {
    setSideOpened(true);
  };
  const closeSideMenu = (e) => {
    setSideOpened(false);
  };

  const passSelectedLink = ({ item, key }) => {
    setSelectedLink(key);
  };
  return (
    <div className="adminMainPage">
      <AdminNavBar />
      <Row className="media_resolution">
        {" "}
        <Col
          xl={{ span: sideOpened ? 3 : 1 }}
          md={{ span: sideOpened ? 5 : 1 }}
          sm={{ span: sideOpened ? 5 : 1 }}
          xs={{ span: sideOpened ? 8 : 1 }}
          // style={{ width:sideOpened ? "100%" : "20px" }}
          className={
            sideOpened ? "sideMenuShown sideMenuu " : "sideMenuHidden sideMenuu"
          }
        >
          {!sideOpened ? (
            <i
              onClick={openSideMenu}
              className=" fas fa-chevron-left openSideMenuArrow "
            ></i>
          ) : null}
          <AdminSideMenu
            passSelectedLink={passSelectedLink}
            sideLinks={sideLinks}
            selectedLink={selectedLink}
            sideOpened={sideOpened}
          />
        </Col>{" "}
        <Col
          xl={{ span: sideOpened ? 21 : 23 }}
          md={{ span: sideOpened ? 19 : 23 }}
          sm={{ span: sideOpened ? 19 : 23 }}
          xs={{ span: sideOpened ? 16 : 23 }}
        >
          {!sideOpened ? null : (
            <i
              onClick={closeSideMenu}
              className="fas fa-chevron-right closeSideMenuArrow"
            ></i>
          )}
          <AdminPageContent sideLinks={sideLinks} selectedLink={selectedLink} />
        </Col>
      </Row>
    </div>
  );
}

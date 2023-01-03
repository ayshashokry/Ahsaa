import React, { useEffect, useState } from "react";
import { Row, Col } from "antd";
import axios from "axios";
import Loader from "../../loader/index";

import EditContact from "../modals/EditContact";

export default function AdminContact(props) {
  const [showEdit, setShowEdit] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [contactData, setContactData] = useState({});
  const getContactData = (contactData) => {
    setContactData(contactData);
  };
  const openEdit = () => {
    setShowEdit(true);
  };
  const closeeditmodal = () => {
    setShowEdit(false);
  };

  const handleUserInput = (e) => {
    setName(e.target.value);
  };
  const setEditLoading = (e) => {
    setLoading(e);
  };
  useEffect(() => {
    setLoading(true);
    props.isAuth&&
    axios
      .get(window.API_URL + "Contacts/GetAll", {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.userToken}`,
        },
      })
      .then((res) => {
        getContactData(res.data.results[0]);
        setContactData(res.data.results[0]);
        setLoading(false);
      });
  }, []);
  return (
    <>
      <div className="baladyaAdmin  adminContact">
        {loading ? <Loader /> : null}
        <i
          className="fas fa-wrench btn-edit text-left"
          style={{ padding: "10px" }}
          onClick={openEdit}
        ></i>
        <EditContact
          setEditLoading={setEditLoading}
          closeeditmodal={closeeditmodal}
          contactData={contactData}
          showEdit={showEdit}
          getContactData={getContactData}
          isAuth={props.isAuth}
        />
        <Row className="text-right">
          <Col span={24}>
            <h6>
              رقم الجوال: <span>{contactData.mobile}</span>
            </h6>
            <h6>
              رقم الهاتف: <span>{contactData.phone}</span>
            </h6>
            <h6>
              الفاكس: <span>{contactData.fax}</span>
            </h6>
            <h6>
              البريد الإلكتروني:
              <span>{contactData.mail !== null ? contactData.mail : "--"}</span>
            </h6>
            <h6>
              الموقع الإلكتروني:
              <span>{contactData.site !== null ? contactData.site : "--"}</span>
            </h6>
          </Col>
        </Row>
      </div>
    </>
  );
}

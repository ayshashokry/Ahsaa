import React, { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import axios from "axios";
import Loader from "../loader/index";

export default function CallUsModal(props) {
  const [loading, setLoading] = useState(false);
  const [contactData, setContactData] = useState({});

  useEffect(() => {
    setLoading(true);
    // props.isAuth&&
    axios
      .get(window.API_URL + "Contacts/GetAll", {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.userToken}`,
        },
      })
      .then((res) => {
        setContactData(res.data.results[0]);
        setLoading(false);
      });
  }, []);
  return (
    <Modal
      keyboard={false}
      onHide={props.closeCallUsModal}
      show={props.showCallUs}
      // backdrop="static"
      className="CallUsModal"
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      {loading ? <Loader /> : null}
      <Modal.Header>
        <Modal.Title id="contained-modal-title-vcenter">اتصل بنا</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="callNumbersDiv">
          <div className="callNumber">
            <p>
              {contactData.mobile}
              <i style={{ float: "right" }} className="fas fa-phone"></i>
            </p>
          </div>

          <div className="callNumber">
            <p>
              {contactData.fax}
              <i style={{ float: "right" }} className="fas fa-fax"></i>{" "}
            </p>
          </div>

          <div className="callNumber">
            <p>
              <a
                href="mailto:invest@alhasa.gov.sa"
                target="_blank"
                rel="noopener noreferrer"
              >
                {contactData.mail}
              </a>
              <i style={{ float: "right" }} className="fas fa-envelope"></i>{" "}
            </p>
          </div>

          <div className="callNumber">
            <p>
              <a href="https://alhasa.gov.sa/" target="_blank">
                {contactData.site}
                <i style={{ float: "right" }} className="fas fa-link"></i>{" "}
              </a>
            </p>
          </div>
        </div>
        <Button className="closeBtn" onClick={props.closeCallUsModal}>
          إغلاق
        </Button>
      </Modal.Body>
    </Modal>
  );
}

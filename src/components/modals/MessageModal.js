import React from "react";
import { Modal, Button } from "react-bootstrap";
import MessageForm from "../forms/MessageForm";
export default function MessageModal(props) {
  return (
    <Modal
      keyboard={false}
      onHide={props.closeMessageModal}
      show={props.showMessage}
      // backdrop="static"
      className="MessageModal"
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header>
        <Modal.Title id="contained-modal-title-vcenter">راسلنا</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <MessageForm onHide={props.closeMessageModal} />
      </Modal.Body>
    </Modal>
  );
}

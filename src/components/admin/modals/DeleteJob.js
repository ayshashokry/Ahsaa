import React from "react";
import { Button, Modal, Container } from "react-bootstrap";
import axios from "axios";

export default function DeleteJob(props) {
  return (
    <Modal
      keyboard={false}
      onHide={props.closeDelete}
      show={props.showDelete}
      backdrop="static"
      className="adminModal"
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Container fluid style={{ textAlign: "right", backgroundColor: "#fff" }}>
        <div>
          <h5 className="px-5 pt-4">
            <span>
              <i
                className="fas fa-times fa-1x"
                onClick={props.closeDelete}
                style={{
                  textAlign: "left",
                  float: "left",
                  cursor: "pointer",
                }}
              ></i>
            </span>
            هل أنت متأكد من حذف هذه الوظيفة؟
          </h5>
        </div>
        <hr />
        <Button className="cancelbtn" onClick={props.closeDelete}>
          لا
        </Button>
        <Button className="addbtn" id={props.id} onClick={props.onDelete}>
          نعم
        </Button>
      </Container>
    </Modal>
  );
}

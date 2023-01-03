import React from "react";
import { Modal, Button, Container } from "react-bootstrap";
function ConfirmationModal(props) {
  return (
    <Modal
      keyboard={false}
      onHide={props.handleCancelConfirmationModal}
      show={props.confirmationModalIsShow}
      backdrop="static"
      className="MessageModal"
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header>
        <Modal.Title id="contained-modal-title-vcenter">
          !!!! تنبيه{" "}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container className="MessageForm">
          <div className="ml-3 text-center">
            <div style={{ fontSize: "x-large" }}>
              النتائج الظاهرة أمامك سوف تُزال لكي تحدد من الخـريطـة
             
              <br></br>
              <br></br>
              <strong style={{ fontSize: "x-large" }}>
                هل أنت متأكد من هذه الخطوة ؟؟
              </strong>
              <br />
              <div style={{direction: 'rtl',fontSize: 'smaller',marginTop: '2em',display: 'flex',textAlign: 'right'}}>{['InvestmentReport', 'generalSearch','updateLocationInfo','addLocationCharts','addLocationCad'].includes(props.routeName)?
              '** ملحوظة: لاضافة مواقع استثمارية اضغط "إلغاء" ثم غيّر طريقة اختيار الموقع الاستثماري لـ (لتحديد من الخريطة مباشرة) ':null}</div>
            </div>
          </div>
        </Container>
      </Modal.Body>
      <Modal.Footer className="bg-light">
        <Button
          className="closeBtn"
          onClick={props.handleCancelConfirmationModal}
        >
          إلغاء
        </Button>
        <Button className="closeBtn" onClick={props.handleOkConfirmationModal}>
          موافق
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ConfirmationModal;

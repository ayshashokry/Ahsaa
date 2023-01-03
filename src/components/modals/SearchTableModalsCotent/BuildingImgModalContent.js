import { Component } from "react";
import { Carousel, Button, Modal, Row, Col } from "react-bootstrap";

class BuildingImgModalContent extends Component {
  render() {
    const { selectedFeatureOnSearchTable, closeModal } = this.props;
    const {
      feature: { attributes },
    } = selectedFeatureOnSearchTable;
    // const attributes = {
    //     IMAGE_URL:"https://wonderfulengineering.com/wp-content/uploads/2014/01/highway-wallpapers-15.jpg, https://wonderfulengineering.com/wp-content/uploads/2014/01/highway-wallpapers-15.jpg, https://wonderfulengineering.com/wp-content/uploads/2014/01/highway-wallpapers-15.jpg, https://wonderfulengineering.com/wp-content/uploads/2014/01/highway-wallpapers-15.jpg"
    // }

    let imgUrls = attributes["IMAGE_URL"]
      ? attributes["IMAGE_URL"].split(",")
      : [];

    return (
      <Modal
        backdrop="static"
        className="addTaskModal"
        show={selectedFeatureOnSearchTable != null}
        size="xl"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header>
          <Modal.Title id="contained-modal-title-vcenter">
            صور المبني
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {imgUrls.length ? (
            <Carousel>
              {imgUrls.map((img) => (
                <Carousel.Item interval={2000}>
                  <img
                    className="d-block w-100"
                    src={window.API_FILES_URL + img}
                    alt="First slide"
                  />
                </Carousel.Item>
              ))}
            </Carousel>
          ) : (
            <Row>
              <Col span={24} >

              <strong className="m-3" style={{fontSize:'18px', display:'flex', justifyContent:'center'}}>لا توجد صور متوفرة</strong>
              </Col>
            </Row>
          )}
          <Button
            onClick={() => closeModal()}
            className="addbtn mb-3"
            size="large"
            htmlType="submit"
          >
            موافق
          </Button>
        </Modal.Body>
      </Modal>
    );
  }
}

export default BuildingImgModalContent;

import React, { useEffect, useState } from "react";
import { Carousel, Button, Modal, Row, Col } from "react-bootstrap";

function BuildingImageTab(props) {
  const { selectedFeatureOnSearchTable, tabName } = props;
  const [imgUrls, setImgUrls] = useState([]);

  useEffect(() => {
    if (
      selectedFeatureOnSearchTable?.feature?.attributes &&
      tabName == "BuildingImages"
    ) {
      const {
        feature: { attributes },
      } = selectedFeatureOnSearchTable;

      let imgUrls = attributes["IMAGE_URL"]
        ? attributes["IMAGE_URL"].split(",")
        : [];
      setImgUrls(imgUrls);
    } else setImgUrls([]);
  }, [selectedFeatureOnSearchTable]);
  return (
    <>
      {imgUrls.length ? (
        <Carousel>
          {imgUrls.map((img) => {
            let imgSrc = img.split('&')[0];
            
            return(
            <Carousel.Item interval={3000}>
              <img
                className="d-block w-100"
                src={window.API_FILES_URL + imgSrc}
                alt="First slide"
              />
            </Carousel.Item>
          )})}
        </Carousel>
      ) : (
        <Row>
          <Col span={24}>
            <strong
              className="m-3"
              style={{
                fontSize: "18px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              لا توجد صور متوفرة
            </strong>
          </Col>
        </Row>
      )}
    </>
  );
}

export default BuildingImageTab;

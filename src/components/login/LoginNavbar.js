import React, { useState } from "react";
import { Nav, Button, NavDropdown } from "react-bootstrap";
import logo from "../../assets/images/Logo1.png";
import { Link } from "react-router-dom";

import Media from "react-media";
export default function LoginNavbar(props) {
  return (
    <div className="navBar loginNav">
      <Nav>
        <Nav.Item className="ahsaaNavLink my-auto">
          <Link to="/" eventKey="home" title="الرئيسية">
            الرئيسية
          </Link>
        </Nav.Item>
        <Nav.Item className="navTitle">
          <Nav.Link eventKey="home" style={{ cursor: "pointer" }}>
            الخـريطـة الإسـتثـمـاريـة
          </Nav.Link>
        </Nav.Item>
        <Nav.Item className="navLogo">
          <img
            src={logo}
            style={{ height: "50px", width: "50px" }}
            alt="logo"
            className="img-fluid"
          />
        </Nav.Item>
      </Nav>
    </div>
  );
}

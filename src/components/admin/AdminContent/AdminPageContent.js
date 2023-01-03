import React, { useEffect, useState } from "react";
import { Table, Pagination, ConfigProvider } from "antd";
import axios from "axios";

export default function AdminPageContent(props) {
  return (
    <div>
      {props.sideLinks.map((admin, index) =>
        props.selectedLink == admin.id ? (
          <div className="adminContent" key={admin.id}>
            <h4 style={{ paddingBottom: "15px" }}>{admin.name}</h4>
            {admin.component}
          </div>
        ) : null
      )}
    </div>
  );
}

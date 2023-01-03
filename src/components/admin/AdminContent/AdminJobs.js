import React, { useEffect, useState } from "react";
import { Table, Button, notification, Row, Col, Input } from "antd";
import axios from "axios";
import AddAdminJob from "../modals/AddAdminJob";
import DeleteJob from "../modals/DeleteJob";
import EditJob from "../modals/EditJob";
export default function AdminJobs(props) {
  const [tableData, setTableData] = useState([]);
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(null);
  const [rowId, setRowId] = useState(0);
  const [rowdata, setRowData] = useState({});
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [searchText, setSearch] = useState("");
  const [searchData, setSearchData] = useState([]);
  const [columns] = useState([
    {
      title: "الاسم",
      dataIndex: "name",
      key: "name",
      render: (text) => <a>{text}</a>,
    },

    {
      title: "الإجراء",
      dataIndex: "action",
      key: "action",
      render: (text, record) => (
        <>
          <i
            className="fas fa-wrench btn-edit"
            style={{ padding: "10px" }}
            id={record.id}
            onClick={openEdit.bind(this, record)}
          ></i>
          <i
            className="btnDele fas fa-times"
            id={record.id}
            onClick={openDelete}
            style={{ padding: "10px" }}
          ></i>
        </>
      ),
    },
  ]);
  const { Search } = Input;
  const handleUserInput = (e) => {
    setSearch(e.target.value);
    setSearchData(tableData.filter((x) => x.name.includes(e.target.value)));
  };
  const onSearch = (value) => {};

  const openDelete = (e) => {
    setRowId(e.target.id);
    setShowDelete(true);
  };
  const closeDelete = () => {
    setRowId(null);
    setShowDelete(false);
  };
  const onDelete = (e) => {
    setLoading(true);

    axios
      .delete(window.API_URL + "groups/" + e.target.id, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.userToken}`,
        },
      })
      .then((res) =>
        axios
          .get(window.API_URL + "groups/getall", {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${localStorage.userToken}`,
            },
          })
          .then((res) => {
            getTableData(res.data.results);
            setTableData(res.data.results);
            setLoading(false);
            confirmationDelete();
          })
      );

    closeDelete();
  };
  const getTableData = (tableData) => {
    setTableData(tableData);
  };
  useEffect(() => {
    setLoading(true);
    axios
      .get(window.API_URL + "groups/getall", {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.userToken}`,
        },
      })
      .then((res) => {
        getTableData(res.data.results);
        setTableData(res.data.results);
        setLoading(false);
      });
  }, []);

  const openEdit = (e, data) => {
    setRowId(e.id);
    setRowData(e);
    setShowEdit(true);
  };
  const closeeditmodal = () => {
    setRowId(0);
    setShowEdit(false);
  };
  const openAdd = (e) => {
    setShowAdd(true);
  };
  const closeAdd = () => {
    setShowAdd(false);
  };
  const setEditLoading = (e) => {
    setLoading(e);
  };
  const confirmationDelete = () => {
    const args = {
      description: "تم حذف الوظيفة بنجاح",
      duration: 5,
      placement: "bottomLeft",
      bottom: 5,
    };
    notification.open(args);
  };

  return (
    <>
      {" "}
      <div className="baladyaAdmin">
        <Row>
          <Col md={{ span: 24 }} lg={{ span: 12 }}>
            <Search
              placeholder="ابحث بإسم الوظيفة هنا"
              enterButton="بحث"
              size="large"
              name="searchText"
              onSearch={onSearch}
              onChange={handleUserInput}
            />
          </Col>
        </Row>
        <Button className="loginButton mb-3" onClick={openAdd}>
          إضافة جديد
        </Button>
      </div>
      <AddAdminJob
        showAdd={showAdd}
        closeAdd={closeAdd}
        openAdd={openAdd}
        getTableData={getTableData}
        columns={columns}
        setEditLoading={setEditLoading}
      />{" "}
      <DeleteJob
        showDelete={showDelete}
        id={rowId}
        closeDelete={closeDelete}
        onDelete={onDelete}
      />
      <EditJob
        setEditLoading={setEditLoading}
        showEdit={showEdit}
        id={rowId}
        rowdata={rowdata}
        getTableData={getTableData}
        closeeditmodal={closeeditmodal}
        columns={columns}
      />
      <Table
        columns={columns}
        dataSource={
          searchText == "" || searchText == undefined ? tableData : searchData
        }
        pagination={false}
        loading={loading}
        locale={{ emptyText: "لا توجد نتائج" }}
      />
    </>
  );
}

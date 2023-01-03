import React, { useEffect, useState } from "react";
import { Table, Pagination, ConfigProvider, Row, Col, Input } from "antd";
import axios from "axios";
import EditUserModal from "../modals/EditUserModal";
import Loader from "../../loader/index";

export default function Users(props) {
  const [tableData, setTableData] = useState([]);
  const [showEdit, setShowEdit] = useState(null);
  const [rowId, setRowId] = useState(0);
  const [rowdata, setRowData] = useState({});
  const [searchText, setSearch] = useState("");
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchData, setSearchData] = useState([]);
  const [columns] = useState([
    {
      title: "الاسم",
      dataIndex: "name",
      key: "name",
      render: (text) => <a>{text}</a>,
    },

    {
      title: "البريد الالكتروني",
      dataIndex: "email",
      key: "email",
      render: (text) => <a>{text == null ? "--" : text}</a>,
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
        </>
      ),
    },
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const handleChangePage = (page) => {
    setLoading(true);
    window.scrollTo(0, 0);
    setCurrentPage(page);
    if (
      (props.tableData.next !== "" && props.tableData.next !== undefined) ||
      (props.tableData.prevURL !== "" && props.tableData.prevURL !== undefined)
    ) {
      axios
        .get(window.API_URL + `/get-all-users?page=${page - 1}`, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.userToken}`,
          },
        })
        .then((res) => {
          getTableData(res.data.Value);
          setLoading(false);
        });
    }
  };
  const getTableData = (tableData) => {
    setTableData(tableData);
  };
  useEffect(() => {
    setLoading(true);
    axios
      .get(window.API_URL + "get-all-users", {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.userToken}`,
        },
      })
      .then((res) => {
        getTableData(res.data.Value);
        setTableData(res.data.Value);
        setLoading(false);
      });
    axios
      .get(window.API_URL + "groups/getall", {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.userToken}`,
        },
      })
      .then((res1) => {
        setGroups(res1.data.results);
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

  const handleUserInput = (e) => {
    setSearch(e.target.value.replace(/\s/g, ""));
    setSearchData(
      tableData.results.filter((x) =>
        x.email.includes(e.target.value.replace(/\s/g, ""))
      )
    );
  };

  const { Search } = Input;
  const setEditLoading = (e) => {
    setLoading(e);
  };
  return (
    <>
      <div className="baladyaAdmin">
        <Row>
          <Col md={{ span: 24 }} lg={{ span: 12 }}>
            <Search
              placeholder="ابحث بالبريد الإلكتروني هنا"
              enterButton="بحث"
              size="large"
              name="searchText"
              onChange={handleUserInput}
            />
          </Col>
        </Row>
        <EditUserModal
          showEdit={showEdit}
          id={rowId}
          rowdata={rowdata}
          getTableData={getTableData}
          setEditLoading={setEditLoading}
          closeeditmodal={closeeditmodal}
          columns={columns}
          groups={groups}
        />
      </div>
      <Table
        columns={columns}
        dataSource={
          searchText == "" || searchText == undefined
            ? tableData.results
            : searchData
        }
        pagination={false}
        loading={loading}
        locale={{ emptyText: "لا توجد نتائج" }}
      />
      {tableData.next == "" && tableData.prevURL == "" ? null : (
        <ConfigProvider direction="ltr">
          <Pagination
            className="mt-4"
            current={currentPage}
            defaultCurrent={currentPage}
            pageSize={30}
            total={tableData.count}
            onChange={handleChangePage}
            style={{ bottom: "0px" }}
          />
        </ConfigProvider>
      )}
    </>
  );
}

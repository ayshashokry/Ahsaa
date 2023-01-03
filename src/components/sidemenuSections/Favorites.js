import React, { Component } from "react";
import { connect } from "react-redux";
import { Table, Button, Modal, Container } from "react-bootstrap";
import {
  getFeatureDomainName,
  getLayerIndex,
  highlightFeature,
  LoadModules,
  queryTask,
} from "../common/mapviewer";
// import Loader from "../loader/index";
import axios from "axios";
import { withRouter } from "react-router";
import { checkTokenExpiration } from "../../redux/reducers/map";
import { notificationMessage } from "../../helpers/utlis/notifications_Func";
import SearchResultDetails from "./SerarchResults/SearchResultDetails";
import SearchResultMenu from "./SerarchResults/SearchResultMenu";
import { setSitesDataToRedux } from "./helpers/common_func";
// import { API_URL } from "../../config";

class Favorites extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showDeleteModal: null,
      loading: false,
      showEditModal: null,
      editedBookMarkName: "",
      isFavMenuShown: true,
      isSideInfoChosenToDisplay: false,
      errorEditFavName:null
    };
  }

  openDeleteModal = (id) => {
    this.setState({ showDeleteModal: id });
  };
  closeDeleteModal = () => {
    this.setState({ showDeleteModal: null });
  };
  openEditModal = (id) => {
    this.setState({ showEditModal: id });
  };
  closeEditModal = () => {
    this.setState({ showEditModal: null, editedBookMarkName: "" });
  };
  removeDeletedSitesFromGraphLayer(bookmark, isAuth) {
    let gcLayer = window.__map__.getLayer("highLightGraphicLayer");
    let graphics = gcLayer.graphics;
    if (graphics.length) {
      let deletedGraphics = graphics.filter((gc) => {
        if (
          bookmark.geoSpatialIDs.includes(
            isAuth
              ? gc.attributes.SITE_GEOSPATIAL_ID.toString()
              : gc.attributes.SITE_GEOSPATIAL_ID
          )
        )
          return gc;
      });
      console.log(deletedGraphics);
      deletedGraphics.forEach((gc) => gcLayer.remove(gc));
    }
  }
  onDelete = (index) => {
    const {
      isAuth,
      deleteBookmark,
      bookmarks,
      token,
      user,
      openLoader,
      closeLoader,
      history,
    } = this.props;
    if (!isAuth) {
      openLoader();
      let bookmark = bookmarks?.[index];
      this.removeDeletedSitesFromGraphLayer(bookmark, isAuth);
      deleteBookmark(index, isAuth);
      this.setState({ loading: false, showDeleteModal: null });
      closeLoader();
    } else {
      //Use API of bookmark
      let bookmark = bookmarks.find((book) => book.id === bookmarks[index].id);
      openLoader();
      axios
        .delete(window.API_URL + "Bookmark/" + bookmark.id, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          console.log(res);
          notificationMessage("تم الحذف من المفضلة بنجاح", 3);
          this.removeDeletedSitesFromGraphLayer(bookmark, isAuth);
          deleteBookmark(index, isAuth);
          closeLoader();
          this.setState({ showDeleteModal: null });
        })
        .catch((err) => {
          console.log(err);
          this.setState({ showDeleteModal: null });
          if (err.response.status === 401) {
            setTimeout(() => {
              notificationMessage("برجاء إعادة تسجيل الدخول");
              closeLoader();
              history.replace("/Login");
              this.props.removeUserFromApp();
            }, 1000);
          } else {
            closeLoader();
            notificationMessage("حدث خطأ ");
          }
        });
    }
  };
  zoomToFeatures = (fav, isShowCards) => {
    this.props.openLoader(); //for loader in case of zooming process
    var featuresIds = fav.geoSpatialIDs;
    if (featuresIds.length) {
      var where = featuresIds
        .map((i) => `SITE_GEOSPATIAL_ID=${i}`)
        .join(" OR ");
      // query features
      var layerIndex = getLayerIndex("INVEST_SITE_POLYGON");
      queryTask({
        returnGeometry: true,
        url: `${window.__mapUrl__}/${layerIndex}`,
        outFields: ["*"],
        where,
        callbackResult: ({ features }) => {
          getFeatureDomainName(features, layerIndex).then((res) => {
            console.log(res); //res here is an array of features with domain values
            // todo: add this array to redux for displaying in side menu
            highlightFeature(features, window.__map__, {
              isZoom: true,
              layerName: "highLightGraphicLayer",
              zoomFactor: features.length === 1 ? 50 : 200,
            });
            isShowCards? this.showingSitesInFav(fav):

            this.props.closeLoader(); //for loader in case of zooming process
          });
        },
      });
    }
  };

  // editBookMarkName(e) {
  //   console.log("edit bookmark");
  //   this.setState({ editedBookMarkName: e.target.value });
  // }
  onEdit(index) {
    const {
      isAuth,
      bookmarks,
      token,
      user,
      openLoader,
      closeLoader,
      history,
      editBookmark,
    } = this.props;
    if(!this.state.editedBookMarkName) return;
    if (!isAuth) {
      // openLoader();
      this.props.editBookmark(
        this.state.editedBookMarkName,
        index,
        this.props.isAuth
      );
      this.setState({ editedBookMarkName: "", showEditModal: null });
    } else {
      //Use API of bookmark
      openLoader();
      let bookmark = bookmarks.find((book) => book.id === bookmarks[index].id);
      axios
        .patch(
          window.API_URL + "bookmark/" + bookmark.id,
          [
            {
              op: "replace",
              path: "/title",
              value: this.state.editedBookMarkName,
            },
          ],
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((res) => {
          console.log(res);
          notificationMessage("تم التعديل بنجاح", 3);
          editBookmark(this.state.editedBookMarkName, index, isAuth);
          closeLoader();
          this.setState({ showEditModal: null, editedBookMarkName: "" });
        })
        .catch((err) => {
          console.log(err);
          this.setState({ showEditModal: null, editedBookMarkName: "" });
          if (err.response.status === 401) {
            setTimeout(() => {
              notificationMessage("برجاء إعادة تسجيل الدخول");
              closeLoader();
              history.replace("/Login");
              this.props.removeUserFromApp();
            }, 1000);
          } else {
            closeLoader();
            notificationMessage("حدث خطأ ");
          }
        });
    }
  }
  handleBackToFavMenu() {
    window.__map__.getLayer("highLightGraphicLayer").clear();
    this.setState({ isFavMenuShown: true, isSideInfoChosenToDisplay: false });
    this.props.handleDoubleClickOnFavItems(false);
  }
  showingSitesInFav(fav) {
    // this.props.openLoader();
    let featuresIds = fav.geoSpatialIDs;
    let whereCondition = featuresIds
      .map((i) => `SITE_GEOSPATIAL_ID=${i}`)
      .join(" OR ");
    const callBackFunc = () => {
      this.setState({ isFavMenuShown: false });
      this.props.handleDoubleClickOnFavItems(true);
    };
    setSitesDataToRedux(
      whereCondition,
      this.props.pushResultTableData,
      this.props.pushContentToModal,
      this.props.closeLoader,
      this.props.openLoader,
      this.props.user,
      callBackFunc.bind(this)
    );
  }
  OpenResultDetailsHandler = (feature, layername) => {
    //set only dbl click on map
    this.setState({
      isSideInfoChosenToDisplay: {
        feature,
        layername,
      },
      isFavMenuShown: false,
    });
  };
  handleBackToMenuCards() {
    this.setState({ isSideInfoChosenToDisplay: false, isFavMenuShown: false });
    window.__map__.getLayer("zoomGraphicLayer").clear();
    this.props.handleDoubleClickOnFavItems(true);
    //todo: once user click to back to cards menu => zoom to the existing cards geoms
  }
  render() {
    const { bookmarks, dblclickOnFavMenu } = this.props;
    return (
      <div className="favorites">
        {/* <h3>قائمة المفضلة</h3> */}
        <div className="searchStepsWizard ">
          <nav class="breadcrumbs">
            {this.state.isSideInfoChosenToDisplay ? (
              <li
                // onClick={this.props.generalOpenResultdetails}
                className={
                  this.state.isSideInfoChosenToDisplay
                    ? "breadcrumbs__item breadcrumbs__itemActive third"
                    : "breadcrumbs__item third"
                }
              >
                بيانات الموقع
              </li>
            ) : null}
            {dblclickOnFavMenu || this.state.isSideInfoChosenToDisplay ? (
              <li
                onClick={this.handleBackToMenuCards.bind(this)}
                className={
                  dblclickOnFavMenu && !this.state.isSideInfoChosenToDisplay
                    ? "breadcrumbs__item breadcrumbs__itemActive third"
                    : "breadcrumbs__item third"
                }
              >
                النتائج
              </li>
            ) : null}

            <li
              onClick={() => this.handleBackToFavMenu()}
              className={
                this.state.isFavMenuShown
                  ? "breadcrumbs__item breadcrumbs__itemActive second"
                  : "breadcrumbs__item second"
              }
            >
              قائمة المفضلة
            </li>
          </nav>
        </div>
        {this.state.isFavMenuShown ? (
          <Container className="favList">
            {" "}
            <Table className="mt-2">
              <thead>
                <tr>
                  {" "}
                  <th>الاجراءات </th>
                  <th>الاسم </th>
                </tr>
              </thead>
              <tbody>
                {bookmarks.length !== 0 ? (
                  bookmarks.map((fav, index) => (
                    <tr
                      className="fav-list-item"
                      key={index}
                      style={{
                        borderBottom: "1px solid #d4d6de",
                      }}
                    >
                      <td>
                        <i
                          className="fas fa-trash pr-4 fav-icon"
                          onClick={() => this.openDeleteModal(index)}
                          id={index}
                        ></i>
                        {/**delete modal */}
                        <Modal
                          style={{ textAlign: "right" }}
                          show={this.state.showDeleteModal === index}
                          onHide={this.closeDeleteModal}
                          backdrop="static"
                          {...this.state}
                          size="lg"
                          aria-labelledby="contained-modal-title-vcenter"
                          centered
                        >
                          <Modal.Header>
                            <Modal.Title>
                              {" "}
                              هل أنت متأكد من حذف هذه المفضلة؟
                            </Modal.Title>
                          </Modal.Header>
                          <Modal.Body>
                            <Button
                              className="cancelbtn"
                              onClick={this.closeDeleteModal}
                            >
                              إلغاء
                            </Button>
                            <Button
                              className="addbtn"
                              id={fav.id}
                              loading={this.state.loading}
                              onClick={() => this.onDelete(index)}
                            >
                              حذف
                            </Button>{" "}
                          </Modal.Body>
                        </Modal>

                        {/** zoom icon to fav sites */}
                        <i
                        onClick={() => this.zoomToFeatures(fav)}
                        className="fas fa-search-plus pr-4 fav-icon"
                      ></i>
                        {/**edit fav icon */}
                        <i
                          className="fas fa-pen-fancy fav-icon"
                          onClick={() =>
                            this.setState({ showEditModal: index, editedBookMarkName:fav.name })
                          }
                          id={index}
                        ></i>
                        {/**edit fav modal */}
                        <Modal
                          style={{ textAlign: "right" }}
                          show={this.state.showEditModal === index}
                          onHide={this.closeEditModal}
                          backdrop="static"
                          {...this.state}
                          size="lg"
                          aria-labelledby="contained-modal-title-vcenter"
                          centered
                        >
                          <Modal.Header>
                            <Modal.Title> تعديل اسم المفضلة</Modal.Title>
                          </Modal.Header>
                          <Modal.Body>
                            <Container>
                              <div
                                className="container mb-2"
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <input
                                  type="text"
                                  name="editedBookMarkName"
                                  className="text-center"
                                  onChange={(e) =>{
                                  
                                    this.setState({
                                      editedBookMarkName: e.target.value,errorEditFavName:e.target.value?null:true
                                    })
                                  }
                                  }
                                  value={
                                    this.state.editedBookMarkName
                                  }
                                  id="bookmark"
                                />
                                <label
                                  htmlFor="editedBookMarkName"
                                  style={{ margin: "auto" }}
                                >
                                  <strong> اسم المفضلة</strong>
                                </label>
                              </div>
                            </Container>
                            {this.state.errorEditFavName?<div style={{color:'red', textAlign:'center', margin:'1em', fontWeight:'bold'}}> من فضلك أدخل اسم المفضلة ** </div>:null}
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-around",
                              }}
                            >
                              <Button
                                className="cancelbtn"
                                onClick={this.closeEditModal}
                              >
                                إلغاء
                              </Button>
                              <Button
                                className="addbtn"
                                id={fav.id}
                                onClick={() => this.onEdit(index)}
                              >
                                حفظ
                              </Button>{" "}
                            </div>
                          </Modal.Body>
                        </Modal>
                      </td>
                      <td
                        style={{ cursor: "pointer" }}
                        onClick={() => this.zoomToFeatures(fav, true)}
                        // onDoubleClick={()=>this.showingSitesInFav(fav)}
                      >
                        <h5>{fav.name}</h5>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="noData">
                    <td colspan="2">لا توجد بيانات</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Container>
        ) : this.props.tableSettings?.result &&
          (this.props.tableSettings?.result?.map((r) => r.data)?.flat()
            .length === 1 ||
            this.state.isSideInfoChosenToDisplay) ? (
          <SearchResultDetails
            OpenResultMenu={this.handleBackToMenuCards.bind(this)}
            openLoader={this.props.openLoader}
            closeLoader={this.props.closeLoader}
            showData={
              this.state.isSideInfoChosenToDisplay
                ? this.state.isSideInfoChosenToDisplay
                : {
                    feature: this.props.tableSettings.result.find(
                      (r) => r.data.length
                    ).data[0],
                    layername: this.props.tableSettings.result.find(
                      (r) => r.data.length
                    ).layername,
                  }
            }
          />
        ) : (
          <SearchResultMenu
            OpenResultdetails={this.OpenResultDetailsHandler.bind(this)}
          />
        )}
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    deleteBookmark: (index, isAuth) =>
      dispatch({ type: "DEL_BOOKMARK", index, isAuth }),
    editBookmark: (data, index, isAuth) =>
      dispatch({ type: "EDIT_BOOKMARK", data, index, isAuth }),
    pushResultTableData: (data) =>
      dispatch({ type: "RESULT_TABLE_DATA_SET", data }),
    pushContentToModal: (data) =>
      dispatch({ type: "TABLE_ICON_MODAL_DATA_SET", data }),
    removeFeatFromSelectedFeats: (gids) =>
      dispatch({ type: "REMOVE_FROM_SELECTED_FEATURES", data: gids }),
  };
};

const mapStateToProps = ({ mapUpdate }) => {
  const { bookmarks, auth, tableSettings } = mapUpdate;
  return {
    bookmarks,
    isAuth: auth.isAuth,
    token: auth.user ? auth.user.token : "",
    user: auth.user,
    tableSettings,
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Favorites)
);

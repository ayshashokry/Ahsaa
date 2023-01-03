import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { connect } from "react-redux";
// import { API_URL } from "../../../../config";
import { Row, Col, Input, Form, Button, Select, notification } from "antd";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import { Container, Modal } from "react-bootstrap";
import { sortedUniq } from "lodash";
import { withRouter } from "react-router";
import { checkTokenExpiration } from "../../redux/reducers/map";
import { notificationMessage } from "../../helpers/utlis/notifications_Func";

function SuggestionDataEntryTab({
  selectedFeatureOnSearchTable,
  user,
  openLoader,
  closeLoader,
  history,
  removeUserFromApp,
}) {
  const formRef = useRef(null);
  const [suggestionTypes, setSuggestionTypes] = useState([]);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([
    {
      canBeDeleted: false,
    },
  ]);
  const [titles, setTitles] = useState({
    1: "الاقتراح الأول",
    2: "الاقتراح الثاني",
    3: "الاقتراح الثالث",
  });
  const [remarks, setRemarks] = useState("");
  const fetchSuggestionTypes = async () => {
    openLoader();
    console.log(user);
    try {
      let res = await axios.get(`${window.API_URL}` + "api/suggestiontype", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      console.log(res);
      let typesOfSuggestions = res.data;
      console.log(res);
      setSuggestionTypes(typesOfSuggestions.results);
      closeLoader();
    } catch (err) {
      closeLoader();
      if (err.response.status === 401) {
        showNotification("يجب إعادة تسجيل الدخول", "error");
        history.push("/Login");
        removeUserFromApp();
      } else {
        showNotification("حدث خطأ ", "error");
        cancelHandler();
      }
    }
  };
  const cancelHandler = () => {
    // setSuggestionTypes([]);
    setSuggestions([
      {
        canBeDeleted: false,
      },
    ]);
    setError("");
    setTitles({
      1: "الاقتراح الأول",
      2: "الاقتراح الثاني",
      3: "الاقتراح الثالث",
    });
    setRemarks("");
    formRef.current&&formRef.current.resetFields();
  };
  useEffect(() => {
    fetchSuggestionTypes();
  }, []);
  //clean up
  useEffect(() => {
    return () => {
      cancelHandler();
    };
  }, []);

  const handleChange = (name) => (value) => {
    if (name.includes("suggestionType")) {
      let index = name.split("suggestionType")[1];
      let suggestionsClone = [...suggestions];
      let suggestion = {
        value: value,
        text: value ? suggestionTypes.find((s) => s.id === value).name : "",
      };
      suggestionsClone[index] = { ...suggestionsClone[index], ...suggestion };
      formRef.current.setFieldsValue({ [`suggestionType${index}`]: value });
      setSuggestions(suggestionsClone);
      //duplication validation
      checkDuplicateSuggetions(suggestionsClone);
    } else setRemarks(value.target.value);
  };
  const checkDuplicateSuggetions = (suggestionsClone) => {
    let suggestionsValues = suggestionsClone.map((s) => s.value);
    let chosenSuggestions = sortedUniq(suggestionsValues.sort());
    if (suggestionsValues.length != chosenSuggestions.length) {
      setError("يوجد اقتراحات مُكررة. من فضلك ادخل اقتراحات مختلفة");
    } else {
      setError("");
    }
  };
  const addSuggestion = () => {
    if (suggestions.length == 3) {
      setError("لقد بلغت الحد الأقصى من الاقتراحات (ثلاثة)");
      setTimeout(() => {
        setError("");
      }, 3000);
    } else {
      let suggestionsClone = [...suggestions];
      suggestionsClone.push({ canBeDeleted: suggestions.length >= 1 });
      setSuggestions([...suggestionsClone]);
    }
  };
  const deleteSuggestion = (index) => {
    let suggestionsClone = [...suggestions];
    suggestionsClone.splice(index, 1);
    if (suggestionsClone.length < 1) suggestionsClone[0].canBeDeleted = false;
    setSuggestions([...suggestionsClone]);
    checkDuplicateSuggetions(suggestionsClone);
  };

  const postData = () => {
    const {
      feature: { attributes },
      layername,
    } = selectedFeatureOnSearchTable;
    // let { client, captcha } = this.state;
    let suggestionsValues = suggestions.map((s) => s.value);
    let chosenSuggestions = sortedUniq(suggestionsValues.sort());
    if (error) return;
    else {
      let url = `${window.API_URL}api/suggestion`;
      let selectedFeaturesClone = selectedFeatureOnSearchTable
        ? [
            {
              investment_spatial_id: attributes.SITE_GEOSPATIAL_ID,
              feature_class_name: layername,
            },
          ]
        : [];
      console.log("selectedFeaturesClone", selectedFeaturesClone);
      let postedData = {
        public_user_name: user.username,
        user_id: user ? user.id : null,
        email: user.email,
        phone: user.mobile,
        suggestion1_id:
          suggestions.length && suggestions[0].value
            ? suggestions[0].value
            : null,
        suggestion2_id:
          suggestions.length && suggestions[1] ? suggestions[1].value : null,
        suggestion3_id:
          suggestions.length && suggestions[2] ? suggestions[2].value : null,
        remarks: remarks,
        suggestion_investment: selectedFeaturesClone,
      };
      console.log("postedData", postedData);
      openLoader();
      checkTokenExpiration(user)
        .then((res) => {
          if (!res) {
            setTimeout(() => {
              notificationMessage("يجب إعادة تسجيل الدخول");
              closeLoader();
              history.replace("/Login");
              removeUserFromApp();
            }, 1000);
          } else {
            axios
              .post(url, postedData, {
                headers: {
                  Authorization: `Bearer ${user.token}`,
                },
              })
              .then((response) => {
                var { success } = response.data;
                closeLoader();
                if (!success) {
                  showNotification(
                    `لقد تخطيت العدد المسموح به من الملاحظات`,
                    "warning"
                  );
                  cancelHandler();
                  formRef.current.resetFields();
                } else {
                  showNotification("تم ارسال الملاحظة بنجاح", "success");
                  cancelHandler();
                  formRef.current.resetFields();
                }
              })
              .catch((err) => {
                if (err.response.status === 401) {
                  setTimeout(() => {
                    showNotification("يجب إعادة تسجيل الدخول");
                    removeUserFromApp();
                    history.replace("/Login");
                    closeLoader();
                  }, 1000);
                } else {
                  showNotification("حدث خطأ اثناء الارسال", "error");
                  closeLoader();
                  cancelHandler();
                  formRef.current.resetFields();
                }
              });
          }
        })
        .catch((err) => {
          cancelHandler();
          formRef.current.resetFields();
          if (err.response.status === 401) {
            setTimeout(() => {
              showNotification("يجب إعادة تسجيل الدخول مرة أخرى");
              closeLoader();
              history.replace("/Login");
              removeUserFromApp();
            }, 1000);
          } else {
            showNotification("حدث خطأ اثناء الارسال", "error");
            closeLoader();
          }
        });
    }
  };

  const showNotification = (msg, type, duration = 3) => {
    const args = {
      description: msg,
      duration: duration,
    };
    notification.open(args);
  };

  return (
   
        <Container className="RemarkForm">
          <Form
            layout="vertical"
            name="validate_other"
            ref={formRef}
            onFinish={postData}
          >
            <Row>
              {" "}
              <Col span={24}>
                <div
                  className="formItemSelectSuggestion"
                  style={{ display: "flex", flexFlow: "column" }}
                >
                  {suggestions.map((s, index) => (
                    <Row key={index}>
                      {/* <div className="selectSuggetion"> */}
                      <Col span={22}>
                        <Form.Item
                          hasFeedback
                          name={`suggestionType${index}`}
                          rules={[
                            {
                              message: " من فضلك اختر اقتراحا ",
                              required: true,
                            },
                          ]}
                        >
                          {" "}
                          <Select
                            allowClear
                            showSearch
                            filterOption={(input, option) =>
                              option.children
                                .toLowerCase()
                                .indexOf(input.toLowerCase()) >= 0
                            }
                            className="dont-show"
                            onChange={handleChange(`suggestionType${index}`)}
                            value={
                              suggestions[index].value
                                ? suggestions[index].value
                                : null
                            }
                            placeholder={titles[index + 1]}
                            getPopupContainer={(trigger) => trigger.parentNode}
                            name={`suggestionType${index}`}
                          >
                            {suggestionTypes.length &&
                              suggestionTypes.map((suggestion) => (
                                <Select.Option
                                  key={suggestion.id}
                                  className="text-right"
                                  value={suggestion.id}
                                >
                                  {suggestion.name}
                                </Select.Option>
                              ))}
                          </Select>{" "}
                        </Form.Item>
                      </Col>{" "}
                      <Col span={2}>
                        {" "}
                        {suggestions.length > 1 ? (
                          <Button
                            className="deleteBtn"
                            type="danger"
                            shape="circle"
                            onClick={() => deleteSuggestion(index)}
                          >
                            <DeleteForeverIcon />
                          </Button>
                        ) : null}
                      </Col>
                      {/* </div> */}
                    </Row>
                  ))}
                  {suggestions.length > 3 ? null : (
                    <span
                      className="btn btn-danger"
                      style={{
                        width: "fit-content",
                        margin: "auto",
                        marginBottom: "20px",
                      }}
                      onClick={addSuggestion}
                    >
                      اضافة مقترح
                    </span>
                  )}
                </div>
              </Col>
              <Col span={22} className="msg">
                <Form.Item
                  name="remark_details"
                  rules={[
                    {
                      message: " من فضلك ادخل ملاحظاتك",
                      required: true,
                    },
                  ]}
                >
                  <Input.TextArea
                    showCount
                    onChange={handleChange("remarks")}
                    maxLength={500}
                    rows={2}
                    name="remark_details"
                    placeholder="الملاحظات"
                    value={remarks}
                  />
                </Form.Item>
              </Col>
            </Row>
            {error && (
              <span className="custom-validation-error">** {error} </span>
            )}
            <div className="formButtons pt-4">
              <Button
                // onClick={sendMessage}
                className="addbtn"
                size="large"
                htmlType="submit"
              >
                إرسال
              </Button>
              <Button className="cancelbtn" size="large" onClick={cancelHandler}>
                إلغاء
              </Button>
            </div>
          </Form>
        </Container>
   
  );
}

const mapDispatchToProps = (dispatch) => {
  return {
    removeUserFromApp: () => dispatch({ type: "LOGOUT" }),
  };
};
const mapStateToProps = ({ mapUpdate }) => {
  return {
    user: mapUpdate.auth.user,
    isAuth: mapUpdate.auth.isAuth,
    selectedFeatureOnSearchTable:mapUpdate.selectedFeatureOnSearchTable
  };
};
export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(SuggestionDataEntryTab)
);

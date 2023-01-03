import axios from "axios";
import INIT_STATE from "../../initState";
import store from "../../store";
import {
  getBookmarksOfAuthUSer,
  updateLocalStorage,
  saveToLocalStorage,
} from "../helpersFunc";

export const feasibilityStudy = (
  state = INIT_STATE.feasibilityStudy,
  action
) => {
  switch (action.type) {
    // suggetion report actions
    case "ADD_SUGGESTION_FOR_REPORT":
      return { ...state, suggestionDataToPrint: action.data };
    case "CLEAR_SUGGESTION_DATA_OF_REPORT":
      return {
        ...state,
        suggestionDataToPrint: null,
      };
    default:
      return { ...state };
  }
};

export const mapUpdate = (state = INIT_STATE, action) => {
  let tableSettingsClone,
    token,
    user,
    tblResultArr,
    tblSettingsAfterUpdateData,
    resDataLayerName,
    tblSettingsAfterRmvData;
  switch (action.type) {
    case "AUTHENTICATE":
      token = localStorage.getItem("userToken");
      user = JSON.parse(localStorage.getItem("user"));

      if (user) checkTokenExpiration(user);
      return { ...state };
    //check user logged in or not
    case "SET_CURRENT_USER":
      return {
        ...state,
        auth: {
          isAuth: true,
          user: action.data,
          admin: null,
        },
      };
    /****
     * Login-Logout Actions
     */
    case "LOGIN":
      localStorage.setItem("userToken", action.data.token);
      localStorage.setItem("user", JSON.stringify(action.data));
      // window.__baseMapGallery= undefined
      getBookmarksOfAuthUSer(action.data.token);
      return {
        ...state,
        auth: { ...state.auth, isAuth: true, user: action.data },
        currentUser:
          action.data.user_type_id == 1
            ? "Employee"
            : action.data.user_type_id == 2
            ? "Investor"
            : action.data.user_type_id == 3
            ? "Office"
            : "Gest",
      };

    case "LOGOUT":
      localStorage.removeItem("userToken");
      localStorage.removeItem("user");
      window.__featureServiceLayers__ = null;
      window.__featureServiceTables__ = null;
      return {
        ...state,
        //user stuff
        auth: { ...state.auth, isAuth: false, user: {}, admin: "" },
        currentUser: "Gest",
        bookmarks: localStorage.getItem("bookmarks")
          ? JSON.parse(localStorage.getItem("bookmarks"))
          : [],
        //features stuff
        tempSelectedFeaturesData: [],
        selectedFeatures: [],
        tableSettings: null,
        selectedFeatureOnSearchTable: null,
        //select sigle, multi-select stuff
        singleSelectActive: {
          isActive: false,
          layerName: "",
        },
        multiSelectActive: {
          isActive: false,
          layerName: "",
        },
      };
    /******************** */

    /***
     * Other Actions
     */
    case "MAP_NOT_LOADED":
      return {
        ...state,
        mapLoaded: false,
      };
    case "MAP_LOADED":
      return { ...state, mapLoaded: true };
    // case "LOADING_FEATURES_ON_ZOOMING":
    //   return {...state, featuresLoading:action.data}
    case "ADD_TO_SELECTED_FEATURES":
      const { selectedFeatures } = state;
      action.features.forEach((f) => selectedFeatures.push(f));
      return { ...state, selectedFeatures: [...selectedFeatures] };
    case "REMOVE_FROM_SELECTED_FEATURES":
      const selectedFeaturesC = state.selectedFeatures;
      let selectedFeatsAfterRemove;
      if(typeof action.data =='object')
      selectedFeatsAfterRemove = selectedFeaturesC.filter(
        (feat) => !action.data.includes(feat.attributes.SITE_GEOSPATIAL_ID)
      );
      else 
      selectedFeatsAfterRemove = selectedFeaturesC.filter(
        (feat) => feat.attributes.SITE_GEOSPATIAL_ID !== action.data
      );
      return { ...state, selectedFeatures: [...selectedFeatsAfterRemove] };

    case "CLEAR_SELECTED":
      return { ...state, selectedFeatures: [] };
    case "DOMAINS_ADDED":
      return { ...state, fields: action.fields };
    case "FILTER_RESULT_TABLE":
        return{
          ...state, filteredTableSettingsIDs: {data:action.data, bool:true}
        }
    case "EMPTY_FILTERED_RESULT_TABLE":
      return{
        ...state, filteredTableSettingsIDs:{data:[], bool:false}
      }
    case "RESULT_TABLE_DATA_SET":
      return { ...state, tableSettings: action.data };
    case "REMOVE_FROM_RESULT_TABLE_DATA_SET":
      tblSettingsAfterRmvData = { ...state.tableSettings };
      tblResultArr = tblSettingsAfterRmvData.result.map((item) => {
        let resData = item.data;
        let removedFeat = resData.findIndex(
          (item) => item.attributes.SITE_GEOSPATIAL_ID === action.id
        );
        resData.splice(removedFeat, 1);
        return item;
      });
      tblSettingsAfterRmvData.result = [...tblResultArr];
      return {
        ...state,
        tableSettings: tblSettingsAfterRmvData,
      };
    case "UPDATE_RESULT_TABLE_DATA_SET":
      tblSettingsAfterUpdateData = { ...state.tableSettings };
      tblResultArr = tblSettingsAfterUpdateData.result.map((item) => {
        resDataLayerName = item.layername.toLowerCase();
        let actionData = action.data.find(
          (d) => d.layername.toLowerCase() === resDataLayerName
        ).data;
        item.data = [...item.data, ...actionData];
        return item;
      });
      tblSettingsAfterUpdateData.result = [...tblResultArr];
      return {
        ...state,
        tableSettings: tblSettingsAfterUpdateData,
      };

    case "TABLE_ICON_MODAL_DATA_SET":
      return { ...state, selectedFeatureOnSearchTable: action.data };
    case "CLOSE_TABLE_ICON_MODAL":
      return { ...state, selectedFeatureOnSearchTable: null };
    case "CLEAR_RESULT_TABLE_DATA_SET":
      return { ...state, tableSettings: null, filteredTableSettingsIDs:{data:[], bool:false }}
    //for counted land table
    case "ADD_DATA_TO_TEMP":
      return {
        ...state,
        tempSelectedFeaturesData: [
          ...state.tempSelectedFeaturesData,
          ...action.data,
        ],
      };
    case "REMOVE_FROM_TEMP_SELECTED":
      //action contains id of removed feature
      let tempSelectedFeaturesAfterRemove = [...state.tempSelectedFeaturesData];
      let indexOfRemovedFeat = tempSelectedFeaturesAfterRemove.findIndex(f=>f.id===action.id);
      if(indexOfRemovedFeat!=-1)
      tempSelectedFeaturesAfterRemove.splice(indexOfRemovedFeat, 1);
      return {
        ...state, 
        tempSelectedFeaturesData:tempSelectedFeaturesAfterRemove
      }
    /******Dashbaord data******** */
    case "ADD_DATA_TO_DASHBOARD":
      return {
        ...state,
        dashboardData: action.data,
      };
    case "CLEAR_DASHBOARD_DATA":
      return {
        ...state,
        dashboardData: null,
      };
    // return {
    //   ...state,
    //   tempSelectedFeaturesData: prevTempSelectedFeaturesData.filter(
    //     (f) => ![f["id"]].includes(action.id)
    //   ),
    // };
    case "EMPTY_DATA_FROM_TEMP":
      return {
        ...state,
        tempSelectedFeaturesData: [],
      };
    case "ADD_TO_TABLE_DATA_SET":
      if (state.tableSettings && state.tableSettings.result.length) {
        let countedData = [...state.tableSettings.result, ...action.data];
        return {
          ...state,
          tableSettings: { ...state.tableSettings, result: countedData },
        };
      } else return { ...state, tableSettings: { result: action.data } };
    case "REMOVE_ITEM_FROM_RESULT_COUNTED_TABLE_DATA_SET":
      tableSettingsClone = { ...state.tableSettings };
      tableSettingsClone.result = tableSettingsClone.result.filter(
        (feat) => feat.id !== action.id
      );
      return { ...state, tableSettings: tableSettingsClone };
    case "SET_VALUES_BEFORE_EDIT_IN_COUNTED_TABLE":
      tableSettingsClone = { ...state.tableSettings };
      tableSettingsClone.result = tableSettingsClone.result.map((feat) => {
        if (feat.id == action.id) {
          feat[action.nameOfProperty] = action.data;
        }
        return feat;
      });
      return {
        ...state,
        tableSettingsClone,
      };
    case "EDIT_ITEM_FROM_RESULT_COUNTED_TABLE_DATA_SET":
      return { ...state, tableSettings: action.data };
    case "EDIT_ATTRIBUTES_FOR_FEATURE_IN_COUNTED_TABLE_DATA_SET":
      tableSettingsClone = { ...state.tableSettings };
      let editedAttributes;
      tableSettingsClone.result = tableSettingsClone.result.map((feat) => {
        if (feat.id == action.id) {
          editedAttributes = { ...feat[action.nameOfProperty] };
          Object.keys(action.data).forEach((key) => {
            editedAttributes[key] = action.data[key];
          });
          feat[action.nameOfProperty] = editedAttributes;
        }
        return feat;
      });
      return { ...state, tableSettings: tableSettingsClone };

    case "DELTE_FEATURE_FROM_COUNTED_TABLE_DATA_SET_AND_MAP":
      tableSettingsClone = { ...state.tableSettings };
      tableSettingsClone.result = tableSettingsClone.result.map((feat) => {
        if (feat.id == action.id) {
          feat.isDeleted = true;
          if (action.cornersBoundsDeleteObj)
            feat["cornersBoundsDeleteObj"] = action.cornersBoundsDeleteObj;
          if (action.buildingDetailsDeleteObj)
            feat["buildingDetailsDeleteObj"] = action.buildingDetailsDeleteObj;
        }
        return feat;
      });
      return { ...state, tableSettings: tableSettingsClone };
    case "CANCEL_SELECTED_ROWS_FROM_TABLE":
      tableSettingsClone = { ...state.tableSettings };
      tableSettingsClone.result = tableSettingsClone.result.filter(
        (feat) => feat.isChecked != true
      );
      return { ...state, tableSettings: tableSettingsClone };

    //////////////
    /***
     * Bookmarks Actions
     */
    case "ADD_BOOKMARK":
      var { bookmarks } = state;
      bookmarks.push(action.data);
      if (!action.isAuth) saveToLocalStorage(action.data);
      return { ...state, bookmarks: [...bookmarks] };
    case "DEL_BOOKMARK":
      var { bookmarks } = state;
      bookmarks.splice(action.index, 1);
      if (!action.isAuth) updateLocalStorage(bookmarks);
      return { ...state, bookmarks: [...bookmarks] };

    case "EDIT_BOOKMARK":
      var { bookmarks } = state;
      bookmarks[action.index].name = action.data;
      if (!action.isAuth) updateLocalStorage(bookmarks);
      return { ...state, bookmarks: [...bookmarks] };
    case "SET_BOOKMARKS_AFTER_LOGIN":
      return {
        ...state,
        bookmarks: action.data,
      };
    case "SET_BOOKMARKS_INTO_STATE":
      token = localStorage.getItem("userToken");
      user = localStorage.getItem("user");
      if (token && user) {
        let userParsed = JSON.parse(user);
        getBookmarksOfAuthUSer(userParsed.token);

        return {
          ...state,
          auth: { ...state.auth, isAuth: true, user: userParsed },
          currentUser:
            userParsed.user_type_id == 1
              ? "Employee"
              : userParsed.user_type_id == 2
              ? "Investor"
              : userParsed.user_type_id == 3
              ? "Office"
              : "Gest",
        };
      } else
        return {
          ...state,
          auth: { ...state.auth, isAuth: false, user: {}, admin: "" },
          currentUser: "Gest",
          bookmarks: localStorage.getItem("bookmarks")
            ? JSON.parse(localStorage.getItem("bookmarks"))
            : [],
        };

    //////////////////////////////
    /// map actions //////////
    case "MAP_CLICK_EVENT":
      const { cursor, handler } = action;
      window.__map__.setMapCursor(cursor);
      if (window.__map__.click) {
        window.__map__.click.remove();
        window.__map__.click = null;
      }
      if (handler) window.__map__.click = window.__map__.on("click", handler);
      return state;

    case "ACTIVATE_MULTI_SELECT":
      return {
        ...state,
        multiSelectActive: {
          isActive: true,
          layerName: action.layerName,
          typeUse: action.typeUse,
          isForFeasibilityStudy: action.feasibilityStudySelect,
        },
      };
    case "DIACTIVATE_MULTI_SELECT":
      return {
        ...state,
        multiSelectActive: {
          isActive: false,
          layerName: "",
        },
      };

    case "ACTIVATE_SINGLE_SELECT":
      return {
        ...state,
        singleSelectActive: {
          isActive: true,
          layerName: action.layerName,
          purposeOfSelect: action.purposeOfSelect,
        },
      };
    case "DIACTIVATE_SINGLE_SELECT":
      return {
        ...state,
        singleSelectActive: {
          isActive: false,
          layerName: "",
          purposeOfSelect: "",
        },
      };
    ////////////////////////////////
    default:
      return state;
  }
};

export const checkTokenExpiration = async (user, dontMakeLogout) => {
  try {
    let res = await axios.post(
      window.API_URL + "Authenticate",
      {},
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
    );
    let editedUser = {...user};
    editedUser.token = res.data.token;
    editedUser.esriToken = res.data.esriToken;
    store.dispatch({ type: "SET_CURRENT_USER", data: editedUser });
    localStorage.setItem("userToken", res.data.token);
    localStorage.setItem("user", JSON.stringify(editedUser));
    return true;
  } catch (err) {
    if (!dontMakeLogout) {
      store.dispatch({ type: "LOGOUT" });
    }
    return false;
  }
};

import { createStore } from "redux";
import reducer from "./reducers";
import INIT_STATE from "./initState";


let store =createStore(reducer, INIT_STATE, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())
// //check user auth
// store.dispatch({ type:"CHECK_AUTHINTICATION" })
export default store;



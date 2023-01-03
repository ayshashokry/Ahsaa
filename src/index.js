import React, { Fragment, Suspense, lazy } from "react";

import { Provider } from "react-redux";
import store from "./redux/store";
import ReactDOM from "react-dom";
import Loader from "./components/loader";

import { ConfigProvider } from "antd";


import "./index.css";
import "antd/dist/antd.css";





function renderApp() {
  // lazy loading the app so configuration can be applied
  const App = lazy(() => import("./App"));

  ReactDOM.render(
    <React.StrictMode>
      <Fragment>
        <ConfigProvider direction="rtl">
          <Provider store={store}>

            <Suspense fallback={<Loader />}>
              <App />
            </Suspense>

          </Provider>
          
        </ConfigProvider>
      </Fragment>
    </React.StrictMode>,
    document.getElementById("root")
  );
}


renderApp();
//check user auth

let promiseOfAuthenticate = new Promise((resolve)=>resolve(store.dispatch({type:"AUTHENTICATE"})))
promiseOfAuthenticate.then(res=>{
  store.dispatch({ type:"SET_BOOKMARKS_INTO_STATE" })
})


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();

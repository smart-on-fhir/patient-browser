/* eslint-disable @typescript-eslint/ban-ts-comment */
import ReactDOM from "react-dom/client";
import * as bootstrap from "bootstrap";
import { Provider } from "react-redux";
import { Route, Routes } from "react-router";
import { BrowserRouter } from "react-router-dom";
import STORE from "./redux";
// Import early so other children component styles cascade over bootstrap styles
import "./main.scss";
import App from "./components/App";
import PatientList from "./components/PatientList";
import PatientDetail from "./components/PatientDetail";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// TODO: Determine if this is necessary
// import * as popper from "@popperjs/core";


ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={STORE}>
    <App>
      <BrowserRouter>
        <Routes>
          <Route path="/" Component={PatientList} />
          <Route path="/patient/:index" Component={PatientDetail} />
        </Routes>
      </BrowserRouter>
    </App>
  </Provider>
);

// QUESTION: Is document ready necessary for a react component?
// $(function () {
const body = document.getElementsByTagName("body")[0];
new bootstrap.Tooltip(body, {
  selector: ".patient-detail-page [title]",
});
// alert("change seen?");
// });

import ReactDOM from "react-dom/client";
import * as bootstrap from "bootstrap";
import { Provider } from "react-redux";
import { Route, Routes } from "react-router";
import { HashRouter } from "react-router-dom";
import STORE from "./redux";
// Import early so other children component styles cascade over bootstrap styles
import "./main.scss";
import App from "./components/App";
import PatientList from "./components/PatientList";
import PatientDetail from "./components/PatientDetail";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={STORE}>
    {/* TSC is getting confused by the mixing of propTypes & redux's connect fn */}
    {/* @ts-ignore */}
    <App>
      <HashRouter>
        <Routes>
          <Route path="/" Component={PatientList} />
          <Route path="/patient/:index" Component={PatientDetail} />
        </Routes>
      </HashRouter>
    </App>
  </Provider>
);

const body = document.getElementsByTagName("body")[0];
new bootstrap.Tooltip(body, {
  selector: ".patient-detail-page [title]",
});

import { Provider } from "react-redux";
import { createStore, combineReducers } from "redux";
import { storeManager } from "@data-provider/core";

import About from "./modules/about";
import Settings from "./modules/settings";
import Mocks from "./modules/collections";
import CurrentRouteVariant from "./modules/current-route-variant";
import Routes from "./modules/routes";
import Alerts from "./modules/alerts";

import "./App.css";

const store = createStore(
  combineReducers({
    dataProviders: storeManager.reducer,
  }),
  window && window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
);

storeManager.setStore(store, "dataProviders");

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <header className="App-header">
          <About />
          <Settings />
          <Mocks />
          <CurrentRouteVariant />
          <Routes />
          <Alerts />
        </header>
      </div>
    </Provider>
  );
}

export default App;

import { I18nextProvider } from 'react-i18next';
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';

import { AppContainer0 } from './app/AppContainer';
import { ToastsContext } from './app/ToastsContext';
import { i18n } from './i18n/i18n';

function App() {
  return (
    <div className="App">
      <I18nextProvider i18n={i18n}>
        <ToastsContext>
          <BrowserRouter>
            <Routes>
              <Route
                path="/*"
                element={<AppContainer0></AppContainer0>}></Route>
            </Routes>
          </BrowserRouter>
        </ToastsContext>
      </I18nextProvider>
    </div>
  );
}

export default App;

import { I18nextProvider } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';

import { AppContainer } from './app/AppContainer';
import { ToastsContext } from './app/ToastsContext';
import { GlobalStyles } from './app/layout/GlobalStyles';
import { i18n } from './i18n/i18n';
import { ResponsiveApp } from './ui-components/ResponsiveApp';
import { ThemedApp } from './ui-components/ThemedApp';
import { ConnectedUserWrapper } from './user-login/contexts/ConnectedUserWrapper';

function App() {
  return (
    <div className="App">
      <I18nextProvider i18n={i18n}>
        <ToastsContext>
          <BrowserRouter>
            <ConnectedUserWrapper>
              <GlobalStyles />
              <ThemedApp>
                <ResponsiveApp>
                  <AppContainer></AppContainer>
                </ResponsiveApp>
              </ThemedApp>
            </ConnectedUserWrapper>
          </BrowserRouter>
        </ToastsContext>
      </I18nextProvider>
    </div>
  );
}

export default App;

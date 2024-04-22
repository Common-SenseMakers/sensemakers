import { I18nextProvider } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';

import { AppContainer } from './app/AppContainer';
import { GlobalStyles } from './app/layout/GlobalStyles';
import { i18n } from './i18n/i18n';
import { ResponsiveApp } from './ui-components/ResponsiveApp';
import { ThemedApp } from './ui-components/ThemedApp';
import { AccountContext } from './user/contexts/AccountContext';
import { DisconnectContext } from './user/contexts/DisconnectContext';
import { NanopubContext } from './user/contexts/platforms/NanopubContext';
import { TwitterContext } from './user/contexts/platforms/TwitterContext';
import { ConnectedWallet } from './user/contexts/signer/ConnectedWalletContext';
import { SignerContext } from './user/contexts/signer/SignerContext';

function App() {
  return (
    <div className="App">
      <I18nextProvider i18n={i18n}>
        <BrowserRouter>
          <AccountContext>
            <ConnectedWallet>
              <SignerContext>
                <TwitterContext>
                  <NanopubContext>
                    <DisconnectContext>
                      <GlobalStyles />
                      <ThemedApp>
                        <ResponsiveApp>
                          <AppContainer></AppContainer>
                        </ResponsiveApp>
                      </ThemedApp>
                    </DisconnectContext>
                  </NanopubContext>
                </TwitterContext>
              </SignerContext>
            </ConnectedWallet>
          </AccountContext>
        </BrowserRouter>
      </I18nextProvider>
    </div>
  );
}

export default App;

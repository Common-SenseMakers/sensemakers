import { I18nextProvider } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';

import { AccountContext } from './app/AccountContext';
import { AppContainer } from './app/AppContainer';
import { DisconnectContext } from './app/DisconnectContext';
import { GlobalStyles } from './app/GlobalStyles';
import { NanopubContext } from './app/NanopubContext';
import { TwitterContext } from './app/TwitterContext';
import { ConnectedWallet } from './app/signer/ConnectedWalletContext';
import { SignerContext } from './app/signer/SignerContext';
import { i18n } from './i18n/i18n';
import { ResponsiveApp } from './ui-components/ResponsiveApp';
import { ThemedApp } from './ui-components/ThemedApp';

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

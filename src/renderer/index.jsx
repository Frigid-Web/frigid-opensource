import { createRoot } from 'react-dom/client';

import { store } from './store/store';
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import './vivify.min.css';
import { BrowserRouter } from 'react-router-dom';
const container = document.getElementById('root');
const root = createRoot(container);
import { Provider } from 'react-redux';
import { Suspense, lazy } from 'react';
import { HelmetProvider } from 'react-helmet-async';

const App = lazy(() => import('./native/App'));
const WebStartApp = lazy(() => import('./webStart/WebStartApp'));

const Home = lazy(() => import('./webApp/home'));

root.render(
  window.electron ? (
    <Provider store={store}>
      <MantineProvider>
        <Suspense fallback={<></>}>
          <App />
        </Suspense>
      </MantineProvider>
    </Provider>

  )
    :

     (() => {
        switch (window.location.hostname) {
          case 'dev.frigid': {
            return (
              <HelmetProvider>
                <Provider store={store}>
                  <MantineProvider>
                    <BrowserRouter>
                      <Suspense fallback={<></>}>
                        <Home />
                      </Suspense>
                    </BrowserRouter>
                  </MantineProvider>
                </Provider>
              </HelmetProvider>
            )
          }
          case 'start.frigid': {
            return (
              <HelmetProvider>
                <Provider store={store}>
                  <MantineProvider>
                    <BrowserRouter>
                      <Suspense fallback={<></>}>
                        <WebStartApp />
                      </Suspense>
                    </BrowserRouter>
                  </MantineProvider>
                </Provider>
              </HelmetProvider>
            )
          }
          default: {
            return (
             <p>Resource not Found</p>
            )
          }
        }
     })()




);

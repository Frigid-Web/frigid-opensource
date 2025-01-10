import { MemoryRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DevRoot from './developer/devRoot';
import YourApps from './developer/yourapps.js/apps';
import AppViewer from './developer/yourapps.js/appViewer';
import Docs from './developer/docs/docs';
import { useEffect, useState } from 'react';
import BuyDomains from './developer/buyDomains/buyDomains';

import { useDispatch, useSelector } from "react-redux";
import Dexie from 'dexie';
import MyDomains from './developer/myDomains/myDomains';
import PublishingRoot from './developer/docs/d_publishing/publishingRoot';
import MetaMaskRoot from './developer/docs/d_metamask/metamaskRoot';
import DomainRoot from './developer/docs/d_domains/domainRoot';

import OverviewPage from './developer/docs/d_publishing/overview';
import SpeedUpPage from './developer/docs/d_publishing/speedup';
import StartGuide from './developer/docs/d_publishing/startguide';

import MetamaskInstallationPage from './developer/docs/d_metamask/installation';
import MetamaskUsagePage from './developer/docs/d_metamask/usage';
import MetamaskIntroductionPage from './developer/docs/d_metamask/introduction';

import DomainOverviewPage from './developer/docs/d_domains/overview';
import HowToPage from './developer/docs/d_domains/howTo';
import SellTransferPage from './developer/docs/d_domains/sellandtransfer';

export const db = new Dexie('frigidDB');
import { Loading } from './auth/loading';
import './web.css'
import { Helmet } from 'react-helmet-async';
import logo from '../../../assets/favicondev.png'
import CurrencyRoot from './developer/currency/currencyRoot';
import C_AppPublishing from './developer/currency/c_apppublishing';
import C_Domains from './developer/currency/c_domains';
import { getAvailableNetworks } from './httpCalls/frigidApi';
import { setNetworkTokens } from '../helpers/helper';
import { setContractsLoaded } from '../store/schemas/chainSlice';
import DomainsCheck from './components/domainsCheck';

db.version(1).stores({
  domains: '++id, name, forSale, price, networkName, networkSlug, sold, suffix, ownerAddress',
  apps: '++id, name, domain, keywords, description, version, created, icon, ownerAddress',
  deployments: '++id, appId, description, version, created, noIndex, ownerAddress, status, transactionHash'
});



export default function Home() {
  const dispatch = useDispatch()
  const [networksRetrieved, setNetworksRetrieved] = useState(false)
  const accountId = useSelector(state => state.mainapp.authSlice.metamask.accountId)
  const currentChain = useSelector(state => state.mainapp.chainSlice.currentChain)

  useEffect(() => {

    dispatch(getAvailableNetworks()).then(async () => {
      const result = await setNetworkTokens()
      if (result) {
        dispatch(setContractsLoaded(true))
      }
      setNetworksRetrieved(true)
    })
  }, [accountId, currentChain])


  return (

    <>

      <Helmet>
        <title>Frigid Developer</title>
        <meta name="description" content="Frigid is a decentralized platform for building, deploying, and managing web applications on the blockchain." />
        <link rel="icon" href={logo} />
      </Helmet>

      <Loading />
      {
        networksRetrieved ?
          <Routes>
            <Route path="/" element={<DevRoot />} >
              <Route path="/docs" element={<Docs />} >
                <Route path="/docs" element={<Navigate replace to="/docs/publishing" />} />
                <Route path="/docs/publishing" element={<PublishingRoot />} >
                  <Route path="/docs/publishing" element={<Navigate replace to="/docs/publishing/overview" />} />
                  <Route path="/docs/publishing/overview" element={<OverviewPage />} />
                  <Route path="/docs/publishing/startguide" element={<StartGuide />} />
                  <Route path="/docs/publishing/speedup" element={<SpeedUpPage />} />
                </Route>
                <Route path="/docs/metamask" element={<MetaMaskRoot />} >
                  <Route path="/docs/metamask" element={<Navigate replace to="/docs/metamask/introduction" />} />
                  <Route path="/docs/metamask/installation" element={<MetamaskInstallationPage />} />
                  <Route path="/docs/metamask/usage" element={<MetamaskUsagePage />} />
                  <Route path="/docs/metamask/introduction" element={<MetamaskIntroductionPage />} />
                </Route>

                <Route path="/docs/domains" element={
                  <DomainRoot />
                } >
                  <Route path="/docs/domains" element={<Navigate replace to="/docs/domains/overview" />} />
                  <Route path="/docs/domains/overview" element={<DomainOverviewPage />} />
                  <Route path="/docs/domains/howto" element={<HowToPage />} />
                  <Route path="/docs/domains/sellandtransfer" element={<SellTransferPage />} />

                </Route>
              </Route>
              <Route path="/currency" element={<CurrencyRoot />} >
                <Route path="/currency" element={<Navigate replace to="/currency/apppublishing" />} />
                <Route path="/currency/apppublishing" element={<C_AppPublishing />} />
                <Route path="/currency/domains" element={<C_Domains />} />

              </Route>


              <Route path="/" element={<Navigate replace to="/apps" />} />
              <Route path="/apps" element={<DomainsCheck><YourApps /></DomainsCheck>} />
              <Route path="/apps/:id" element={<AppViewer />} />
              <Route path="/buydomains" element={<BuyDomains />} />
              <Route path="/mydomains" element={<DomainsCheck><MyDomains /></DomainsCheck>} />


            </Route>


          </Routes >

          :
          null
      }

    </>



  );
}

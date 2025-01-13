import { MemoryRouter as Router, Routes, Route, useNavigate, Outlet } from 'react-router-dom';
import ScreenRoot from './screenroot';
import Network from "./network/network";
import More from './more/more';

import Apps from './apps/apps';
import Developer from './developer/developer';
import Settings from './settings/settings';
import './App.css'
import B_RPCForm from './settings/boards/b_rpcForm';
import B_RPCStart from './settings/boards/b_rpcStart';
import B_RPCComplete from './settings/boards/b_rpcComplete';

import B_Welcome from './network/boards/b_welcome';
import B_Profile from './network/boards/b_profile';
import B_DNS from './network/boards/b_dns';
import B_Complete from './network/boards/b_complete';

import { useEffect, useState } from 'react';
import Permission from './permissions/permission';




export default function App() {
 


  return (


    <>
      <div className='drag-zone'></div>



      <Router>
        <Routes>


          <Route  element={<ScreenRoot />} >
            <Route path="/" element={<Network />} >
              <Route path="/" element={<Permission />} />
              <Route path="/onboarding/start" element={<B_Welcome />} />
              <Route path="/onboarding/profile/" element={<B_Profile />} />
              <Route path="/onboarding/dns/" element={<B_DNS />} />
              <Route path="/onboarding/complete/" element={<B_Complete />} />
            </Route>
          
              <Route path="/more" element={<More />} />
              <Route path="/settings" element={<Settings />} >
                <Route path="/settings/rpcsetup/start" element={<B_RPCStart />} />
                <Route path="/settings/rpcsetup/form" element={<B_RPCForm />} />
                <Route path="/settings/rpcsetup/complete" element={<B_RPCComplete />} />
              </Route>
              <Route path="/apps" element={<Apps />} />
              <Route path="/developer" element={<Developer />} />
            </Route>

        </Routes>
      </Router>
    </>

  );
}

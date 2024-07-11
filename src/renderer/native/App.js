import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import ScreenRoot from './screenroot';
import Network from "./network/network";
import More from './more/more';

import Apps from './apps/apps';
import Developer from './developer/developer';
import Settings from './settings/settings';
import './App.css'


export default function App() {

 
  return (


    <>
      <div className='drag-zone'></div>

      <Router>
        <Routes>


          <Route path="/" element={<ScreenRoot />} >
            <Route path="/" element={<Network />} />
            <Route path="/more" element={<More />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/apps" element={<Apps />} />
            <Route path="/developer" element={<Developer />} />
          </Route>

        </Routes>
      </Router>
    </>
  
  );
}

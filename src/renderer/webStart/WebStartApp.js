import { Helmet } from 'react-helmet-async';
import './webStart.css'
import './vivify.min.css'
import logo from '../../../assets/startIcon.png'
import { Route, Routes } from 'react-router-dom';
import Wrapper from './mainapp/wrapper';
import Home from './mainapp/hompage/home';
import B_StartWelcome from '../webDev/components/boards/b_startWelcome';
import B_StartHue from '../webDev/components/boards/b_startHue';

export default function WebStartApp() {



  return (

    <>

      <Helmet>
        <title>Frigid Start</title>
        <meta name="description" content="Frigid is a decentralized platform for building, deploying, and managing web applications on the blockchain." />
        <link rel="icon" href={logo} />
      </Helmet>

      {

        <Routes>
          <Route path="/" element={<Wrapper />} >
            <Route path="/" element={<Home />} >
              <Route path="/onboarding/start" element={<B_StartWelcome />} />
              <Route path="/onboarding/hue" element={<B_StartHue />} />
            </Route>

          </Route>


        </Routes >

      }

    </>



  );
}

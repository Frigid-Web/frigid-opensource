import { Helmet } from 'react-helmet-async';
import './webStart.css'
import './vivify.min.css'
import logo from '../../../assets/startIcon.png'
import { Route, Routes } from 'react-router-dom';
import Wrapper from './mainapp/wrapper';
import Home from './mainapp/hompage/home';


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
            <Route path="/" element={<Home />} />

          </Route>


        </Routes >

      }

    </>



  );
}

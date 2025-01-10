import React, { useEffect, useState } from 'react';
import O_BoardController from './o_boardController';
import network from '../../../../../assets/network.svg'
import norequest from '../../../../../assets/norequest.svg'
import dollarbox from '../../../../../assets/dollarbox.svg'
import bandwidth from '../../../../../assets/bandwidth.svg'
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import bolt from '../../../../../assets/bolt.svg'
import frigidVector from '../../../../../assets/frigidvector.svg'
import { useParams } from 'react-router-dom';


const B_Welcome = (props) => {
    const navigate = useNavigate();
    const [navigatePathway, setNavigatePathway] = useState('/onboarding/profile')
   
    useEffect(() => {
        // case "getStatusForConfiguration":
        //     const certificateStatus = await checkIfRootCAExistsInRegistry() && await checkIfRootCAFileExists();
        //     const dnsStatus = await setLocalhostAsPrimaryDNS()
        //     event.reply('configuration-status', JSON.stringify({ certificateStatus, dnsStatus }));
        //     break;
        const handleConfiguration = (data) => {
            const status = JSON.parse(data)
            if (status.certificateStatus && status.dnsStatus) {
                setNavigatePathway('/onboarding/complete')
            }
            else if(status.certificateStatus && !status.dnsStatus){
                setNavigatePathway('/onboarding/dns')
            }
            else{
                setNavigatePathway('/onboarding/profile')
            }
        };

        let listener = window.electron.ipcRenderer.on('configuration-status', handleConfiguration);
        window.electron.ipcRenderer.sendMessage('native', 'getStatusForConfiguration', 'true')

        return () => {
            //kills listener
            listener()
        };

    }, [])


    return (
        <>
            <O_BoardController >
                <div className='board-content'>
                    <div>
                        <div style={{ marginTop: 20, marginBottom: 30, alignItems: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column' }} className='board-header'>
                            <img style={{ width: 100 }} src={frigidVector} alt='bolt' />
                            <h1 >Welcome To Frigid</h1>
                            <p style={{ textAlign: 'center', width: '90%' }}>Explore apps and websites hosted entirely on the blockchain using (ERC20) networks.</p>
                        </div>
                    </div>

                    <div className='board-cta'>
                        <button className='board-cta-button' onClick={
                            () => {
                                navigate(navigatePathway);
                            }
                        }>Get Started</button>
                        <p>Web Browser Required</p>
                    </div>
                </div>
            </O_BoardController>
        </>
    );
};

export default B_Welcome
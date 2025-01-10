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

import addTo from '../../../../../assets/addTo.svg'
import confirm from '../../../../../assets/confirm.svg'


const B_DNS = (props) => {
    const navigate = useNavigate();
    const [disable, setDisable] = useState(false)
    const updateDNSPermission = () => {
        setDisable(true)
        if (props.permissionFunc == null) {
            window.electron.ipcRenderer.sendMessage('native', 'installDNS', 'true')
        }
        else {
            props.permissionFunc()
        }
        setTimeout(() => {
            setDisable(false)
        }, 500)
    }

    useEffect(() => {
        if (props.permissionFunc == null) {
            const handleDNS = (data) => {
                window.electron.ipcRenderer.sendMessage('native', 'getStatusForConfiguration', 'true')
            };

            const handleConfiguration = (data) => {
                const status = JSON.parse(data)
                let navigatePathway = '/onboarding/complete'

                if (!status.certificateStatus) {
                    navigatePathway = '/onboarding/profile'
                }
                else {
                    navigatePathway = '/onboarding/complete'
                }

                if (status.dnsStatus) {
                    navigate(navigatePathway)
                }
            };

            let listener = window.electron.ipcRenderer.on('configuration-status', handleConfiguration);
            let listener2 = window.electron.ipcRenderer.on('dnsInitialized', handleDNS);

            window.electron.ipcRenderer.sendMessage('native', 'getStatusForConfiguration', 'true')


            return () => {
                //kills listener
                listener()
                listener2()

            };
        }


    }, [])


    return (
        <>
            <O_BoardController >
                <div className='board-content' style={{ gap: 15 }}>
                    <div>
                        <div className='board-header'>
                            <img src={network} alt='network' />
                            <h1>Last Step: Get Connected</h1>
                            <p>This allows us to provide web3 content when you visit a frigid domain. So we can give you access to website hosted on the blockchain.</p>
                        </div>

                    </div>

                    <div className='board-cta'>
                        <button style={{ pointerEvents: disable ? 'none' : 'all' }} className='board-cta-button' onClick={
                            () => {

                                updateDNSPermission()
                            }
                        }>Allow Access</button>

                    </div>
                </div>
                <style>
                    {
                        `
                                .board-cta {
    justify-content: flex-start;
    align-items: flex-start;
    margin-bottom: 37px;
}
                                `
                    }
                </style>
            </O_BoardController>
        </>
    );
};

export default B_DNS
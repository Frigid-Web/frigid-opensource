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
import video from '../../../../../assets/instructionvideo.gif'

const B_Profile = (props) => {
    const navigate = useNavigate();
    const [disable, setDisable] = useState(false)
    const updateCAPermission = () => {
        setDisable(true)
        if (props.permissionFunc == null) {
            window.electron.ipcRenderer.sendMessage('native', 'installRootCA', 'true')
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
            const handleCA = (data) => {
                window.electron.ipcRenderer.sendMessage('native', 'getStatusForConfiguration', 'true')
            };

            const handleConfiguration = (data) => {
                const status = JSON.parse(data)
                let navigatePathway = '/onboarding/profile'

                if (!status.dnsStatus) {
                    navigatePathway = '/onboarding/dns'
                }
                else {
                    navigatePathway = '/onboarding/complete'
                }
                if (status.certificateStatus) {
                    navigate(navigatePathway)
                }
            };

            let listener = window.electron.ipcRenderer.on('configuration-status', handleConfiguration);
            let listener2 = window.electron.ipcRenderer.on('rootCAInitialized', handleCA);

            window.electron.ipcRenderer.sendMessage('native', 'getStatusForConfiguration', 'true')


            return () => {
                listener()
                listener2()

            };
        }

    }, [])

    return (
        <>
            <O_BoardController >

                <div className='board-content'>
                    <div>
                        <div className='board-video'>
                            <img src={video} alt='video' />
                        </div>


                        <div style={{ padding: '0px 35px' }} className='board-list'>
                            <div className='board-list-item'>

                                <div className='board-list-item-text'>
                                    <h4>Add Profile To System Settings</h4>
                                    <p>Click the button below to add the profile to system settings. System settings should open automatically.</p>
                                </div>
                            </div>
                            <div className='board-list-item'>

                                <div className='board-list-item-text'>
                                    <h4>Double Click & Install</h4>
                                    <p>Open the profile in system settings and double click the profile and then click install.</p>
                                </div>
                            </div>


                        </div>
                    </div>

                    <div className='board-cta'>
                        <button style={{ pointerEvents: disable ? 'none' : 'all' }} className='board-cta-button' onClick={
                            () => {
                                updateCAPermission()
                            }
                        }>Add Profile To Settings</button>

                    </div>
                </div>

                <style>
                    {
                        `


        .board-inlet {
        padding: 0px}`
                    }
                </style>
            </O_BoardController>
        </>
    );
};

export default B_Profile
import React, { useEffect } from 'react';
import PermissionItem from './permissionItem';
import { useSelector } from 'react-redux';
import B_DNS from '../network/boards/b_dns';
import B_Profile from '../network/boards/b_profile';
import { useNavigate } from 'react-router-dom';

const Permission = (props) => {
    const navigate = useNavigate();
    const [dnsPermission, setDnsPermission] = React.useState(props.dns || true)
    const [certificatePermission, setCertificatePermission] = React.useState(props.ca || true)
    const [disable, setDisable] = React.useState(props.disable || false)
    const networkActive = useSelector(state => state.mainapp.networkSlice.networkActive)

    const updateCAPermission = (value) => {
        window.electron.ipcRenderer.sendMessage('native', 'installRootCA', 'true')
    }

    const updateDNSPermission = (value) => {
        window.electron.ipcRenderer.sendMessage('native', 'installDNS', 'true')
    }

    useEffect(() => {
        const handleCA = (data) => {
            if (data == 'false') {
                setCertificatePermission(false)
                navigate('/?background=false')
            }
            else {
                setCertificatePermission(true)
                navigate('/')
                window.electron.ipcRenderer.sendMessage('native', 'toggleNetwork', networkActive ? 'turn-off' : 'turn-on')
            }
            setDisable(false)
        };

        const handleDNS = (data) => {
            if (data == 'false') {
                setDnsPermission(false)
                navigate('/?background=false')
            }
            else {
                setDnsPermission(true)
                navigate('/')

                window.electron.ipcRenderer.sendMessage('native', 'toggleNetwork', networkActive ? 'turn-off' : 'turn-on')
            }
            setDisable(false)

        };

        let listener = window.electron.ipcRenderer.on('rootCAInitialized', handleCA);
        let listener2 = window.electron.ipcRenderer.on('dnsInitialized', handleDNS);


        return () => {
            //kills listener
            listener()
            listener2()
        };

    }, [])

    return (
        <>
            {
                dnsPermission ? null : <div className='permission-gateway'>
                    {
                        <B_DNS permissionFunc={updateDNSPermission} />
                        // <PermissionItem disable={disable} setDisable={setDisable} permissionFunc={updateDNSPermission} title={'Adjust Your DNS Configuration'} desc={'This gives your machine the ability to load web3 Frigid Domains that provide web3 content.'} icon={'build_circle'} />
                    }
                </div>
            }

            {
                certificatePermission ? null : <div className='permission-gateway'>
                    {

                        <B_Profile permissionFunc={updateCAPermission} />
                        // <PermissionItem disable={disable} setDisable={setDisable} permissionFunc={updateCAPermission} title={'Create New Certificates on Your Device'} desc={'This will allow us to create secure connections (Https) to the blockchain. By creating certificates for every Frigid Domain you visit.'} icon={'hotel_class'} />
                    }
                    {/*     {
                        <PermissionItem disable={disable} setDisable={setDisable} permissionFunc={updateCAPermission} title={
                            os.platform() == 'darwin' ? 'Create Secure Connection to Blockchain' : 'Create New Certificates on Your Device'
                        } desc={
                            os.platform() == 'darwin' ? 'This allows us to create a secure connection to the Blockchain for all the sites you visits' : 'This will allow us to create secure connections to the blockchain. By creating certificates for every website you visit.'
                        } icon={'hotel_class'} />
                    } */}
                </div>
            }
            <style>
                {`
            .permission-gateway {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgb(0 0 0 / 27%);
                display: flex;
                justify-content: center;
                align-items: center;
                backdrop-filter: blur(20px);
                z-index: 100;
            }

            .permission-modal {
                width: 380px;
                padding: 40px;
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                background-color: #181818;
                border-radius: 15px;
            }

            .permission-header {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;

            }

            .permission-header > i {
                font-size: 90px;
                color: white;
            }

            .permission-header > h1 {
                font-size: 33px;
                text-align: center;
                line-height: 43px;
            }

            .permission-header > p {
                font-size: 14px;
    text-align: center;
    line-height: 25px;
    color: white;
    margin-top: 7px;
            }

            .permission-button {
                display: flex;
    align-items: center;
    justify-content: center;
    color: black;
    font-size: 15px;
    text-transform: uppercase;
    font-weight: 700;
    background-color: white;
    width: 180px;
    border: none;
    padding: 12px 20px;
    border-radius: 50px;
    margin-top: 35px
            }
            `}
            </style>
        </>
    );
};

export default Permission
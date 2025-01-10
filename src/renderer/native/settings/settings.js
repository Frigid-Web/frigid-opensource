import React, { useEffect, useMemo } from 'react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import S_BoardController from './boards/s_boardController';
// import { getAppInfo } from '../../helpers/appInfo';
import { Outlet } from 'react-router-dom';
import { checkRpc } from './boards/helperCheckRpc';

const Settings = () => {

    const location = useLocation()
    const [flipFlopRefresh, setFlipFlopRefresh] = useState(false)

   

    useEffect(() => {
        setFlipFlopRefresh(!flipFlopRefresh)
    }, [location])
    const testRPC = async (url, chainName) => {
        return await checkRpc(url, chainName)
    };

    const handleInputChange = async (key, value, e) => {
        const isValid = await testRPC(value, key)
        if (isValid) {
            window.electron.store.set(`rpc.${key}`, value);
        } else {
            e.target.value = window.electron.store.get(`rpc.${key}`);
        }
    };

  


    return (
        <>
            <Outlet></Outlet>
            <div className='settings-page'>
                <h1>Settings</h1>

                <div className='options-list'>

                    {/* <div className='option-block'>
                    <h4 style={{ marginBottom: '-9px' }}>DNS Configuration</h4>
                    <div className='text-container'>
                        <label for='dns'>Primary</label>
                        <input style={
                            {
                                cursor: 'not-allowed'
                            }
                        } type='text' id='rpc' defaultValue={'Frigid Network'} disabled />
                        <p>Unchangeable - Primary router is the frigid network when network is powered on </p>
                    </div>
                    <div className='text-container'>
                        <label for='dns'>Secondary</label>
                        <input type='text' id='rpc' defaultValue={'196.0.0.1'} />

                    </div>
                </div> */}

                    {/*  <div className='option-block'>
                    <h4>Blockchain RPC</h4>
                    {(() => {

                        let arr = []
                        if (chainAppInfo != undefined) {
                            for (let key in chainAppInfo.supportedNetworks) {
                                arr.push(handlerForInputs(key))
                            }
                        }

                        return arr

                    })()}

                </div> */}

                    <div className='settings-container'>
                        <div className='settings-option'>
                            <h3>Network RPC's</h3>
                            <div className='settings-option-items'>
                                
                                {
                                    (() => {
                                        let elements = []
                                        let rpc = window.electron.store.get('rpc')
                                        for(let key in rpc){
                                            if(key != 'version' && rpc[key] != null){
                                                elements.push(
                                                    <div className='option-input' key={key+rpc[key]}>
                                                        <input type='text' id={key} defaultValue={window.electron.store.get(`rpc.${key}`)} onBlur={(e) => { handleInputChange(key, e.target.value, e) }} />
                                                        <label htmlFor={key}>{key}</label>
                                                    </div>
                                                )
                                            }
                                          
                                        }
                                        return  elements
                                    })()
                                }

                            </div>
                            <div className='settings-option-buffer'>
                                <Link to='/settings/rpcsetup/start'>
                                    Want to Add Another Network? <span>Add New </span>
                                </Link>
                            </div>
                        </div>
                    </div>




                </div>
            </div></>
    );
};

export default Settings;
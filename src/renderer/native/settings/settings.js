import React, { useMemo } from 'react';
import { useState } from 'react';
// import { getAppInfo } from '../../helpers/appInfo';

const Settings = () => {
    const [ethereum, setEthereum] = useState(window.electron.store.get('rpc.ethereum'));
    const [binanceSmartChain, setBinanceSmartChain] = useState(window.electron.store.get('rpc.binance'));
    const [ethereumClassic, setEthereumClassic] = useState(window.electron.store.get('rpc.ethereumclassic'));
    const [avalanche, setAvalanche] = useState(window.electron.store.get('rpc.avalanche'));
    const [arbitrum, setArbitrum] = useState(window.electron.store.get('rpc.arbitrum'));
    const [optimism, setOptimism] = useState(window.electron.store.get('rpc.optimism'));
    const [fantomOpera, setFantomOpera] = useState(window.electron.store.get('rpc.fantom'));
    const [polygon, setPolygon] = useState(window.electron.store.get('rpc.polygon'));
    const [chainAppInfo, setChainAppInfo] = useState(window.electron.store.get('chainAppInfo'));

    console.log(window.electron.store.get('rpc'))
    const testRPC = async (url) => {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'web3_clientVersion',
                    params: [],
                    id: 1
                })
            });
            const data = await response.json();
            return data.result !== undefined;
        } catch (error) {
            return false;
        }
    };

    const handleInputChange = async (key, value, setValue, e) => {
        const isValid = await testRPC(value)
        if (isValid) {
            setValue(value);
            window.electron.store.set(`rpc.${key}`, value);
        } else {
            setValue(window.electron.store.get(`rpc.${key}`)); // revert to previous value
            e.target.value = window.electron.store.get(`rpc.${key}`);
        }
    };

    const handlerForInputs = (key) => {
        let html
        switch (key) {
            case 'etheruem':
                html = <>
                    <div className='text-container'>
                        <label htmlFor='ethRpc'>Ethereum</label>
                        <input type='text' id='ethRpc' defaultValue={ethereum} onBlur={(e) => { handleInputChange('ethereum', e.target.value, setEthereum, e) }} />
                    </div>
                </>
                break;
            case 'binance':
                html = <>
                    <div className='text-container'>
                        <label htmlFor='bscRpc'>Binance Smart Chain</label>
                        <input type='text' id='bscRpc' defaultValue={binanceSmartChain}
                            onBlur={(e) => { handleInputChange('binance', e.target.value, setBinanceSmartChain, e) }}
                        />
                    </div>
                </>
                break;
            case 'ethereumclassic':
                html = <>
                    <div className='text-container'>
                        <label htmlFor='etcRpc'>Ethereum Classic</label>
                        <input type='text' id='etcRpc' defaultValue={ethereumClassic}
                            onBlur={(e) => { handleInputChange('ethereumclassic', e.target.value, setEthereumClassic, e) }}
                        />
                    </div>
                </>
                break;
            case 'avalanche':
                html = <>
                    <div className='text-container'>
                        <label htmlFor='avaxRpc'>Avalanche</label>
                        <input type='text' id='avaxRpc' defaultValue={avalanche}
                            onBlur={(e) => { handleInputChange('avalanche', e.target.value, setAvalanche, e) }}
                        />
                    </div>
                </>
                break;
            case 'arbitrum':
                html = <>
                    <div className='text-container'>
                        <label htmlFor='arbRpc'>Arbitrum</label>
                        <input type='text' id='arbRpc' defaultValue={arbitrum}
                            onBlur={(e) => { handleInputChange('arbitrum', e.target.value, setArbitrum, e) }}
                        />
                    </div>
                </>
                break;
            case 'optimism':
                html = <>
                    <div className='text-container'>
                        <label htmlFor='optRpc'>Optimism</label>
                        <input type='text' id='optRpc' defaultValue={optimism}
                            onBlur={(e) => { handleInputChange('optimism', e.target.value, setOptimism, e) }}
                        />
                    </div>
                </>
                break;
            case 'fantom':
                html = <>
                    <div className='text-container'>
                        <label htmlFor='fantomRpc'>Fantom Opera</label>
                        <input type='text' id='fantomRpc' defaultValue={fantomOpera}
                            onBlur={(e) => { handleInputChange('fantom', e.target.value, setFantomOpera, e) }}
                        />
                    </div>
                </>
                break;
            case 'polygon':
                html = <>
                    <div className='text-container'>
                        <label htmlFor='polygonRpc'>Polygon</label>
                        <input type='text' id='polygonRpc' defaultValue={polygon}
                            onBlur={(e) => { handleInputChange('polygon', e.target.value, setPolygon, e) }}
                        />
                    </div>
                </>
                break;


            default:
                break;
        }

        return html
    }


    return (
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

                <div className='option-block'>
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

                </div>




            </div>
        </div>
    );
};

export default Settings;
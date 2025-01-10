import React, { useEffect, useState } from 'react';
import S_BoardController from './s_boardController';
import network from '../../../../../assets/network.svg'
import norequest from '../../../../../assets/norequest.svg'
import dollarbox from '../../../../../assets/dollarbox.svg'
import bandwidth from '../../../../../assets/bandwidth.svg'

import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { checkRpc } from './helperCheckRpc';

const B_RPCForm = (props) => {
    const navigate = useNavigate();
    const [options, setOptions] = useState([])
    useEffect(() => {
        (async () => {
            let res = window.electron.store.get('rpc')
            let arr = []
            for(let key in res){
                if(key != 'version' && res[key] == null){
                    arr.push(key)
                }
            }
            setOptions(arr)
        })()
    }, [])

    const handleRpc = async () => {
        let rpc = document.querySelector('input').value
        let network = document.querySelector('select').value
        let res = await checkRpc(rpc, network)
        if(res){
            window.electron.store.set(`rpc.${network}`, rpc)
            navigate('/settings/rpcsetup/complete')
        }
    }

    return (
        <>
            <S_BoardController close={'/settings'}>
                <div className='board-content'>
                    <div>
                        <div style={{ marginTop: 20, marginBottom: 30 }} className='board-header'>

                            <h1>Add RPC Details</h1>
                            <p>Picking the right RPC is important when setting up other networks. Please follow these <Link to={'/settings/rpcsetup/start'}>guidelines</Link>.</p>
                        </div>

                        <div className='board-form'>

                            <div className='board-form-item'>
                                <label>RPC URL</label>
                                <input type='text' placeholder='Ex: https://bsc-rpc.publicnode.com ' />
                            </div>
                            <div className='board-form-item'>
                                <label>Choose Network</label>
                                <select defaultValue="" required>
                                    <option value="" disabled hidden>
                                        Select Network
                                    </option>
                                    {options.map((option, index) => {
                                        return <option key={index} value={option}>{option}</option>
                                    })}
                                    
                                </select>

                            </div>

                        </div>

                    </div>

                    <div className='board-cta'>
                        <button className='board-cta-button' onClick={
                            () => {
                               
                                handleRpc()
                            }
                        }>Complete Setup</button>
                        <p>Custom RPC’s Can Be Risky & Unsafe. Be Safe.</p>
                    </div>
                </div>
            </S_BoardController>
        </>
    );
};

export default B_RPCForm
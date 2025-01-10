import React, { useEffect } from 'react';
import S_BoardController from './dev_boardController.js';
import network from '../../../../../assets/network.svg'
import norequest from '../../../../../assets/norequest.svg'
import dollarbox from '../../../../../assets/dollarbox.svg'
import bandwidth from '../../../../../assets/bandwidth.svg'

import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const B_RPCForm = (props) => {
    const navigate = useNavigate();

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
                                    <option value="1">Mainnet</option>
                                    <option value="3">Ropsten</option>
                                    <option value="4">Rinkeby</option>
                                    <option value="5">Goerli</option>
                                    <option value="42">Kovan</option>
                                    <option value="56">Binance Smart Chain</option>
                                </select>

                            </div>

                        </div>

                    </div>

                    <div className='board-cta'>
                        <button className='board-cta-button' onClick={
                            () => {
                                navigate('/settings/rpcsetup/complete')
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
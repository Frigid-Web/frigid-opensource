import React, { useEffect } from 'react';
import S_BoardController from './s_boardController';
import network from '../../../../../assets/network.svg'
import norequest from '../../../../../assets/norequest.svg'
import dollarbox from '../../../../../assets/dollarbox.svg'
import bandwidth from '../../../../../assets/bandwidth.svg'
import { useNavigate } from 'react-router-dom';


const B_RPCStart = (props) => {
    const navigate = useNavigate();

    return (
        <>
            <S_BoardController close={'/settings'}>
                <div className='board-content'>
                    <div>
                        <div className='board-header'>
                            <img src={network} alt='network' />
                            <h1>Network Guidelines</h1>
                            <p>Picking the right RPC is important when setting up other networks. Please follow these guidelines.</p>
                        </div>
                        <div className='board-list'>
                            <div className='board-list-item'>
                                <img src={bandwidth} alt='bandwidth' />
                                <div className='board-list-item-text'>
                                    <h4>Bandwidth & Data Requirements</h4>
                                    <p>Your RPC needs to support archival data and support at least 100kb of Upload and Download of data.</p>
                                </div>
                            </div>
                            <div className='board-list-item'>
                                <img src={norequest} alt='norequest' />
                                <div className='board-list-item-text'>
                                    <h4>No Request Caps</h4>
                                    <p>Try to avoid a RPC that has limits on how often it can be called Frigid relies on request to show web3 content.</p>
                                </div>
                            </div>
                            <div className='board-list-item'>
                                <img src={dollarbox} alt='dollarbox' />
                                <div className='board-list-item-text'>
                                    <h4>Avoid RPC's That Cost Per Request</h4>
                                    <p>Avoid RPC’s that cost per request. Web3 websites can be very contentful and may require many requests.</p>
                                </div>
                            </div>

                        </div>
                    </div>

                    <div className='board-cta'>
                        <button className='board-cta-button' onClick={
                            () => {
                                navigate('/settings/rpcsetup/form')
                            }
                        }>Get Started</button>
                        <p>Custom RPC’s Can Be Risky & Unsafe. Be Safe.</p>
                    </div>
                </div>
            </S_BoardController>
        </>
    );
};

export default B_RPCStart
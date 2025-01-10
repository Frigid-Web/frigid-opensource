import React, { useEffect } from 'react';
import S_BoardController from './dev_boardController.js';
import network from '../../../../../assets/network.svg'
import norequest from '../../../../../assets/norequest.svg'
import dollarbox from '../../../../../assets/dollarbox.svg'
import bandwidth from '../../../../../assets/bandwidth.svg'
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import bolt from '../../../../../assets/bolt.svg'

const B_RPCComplete = (props) => {
    const navigate = useNavigate();

    return (
        <>
            <S_BoardController close={'/settings'}>
                <div className='board-content'>
                    <div>
                        <div style={{ marginTop: 20, marginBottom: 30, alignItems: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column' }} className='board-header'>
                            <img src={bolt} alt='bolt' />
                            <h1>Network RPC Added</h1>
                            <p style={{ textAlign: 'center', width: '90%' }}>Ready to explore website & webapp hosted entirely on the blockchain?</p>
                        </div>



                    </div>

                    <div className='board-cta'>
                        <button className='board-cta-button' onClick={
                            () => {
                                navigate('/settings')
                            }
                        }>Let's Continue</button>
                        <p>Custom RPC’s Can Be Risky & Unsafe. Be Safe.</p>
                    </div>
                </div>
            </S_BoardController>
        </>
    );
};

export default B_RPCComplete
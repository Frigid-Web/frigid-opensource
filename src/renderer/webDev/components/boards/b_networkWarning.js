import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Dev_BoardController from './dev_boardController.js';
import bolterror from '../../../../../assets/bolterror.svg'



const B_NetworkWarning = (props) => {
    const navigate = useNavigate();

    return (
        <>
            <Dev_BoardController >
                <div className='board-content'>
                    <div>
                        <div style={{ marginTop: 20, marginBottom: 30, alignItems: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column' }} className='board-header'>
                            <img src={bolterror} alt='bolt' />
                            <h1>RPC Setup Needed</h1>
                            <p style={{ textAlign: 'center', width: '90%' }}>This network requires a custom RPC to browse web3 websites & web apps.</p>
                        </div>

                        <p>{"Open Frigid App --> Settings --> Add New (RPC)"}</p>


                    </div>

                    <div style={{ marginBottom: 30 }} className='board-cta'>
                        <div className='board-grouped-cta'>
                            <button className='board-cta-button' onClick={
                                () => {
                                    window.open('frigid://dev.frigid')
                                }
                            }>Open Frigid App</button>
                            <button className='board-cta-button' onClick={
                                () => {
                                    window.location.reload()
                                }
                            }>
                                I Did This Already
                            </button>
                        </div>

                    </div>
                </div>
            </Dev_BoardController>
        </>
    );
};

export default B_NetworkWarning
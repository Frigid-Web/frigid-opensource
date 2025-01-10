import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Dev_BoardController from './dev_boardController.js';
import boltcheck from '../../../../../assets/powerfill.svg'

import networksmall from '../../../../../assets/networksmall.svg'
import hammer from '../../../../../assets/hammer.svg'
import wifi from '../../../../../assets/wifi.svg'


const B_StartWelcome = (props) => {
    const navigate = useNavigate();

    return (
        <>
            <Dev_BoardController >
                <div className='board-content'>
                    <div>
                        <div className='board-header'>
                            <img src={boltcheck} alt='network' />
                            <h1>Welcome To Frigid Start</h1>
                            <p>
                                This is the start of your Frigid journey. Explore apps and websites hosted entirely on the blockchain.
                            </p>
                        </div>




                        <div className='board-list'>
                            <div className='board-list-item'>
                                <img src={networksmall} alt='bandwidth' />
                                <div className='board-list-item-text'>
                                    <h4>Pages Load From The Blockchain</h4>
                                    <p>
                                        Frigid websites are hosted on the blockchain. This means they load from the blockchain and not a server.
                                    </p>
                                </div>
                            </div>
                            <div className='board-list-item'>
                                <img src={wifi} alt='norequest' />
                                <div className='board-list-item-text'>
                                    <h4>Explore Web3 Domains In Your Browser</h4>
                                    <p>
                                        Frigid websites can be found and browsed like normal websites. They support domain names and search engines.
                                    </p>
                                </div>
                            </div>
                            <div className='board-list-item'>
                                <img src={hammer} alt='dollarbox' />
                                <div className='board-list-item-text'>
                                    <h4>Host & Upload Apps Easily</h4>
                                    <p>
                                        Frigid makes it easy to host and upload your own apps. You can host your app entirely on the blockchain.
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>

                    <div className='board-cta'>
                        <button className='board-cta-button' onClick={
                            () => {
                                navigate('/onboarding/hue')
                            }
                        }>Get Started</button>
                        <p>Custom RPC’s Can Be Risky & Unsafe. Be Safe.</p>
                    </div>
                </div>
            </Dev_BoardController>
        </>
    );
};

export default B_StartWelcome
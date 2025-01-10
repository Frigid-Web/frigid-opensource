import React, { useEffect } from 'react';
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


import checkLarge from '../../../../../assets/checklarge.svg'
import hammer from '../../../../../assets/hammer.svg'
import networksmall from '../../../../../assets/networksmall.svg'


const B_Complete = (props) => {
    const navigate = useNavigate();
    const setOnboardingStatus = () => {
        window.electron.store.set('onboardingStatus', true)
    }


    return (
        <>


            <O_BoardController animation={true} >

                <div className='board-content vivify fadeIn duration-500 delay-300' >
                    <div>
                        <div className='board-header'>
                            <img src={checkLarge} alt='check' />
                            <h1>Setup Complete</h1>
                            <p>Frigid let's you explore website and web apps hosted entirely on the blockchain. </p>
                        </div>
                        <div className='board-list'>
                            <div className='board-list-item'>
                                <img src={bolt} alt='bolt' />
                                <div className='board-list-item-text'>
                                    <h4>Power On Frigid Client</h4>
                                    <p> Hit the power button. This will allow you to access web3 content in any browser.</p>
                                </div>
                            </div>
                            <div className='board-list-item'>
                                <img src={networksmall} alt='network' />
                                <div className='board-list-item-text'>
                                    <h4>Explore Websites on The Blockchain</h4>
                                    <p>
                                        Launch your browser and visit a website or web app hosted on the blockchain.
                                    </p>
                                </div>
                            </div>
                            <div className='board-list-item'>
                                <img src={hammer} alt='hammer' />
                                <div className='board-list-item-text'>
                                    <h4>
                                        Build & Host a Site on The Blockchain
                                    </h4>
                                    <p>
                                        Are you a developer? Build and host a website or web app on the blockchain anonymously.
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>



                    <div className='board-cta'>
                        <button className='board-cta-button' onClick={
                            () => {
                                navigate('/');
                                setOnboardingStatus()
                            }
                        }>Get Started</button>

                    </div>
                </div>
                <style>
                    {
                        `
                            .board-cta {
                            margin-bottom: 30px}
                            `
                    }
                </style>
            </O_BoardController>
        </>
    );
};

export default B_Complete
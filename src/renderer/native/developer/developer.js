import React, { useEffect } from 'react';
import logo from '../../../../assets/logoWhite.svg'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
const Developer = () => {
    const networkActive = useSelector(state => state.mainapp.networkSlice.networkActive)
    const navigate = useNavigate()
    useEffect(() => {
        if (!networkActive) {
            navigate('/')
        }
    }, [networkActive])

    return (
        <div className='promo-screen vivify fadeIn duration-300'>
            <div className='split-logo'>
                <img src={logo} alt='logo' className='logo' />
                <div className='vertical-line'></div>
                <h1>Developer </h1>

            </div>
            <div className='promo-action'>
                <i className='material-icons'>
                    code
                </i>
                <h1>Development</h1>
                <p>
                    Use Frigid in combination with blockchain technology to host your apps and websites securely and anonymously.
                </p>
                <button onClick={
                    () => {
                        window.open('https://dev.frigid')
                    }
                } className='large-action'>Publish Apps</button>
                <button onClick={
                    () => {
                        window.open('https://dev.frigid/docs')
                    }
                } className='small-action'>Documentation</button>
            </div>
            <div className='footer-text'>
                <i className='material-icons'>
                    lock
                </i>
                <p>All Frigid apps hosted securely and anonymously on the blockchain</p>
            </div>
        </div>
    );
};

export default Developer;
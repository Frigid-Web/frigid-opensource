import React from 'react';
import logo from '../../../../assets/logoWhite.svg'

const Apps = () => {
    return (
        <div className='promo-screen vivify fadeIn duration-300'>
            <div className='split-logo'>
                <img src={logo} alt='logo' className='logo' />
                <div className='vertical-line'></div>
                <h1>dApp Store</h1>

            </div>
            <div className='promo-action'>
                <i className='material-icons'>
                    local_mall
                </i>
                <h1>dApp Store</h1>
                <p>
                    The dApp Store is a currated collection of apps and websites hosted securely on the blockchain with Frigid
                </p>
                <button className='large-action'>Launch DApp Store</button>
                <button onClick={
                    () => {
                        alert('This feature is not yet available')
                    }
                } className='small-action'>Develop an App</button>
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

export default Apps;
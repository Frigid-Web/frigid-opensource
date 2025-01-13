import React, { useEffect } from 'react';
import { useState } from 'react';
import { Popover, Text, Button } from '@mantine/core';
import { toggleNetworkActive } from '../../store/schemas/networkSlice';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import loadingIcon from '../../../../assets/loading.gif'
import { Link } from 'react-router-dom';
import { Outlet } from 'react-router-dom';

const Network = () => {


    const [browser, setBrowser] = useState('Chrome')
    const [opened, setOpened] = useState(false);
    const dispatch = useDispatch()
    const networkActive = useSelector(state => state.mainapp.networkSlice.networkActive)
    const [loading, setLoading] = useState(false)
    const browsers = [
        {
            name: 'Chrome',
            icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Google_Chrome_icon_%28February_2022%29.svg/1024px-Google_Chrome_icon_%28February_2022%29.svg.png'
        },
        {
            name: 'Firefox',
            icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Firefox_logo%2C_2019.svg/1200px-Firefox_logo%2C_2019.svg.png'
        },
        {
            name: 'Brave',
            icon: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Brave_icon_lionface.png'
        },
        {
            name: 'Edge',
            icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Microsoft_Edge_logo_%282019%29.svg/480px-Microsoft_Edge_logo_%282019%29.svg.png'
        },
        {
            name: 'Opera',
            icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Opera_2015_icon.svg/800px-Opera_2015_icon.svg.png'
        },


    ]

    const handleBrowserChange = (browser) => {
        setBrowser(browser)
        setOpened(false)
    }

    useEffect(() => {
        const handleNetworkStatus = (data) => {
            if (data === 'on') {
                dispatch(toggleNetworkActive());
            } else {
                dispatch(toggleNetworkActive());
            }
            setLoading(false);
        };

        // Subscribe to the 'network-status' event
        let value = window.electron.ipcRenderer.on('network-status', handleNetworkStatus);

        return () => {
            value()
        };

    }, [])


    return (
        <>
            <Outlet />
            <div className='network-page'>
                {/*         <p>“A group of penguins in the water is called a raft but on land they’re called a waddle!”</p> */}

                <span className="version-status-string slim-version">
                    <i className="material-icons">science</i>
                    <p>Release Beta: 0.0.2</p>

                </span>

                <div className='network-controls vivify fadeIn duration-300'>
                    <button className='net-btn' onClick={
                        () => {

                            if (!networkActive) {
                                setLoading(true)
                            }

                            window.electron.ipcRenderer.sendMessage('native', 'toggleNetwork', networkActive ? 'turn-off' : 'turn-on')
                        }

                    }>

                        <i className={
                            loading ? 'material-icons vivify blink infinite' : 'material-icons'
                        }>power_settings_new</i>

                    </button>
                    <div className='network-status'>
                        <i className="material-icons">{
                            loading ? 'account_tree' : networkActive ? 'gpp_good' : 'bedtime'

                        }</i>
                        <div className='network-status-text'>
                            <h4>{
                                loading ? "Establishing Connection..." : networkActive ? 'Connected to The Blockchain' : 'Blockchain Connection Sleeping'
                            }</h4>
                        </div>
                    </div>
                </div>

                <div className='network-footer '>
                    {
                        networkActive ?


                            <Popover opened={opened} onChange={setOpened} width={332} position="top-end" shadow="md" offset={20}>
                                <Popover.Target>
                                    <div className='browser-selector vivify fadeIn duration-300'>
                                        <button onClick={
                                            () => {
                                                setOpened(!opened)
                                            }

                                        } className='browser-switcher'>
                                            <img src={
                                                browsers.find(b => b.name === browser).icon

                                            } />
                                            <div className='browser-selector-text'>
                                                <h4>Browse with {
                                                    browser
                                                }</h4>
                                                <p>Explore Apps Built on Blockchain</p>
                                            </div>

                                            <div className='expand-browser'>
                                                <i className='material-icons'>expand_more</i>
                                            </div>
                                        </button>
                                        <button onClick={
                                            () => {
                                                setOpened(false)
                                                window.electron.ipcRenderer.sendMessage('native', 'openBrowser', browser)
                                            }
                                        } className='launch-btn'>
                                            <i className='material-icons'>rocket_launch</i>
                                        </button>
                                    </div>
                                </Popover.Target>
                                <Popover.Dropdown>
                                    <div className='browser-options'>
                                        {
                                            browsers.map((browser, index) => {
                                                return (
                                                    <button onClick={
                                                        () => {
                                                            handleBrowserChange(browser.name)
                                                        }

                                                    } key={index}>
                                                        <img src={browser.icon} />
                                                        <p>{browser.name}</p>
                                                    </button>
                                                )
                                            })
                                        }
                                    </div>
                                </Popover.Dropdown>
                            </Popover>

                            : null
                    }
                    {/* <Link style={{ color: 'white' }} to={'/onboarding/start?background=true'}>Run Onboarding Test</Link>
                    <Link style={{ color: 'white' }} to={'/onboarding/start?background=false'}>Run Glass Test</Link> */}
                    <div className='footer-text'>
                        <i className='material-icons'>
                            lock
                        </i>
                        <p>All Frigid apps hosted securely and anonymously on the blockchain</p>
                    </div>

                </div>
            </div>



        </>
    );
};

export default Network;
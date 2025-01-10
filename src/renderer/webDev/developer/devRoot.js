import React from "react";
import { Link, Outlet, Route } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

import { useState } from "react";
import { useDispatch } from "react-redux";
import logo from '../../../../assets/logoWhite.svg'
import polygon from '../../../../assets/polygon.svg'
import { Modal } from "@mantine/core";
import NewAppForm from "./yourapps.js/a_newAppForm";
import { useDisclosure } from '@mantine/hooks';
import Auth from "../auth/auth";
import { useEffect } from "react";
import { setMetamaskConnected, setMetaText, setAccountId } from "../../store/schemas/authSlice";
import { useNavigate } from "react-router-dom";

import { setPermissionState } from "../../store/schemas/authSlice";
import { setOnChain } from "../../store/schemas/authSlice";
import { formatUnits } from "ethers";
import MetaMaskOnboarding from "@metamask/onboarding";
import { setCurrentActiveChain } from "../../store/schemas/chainSlice";
import SwapNetwork from "../auth/swapNetwork";
import { Popover } from "@mantine/core";
import { alterLoading } from "../../store/schemas/loadingSlice";
import Wallet from "./yourapps.js/wallet";

import pluriIcon from '../../../../assets/pluriIcon.png'
import { getNetworkTokens } from "../../helpers/helper";
import IncorrectNetwork from "../auth/incorrectNetwork";
import B_NetworkWarning from "../components/boards/b_networkWarning";


function DevRoot() {
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();
    const [opened, { open, close }] = useDisclosure(false);
    const toggleModal = () => opened ? close() : open();
    const navigate = useNavigate();

    const chainList = useSelector(state => state.mainapp.chainSlice.chainList);
    const currentSelectedChain = useSelector(state => state.mainapp.chainSlice.currentChain);

    const ONBOARD_TEXT = "Click here to install MetaMask!";
    const CONNECT_TEXT = "Connect";
    const CONNECTED_TEXT = "Connected";

    const [account, setAccount] = useState(null);
    const usdtAddress = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F';
    const pluriAddress = '0xe469e49A15cF9c6B0C2685027eBb8bE43363bE33'
    const [maticBalance, setMaticBalance] = useState('0');
    const [usdtBalance, setUsdtBalance] = useState('0');
    const [pluriBalance, setPluriBalance] = useState('0');
    const isOnChain = useSelector(state => state.mainapp.authSlice.metamask.isOnChain)
    const [currentChain, setCurrentChain] = useState(null);
    const [swapNetwork, setSwapNetwork] = useState(false);
    const accountId = useSelector(state => state.mainapp.authSlice.metamask.accountId);
    const reCheck = useSelector(state => state.mainapp.authSlice.metamask.reCheck);

    const contractsLoaded = useSelector(state => state.mainapp.chainSlice.contractsLoaded);

    const [darkMode, setDarkMode] = useState(true);
    {
        /* Get MATIC balance */
    }
    const handleGetMaticBalance = async (accountId) => {

        try {
            const { nativeTokenFunctions } = getNetworkTokens[currentSelectedChain.slug]
            const balanceWei = await nativeTokenFunctions.provider.getBalance(accountId);
            const balanceMatic = formatUnits(balanceWei, 'ether');
            setMaticBalance(balanceMatic);
        } catch (error) {
            console.error('Error fetching MATIC balance:', error);
        }

    };


    {
        /* Get USDT balance */
    }
    async function getUSDTBalance(accountId) {


        const { stableToken } = getNetworkTokens[currentSelectedChain.slug]
        const balanceWei = await stableToken.contract.balanceOf(accountId);

        const adjustedBalance = formatUnits(balanceWei, stableToken.token.decimals);

        setUsdtBalance(adjustedBalance);

    }

    async function getPluriBalance(accountId) {

        const { pluri } = getNetworkTokens[currentSelectedChain.slug]
        const balanceWei = await pluri.contract.balanceOf(accountId);

        const adjustedBalance = formatUnits(balanceWei, pluri.token.decimals);
        setPluriBalance(adjustedBalance);

    }



    const [buttonText, setButtonText] = React.useState(ONBOARD_TEXT);
    const [isDisabled, setDisabled] = React.useState(false);
    const [accounts, setAccounts] = React.useState([]);
    const onboarding = React.useRef();

    useEffect(() => {
        if (!onboarding.current) {
            onboarding.current = new MetaMaskOnboarding();
        }
    }, []);

    useEffect(() => {
        if (MetaMaskOnboarding.isMetaMaskInstalled()) {
            checkChain();
            if (accounts.length > 0) {
                setButtonText(CONNECTED_TEXT);
                setDisabled(true);
                onboarding.current.stopOnboarding();
                dispatch(setMetamaskConnected(true));

            } else {
                setButtonText(CONNECT_TEXT);
                setDisabled(false);
                dispatch(setMetamaskConnected(false));
            }
        }
    }, [accounts]);

    const checkNetworks = async () => {
        const chainId = await window.ethereum.request({ method: "eth_chainId" });
        setCurrentChain(chainId);
        for (let i = 0; i < chainList.length; i++) {
            if (chainList[i].id == parseInt(chainId, 16).toString(10)) {
                dispatch(setOnChain(true));
                dispatch(setCurrentActiveChain(chainList[i]));
            }
        }
    }


    const checkChain = async () => {
        dispatch(setOnChain(false));
        checkNetworks();
    }


    useEffect(() => {
        const checkMetaMaskConnection = async () => {
            dispatch(setPermissionState(true));
            if (window.ethereum) {
                try {
                    const permissions = await window.ethereum.request({ method: 'wallet_getPermissions' });
                    const hasPermissions = permissions.some(permission => permission.parentCapability === 'eth_accounts');
                    if (hasPermissions) {
                        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                        dispatch(setMetamaskConnected(accounts.length > 0));
                        setAccounts(accounts);
                        if (accounts.length > 0) {
                            setAccount(accounts[0]);
                            dispatch(setAccountId(accounts[0]));
                        }
                    } else {
                        dispatch(setMetamaskConnected(false));
                        dispatch(setPermissionState(false));
                    }
                    await checkChain();
                } catch (error) {
                    dispatch(setMetaText('Error Occurred Refresh Page'));
                    dispatch(setMetamaskConnected(false));
                }
            } else {
                dispatch(setMetaText('Download MetaMask'));
                dispatch(setMetamaskConnected(false));
            }
            setLoading(false);
        };

        checkMetaMaskConnection();

        const handleAccountsChanged = (newAccounts) => {
            setAccounts(newAccounts);
            checkMetaMaskConnection();
        };

        if (MetaMaskOnboarding.isMetaMaskInstalled()) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on("chainChanged", checkChain);
            return () => {
                window.ethereum.removeListener('chainChanged', checkChain);
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            };
        }
    }, [reCheck]);

    const onClick = () => {
        if (MetaMaskOnboarding.isMetaMaskInstalled()) {
            window.ethereum.request({ method: "eth_requestAccounts" }).then(handleAccountsChanged);
        } else {
            onboarding.current.startOnboarding();
        }
    };

    useEffect(() => {
        setSwapNetwork(false);
        dispatch(alterLoading({
            loading: true,
            statusText: 'Verifying Network...',
            origin: 'MetaMask Connection'

        }))
        setTimeout(() => {
            dispatch(alterLoading({
                loading: false,
                statusText: 'Network Status Confirmed',
                origin: 'MetaMask Connection'
            }))
        }, 1000);

    }, [currentSelectedChain]);

    const asciiArt = `
iiiiiii>>><ï=ílvvvrootI%%Jzz¼½‰
iiii><ïï=ílv?º   „i%%Jzz½‰¢¢¢òö
><ï=íílv7             r¢òòö@óÏÏ
ílvvvrr                 ‡óÏLLÍ0
rîoot¸                   –£©©çç
I%%%                       wüaú
z¼½:   ‰s½nóó     L©©L©©   “54¾
¢¢¼  ˆC/   ?Í£££wç2¤   »4(  5Oµ
@@J  ?L}   >çç©±ùúú¼   ×x0  üU9
33ö  {©wç©2ü       ÎxxµeUó  yŸÝ
0£©   üüaú55       eUU9®Ÿ   ûšš
ç2ün  l54ÎÎxö     %®ŸÝ§ûn  ¾áñD
úô54Ï   µµeUU&   ü§ûàšä’  xbbÒÿ
¾ÎxOOµ    ™UÝ§ûààšPûO    bÖÞèýý
µeUU9®Ÿ6°             ­Zèýýýýýý
9®®Ý§ûûàšPPŸ©c•—»t™Zèýýýýýýýýýý
§ûàšäPPáDFbbÿÿÞèýýýýýýýýýýýýýýý

Thanks for using Frigid! 
We ❤️ Our Developers

U2FsdGVkX1+kFmDsrb182Je8UFOz04WA2KyvnCnWEdBLootJRWhf/xjaPLV9xlhAmD4NEFEZZ4/193lLlsCcxtHgY5D6eenFeF635BDvUvi4naM5Hzv4T8PVPXRSpJimaWRraeRHwqQGqlLE2gy1VFAlO+wbG5ysoeOfMTAyXK9tl4+bUXTP8FXR7sQLHBbmBPM1djVCse+NL4XXNBLC9TXMGddogjnVO5HNVBSX4Z4u57izQx4/YAV32/nb/yNaMUoJXWJZiAEQQkL58Dyru+vWWSbrDnGCeg1UTSYzMK3xGlfU2fWbhJDjgin95IGrBPwznulntqXTHUONd+QucUmhytoLZ93S1GPRXftBp98=

Man it sure is cold in here!

    `

    useEffect(() => {
        console.log(asciiArt)
    }, [])

    const [networkWarning, setNetworkWarning] = useState(false);

    const toggleNetworkWarning = (value) => {
        setNetworkWarning(value)
    }



    return (
        <>
            {
                networkWarning && currentSelectedChain.slug != 'polygon' ? <B_NetworkWarning toggleNetworkWarning={toggleNetworkWarning} /> : null
            }
            <Auth />
            <IncorrectNetwork />
            <div className="king-navbar">
                <div className='split-logo'>
                    <img src={logo} alt='logo' className='logo' />
                    <div className='vertical-line'></div>
                    <h1>Developer</h1>
                    <span className="version-status-string">
                        <i className="material-icons">science</i>
                        <p>Release Beta: 0.0.1</p>
                    </span>

                </div>
                <div className="crypto-strip">
                    <h3>Metamask</h3>
                    {
                        isOnChain && contractsLoaded ? <Wallet /> : null
                    }

                    <Popover position="bottom" withArrow shadow="md" opened={
                        swapNetwork
                    } onChange={setSwapNetwork}>
                        <Popover.Target>
                            <button onClick={
                                () => {
                                    setSwapNetwork(!swapNetwork)
                                }

                            } className="toggle-network">
                                <img src={currentSelectedChain.image} alt="icon" />
                                <h3>{currentSelectedChain.name} Network</h3>
                                <i className="material-icons">arrow_drop_down</i>
                            </button>
                        </Popover.Target>
                        <Popover.Dropdown>

                            <div>
                                <SwapNetwork toggleNetworkWarning={toggleNetworkWarning} />

                            </div>
                        </Popover.Dropdown>
                    </Popover>

                    {/* 
                    <Switch onChange={
                        (event) => {
                            setDarkMode(event.target.checked)
                        }
                    } checked={darkMode} color="blue" onLabel={
                        <i className="material-icons switch-icon">wb_sunny</i>
                    } offLabel={
                        <i className="material-icons switch-icon">dark_mode</i>
                    } className="dark-mode-toggle" /> */}

                </div>
            </div>
            <div className="king-container">

                <div></div>
                <div className="root-container">


                    <div className="side-panel">

                        <div className="side-panel-mid">

                            <div className="side-panel-items">
                                <NavLink to="/apps" className="side-panel-item" >
                                    <div className="side-item">
                                        <i className="material-icons">grade</i>
                                        <p>My Apps</p>
                                    </div>
                                </NavLink>

                                <NavLink to="/mydomains" className="side-panel-item" >
                                    <div className="side-item">
                                        <i className="material-icons">domain_verification</i>
                                        <p>My Domains</p>
                                    </div>
                                </NavLink>
                                <NavLink to="/docs" className="side-panel-item" >
                                    <div className="side-item">
                                        <i className="material-icons">description</i>
                                        <p>
                                            Docs & Help
                                        </p>
                                    </div>
                                </NavLink>

                                <NavLink to="/buydomains" className="side-panel-item" >
                                    <div className="side-item">
                                        <i className="material-icons">domain_add</i>
                                        <p>Buy Domain</p>
                                    </div>
                                </NavLink>




                                <NavLink to="/currency" className="side-panel-item" >
                                    <div className="side-item">
                                        <img src={pluriIcon} alt="pluri" />
                                        <p>Get Currency</p>
                                    </div>
                                </NavLink>





                            </div>
                        </div>

                        <div className="side-panel-footer">
                            {/*   {
         
            window.location.pathname === '/' ? null : <button className='mini-net-btn' onClick={
                () => {
                  
                    if (!networkActive) {
                        setLoading(true)
                    }
                    setTimeout(() => {

                        if (!networkActive) {
                            dispatch(toggleNetworkActive())
                            setLoading(false)
                        }


                    }, 1400)
                    if (networkActive) {
                        dispatch(toggleNetworkActive())
                    }

                }

            }>

                <i className={
                    loading ? 'material-icons vivify blink infinite' : 'material-icons'
                }>power_settings_new</i>

            </button>

        } */}


                            <button className="side-item vivify fadeIn duration-400" onClick={
                                toggleModal

                            }>
                                <i style={{ fontSize: 25 }} className="material-icons">add_circle</i>
                                <p>New App</p>
                            </button>

                        </div>
                    </div>
                    <div className="main-panel">
                        {contractsLoaded ?
                            <Outlet />
                            :
                            null
                        }



                    </div>



                </div>
            </div>
            <Modal opened={opened} size={450} radius={25} onClose={close} title="New App" centered overlayProps={{
                backgroundOpacity: 0.55,
                blur: 20,
            }}>
                <NewAppForm mode={'add'} toggleModal={toggleModal} />
            </Modal>

            <style>
                {
                    darkMode ?
                        `
                    
                        ` : `
                    :root {
                        --base-gray: white !important;
                        --frostedBorder:  solid 1px #00000012;
                        --glassBackground: #ffffffa6;
                        --frostedBackground:#f0f0f0
                        
                    }
                    .mantine-Input-input{
                        border-color: rgb(233, 233, 233) !important;
                    }
                    .focused-btn {
                        background-color: var(--grayBackground) !important;
                    }
                    
                    .hero-text > h1 {
                        color: white !important;
                    }
                    .hero-text > p {
                        color: white !important;
                    
                    }
                    .vertical-line {
                        background-color: black !important;
                    }
                    .hero > i {
                        color:#ffffff0d !important
                    
                    }
                    * {
                        color: black !important;
                    }
                    .split-logo > img {
                        filter: invert(1) !important;
                    }
                    .top-rail-active {
                        border-top: solid 2.5px black !important;
                    }
                    .rail-line {
                        background-color: black !important;
                    }
                    .loading-spinner>img {
                     filter: invert(1) !important;
                    
                    }
                    `
                }
            </style>
        </>


    );
}

export default DevRoot;


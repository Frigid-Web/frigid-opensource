import React, { useEffect } from "react";
import { Link, Outlet, Route } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useDisclosure } from '@mantine/hooks';
import { Modal, Button } from '@mantine/core';

import { useNavigate } from "react-router-dom";

import logo from '../../../../assets/logoWhite.svg'
import MetaMaskOnboarding from "@metamask/onboarding";
import { OnboardingButton } from "./authBtn";
import polygonIcon from '../../../../assets/chains/polygon.png'
import ethereumIcon from '../../../../assets/chains/ethereum.png'
import binanceIcon from '../../../../assets/chains/binance.png'
import avalancheIcon from '../../../../assets/chains/avalanche.png'
import ethereumclassicIcon from '../../../../assets/chains/ethereumclassic.png'
import optimismIcon from '../../../../assets/chains/optimism.png'
import arbitrumIcon from '../../../../assets/chains/arbitrum.png'
import fantomIcon from '../../../../assets/chains/fantom.png'

import B_NetworkWarning from "../components/boards/b_networkWarning";

function SwapNetwork(props) {
    const dispatch = useDispatch()

    const navigate = useNavigate()
    const metamaskConnected = useSelector(state => state.mainapp.authSlice.metamask.connected)
    const { toggleNetworkWarning } = props

    const currentSelectedChain = useSelector(state => state.mainapp.chainSlice.currentChain)
    const [selectedChain, setSelectedChain] = useState(currentSelectedChain.id || 137)
    const isOnChain = useSelector(state => state.mainapp.authSlice.metamask.isOnChain)

    const chainList = useSelector(state => state.mainapp.chainSlice.chainList);

    const expectedChainList = useSelector(state => state.mainapp.chainSlice.expectedChainList);



    const [networkAdded, setNetworkAdded] = useState(true);

    const [showWarning, setShowWarning] = useState(false)

    const addPolygonNetwork = async () => {
        const rpcUrl = chainList.find(chain => chain.id === selectedChain).rpcUrl
        const chainId = chainList.find(chain => chain.id === selectedChain).chainId
        const chainName = chainList.find(chain => chain.id === selectedChain).name
        const nativeCurrency = chainList.find(chain => chain.id === selectedChain).nativeCurrency
        try {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                // set from selected network
                params: [{
                    chainId: '0x' + chainId.toString(16),
                    chainName: chainName,
                    nativeCurrency: nativeCurrency,
                    rpcUrls: [rpcUrl],

                }],


            });
            setNetworkAdded(true)
            toggleNetworkWarning(true)

        } catch (error) {
            console.error("Failed to add network to MetaMask:", error);

        }
    };



    async function switchNetwork() {
        if (typeof window.ethereum !== 'undefined') {
            try {

                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x' + selectedChain.toString(16) }],
                });
                console.log("Switched to Polygon network.");
                setNetworkAdded(true);
                toggleNetworkWarning(true)
            } catch (error) {
                if (error.code === 4902) {
                    console.log("Polygon network is not added to MetaMask.");
                    setNetworkAdded(false);
                } else {
                    console.error("Error switching to Polygon network:", error);
                }
            }
        } else {
            console.log("MetaMask is not available.");
        }
    }



    const getIcon = (chainId) => {
        switch (chainId) {
            case 137:
                return polygonIcon
            case 1:
                return ethereumIcon
            case 56:
                return binanceIcon
            case 43114:
                return avalancheIcon
            case 61:
                return ethereumclassicIcon
            case 42161:
                return arbitrumIcon
            case 10:
                return optimismIcon
            case 250:
                return fantomIcon
            default:
                return polygonIcon
        }
    }



    return (
        <>

            {
                networkAdded ?
                    <div className="auth-window lg-window vivify fadeIn duration-300 " >
                        {/* <div className="auth-header">
                        <div className='promo-action'>

                            <h1 style={{ marginBottom: 7 }}>
                                Wrong Network: Switch to Polygon
                            </h1>
                            <p>
                                Please switch MetaMask to Polygon network to continue.
                            </p>

                        </div>
                    </div> */}

                        <div className="chain-header">
                            <h1 className="chain-title">
                                Select Your Network
                            </h1>
                        </div>
                        <div className="chain-switcher">


                            <div className="chain-list">
                                {

                                    chainList.map((chain) => {

                                        return <button
                                            key={chain.id}
                                            className={selectedChain === chain.id ? 'selected-chain chain-wrap' : 'chain-wrap'} onClick={() => {
                                                if(chain.rpcUrl != null){
                                                    setSelectedChain(chain.id)
                                                }
                                            }
                                            }>
                                            <div className="chain-btn">
                                                <div className="chain-left">
                                                    <img alt="icon" src={
                                                        getIcon(chain.id)
                                                    } />
                                                    <div className="chain-text">
                                                        {
                                                            chain.id === 137 ? <span>
                                                                Recommended
                                                            </span> : ''
                                                        }
                                                        {chain.rpcUrl == null ? <span>Disabled - Add Rpc In Frigid Settings</span>  : ''}
                                                        <h3>{chain.name}</h3>

                                                    </div>

                                                </div>
                                                <div className="chain-right">
                                                    {
                                                        selectedChain === chain.id ? <i className="material-icons">check</i> : ''
                                                    }
                                                </div>
                                            </div>
                                        </button>
                                    })
                                }
                            </div>
                        </div>

                        <div className="meta-inline-container" style={{
                            margin: 'auto',

                        }}>
                            <button className="meta-btn" onClick={switchNetwork} >

                                Confirm Selection
                            </button>
                        </div>
                    </div> : <div className="auth-window " style={{
                        gridTemplateRows: '1fr ',
                        height: '430px'
                    }}>
                        <div className="floating-header">
                            <button className="back-btn" onClick={() => {
                                setNetworkAdded(true)
                            }}><i className="material-icons">arrow_back</i>
                                <span>Back</span>
                            </button>
                        </div>
                        <div className="auth-header">

                            <div className='promo-action'>
                                <img src={
                                    getIcon(selectedChain)
                                } alt="icon" />

                                <h1 style={{ marginBottom: 7 }}>
                                    Add {
                                        chainList.find(chain => chain.id === selectedChain).name
                                    } Network
                                </h1>
                                <p>
                                    Click to add {chainList.find(chain => chain.id === selectedChain).name} network to MetaMask and use with Frigid {(chainList.find(chain => chain.id === selectedChain).rpcUrl).toString()}
                                </p>

                            </div>
                        </div>

                        <div style={{
                            margin: 'auto',
                            marginBottom: 35
                        }}>
                            <button className="meta-btn" onClick={addPolygonNetwork} >
                                <i className="material-icons">add_circle</i>

                                Add Network
                            </button>
                        </div>


                    </div>
            }

        </>


    );
}

export default SwapNetwork;


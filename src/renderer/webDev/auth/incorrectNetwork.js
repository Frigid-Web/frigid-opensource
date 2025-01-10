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
import { setDesiredChain } from "../../store/schemas/networkSlice";

function IncorrectNetwork() {
    const dispatch = useDispatch()

    const navigate = useNavigate()
    const metamaskConnected = useSelector(state => state.mainapp.authSlice.metamask.connected)


    const currentSelectedChain = useSelector(state => state.mainapp.chainSlice.currentChain)
    const desiredChain = useSelector(state => state.mainapp.networkSlice.desiredChain)


    const chainList = useSelector(state => state.mainapp.chainSlice.chainList);

    async function switchNetwork() {
        if (typeof window.ethereum !== 'undefined') {
            try {

                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x' + desiredChain.toString(16) }],
                });
                console.log("Switched to Polygon network.");
            } catch (error) {
                if (error.code === 4902) {
                    console.log("Polygon network is not added to MetaMask.");
                    const rpcUrl = chainList.find(chain => chain.id === desiredChain).rpcUrl
                    const chainId = chainList.find(chain => chain.id === desiredChain).chainId
                    const chainName = chainList.find(chain => chain.id === desiredChain).name
                    const nativeCurrency = chainList.find(chain => chain.id === desiredChain).nativeCurrency
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
                    switchNetwork()
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
                desiredChain != null && currentSelectedChain.id != desiredChain ?
                    <Modal withCloseButton={false} onClose={
                        () => {
                            dispatch(setDesiredChain(null))

                        }
                    } opened={true} size={440} radius={25} centered overlayProps={{
                        backgroundOpacity: 0.55,
                        blur: 20,
                    }}>
                        <div className="floating-header">
                            <button className="back-btn" onClick={() => {
                                dispatch(setDesiredChain(null))
                            }}><i className="material-icons">arrow_back</i>
                                <span>Back</span>
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>


                            <div className="auth-header">
                                <div style={{ marginTop: 60 }} className='promo-action'>
                                    <img src={
                                        getIcon(desiredChain)
                                    } alt="icon" />

                                    <h1 style={{ marginBottom: 7 }}>
                                        Confirm & Switch to {
                                            chainList.find(chain => chain.id === desiredChain).name
                                        } Network
                                    </h1>
                                    <p>
                                        Click to add and switch to {chainList.find(chain => chain.id === desiredChain).name} network with MetaMask to start this transaction.
                                    </p>

                                </div>
                            </div>

                            <div style={{
                                marginTop: '20px',
                                marginBottom: 35
                            }}>
                                <button style={{ width: 'max-content' }} className="meta-btn" onClick={switchNetwork} >
                                    <i className="material-icons">swap_horiz</i>

                                    Switch Network
                                </button>
                            </div>
                        </div>

                    </Modal >
                    :
                    null
            }

        </>


    );
}

export default IncorrectNetwork;


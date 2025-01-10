import React, { useState, useEffect, useRef } from "react";

import MetaMaskOnboarding from "@metamask/onboarding";
import { useDispatch } from 'react-redux';
import { setMetamaskConnected, setRecheck } from "../../store/schemas/authSlice";
import { useSelector } from "react-redux";
import fox from '../../../../assets/fox.png'

export function OnboardingButton() {
    const [buttonText, setButtonText] = useState('Connect With MetaMask');
    const [isDisabled, setDisabled] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const onboarding = useRef(new MetaMaskOnboarding());
    const [loading, setLoading] = useState(true);
    const [account, setAccount] = useState(null);
    const [isRequesting, setRequesting] = useState(false);
    const dispatch = useDispatch();
    const metaText = useSelector(state => state.mainapp.authSlice.metamask.metaText)
    const connected = useSelector(state => state.mainapp.authSlice.metamask.connected)
    const permissionState = useSelector(state => state.mainapp.authSlice.metamask.permissionState)

    useEffect(() => {
        console.log('MetaMask Button Mounted')
    }, [])

    const connectMetaMask = async () => {

        if (metaText === 'Download MetaMask') {

            window.open("https://metamask.io/download", "_blank");

        } else {

            try {

                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                    dispatch(setRecheck())
                }
                else {
                    await window.ethereum.request({
                        method: 'eth_requestAccounts'
                    });
                    if (accounts.length > 0) {
                        setAccount(accounts[0]);
                        dispatch(setRecheck())
                    }
                }

            } catch (error) {
                console.error("Failed to connect MetaMask", error);
            }
        }

    };

    return (
        <div>

            <button className="meta-btn" onClick={connectMetaMask} disabled={isRequesting}>
                {
                    metaText === 'Error Occurred Refresh Page' ? <i className="material-icons">error</i> : <img src={fox} alt="fox" className="fox" />
                }
                {metaText}
            </button>

        </div>
    );
}

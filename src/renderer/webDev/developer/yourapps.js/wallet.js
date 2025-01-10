import React, { useEffect } from "react";
import { Link, Outlet, Route } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

import { useState } from "react";
import { useDispatch } from "react-redux";

import { getNetworkTokens } from "../../../helpers/helper";
import { formatUnits, parseUnits } from "ethers";


function Wallet() {
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();
    const [pluriBalance, setPluriBalance] = useState(0);
    const [pluriDecimals, setPluriDecimals] = useState(0);
    const currentSelectedChain = useSelector(state => state.mainapp.chainSlice.currentChain)
    const accountId = useSelector(state => state.mainapp.authSlice.metamask.accountId)
    const [nativeBalance, setNativeBalance] = useState(0);
    const [nativeDecimals, setNativeDecimals] = useState(0);

    const [stableCurrencyBalance, setStableCurrencyBalance] = useState(0);

    function formatToSixDecimalPlaces(num) {
        let numStr = num.toString();
        let decimalIndex = numStr.indexOf('.');

        if (decimalIndex === -1 || numStr.length - decimalIndex - 1 < 6) {
            return numStr;
        }

        return numStr.slice(0, decimalIndex + 7);
    }

    const handleGetNativeCurrency = async () => {
        try {
            const { nativeTokenFunctions } = getNetworkTokens[currentSelectedChain.slug]
            const balanceWei = await nativeTokenFunctions.provider.getBalance(accountId);
            const balanceMatic = formatUnits(String(balanceWei), 'ether');
            console.log(balanceMatic)
            setNativeBalance(formatToSixDecimalPlaces(balanceMatic));
            const decimals = await nativeTokenFunctions.provider.getDecimals(accountId);
            setNativeDecimals(decimals);
        } catch (error) {

        }
    }


    useEffect(() => {
        setPluriBalance(0)
        setStableCurrencyBalance(0)
        if (accountId && getNetworkTokens[currentSelectedChain.slug]) {
            getNetworkTokens[currentSelectedChain.slug].pluri.contract.balanceOf(accountId).then((res) => {
                setPluriBalance(formatToSixDecimalPlaces(formatUnits(String(res), 'ether')))
            }
            )
            getNetworkTokens[currentSelectedChain.slug].pluri.contract.decimals().then((res) => {
                setPluriDecimals(res)
            }
            )
            getNetworkTokens[currentSelectedChain.slug].stableToken.contract.balanceOf(accountId).then((res) => {
                setStableCurrencyBalance(formatToSixDecimalPlaces(formatUnits(String(res), currentSelectedChain.stableToken.unit)))
            }
            )
        }
        handleGetNativeCurrency()
    }, [accountId, currentSelectedChain])

    return (
        <>

            <p>{

                accountId ? accountId.slice(0, 6) + '...' + accountId.slice(accountId.length - 4, accountId.length) : ''
            }</p>

            <div className="vertical-line"></div>
            <p>{
                pluriBalance
            } PLURI</p>

            <div className="vertical-line"></div>

            <p>{

                nativeBalance
            } {
                    currentSelectedChain.nativeCurrency.symbol
                }</p>

            <div className="vertical-line"></div>

            <p>{
                stableCurrencyBalance
            } {
                    currentSelectedChain.stableToken.symbol

                }</p>


        </>


    );
}

export default Wallet;


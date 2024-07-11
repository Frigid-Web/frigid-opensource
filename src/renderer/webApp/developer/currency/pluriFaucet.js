import React, { useEffect } from "react";
import { Link, Outlet, Route } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { TextInput } from "@mantine/core";
import { alterLoading } from "../../../store/schemas/loadingSlice";
import pluriIcon from "../../../../../assets/pluriIcon.png"
import { getNetworkTokens } from "../../../helpers/helper";
import Web3 from "web3";
function PluriFaucet(props) {
    const dispatch = useDispatch()
    const [characterCounter, setCharacterCounter] = useState(0)
    const [imagePreview, setImagePreview] = useState('');
    const handleCharacterCount = (e) => {
        setCharacterCounter(e.target.value.length)
    }
    const currentSelectedChain = useSelector(state => state.mainapp.chainSlice.currentChain)
    const accountId = useSelector(state => state.mainapp.authSlice.metamask.accountId)

    const [walletAddress, setWalletAddress] = useState('')
    /* const lastClaim = await stakeContract.methods.lastAutoMintTimestamp().call()
    const date = new Date(Number(lastClaim) * 1000) */

    const [blockDiff, setBlockDiff] = useState(0)

    useEffect(() => {
        const handleGetTimeStamp = async () => {
            try {
                let stakeholderString = await getNetworkTokens[currentSelectedChain.slug].stakeholder.rpcContract.lastAutoMintTimestamp()
                const date = new Date(Number(stakeholderString) * 1000)
                const lockTime = date.toString()

                let web3 = new Web3(window.ethereum)
                const block = await web3.eth.getBlockNumber()
                const blockTime = await web3.eth.getBlock(block);
                const newBlockDate = new Date(Number(blockTime.timestamp) * 1000)
                const blockDate = newBlockDate.toString()

                const oldDate = new Date(lockTime)
                const newDate = new Date(blockDate)
                const differenceMilliseconds = newDate.getTime() - oldDate.getTime(); // Get the difference in milliseconds
                const dif = Math.floor((differenceMilliseconds / 1000) / 60);
                setBlockDiff(dif)
            } catch (error) {
                console.error(error)
            }
        }
        handleGetTimeStamp()
    }, [currentSelectedChain])


    const handleTransaction = async () => {
        try {
            dispatch(
                alterLoading({
                    loading: true,
                    statusText: 'Processing Transaction...',
                    origin: 'Check MetaMask Wallet',
                })
            )
            const response = await getNetworkTokens[currentSelectedChain.slug].faucet.contract
                .callAutoMint(walletAddress)
            await response.wait()
            dispatch(
                alterLoading({
                    loading: false,
                    statusText: 'Transaction Successful',
                    origin: 'PLURI Faucet',
                })
            )
            setTimeout(() => {
                window.location.reload()
            }, 2000)

        } catch (error) {

            dispatch(
                alterLoading({
                    loading: false,
                    statusText: 'Transaction Failed',
                    origin: 'PLURI Faucet',
                })
            )

            if (error.toString().includes('4001')) {
                dispatch(
                    alterLoading({
                        loading: false,
                        statusText: 'Transaction Cancelled Successfully',
                        origin: 'PLURI Faucet',
                    })
                )

            } else {
                dispatch(
                    alterLoading({
                        loading: false,
                        statusText: 'Transaction Failed',
                        origin: 'Error: PLURI Faucet',
                    })
                )
            }
        }
    };


    return (
        <>
            <form onSubmit={
                (e) => {
                    e.preventDefault()
                    handleTransaction()
                }
            }>

                <div className="domain-container">
                    <div className="domain-block">
                        <div className="faucet-charm">
                            <div className="faucet-charm-left">
                                <img src={pluriIcon} alt="" />
                                <div className="faucet-charm-text">
                                    <h3>Receive 0.0833 PLURI for {currentSelectedChain.name}</h3>
                                    <p>
                                        Status: {
                                            "Current available claims is " + blockDiff
                                        }
                                    </p>
                                </div>
                            </div>
                            <div className="faucet-charm-right">
                                <img src={currentSelectedChain.image} alt="" />
                            </div>
                        </div>
                        <span className="info-strip">
                            Limit of 1 claim per 24 hours
                        </span>
                        <TextInput
                            label="Enter Wallet Address"
                            size="lg"
                            radius="md"
                            placeholder="Enter Wallet Address"
                            required
                            name="wallet"
                            onChange={(e) => setWalletAddress(e.target.value)}
                            value={walletAddress}
                        />
                        <span className="btn-span" onClick={
                            () => {
                                setWalletAddress(accountId)
                            }

                        }>Use Current MetaMask  Wallet</span>


                    </div>
                    <div className="focused-btn-container" style={{ marginBottom: 10 }}>

                        <button type="submit" className="focused-btn">START TRANSFER</button>

                        <p className="charm-description">
                            Gas fees ({
                                currentSelectedChain.nativeCurrency.symbol
                            }) may apply for this transaction.
                        </p>
                    </div>
                    {/*    <div className="domain-overview">

                        <h4>
                            {props.data.title}
                        </h4>
                        <span>

                            {props.data.price} USDT
                        </span>


                    </div> */}



                </div>

            </form>
        </>


    );
}

export default PluriFaucet;


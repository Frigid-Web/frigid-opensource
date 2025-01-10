import React, { useEffect } from "react";
import { Link, Outlet, Route } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { Checkbox, TextInput } from "@mantine/core";
import { alterLoading } from "../../../store/schemas/loadingSlice";
import pluriIcon from "../../../../../assets/pluriIcon.png"
import { getNetworkTokens } from "../../../helpers/helper";
import { db } from "../../home";
import { determineOnNetwork } from "../../httpCalls/frigidApi";

function TransferDomain(props) {
    const dispatch = useDispatch()
    const [characterCounter, setCharacterCounter] = useState(0)
    const [imagePreview, setImagePreview] = useState('');
    const handleCharacterCount = (e) => {
        setCharacterCounter(e.target.value.length)
    }
    const currentSelectedChain = useSelector(state => state.mainapp.chainSlice.currentChain)
    const accountId = useSelector(state => state.mainapp.authSlice.metamask.accountId)
    const domain = props.domain
    const [walletAddress, setWalletAddress] = useState('')
    const [transferEnabled, setTransferEnabled] = useState(false)

    const [domainName, setDomainName] = useState('')


    const handleTransaction = async () => {
      
            dispatch(determineOnNetwork({domain:domain.name})).then(async (r) => {
                try {
                    if(r.payload == false){
                        return
                    }
                    const { dns } = getNetworkTokens[currentSelectedChain.slug]
                    dispatch(alterLoading(
                        {
                            loading: true,
                            statusText: 'Processing Domain Transfer...',
                            origin: "Domain Sale"
                        }
                    ))
                    const tx = await dns.contract.transferDomain(domain.name, walletAddress)
                    await tx.wait()
                    if (domain.owner !== accountId) {
                        await db.domains.delete(domain.id)
                    }
                    dispatch(alterLoading(
                        {
                            loading: false,
                            statusText: 'Transaction Complete!',
                            origin: "Domain Transfer"
                        }
                    ))
                    props.toggleModal()
                } catch (error) {
                    dispatch(alterLoading(
                        {
                            loading: false,
                            statusText: 'Transaction Failed!',
                            origin: "Domain Transfer"
                        }
                    ))
                }

            })
           
       
    };


    return (
        <>
            <form onSubmit={
                (e) => {
                    e.preventDefault()
                    handleTransaction()
                }
            }>

                <div style={{ gap: 80 }} className="domain-container">
                    <div className="domain-block">
                        <div className="faucet-charm">
                            <div className="faucet-charm-left">
                                <i className="material-icons">double_arrow</i>
                                <div className="faucet-charm-text">
                                    <h3>
                                        Transfer {domain.name} Ownership
                                    </h3>
                                    <p style={{ marginTop: 0 }}>
                                        Notice: All dApps, websites, or web apps using this domain will immediately stop working once the domain is transferred. <Link to="/docs/domains/sellandtransfer">Learn More</Link>
                                    </p>
                                </div>
                            </div>

                        </div>
                        <TextInput
                            label="Wallet Address"
                            size="lg"
                            radius="md"
                            placeholder="Enter Wallet Address"
                            required
                            name="wallet"
                            onChange={(e) => setWalletAddress(e.target.value)}
                            value={walletAddress}
                        />

                        <Checkbox onChange={
                            (e) => {
                                setTransferEnabled(e.target.checked)
                            }

                        } color="#ff0000" size="sm" value={transferEnabled} label="I understand that this transfer is permanent and cannot be undone ever. 
                        
                        " />

                    </div>
                    <div className="focused-btn-container" style={{ marginBottom: 10 }}>
                        <button type="submit" className={
                            transferEnabled ? "focused-btn prominent-focus" : "focused-btn prominent-focus prominent-disabled"

                        }>Start Transfer</button>
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

export default TransferDomain


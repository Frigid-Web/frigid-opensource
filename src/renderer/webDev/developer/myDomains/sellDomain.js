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
import { NumberInput } from "@mantine/core";
import { formatUnits, parseUnits } from "ethers";
import { db } from "../../home";
import { determineOnNetwork } from "../../httpCalls/frigidApi";
function SellDomain(props) {
    const dispatch = useDispatch()
    const [characterCounter, setCharacterCounter] = useState(0)
    const [imagePreview, setImagePreview] = useState('');
    const handleCharacterCount = (e) => {
        setCharacterCounter(e.target.value.length)
    }
    const currentSelectedChain = useSelector(state => state.mainapp.chainSlice.currentChain)
    const accountId = useSelector(state => state.mainapp.authSlice.metamask.accountId)
    const domain = props.domain
    const sellFlag = props.sellFlag
    const [walletAddress, setWalletAddress] = useState('')
    const [transferEnabled, setTransferEnabled] = useState(false)

    const [domainName, setDomainName] = useState('')
    const [salePrice, setSalePrice] = useState(props.domain.price || 0)


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
                        statusText: 'Processing Domain Sell...',
                        origin: "Domain Sell"
                    }
                ))
                const tx = await dns.contract.listDomainForSale(domain.name, parseUnits(salePrice.toString(), 'mwei'))
                await tx.wait()
                await db.domains.update(domain.id, {
                    forSale: true,
                    price: salePrice
                })
                dispatch(alterLoading(
                    {
                        loading: false,
                        statusText: 'Transaction Complete!',
                        origin: "Domain Sell"
                    }
                ))
                props.toggleModal()
            } catch (error) {
                console.log(error)
                dispatch(alterLoading(
                    {
                        loading: false,
                        statusText: 'Transaction Failed!',
                        origin: "Domain Sell"
                    }
                ))
            }
        })

    };


    const deleteListing = async () => {
           
        dispatch(determineOnNetwork({domain:domain.name})).then(async (r) => {
            try {
                if(r.payload == false){
                    return
                }
                const { dns } = getNetworkTokens[currentSelectedChain.slug]
                dispatch(alterLoading(
                    {
                        loading: true,
                        statusText: 'Processing Listing Deletion...',
                        origin: "Update Listing"
                    }
                ))
                const tx = await dns.contract.delistDomainForSale(domain.name)
                await tx.wait()
                await db.domains.update(domain.id, {
                    forSale: false,
                    price: 0
                })
                dispatch(alterLoading(
                    {
                        loading: false,
                        statusText: 'Transaction Complete!',
                        origin: "Update Listing"
                    }
                ))
                props.toggleModal()
            } catch (error) {
                console.log(error)
                dispatch(alterLoading(
                    {
                        loading: false,
                        statusText: 'Transaction Failed!',
                        origin: "Update Listing"
                    }
                ))
            }
        })
    }
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
                                <i className="material-icons" style={{
                                    fontSize: 25
                                }}>sell</i>
                                <div className="faucet-charm-text">
                                    <h3>
                                        {sellFlag ? `Update Listing for ${domain.name}` :
                                            `List ${domain.name} for Sell`
                                        }

                                    </h3>
                                    <p style={{ marginTop: 0 }}>
                                        Notice: All dApps, websites, or web apps using this domain will immediately stop working once the domain is sold. <Link to="/docs/domains/sellandtransfer">Learn More</Link>
                                    </p>
                                </div>
                            </div>

                        </div>
                        <NumberInput
                            label="Sell Price (USDT)"
                            size="lg"
                            radius="md"
                            placeholder="Enter Sell Price (USDT)"
                            required
                            name="wallet"
                            onChange={(e) => setSalePrice(e)}
                            value={salePrice}
                            min={0}
                            rightSection={
                                <span ></span>
                            }
                        />



                        <Checkbox onChange={
                            (e) => {
                                setTransferEnabled(e.target.checked)
                            }

                        } color="#ff0000" size="sm" value={transferEnabled} label={
                            "I understand, once " + domain.name + " is sold ownership will be transferred to the buyers wallet and I will no longer have control over it ever."
                        }

                        />



                    </div>
                    <div className="focused-btn-container" style={{ marginBottom: 10 }}>
                        <button type="submit" className={
                            transferEnabled ? "focused-btn prominent-focus" : "focused-btn prominent-focus prominent-disabled"

                        }>
                            {sellFlag ? "Update" : "Start Sell"}
                        </button>
                        {
                            sellFlag ?
                                <button className="delete-listing" onClick={() => { deleteListing() }} type="button" >
                                    Delete Listing
                                </button>
                                :
                                null
                        }

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

export default SellDomain


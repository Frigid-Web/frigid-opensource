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
import { db } from "../../home";
import { formatUnits } from "ethers";
import { determineOnNetwork } from "../../httpCalls/frigidApi";

function RestorePurchases(props) {
    const dispatch = useDispatch()
    const [characterCounter, setCharacterCounter] = useState(0)
    const [imagePreview, setImagePreview] = useState('');
    const handleCharacterCount = (e) => {
        setCharacterCounter(e.target.value.length)
    }
    const currentSelectedChain = useSelector(state => state.mainapp.chainSlice.currentChain)
    const accountId = useSelector(state => state.mainapp.authSlice.metamask.accountId)

    const [domainName, setDomainName] = useState('')
    const chainList = useSelector(state => state.mainapp.chainSlice.chainList)


    const handleTransaction = async (e) => {
        let domainSplit = domainName.split('.')
        let chainCheck = chainList.some((chain) => chain.domainEnding == domainSplit[domainSplit.length - 1].toLowerCase() ? true : false)
        if(chainCheck == false){
            alert("This domain is not supported on any of the available networks")
            return
        }
        dispatch(determineOnNetwork({domain:domainName})).then(async (r) => {
            if(r.payload == false){
                return
            }
            const { dns } = getNetworkTokens[currentSelectedChain.slug]
            try {
                const domainExistsCheck = await db.domains.where('name').equals(domainName).first()
                if (domainExistsCheck == undefined) {
                    const lookupDomain = async (chain) => {
                        return new Promise(async (resolve, reject) => {
                            try {
                                console.log(chain)
                                const results = await dns.rpcContract.domains(domainName)
                                if(results.owner.toLowerCase() == accountId){
                                    let splitDomain = domainName.split('.')
                                    let price = results['salePrice'] == 0n ? 0 : formatUnits(results['salePrice'], 'mwei')
                                    resolve({ 
                                    title: domainName,
                                    name: splitDomain[splitDomain.length - 2], 
                                    suffix:  splitDomain[splitDomain.length - 1],
                                    price:  price,
                                    forSale: results['forSale'],
                                    network: chain.name,
                                    networkSlug: chain.slug})
                                }
                                else{
                                    resolve(undefined)
                                }
                            } catch (error) {
                                console.log(error)
                                resolve(undefined)
                            }
            
                        })
                    }
            
                    let promises = []
            
                    for (let chain of chainList) {

                        let splitDomain = domainName.split('.')
                        let network = splitDomain[splitDomain.length - 1]
                        if(chain.domainEnding == network){
                            promises.push(lookupDomain(chain))
                        }
                    }
                    const results = await Promise.allSettled(promises)
        
                    const extractedResults = results.map(result => result.value).filter(result => result != undefined)
                    if(extractedResults.length > 0){
                        let domainRestore = extractedResults[0]
                        console.log(domainRestore)
                        await db.domains.add({
                            name: domainRestore.title,
                            forSale: domainRestore.forSale,
                            price: domainRestore.price,
                            networkName: domainRestore.network,
                            networkSlug: domainRestore.networkSlug,
                            suffix: domainRestore.suffix,
                            sold:false,
                            ownerAddress: accountId,
                        })
                        alert("Domain has been restored")
                    } 
                    else{
                        alert("This domain is unavailable for restoration.")
                    }
                }
                else{
                    alert("This domain is already registered on your local system")
                }
                 
            }
            catch (e) {
                alert("An error occurred while trying to restore domain. Please try again later")
                console.log(e)
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

                <div className="domain-container">
                    <div className="domain-block">
                        <div className="faucet-charm">
                            <div className="faucet-charm-left">
                                <i className="material-icons">domain_verification</i>
                                <div className="faucet-charm-text">
                                    <h3>
                                        Restore Domain
                                    </h3>
                                    <p>By validating ownership with wallet address.</p>
                                </div>
                            </div>

                        </div>
                        <TextInput
                            label="Enter Your Domain Name"
                            size="lg"
                            radius="md"
                            placeholder="Enter Domain Name"
                            required
                            name="domain"
                            onChange={(e) => setDomainName(e.target.value)}
                            value={domainName}
                            autoComplete="off"
                        />

                    </div>
                    <div className="focused-btn-container" style={{ marginBottom: 10 }}>
                        <button type="submit" className="focused-btn ">Start Restore</button>
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

export default RestorePurchases


import React, { useEffect } from "react";
import { Link, Outlet, Route } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useDisclosure } from '@mantine/hooks';
import { Modal, Button } from '@mantine/core';
import { useNavigate } from "react-router-dom";
import BuyForm from "./buyForm";
import { getNetworkTokens } from "../../../helpers/helper";
import { formatUnits } from "ethers";

import RestorePurchases from "./restorePurchases";


function BuyDomains() {
    const dispatch = useDispatch()

    const navigate = useNavigate()
    const [opened, { open, close }] = useDisclosure(false);
    const [openedRestore, { open: openRestore, close: closeRestore }] = useDisclosure(false);
    const toggleModal = () => opened ? close() : open();
    const toggleRestore = () => openedRestore ? closeRestore() : openRestore();
    const [selectedDomain, setSelectedDomain] = useState([])
    const [domainList, setDomainList] = useState([])
    const [searchedDomain, setSearchedDomain] = useState('')
    const chainList = useSelector(state => state.mainapp.chainSlice.chainList)
    const [enterClicked, setEnterClicked] = useState(false)


    const searchDomain = async () => {

        const lookupDomain = async (chain) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const results = await getNetworkTokens[chain.slug].dns.rpcContract.isAvailableOrForSale(searchedDomain, chain.domainEnding)

                    if (results[0] == false) {
                        resolve({
                            title: searchedDomain + '.' + chain.domainEnding,
                            name: searchedDomain,
                            suffix: chain.domainEnding,
                            price: 'N/A',
                            available: false,
                            network: chain.name,
                            networkSlug: chain.slug
                        })
                    }
                    else {
                        resolve({
                            title: searchedDomain + '.' + chain.domainEnding,
                            name: searchedDomain,
                            suffix: chain.domainEnding,
                            price: formatUnits(results[1], chain.stableToken.unit ),
                            priceBigInt: results[1],
                            available: results[0],
                            network: chain.name,
                            networkSlug: chain.slug,
                            owner: results[2]
                        })
                    }
                } catch (error) {
                    console.log(error)
                    resolve(undefined)
                }

            })
        }

        let promises = []

        for (let chain of chainList) {
            promises.push(lookupDomain(chain))
        }
        const results = await Promise.allSettled(promises)
        let extractedResults = results.map(result => result.value).filter(result => result != undefined)
        if (extractedResults.length == 0) {
            extractedResults = ['No Results']
        }
        setDomainList(extractedResults)
    }



    return (
        <>
            <div className="search-container">
                {/*                 <div className="form-block">
                    <h3>Note: Frigid domains can only be used on the Frigid Network using the Frigid Desktop Proxy
                        <Link to="/docs/domains/overview"> Learn More</Link>
                    </h3>


                </div> */}
                <div className="search-bar-wrapper">

                    <div className="search-bar">
                        <i className="material-icons">search</i>
                        <input type="text" onKeyUp={(e) => { if (e.key == 'Enter') { searchDomain() } }} onChange={(e) => {
                            setSearchedDomain(
                                e.target.value.replace(/\s+/g, '').toLowerCase()
                            );
                        }} maxLength={64} placeholder="Search for a domain ( a-z, 0-9, - )" />
                        <button onClick={() => { searchDomain() }}>Search</button>
                    </div>
                </div>

                <div className="search-results">
                    <div className="app-table results-block">

                        {
                            domainList.length ?
                                <>
                                    {
                                        domainList[0] == 'No Results' ? <p className="search-stinger">No results</p>

                                            :

                                            domainList.map(domain => (

                                                <div className="free-flow">
                                                    <div className="chunk-wrapper">
                                                        <button

                                                            className={
                                                                domain.available ? 'chunk-btn' : 'chunk-btn disabled-chunk'
                                                            } onClick={() => {
                                                                setSelectedDomain(domain)
                                                                toggleModal()
                                                            }}
                                                        >
                                                            <div className="chunk-left">
                                                                {/*  <img src={usdtIcon} alt="" /> */}
                                                                <div className="chunk-text">
                                                                    <p style={{fontSize:'11px', opacity:'.4'}}>
                                                                        {domain.network}
                                                                    </p>
                                                                    <h3>
                                                                        {domain.title}
                                                                    </h3>
                                                                  
                                                                    <p>
                                                                        {
                                                                            domain.available ? <span>
                                                                                Price: {domain.price} USDT
                                                                            </span> : <span>
                                                                                Not Available
                                                                            </span>
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="chunk-right">
                                                                {/*  <button className="chunk-right-btn">
                                                                <p>Open SimpleSwap</p>
                                                                <i className="material-icons">
                                                                    launch
                                                                </i>
                                                            </button> */}

                                                                {
                                                                    domain.available ? <button className="chunk-right-btn" onClick={() => {
                                                                        setSelectedDomain(domain)
                                                                        toggleModal()
                                                                    }}>
                                                                        <p>Buy Domain</p>
                                                                        <i className="material-icons">
                                                                            arrow_forward_ios
                                                                        </i>
                                                                    </button> : null
                                                                }
                                                            </div>
                                                        </button>
                                                    </div>
                                                </div>

                                            ))

                                    }
                                </>
                          /*   <>
                                <table>

                                   <thead>
                                        <tr>
                                            <th>Buy Domains</th>
                                            <th>Price (USDT)</th>
                                            <th>Availability</th>
                                            <th>Network</th>
                                        </tr>
                                    </thead> 
                                    <tbody>

                                        {
                                            domainList.map(domain => (
                                                <tr className={
                                                    domain.available ? 'click-table' : 'click-table disabled-table'
                                                } key={domain.name} onClick={() => {
                                                    setSelectedDomain(domain)
                                                    toggleModal()
                                                }}>
                                                    <td>
                                                        {domain.title}
                                                    </td>
                                                    <td>{domain.price}</td>
                                                    <td>
                                                        {domain.available ? <p>Available</p> : <p>Not Available</p>}
                                                    </td>
                                                    <td>
                                                        {domain.network}
                                                    </td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </table>


                            </> */ :
                                <>
                                    {
                                        <p className="search-stinger">
                                            Build the future of web3 with Frigid Domains. Search for a domain to get started.
                                        </p>
                                    }
                                </>




                        }
                    </div>
                </div>
                <div className="floating-footer">
                    <h3>
                        Frigid Domains
                    </h3>
                    <button onClick={
                        () => toggleRestore()

                    } >
                        Restore Domain
                    </button>
                    <button onClick={
                        () => navigate('/docs/domains/overview')
                    }>
                        Domain Resources
                    </button>
                    <button onClick={
                        () => navigate('/currency/domains')
                    }>
                        Get Currency
                    </button>

                </div>
            </div>
            <Modal title="Register Domain" opened={opened} size={440} radius={25} onClose={close} centered overlayProps={{
                backgroundOpacity: 0.55,
                blur: 20,
            }}>
                <BuyForm data={selectedDomain} toggleModal={toggleModal} />
            </Modal>

            <Modal title="Restore Domain" opened={openedRestore} size={470} radius={25} onClose={
                closeRestore
            } centered overlayProps={{
                backgroundOpacity: 0.55,
                blur: 20,
            }}>
                <RestorePurchases toggleModal={
                    toggleRestore
                } />
            </Modal>

            {/*   <p>glacier32</p> */}
        </>


    );
}

export default BuyDomains;


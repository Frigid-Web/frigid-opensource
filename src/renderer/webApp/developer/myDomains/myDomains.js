import React, { useEffect } from "react";
import { Link, Outlet, Route } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useDisclosure } from '@mantine/hooks';
import { Modal, Button } from '@mantine/core';
import NewAppForm from "../yourapps.js/a_newAppForm";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../home";
import { Menu } from "@mantine/core";
import ContentLoader from "../../components/contentLoader";
import RestorePurchases from "../buyDomains/restorePurchases";
import TransferDomain from "./transferDomain";
import SellDomain from "./sellDomain";
import { getNetworkTokens } from "../../../helpers/helper";
import { formatUnits } from "ethers";




function MyDomains() {
    const dispatch = useDispatch()

    const [isLoaded, setIsLoaded] = useState(false)

    const [opened, { open, close }] = useDisclosure(false);
    const toggleModal = () => {
        opened ? close() : open()
    }
    const [openedTransfer, { open: openTransfer, close: closeTransfer }] = useDisclosure(false);
    const toggleTransfer = () => {
        openedTransfer ? closeTransfer() : openTransfer()
    }
    const navigate = useNavigate()

    const [openedRestore, { open: openRestore, close: closeRestore }] = useDisclosure(false);
    const toggleRestore = () => openedRestore ? closeRestore() : openRestore();

    const [openedSell, { open: openSell, close: closeSell }] = useDisclosure(false);
    const toggleSell = () => openedSell ? closeSell() : openSell();


    const [selectedDomain, setSelectedDomain] = useState([])
    const accountId = useSelector(state => state.mainapp.authSlice.metamask.accountId)
    const chainList = useSelector(state => state.mainapp.chainSlice.chainList)

    const domainList = useLiveQuery(async () => {
        if (accountId === null) return []
        const domains = await db.domains.where('ownerAddress').equals(accountId).toArray();

        const domainsWithAppNames = await Promise.all(domains.map(async (domain) => {
            const app = await db.apps.where('domain').equals(domain.name).and(app => app.ownerAddress === accountId).first();
            return {
                ...domain,
                appName: app ? app.name : 'None'
            };
        }));
       

        if (isLoaded == false) {
            setIsLoaded(true)
        }
        return domainsWithAppNames

    }, [accountId], [])

    const [chainCheck, setChainCheck] = useState(false)
    useEffect(() => {
        (async () => {
            if (isLoaded && domainList.length != 0 && chainCheck == false) {
                try {
                    
                const lookupDomain = async (domainName, chain, id) => {
                    return new Promise(async (resolve, reject) => {
                        try {
                            console.log(chain)
                            const {dns} = getNetworkTokens[chain.slug]
        
                            const results = await dns.rpcContract.domains(domainName)
                            if(results.owner.toLowerCase() == accountId){
                                let splitDomain = domainName.split('.')
                                let price = results['salePrice'] == 0n ? 0 : formatUnits(results['salePrice'], 'mwei')
                                resolve({ 
                                id:id,
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
        
                for (let domain of domainList) {
                    let splitDomain = domain.name.split('.')
                    let network = splitDomain[splitDomain.length - 1]
                    let chain = chainList.find(chain => chain.domainEnding == network)
                    console.log(chain, splitDomain, network )
                    promises.push(lookupDomain(domain.name, chain, domain.id))
                }
                const results = await Promise.allSettled(promises)
                const extractedResults = results.map(result => result.value).filter(result => result != undefined)
                if(extractedResults.length > 0){
                    for(let domain of extractedResults){
                        await db.domains.update(domain.id,{
                            name: domain.title,
                            forSale: domain.forSale,
                            price: domain.price,
                            networkName: domain.network,
                            networkSlug: domain.networkSlug,
                            suffix: domain.suffix,
                            sold:domain.forSale
                        })
                    }
                } 
                } catch (error) {
                    console.log(error)
                }
                finally{
                    setChainCheck(true)
                }

            }
        })()
       
    }, [isLoaded])


    const deleteRow = async (id) => {
        db.domains.delete(id);
    }






    return (
        isLoaded ?
            <>



                {
                    domainList.length ? <>
                        {
                            domainList.length !== 0 ? <div className="app-table">
                                <table>
                                    <thead style={{ position: 'static' }}>
                                        <tr>
                                            <th>My Domains</th>
                                            <th>App</th>
                                            <th>Price (USDT)</th>
                                            <th>For Sale</th>
                                            <th>Manage</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            domainList.map(domain => (
                                                <tr className="click-table disabled-click-table" key={domain.id} >

                                                    <td>
                                                        <div className="table-app">
                                                            {domain.name}
                                                        </div>
                                                    </td>
                                                    <td>{domain.appName}</td>
                                                    <td>{domain.price}</td>
                                                    <td>{domain.sold ? 'Sold' : domain.forSale ? 'Yes' : 'No'}</td>
                                                    <td>
                                                        <Menu width={200}>

                                                            <Menu.Target>
                                                                <button className="table-btn">
                                                                    <i className="material-icons">
                                                                        more_horiz
                                                                    </i>
                                                                </button>
                                                            </Menu.Target>
                                                            <Menu.Dropdown>
                                                                <Menu.Label>
                                                                    Manage Ownership
                                                                </Menu.Label>

                                                                {domain.sold ?

                                                                    <Menu.Item leftSection={
                                                                        <i className="material-icons">
                                                                            double_arrow
                                                                        </i>
                                                                    } onClick={() => {
                                                                        setSelectedDomain(domain);
                                                                        deleteRow(domain.id)
                                                                    }
                                                                    }>
                                                                        Remove Row
                                                                    </Menu.Item>

                                                                    :

                                                                    <Menu.Item leftSection={
                                                                        <i className="material-icons">
                                                                            double_arrow
                                                                        </i>
                                                                    } onClick={() => {
                                                                        setSelectedDomain(domain);
                                                                        toggleTransfer()
                                                                    }
                                                                    }>
                                                                        Transfer Ownership
                                                                    </Menu.Item>

                                                                }



                                                                {domain.sold ? null :
                                                                    domain.forSale ?
                                                                        <Menu.Item leftSection={
                                                                            <i style={{ fontSize: 17, margin: '0px 2px' }} className="material-icons">
                                                                                sell
                                                                            </i>
                                                                        } onClick={() => {
                                                                            setSelectedDomain(domain);
                                                                            toggleSell()
                                                                        }
                                                                        }>
                                                                            Update Sell Listing
                                                                        </Menu.Item>

                                                                        :
                                                                        <Menu.Item leftSection={
                                                                            <i style={{ fontSize: 17, margin: '0px 2px' }} className="material-icons">
                                                                                sell
                                                                            </i>
                                                                        } onClick={() => {
                                                                            setSelectedDomain(domain);
                                                                            toggleSell()
                                                                        }
                                                                        }>
                                                                            Sell Domain
                                                                        </Menu.Item>
                                                                }




                                                            </Menu.Dropdown>
                                                        </Menu>
                                                    </td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </table>
                            </div> :
                                null
                        }
                    </> : <div className="new-start">
                        <div className="new-start-body">
                            <Link to={'/buydomains'}><button className='focused-btn' >Buy A Domain</button></Link>
                            <p className='focused-text'>An all New Internet Awaits. Get started with a Frigid Domain</p>
                        </div>
                    </div>
                }

                <Modal opened={opened} size={500} radius={25} onClose={close} title="New App" centered overlayProps={{
                    backgroundOpacity: 0.55,
                    blur: 20,
                }}>
                    <NewAppForm toggleModal={toggleModal} />
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
                <Modal title="Transfer Domain" opened={openedTransfer} size={440} radius={25} onClose={
                    closeTransfer
                } centered overlayProps={{
                    backgroundOpacity: 0.55,
                    blur: 20,
                }}>
                    <TransferDomain toggleModal={
                        toggleTransfer
                    } domain={selectedDomain} />
                </Modal>
                <Modal title={selectedDomain.forSale ? 'Update Listing' : "Sell Domain"} opened={openedSell} size={440} radius={25} onClose={
                    closeSell
                } centered overlayProps={{
                    backgroundOpacity: 0.55,
                    blur: 20,
                }}>
                    <SellDomain toggleModal={
                        toggleSell
                    } sellFlag={selectedDomain.forSale} domain={selectedDomain} />
                </Modal>




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
                <style>
                    {
                        `
                    td, th {
                        padding: 12px 27px
                    }
                    `
                    }
                </style>

                {/*   <p>frozen76</p> */}

            </>

            :

            null
        // <ContentLoader text={"Retrieving your domains..."} />



    );
}

export default MyDomains;


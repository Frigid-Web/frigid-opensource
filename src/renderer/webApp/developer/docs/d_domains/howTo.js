import React from "react";
import { Link, Outlet, Route } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useDisclosure } from '@mantine/hooks';

import { useNavigate } from "react-router-dom";
import Hero from "../utils/hero";
import Text from "../utils/text";
import List from "../utils/list";
import Title from "../utils/title";
import Paragraph from "../utils/paragraph";
import { useEffect } from "react";
function HowToPage() {
    const dispatch = useDispatch()

    const navigate = useNavigate()
    const currentChain = useSelector(state => state.mainapp.chainSlice.currentChain)
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])
    return (
        <>
            <Hero title="How To Buy a Domain" color="rgb(26 0 35)" description="
           Learn how to buy a domain on the blockchain and deploy your app to the Frigid Network.
            " icon="domain_add" />
            <div className="doc-page-content">
                <div className="doc-content-grouper">
                    <Title> Get Currency</Title>
                    <Paragraph>
                        <p>
                            To buy a domain on the blockchain, you will need to have <b>USDT</b> and the respective gas currency

                            <b> {
                                currentChain.nativeCurrency.symbol
                            }</b> for the chain you are using. You can buy USDT from a cryptocurrency exchange or use a service like <a target="_blank" href="https://simpleswap.io">simpleswap.io</a> to swap for USDT. You can also use a service like MetaMask to buy USDT directly from your wallet.
                        </p>
                    </Paragraph>


                    <List content={[
                        "Get USDT from a cryptocurrency exchange",
                        "Get Gas currency for the chain you are using",

                    ]} />

                </div>

                <div className="doc-content-grouper">
                    <Title>Check Domains Availablity</Title>
                    <Paragraph>
                        <p>
                            To check if a domain is available, visit the Frigid Developer Portal and press Buy Domain. If the domain is available, you can proceed to purchase it. If the domain is not available, you can try a different domain name or search for a different extension. Click the link below to check domain availability. <Link to="/buydomains">Check Domain Availability</Link>
                        </p>
                    </Paragraph>


                    <List content={[
                        "Visit the Frigid Developer Portal",
                        "Press Buy Domain",
                        "Check if the domain is available by searching",

                    ]} />

                </div>


                <div className="doc-content-grouper">
                    <Title>Confirm Purchase with Metamask</Title>
                    <Paragraph>
                        <p>
                            After you have confirmed the domain is available, you can proceed to purchase the domain. You will need to have USDT and the respective gas currency for the chain you are using.
                        </p>
                    </Paragraph>
                </div>

            </div>
        </>


    );
}

export default HowToPage


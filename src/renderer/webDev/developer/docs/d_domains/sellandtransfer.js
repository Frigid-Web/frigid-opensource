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
function SellTransferPage() {
    const dispatch = useDispatch()

    const navigate = useNavigate()
    const currentChain = useSelector(state => state.mainapp.chainSlice.currentChain)
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])
    return (
        <>
            <Hero title="How to Transfer or Sell a Domain" color="rgb(26 0 35)" description="
              Learn how to transfer or sell a domain on the blockchain using Frigid Developer Portal.
            " icon="double_arrow" />
            <div className="doc-page-content">
                <div className="doc-content-grouper">
                    <Paragraph>
                        <p>
                            Note: transfers and sales are final and cannot be undone. Please exercise caution when transferring or selling a domain. As you are the owner of the domain, you are responsible for any actions taken with the domain.
                        </p>
                    </Paragraph>
                    <Title> Get Currency</Title>
                    <Paragraph>
                        <p>


                            To transfer or sell a domain, you will need to have <b>USDT</b> and the respective gas currency

                            <b> {
                                currentChain.nativeCurrency.symbol
                            }</b> for the chain you are using. You can buy USDT from a cryptocurrency exchange or use a service like <a target="_blank" href="https://simpleswap.io">simpleswap.io</a> to swap for USDT. You can also use a service like MetaMask to buy USDT directly from your wallet.
                        </p>
                    </Paragraph>


                    <List content={[
                        "Get " + currentChain.stableToken.name + " from a cryptocurrency exchange",
                        "Get Gas currency for the chain you are using",

                    ]} />

                </div>

                <div className="doc-content-grouper">
                    <Title>
                        Begin Transfer or Sale
                    </Title>
                    <Paragraph>
                        <p>
                            To begin the transaction visit the <Link to="/mydomains">My Domains</Link> page and select the ellipsis icon under manage for the domain you wish to transfer or sell. Select the transfer or sell option and follow the prompts to complete the transaction.
                        </p>
                    </Paragraph>


                    <List content={[
                        "Visit the Frigid Developer Portal",
                        "Press My Domains",
                        "Select the ellipsis icon under manage for the domain you wish to transfer or sell",
                        "Select the transfer or sell option",
                        "Follow the prompts to complete the transaction",


                    ]} />

                </div>


                <div className="doc-content-grouper">
                    <Title>Confirm Purchase with Metamask</Title>
                    <Paragraph>
                        <p>
                            After you have confirmed your sell or transfer, you will be prompted by MetaMask. You will need to have USDT and the respective gas currency for the chain you are using.
                        </p>
                    </Paragraph>
                </div>

            </div>
        </>


    );
}

export default SellTransferPage


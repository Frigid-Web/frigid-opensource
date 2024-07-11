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
import Paragraph from "../utils/paragraph";
import Title from "../utils/title";
import { useEffect } from "react";
import privatekeyguide from "../../../../../../assets/privatekeyguide.gif"
function SpeedUpPage() {
    const dispatch = useDispatch()

    const navigate = useNavigate()
    const currentChain = useSelector(state => state.mainapp.chainSlice.currentChain)
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])


    useEffect(() => {
        try {
            const hash = window.location.hash;

            const observer = new ResizeObserver((entries) => {
                for (let entry of entries) {
                    const isScrollable = entry.target.scrollHeight > window.innerHeight;
                    console.log('Is document scrollable:', isScrollable);
                    if (isScrollable) {
                        scrollToHash(true);
                    }
                }
            });

            const scrollToHash = (resizeCheck = false) => {
                if (hash) {
                    const element = document.querySelector(hash);
                    if (element) {
                        element.className += ' doc-target';
                        element.scrollIntoView({ behavior: 'smooth' });

                    } else {
                        window.scrollTo(0, 0);
                    }
                } else {
                    window.scrollTo(0, 0);
                }
                if (resizeCheck) {
                    observer.disconnect();
                }
            };

            observer.observe(document.body);

            // Run initially
            scrollToHash();

            return () => {
                if (observer) {
                    observer.disconnect();
                }
            };
        } catch (error) {

        }

    }, [window.location.hash]);
    return (
        <>
            <Hero title="Speed Up Publishing" description="
            The process of speeding up the publishing and deployment of your DApp to the Blockchain.
            " icon="speed" color="rgb(35 32 0)" />

            <div className="doc-page-content">



                <div className="doc-content-grouper">
                    <Paragraph>
                        <p>
                            You'll learn how to optimize your apps for improved publishing speed to the blockchain. This guide will help you speed up the publishing and deployment of your DApp to the Blockchain by using your private key, storing large assets using Pluri and changing your RPC URL in MetaMask.
                        </p>
                    </Paragraph>


                </div>


                <div id="changerpc" className="doc-content-grouper">
                    <Title>
                        Change your RPC URL in MetaMask
                    </Title>
                    <Paragraph>
                        <p>
                            Changing your RPC url is a great way to speed up publishing and prevent rate limiting. We recommend using a local or purchased blockchain Node for your RPC to speed up the publishing process. There are also has other benefits such as preventing rate limiting, increased privacy, and faster transaction times. Learn how to setup your own local Polygon blockchain node <Link to="https://docs.polygon.technology/pos/how-to/full-node/full-node-packages/" target="_blank">here</Link>.

                        </p>

                        <p>
                            Follow the steps below to change your RPC URL in MetaMask.
                        </p>

                        <List content={[
                            "Click on the MetaMask icon in your browser",
                            "Click on the network dropdown at the top",
                            "Select 'Add Network' at the bottom",
                            "Enter the Network Name, New RPC URL, and Chain ID",
                            "Click 'Save'",
                            "Select the new network from the dropdown to switch"
                        ]} />


                    </Paragraph>




                </div>



                <div className="doc-content-grouper">
                    <Title>
                        Store Large Assets Using Pluri
                    </Title>
                    <Paragraph>
                        <p>
                            Pluri is a Next-Geneartion token that allows you to store large assets on the blockchain. By using Pluri, you can store large assets such as images, videos, and other resources on the blockchain without the need for a web server or KYC. This allows you to speed up the publishing and deployment of your DApp to the Frigid Network. Learn more about Pluri <Link to="https://polygon.pluricoin.io/ "
                                target="_blank">pluricoin.io</Link>.

                        </p>

                    </Paragraph>




                </div>

                <div className="doc-content-grouper">

                    <Title>
                        Speed Up Publishing with Private Key
                    </Title>
                    <Paragraph>
                        <p>
                            Note: Your private key is never stored on any server and is only used to sign transactions on your local machine.
                        </p>
                        <p>
                            By using your private key on the publish screen of your app we can significantly speed up the publishing process. This allows us to sign transactions and deploy your app faster. You can find your private key in your MetaMask wallet under the account details.
                        </p>
                    </Paragraph>


                    <List content={[
                        "Find your private key in MetaMask wallet",
                        "Use your private key on the publish screen",
                        "Sign transactions and deploy your app faster",



                    ]} />

                    <img src={privatekeyguide} alt="privatekeyguide" />
                    <Paragraph>
                        <p>
                            Image source:
                            <a href="https://support.metamask.io/managing-my-wallet/secret-recovery-phrase-and-private-keys/how-to-export-an-accounts-private-key/#:~:text=On%20the%20'Account%20details'%20page,private%20key%20to%20your%20clipboard." target="_blank"> support.metamask.io</a>
                        </p>
                    </Paragraph>


                </div>




            </div>
        </>


    );
}

export default SpeedUpPage


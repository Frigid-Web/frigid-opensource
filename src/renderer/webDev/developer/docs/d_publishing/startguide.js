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
function StartGuide() {
    const dispatch = useDispatch()

    const navigate = useNavigate()
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
            <Hero title="Quick Start Guide" description="
            This guide will help you publish your dApp or webapp on the blockchain using Frigid.
            " icon="offline_bolt" color="#00231b" />
            <div className="doc-page-content">
                <div className="doc-content-grouper">
                    <Paragraph>
                        <p>
                            Frigid uses the Ethereum blockchain to store chunks of your app in transactions. The Frigid Desktop Client combines these chunks to create a fully functional web app. The Frigid Network is a decentralized network that allows you to deploy your app to the blockchain without the need for a web server or KYC.
                        </p>
                    </Paragraph>
                </div>
                <div className="doc-content-grouper">
                    <Title>Register a Domain</Title>
                    <Paragraph>
                        <p>
                            The first step to deploying your app to the blockchain is to register a domain. A domain is a unique identifier for your app on the blockchain. You can register a domain using the Frigid Developer Portal. These domains are stored on the blockchain and can be used to access your app. You need the USDT currency to make the purchase. You must have the Frigid Desktop Client installed to visit your app.
                            Learn more about <Link to="/docs/domains/howTo">How to Buy a Domain</Link>
                        </p>
                    </Paragraph>



                </div>

                <div className="doc-content-grouper">
                    <Title>Create an App</Title>
                    <Paragraph>
                        <p>
                            Click the New App button in the Frigid Developer Portal to create a new app. You will be prompted to enter your app name, icon, domain and more. This information is stored on the blockchain and acts as metadata for your app. You can update this information at any time. Your metadata may also be used to search for your app on the Frigid Network.
                        </p>
                    </Paragraph>


                </div>


                <div className="doc-content-grouper" id="prepareforupload">
                    <Title>Prepare For Upload</Title>
                    <Paragraph>
                        <p>
                            Frigid supports a variety of technologies and frameworks like React, Vue, static HTML and more. Have your index.html file in the root of your app. Be sure to have your app in a zip file format. Make sure, to have PLURI coin and Gas currency for the network you selected during setup in your MetaMask wallet. You can also use the Frigid Desktop Client to test your app before deployment.
                        </p>
                    </Paragraph>

                    <List content={[
                        "Have an index.html file in the root of your app",
                        "Make sure all files list their extension in the name (test (txt) -> test.txt)",
                        "Put your code in a zip file",
                        "Test Your App",
                        "Get PLURI and Gas",



                    ]} />


                </div>

                <div className="doc-content-grouper">

                    <Title>Publish App</Title>
                    <Paragraph>
                        <p>
                            Click the Upload App button in the Frigid Developer Portal to begin the process. You will complete a MetaMask transaction for each chunk of your app. Once all chunks are uploaded, your app will be live on the Frigid Network. You can view your app by visiting your domain.
                        </p>
                    </Paragraph>



                </div>

            </div>

        </>


    );
}

export default StartGuide


import React, { useEffect } from "react";
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

function OverviewPage() {
    const dispatch = useDispatch()

    const navigate = useNavigate()

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    return (
        <>
            <Hero title="DApp Publishing" color="#001523" description="
           Use the Frigid Network to deploy your DApp or web app to the blockchain.
            " icon="account_tree" />
            <div className="doc-page-content">
                <div className="doc-content-grouper">
                    <Title>Overview</Title>
                    <Paragraph>
                        <p>This guide will help you prepare and deploy your dApp or web app on the blockchain using the Frigid Network on ethereum. We'll explore how to get a domain name on the blockchain, How to test your web app before deployment, optimize your app for publishing and more.</p>
                    </Paragraph>
                    <Paragraph>
                        <p> Whether it's a simple index.html or a complex dApp, the process of deploying your app to the blockchain can be a daunting task. With the Frigid Network, we've made it easy to deploy your app to the blockchain.</p>
                    </Paragraph>

                    <Paragraph>
                        <p>All data is stored securely on the blockchain. The Frigid Network is a decentralized network that allows you to deploy your app to the blockchain without the need for a web server or KYC.
                            <Link to="/docs/publishing/startguide"> Quick Start Guide</Link>
                        </p>
                    </Paragraph>
                    {/* 
                    <Text content="
             All data is stored securely on the blockchain. The Frigid Network is a decentralized network that allows you to deploy your app to the blockchain without the need for a web server or KYC.
            "  link={
                            [

                                {
                                    name: "Quick Start Guide",
                                    link: "/docs/publishing/startguide",
                                }
                            ]
                        } />


                </div> */}

                    <div className="doc-content-grouper">
                        <Text title="What You'll Learn" />
                        <List content={[
                            "How to deploy your app to the blockchain",
                            "How to get a domain name on the blockchain",
                            "How to test your app before deployment",
                            "How to optimize your app for the blockchain",
                            "How to store data on the blockchain in your app"
                        ]} />
                    </div>
                </div>
            </div>
        </>


    );
}

export default OverviewPage


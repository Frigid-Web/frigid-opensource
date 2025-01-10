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
import { useEffect } from "react";
function DomainOverviewPage() {
    const dispatch = useDispatch()

    const navigate = useNavigate()
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])
    return (
        <>
            <Hero title="Frigid Domains" color="rgb(26 0 35)" description="
           Get your domain name on the blockchain and deploy your app to the Frigid Network.
            " icon="domain_verification" />
            <div className="doc-page-content">
                <div className="doc-content-grouper">
                    <Text title="Overview" content="
             Frigid Domains are hosted entirely on the blockchain. This means that your domain name is secure and cannot be taken down by any central authority. With Frigid Domains, you can deploy your app to the blockchain and access it from anywhere in the world.
            " />
                    <Text content="
            Frigid Domains support all types of web apps, including static sites, dApps, and more. You can deploy your app to the blockchain with just a few clicks, and access it with the Frigid Desktop Client on any web browser.
            " />

                    <Text content="
             All data is stored securely on the blockchain. The Frigid Network is a decentralized network that allows you to deploy your app to the blockchain without the need for a web server or KY. The Frigid Desktop Client is required to access your domain.
            "  link={
                            [

                                {
                                    name: "How To Buy a Domain",
                                    link: "/docs/domains/howTo",
                                }
                            ]
                        } />


                </div>

                <div className="doc-content-grouper">
                    <Text title="What You'll Learn" />
                    <List content={[
                        "How to buy a domain name with USDT",
                        "Sell your domain name to another user",
                        "Transfer your domain name to another user",
                    ]} />
                </div>
            </div>
        </>


    );
}

export default DomainOverviewPage


import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { TextInput, Select, FileInput, Button } from "@mantine/core";
import { db } from "../../home";
import { useLiveQuery } from "dexie-react-hooks";
import { Link, useParams } from "react-router-dom";
import { getNetworkTokens } from "../../../helpers/helper";
import { getBytes, toUtf8String } from "ethers";
import { decodeHexToJson } from 'hex2json';
import { alterLoading } from "../../../store/schemas/loadingSlice";
import { determineOnNetwork } from "../../httpCalls/frigidApi";

function HashModal({ toggleModal, currentHash }) {
    const dispatch = useDispatch();
    const accountId = useSelector(state => state.mainapp.authSlice.metamask.accountId)
    const { id } = useParams()

    const currentSelectedChain = useSelector(state => state.mainapp.chainSlice.currentChain)


   const handleFormSubmit = async (e) => {
    e.preventDefault();

    let app = await db.apps.get(parseInt(id))

    dispatch(determineOnNetwork({domain:app.domain})).then(async (r) => {
        if(r.payload == false){
            return
        }
        try{
            const {dns} = getNetworkTokens[currentSelectedChain.slug]
            let deployment = JSON.parse(JSON.stringify(await db.deployments.where('appId').equals(parseInt(id)).and(item => item.transactionHash === currentHash.transactionHash).first())) 
            if(deployment == undefined){
                alert('Deployment not found')
                return
            }
            let app = await db.apps.get(parseInt(id))
            delete deployment.id
            deployment.created = new Date().toUTCString()

            const fileData = await dns.provider.getTransactionReceipt(deployment.transactionHash)
            let json = decodeHexToJson(fileData.logs[0].data)
            const siteJson = json
            let data = JSON.stringify(siteJson)

            const actualContract = dns.contract
            dispatch(alterLoading(
                {
                    loading: true,
                    statusText: 'Processing Version Change...',
                    origin: "Version History"
                }
            ))
        


            const tx = await actualContract.updateDomainMetadata(app.domain, data)
            await tx.wait(2)
            await db.deployments.add(deployment)
            await db.apps.update(parseInt(id), { version: deployment.version})
            dispatch(alterLoading(
                {
                    loading: false,
                    statusText: 'Transaction Complete!',
                    origin: "Version History"
                }
            ))
            toggleModal()
        }
        catch(error){
            dispatch(alterLoading(
                {
                    loading: false,
                    statusText: 'Transaction Failed!',
                    origin: "Version History"
                }
            ))
        }

    })
       
   }



    return (
        <>

            <form onSubmit={handleFormSubmit}>
                <div className="form-container">


                    <div className="faucet-charm">
                        <div className="faucet-charm-left">
                            <i className="material-icons" style={{ fontSize: 25 }}>source</i>
                            <div className="faucet-charm-text">
                                <span>
                                    {currentHash.version}
                                </span>
                                <h3>
                                    {currentHash.description}
                                </h3>
                                <p style={{ marginTop: 0, wordBreak:'break-all' }}>
                                    {currentHash.transactionHash}
                                </p>
                            </div>
                        </div>

                    </div>

                    <p style={
                        {
                            fontSize: 13,
                            opacity: 0.5,
                            textAlign: 'center'
                        }
                    }>
                        Published: {currentHash.created}
                    </p>


                    <div style={{ marginTop: 100 }} className="focused-btn-container">
                        <button className="focused-btn" type="submit">
                            Restore Version
                        </button>
                    </div>
                </div>
            </form></>

    );
}

export default HashModal;

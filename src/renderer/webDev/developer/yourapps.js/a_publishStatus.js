import React, { useEffect, useMemo } from "react";
import { Link, Outlet, Route, useParams } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useDisclosure } from '@mantine/hooks';
import { Modal, Button, Tooltip } from '@mantine/core';
import NewAppForm from "./a_newAppForm";
import { useNavigate } from "react-router-dom";
import { FileUploader } from "react-drag-drop-files";
import { TextInput, Textarea, Progress, Switch } from "@mantine/core";
import { db } from "../../home";
import { useLiveQuery } from "dexie-react-hooks";
import { alterLoading } from "../../../store/schemas/loadingSlice";
import loading from "../../../../../assets/loadingIcon.gif"
import { decryptPrivateKey, deriveKey } from "../../../helpers/encyrpt";
import { getNetworkTokens } from "../../../helpers/helper";
import { ethers, Wallet, Contract, hexlify } from 'ethers'
function PublishStatus(props) {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { id } = useParams()
    const app = useLiveQuery(() => db.apps.get(parseInt(id)), [id], {});
    const addressId = useSelector(state => state.mainapp.authSlice.metamask.accountId)
    const currentSelectedChain = useSelector(state => state.mainapp.chainSlice.currentChain)

    const [isLoaded, setIsLoaded] = useState(false)


    const [publishState, setPublishState] = useState({
        loading: true,
        error: false,
        value: 0,
        total: 0,
        errorString: '',
    })

    const currentColor = useMemo(() => {
        return publishState.loading ? '#4ADEFF' : publishState.error ? '#D1D500' : '#00DBA4'
    }, [publishState])

    const progressCalculation = useMemo(() => {
        return (publishState.value / publishState.total) * 100
    }, [publishState])


    const handleTransaction = async (data) => {
        let customError = false
        try {
            const { pluri, nativeTokenFunctions } = getNetworkTokens[currentSelectedChain.slug]
            if (props.encryptedKey != '' && props.encryptedKey != undefined && props.encryptedKey != null) {
                const key = await deriveKey('FrigidNetwork', addressId)
                const privateKey = await decryptPrivateKey(key, props.encryptedKey)
                const wallet = new Wallet(privateKey, pluri.rpcProvider)
                const actualPluriContract = new Contract(pluri.token.address, pluri.token.abi, wallet)
                const gasEstimate = await actualPluriContract.transferWithData.estimateGas(addressId, 0n, '0x' + data);

                const feeData = await pluri.rpcProvider.getFeeData()

                const balance = await nativeTokenFunctions.rpcProvider.getBalance(addressId);
                if (balance < gasEstimate + BigInt(Math.ceil((Number(gasEstimate) * (200 / 100)))) * feeData.maxFeePerGas) {
                    customError = true
                    throw new Error(`Insufficient ${currentSelectedChain.nativeCurrency.name} Balance For Gas`)
                }
                const pluriBalance = await actualPluriContract.balanceOf(addressId)
                if (pluriBalance < 100000000000n) {
                    customError = true
                    throw new Error(`Insufficient Pluri, 0.0000001 Pluri Required Per Transaction`)
                }

                const tx = await actualPluriContract.transferWithData(addressId, 0n, '0x' + data, {
                    gasLimit: gasEstimate + BigInt(Math.ceil((Number(gasEstimate) * (200 / 100)))),
                    maxFeePerGas: feeData.maxFeePerGas + BigInt(Math.ceil((Number(feeData.maxFeePerGas) * 20 / 100))),
                });
                const transactionHash = tx.hash;
                console.log('Transaction Hash: ', transactionHash)
                await tx.wait(2)
                return transactionHash
            }
            else {
                const actualPluriContract = pluri.contract
                const pluriBalance = await actualPluriContract.balanceOf(addressId)
                if (pluriBalance < 100000000000n) {
                    customError = true
                    throw new Error(`Insufficient Pluri, 0.0000001 Pluri Required Per Transaction`)
                }
                const tx = await actualPluriContract.transferWithData(addressId, 0n, '0x' + data)
                const transactionHash = tx.hash;
                await tx.wait(2)
                // Hey future me, you need to send these transaction hashes to the backend as data, then handle the final transaction with index and other info
                return transactionHash
            }
        } catch (error) {
            if (customError == true) {
                throw new Error(error.message)
            }
            else {
                console.log('Transaction Error: ', error)
                throw new Error("Transaction Failed")

            }
        }

    }

    const handleFinalTransaction = async (transactionHash) => {
        let customError = false
        try {
            const { dns, nativeTokenFunctions } = getNetworkTokens[currentSelectedChain.slug]
            const deployment = await db.deployments.where('appId').equals(parseInt(id)).and(item => item.status === 'pending').first()
            const siteJson = {
                originHash: transactionHash,
                noIndex: deployment.noIndex,
                version: deployment.version,
                description: deployment.description
            }
            let data = JSON.stringify(siteJson)
            if (props.encryptedKey != '' && props.encryptedKey != undefined && props.encryptedKey != null) {
                const key = await deriveKey('FrigidNetwork', addressId)
                const privateKey = await decryptPrivateKey(key, props.encryptedKey)
                const wallet = new Wallet(privateKey, dns.rpcProvider)
                const actualContract = new Contract(dns.token.address, dns.token.abi, wallet)
                const gasEstimate = await actualContract.updateDomainMetadata.estimateGas(app.domain, data)
                const balance = await nativeTokenFunctions.rpcProvider.getBalance(addressId);
                if (balance < gasEstimate + BigInt(Math.ceil((Number(gasEstimate) * (200 / 100))))) {
                    customError = true
                    throw new Error(`Insufficient ${currentSelectedChain.nativeCurrency.name} Balance For Gas`)
                }
                const feeData = await dns.rpcProvider.getFeeData()
                const tx = await actualContract.updateDomainMetadata(app.domain, data, {
                    gasLimit: gasEstimate + BigInt(Math.ceil((Number(gasEstimate) * (200 / 100)))),
                    maxFeePerGas: feeData.maxFeePerGas + BigInt(Math.ceil((Number(feeData.maxFeePerGas) * 20 / 100))),
                })
                const transactionHash = tx.hash;
                await tx.wait(2)
                await db.deployments.update(deployment.id, { transactionHash: transactionHash })

                return transactionHash
            }
            else {

                const actualContract = dns.contract
                const tx = await actualContract.updateDomainMetadata(app.domain, data)
                const transactionHash = tx.hash;
                await tx.wait(2)
                // Hey future me, you need to send these transaction hashes to the backend as data, then handle the final transaction with index and other info
                await db.deployments.update(deployment.id, { transactionHash: transactionHash })
                return transactionHash
            }

        } catch (error) {
            if (customError == true) {
                throw new Error(error.message)
            }
            else {
                console.log('Transaction Error: ', error)
                throw new Error("Transaction Failed")

            }
        }
    }

    const endWs = async () => {
        setPublishState(state => ({ ...state, loading: false }))
        const deployment = await db.deployments.where('appId').equals(parseInt(id)).and(item => item.status === 'pending').first()
        await db.deployments.update(deployment.id, { status: 'completed' })
        await db.apps.update(parseInt(id), { version: deployment.version })
        await props.getDelete(true)
        props.setFileReady(false)

    }

    const handleChange = async () => {

        const ws = new WebSocket('https://dev.frigid/');
        let pingInterval;



        const triggerWebsocket = async () => {
            let wsLoading = true

            try {
                await new Promise(async (resolve, reject) => {
                    const newDomain = app.domain + '.preview.frigid';
                    const PING_INTERVAL = 15 * 1000; // 30 seconds



                    ws.onopen = () => {
                        const message = JSON.stringify({
                            domain: newDomain,
                            productionDomain: app.domain,
                            type: 'publish',
                        });
                        ws.send(message);
                        pingInterval = setInterval(() => {
                            ws.send(JSON.stringify({ type: 'ping' }));
                        }, PING_INTERVAL);
                    };

                    ws.onmessage = async (event) => {
                        const response = JSON.parse(event.data);

                        if (response.error !== undefined) {
                            reject(new Error(`Chunk upload failed at index ${response.error}`));
                            ws.close();
                        }
                        else if (response.type === 'finalUpload') {
                            try {
                                await handleFinalTransaction(response.message)

                                const message = JSON.stringify({
                                    domain: newDomain,
                                    productionDomain: app.domain,
                                    type: 'publishUpdate'
                                })
                                ws.send(message);
                            } catch (error) {
                                reject(new Error(`Transaction Error: ${error.message}`));
                            }

                        }
                        else if (response.type === 'end') {
                            wsLoading = false
                            await endWs()
                            resolve()
                        } else if (response.type === 'publishData') {
                            try {
                                const transactionHash = await handleTransaction(response.message)

                                const message = JSON.stringify({
                                    domain: newDomain,
                                    productionDomain: app.domain,
                                    transactionHash: transactionHash,
                                    type: 'publishUpdate'
                                })
                                ws.send(message);
                            } catch (error) {
                                reject(new Error(`Transaction Error: ${error.message}`));
                            }

                        }
                        else if (response.type === 'progress') {
                            setPublishState(state => (
                                { ...state, value: state.value + response.message }
                            ))

                        }
                        else if (response.type === 'totalFiles') {
                            setPublishState(state => ({ ...state, value: response.alreadyUploaded, total: response.message }))
                            setIsLoaded(true)

                        }
                        else if (response.type == 'pong') {
                            console.log('pong')
                        }
                    };

                    ws.onerror = (error) => {
                        clearInterval(pingInterval);
                        reject(new Error(`Publish error: ${error.message}`));
                    };

                    ws.onclose = () => {
                        reject(new Error('Connection closed.'));
                    };


                })
            } catch (error) {
                if (publishState.loading == false || wsLoading == false) return
                setPublishState(state => ({ ...state, error: true, errorString: error.message, loading: false }))
                // alert("Error processing file: " + error.message);
            }

            if (ws.readyState == 1) {
                ws.close()
            }
            clearInterval(pingInterval)
        }

        triggerWebsocket()






        return () => {
            ws.close();
            clearInterval(pingInterval);
        };
    };

    useEffect(() => {
        if (app?.domain === undefined) return

        let cleanupFunc = null;

        (async () => {
            const deployment = await db.deployments.where('appId').equals(parseInt(id)).and(item => item.status === 'pending').first();

            if (deployment && deployment?.transactionHash != null) {
                await endWs();
            }
            else {
                if (deployment != undefined) {
                    cleanupFunc = await handleChange();
                }
            }

        })();

        return () => {
            if (cleanupFunc) {
                cleanupFunc();
            }
        };
    }, [app])

    return (
        isLoaded ?
            <>
                <div className="advanced-loading-container">
                    <div className="advanced-loading">
                        <div className="advanced-header">
                            <div className="adv-header-title">
                                {
                                    publishState.loading ? <img src={loading} alt="loading" /> : null
                                }
                                {
                                    publishState.loading ? <h3>Please Do Not Close This Tab</h3> : publishState.error ? <h3>{publishState.errorString}</h3> : <a href={
                                        `https://${app.domain}`
                                    } target="_blank">
                                        {`https://${app.domain}`} <i className="material-icons">open_in_new</i>
                                    </a>
                                }
                            </div>
                            <button className="close-btn" onClick={() => {

                                if (
                                    publishState.loading || publishState.error ? window.confirm('Are you sure you want to close this tab?') : true
                                ) {
                                    props.togglePublishStatus()
                                }
                            }}>{
                                    publishState.loading ? 'Cancel Upload' : publishState.error ? 'Close' : 'Close'

                                }</button>

                        </div>
                        <div className="advanced-progress">
                            <div className="advanced-progress-status">
                                <i style={{ color: currentColor }} className="material-icons">{
                                    publishState.loading ? 'account_tree' : publishState.error ? 'warning' : 'check_circle'
                                }</i>
                                <h3>{
                                    publishState.loading ? 'Uploading to Blockchain...' : publishState.error ? 'Error Occurred' : 'Upload Complete'
                                }</h3>
                            </div>
                            <Progress radius="xl" color={currentColor} size="lg" value={progressCalculation} />
                        </div>
                        {
                            publishState.error && <p style={{"background":"#e5e5433b","padding":"20px","borderRadius":"10px","fontSize":"12px"}}>
                                Did your transaction fail instantly or is not processing fast enough?
                                <br/> <Link style={{
                                    color: 'white',
                                    textDecoration: 'underline'
                                }} to="/docs/publishing/speedup#changerpc">
                                    Try Changing Your RPC
                                </Link>
                            </p>
                        }


                        <div className="advanced-status">
                            <div className="adv-status-item">
                                {(props.encryptedKey != '' && props.encryptedKey != undefined && props.encryptedKey != null) ?
                                      <>
                                        <h4>Confirm with Private Key</h4>
                                        <p>
                                            Each transaction will automatically be confirmed with your private key.
                                        </p>
                                    </>
                                :
                                    <>
                                        <h4>Confirm with Metamask</h4>
                                        <p>
                                            Confirm each transaction with Metamask to upload your app.
                                        </p>
                                    
                                    </>
                                }
                               
                            </div>
                            <div className="adv-status-item">
                                <h4>{publishState.value} of {publishState.total} Chunks</h4>
                                <p>
                                    Your app has been split into chunks and is being uploaded to the blockchain
                                </p>
                            </div>
                        </div>


                    </div>
                </div>
                <style>
                    {
                        `
                    .viewer-activity-body {
                        position: relative;
                        z-index: 9999;
                    }
                    body {
                        overflow: hidden;
                    }
                    `
                    }
                </style>
            </>

            : null
    );
}

export default PublishStatus


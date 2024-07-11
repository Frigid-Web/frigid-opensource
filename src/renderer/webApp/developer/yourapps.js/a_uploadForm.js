import React, { useEffect } from "react";
import { Link, Outlet, Route, useParams } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useDisclosure } from '@mantine/hooks';
import { Modal, Button, Tooltip } from '@mantine/core';
import { useNavigate } from "react-router-dom";
import { FileUploader } from "react-drag-drop-files";
import { TextInput, Textarea, Progress, Switch } from "@mantine/core";
import { db } from "../../home";
import { useLiveQuery } from "dexie-react-hooks";
import { alterLoading } from "../../../store/schemas/loadingSlice";
import PublishStatus from "./a_publishStatus";
import { decryptPrivateKey, deriveKey, encryptPrivateKey } from "../../../helpers/encyrpt";
import { ethers, Wallet } from "ethers";
import { getNetworkTokens } from "../../../helpers/helper";
import { determineOnNetwork } from "../../httpCalls/frigidApi";
function UploadForm() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { id } = useParams()

    const app = useLiveQuery(() => db.apps.get(parseInt(id)), [id], {});
    const deployment = useLiveQuery(() => db.deployments.where('appId').equals(parseInt(id)).and(item => item.status === 'pending').first(), [id], {});
    const currentSelectedChain = useSelector(state => state.mainapp.chainSlice.currentChain)
    // const fileReady = useLiveQuery(() => db.deployments.where('app_id').equals(id).and(item => item.status === 'pending').first(), [id]);
    const [fileReady, setFileReady] = useState(false)
    const addressId = useSelector(state => state.mainapp.authSlice.metamask.accountId)
    const fileTypes = ['zip']
    const [file, setFile] = useState(null);
    const [characterCounter, setCharacterCounter] = useState(0)
    const [noIndex, setNoIndex] = useState(false)
    const [progress, setProgress] = useState(0)
    const [publishStatus, setPublishStatus] = useState(false)


    const [key, setKey] = useState('')
    const [encryptedKey, setEncryptedKey] = useState(null)
    const handleKey = async (value) => {
        if (value == '' || value.includes('=')) {
            return
        }
        const { pluri } = getNetworkTokens[currentSelectedChain.slug]
        try {
            new Wallet(value, pluri.provider)

            const key = await deriveKey('FrigidNetwork', addressId)
            const result = await encryptPrivateKey(key, value)
            setKey(result.data)
            setEncryptedKey(result)
            // console.log(await decryptPrivateKey(key, result))
        } catch (error) {
            console.log(error)
            setKey('')
            setEncryptedKey('')
        }

    }



    const togglePublishStatus = () => {
        setPublishStatus(!publishStatus)
    }

    const handleChange = async (file) => {
        setLoading(true);

        try {
            const newDomain = app.domain + '.preview.frigid';

            async function uploadInChunks(file, url, chunkSize = 1024 * 1024 * 5) { // 5MB chunks
                const totalChunks = Math.ceil(file.size / chunkSize);
                let chunkIndex = 0;

                return new Promise((resolve, reject) => {
                    const ws = new WebSocket(url);
                    const reader = new FileReader();


                    const readNextChunk = () => {
                        const start = chunkIndex * chunkSize;
                        const end = Math.min(start + chunkSize, file.size);
                        const blob = file.slice(start, end);
                        reader.readAsArrayBuffer(blob);
                    };

                    ws.onopen = () => {

                        reader.onload = (event) => {
                            const chunk = event.target.result;
                            const message = JSON.stringify({
                                domain: newDomain,
                                chunk: Array.from(new Uint8Array(chunk)), // Convert ArrayBuffer to Array
                                index: chunkIndex,
                                total: totalChunks,
                                type: 'upload'
                            });
                            ws.send(message);
                            chunkIndex++;

                        };

                        reader.onerror = () => {
                            reject(new Error(`FileReader error at index ${chunkIndex}`));
                            ws.close();
                        };
                        readNextChunk()
                    };

                    ws.onmessage = (event) => {
                        const response = JSON.parse(event.data);
                        if (response.error !== undefined) {
                            reject(new Error(`Chunk upload failed at index ${chunkIndex}`));
                            ws.close();
                        } else if (response.type === 'end') {
                            resolve();
                            ws.close();
                        } else if (response.type === 'chunk_received') {
                            if (chunkIndex < totalChunks) {
                                readNextChunk();
                            }
                            setProgress(progress => progress + ((1 / totalChunks) * 100));
                        }
                    };

                    ws.onerror = (error) => {
                        reject(new Error(`WebSocket error: ${error.message}`));
                    };

                    ws.onclose = () => {
                        if (chunkIndex < totalChunks) {
                            reject(new Error('WebSocket connection closed before completing the upload'));
                        }
                    };
                });
            }

            await uploadInChunks(file, 'wss://dev.frigid/', 1024 * 1024 * 5);
            setFileReady(true);

        } catch (error) {
            alert("Error processing file: " + error.message);
        } finally {
            setLoading(false);
            setProgress(0)
        }
    };





    const [checked, setChecked] = useState(false);
    const [opened, { open, close }] = useDisclosure(false);
    const toggleModal = () => {
        opened ? close() : open()
    }

    const handleCharacterCount = (e) => {
        setCharacterCounter(e.target.value.length)
    }


    const handleDiscard = async (noConfirm = false) => {
        if (noConfirm) {
            const newDomain = app.domain + '.preview.frigid'
            await fetch('https://dev.frigid/api/preview/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ domain: newDomain })
            })
            // await db.deployments.where('appId').equals(parseInt(id)).delete()
            setFileReady(false)

        }
        else {
            const confirmDiscard = window.confirm('Are you sure you want to discard this upload?');
            if (confirmDiscard) {
                const newDomain = app.domain + '.preview.frigid'
                await fetch('https://dev.frigid/api/preview/delete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ domain: newDomain })
                })
                await db.deployments.where('appId').equals(parseInt(id)).delete()
                setFileReady(false)
            }
        }
    };

    const generatePreview = async () => {
        const newDomain = app.domain + '.preview.frigid'
        window.open('https://' + newDomain, '_blank')
    }


    const handleFormSubmit = async (e) => {
        e.preventDefault()
        try {
            dispatch(determineOnNetwork({ domain: app.domain })).then(async (r) => {
                if (r.payload == false) {
                    return
                }
                await db.deployments.add({

                    appId: parseInt(id),
                    version: e.target.version.value,
                    description: e.target.description.value,
                    created: new Date().toUTCString(),
                    noIndex: noIndex,
                    ownerAddress: addressId,
                    status: 'pending',
                    transactionHash: null
                })



                setPublishStatus(true)


            })
        } catch (error) {

        }


    }


    const handleContinuePublishing = async () => {
        try {
            dispatch(determineOnNetwork({ domain: app.domain })).then(async (r) => {
                if (r.payload == false) {
                    return
                }
                setPublishStatus(true)
            })
        } catch (error) {

        }

    }

    const getPreview = async () => {
        if (app.domain == undefined) return;
        const newDomain = app.domain + '.preview.frigid'

        const response = await fetch('https://dev.frigid/api/preview', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ domain: newDomain })
        })
        const results = await response.json()
        if (results.status === 'success') {
            setFileReady(true)
        }
        else {
            setFileReady(false)
        }
    }


    useEffect(() => {
        getPreview()
    }, [app])

    const [loading, setLoading] = useState(false)
    return (
        <>


            <div className="button-spanners">

                <form onSubmit={
                    (e) => {
                        e.preventDefault()
                        handleFormSubmit(e)
                    }
                }>
                    <div className="spanner-grouper" style={{
                        height: fileReady ? '75px' : 'auto'
                    }}>
                        <div className="spanner-btn">
                            {
                                loading ? <i className="material-icons vivify blink infinite" >account_tree</i> : <i className="material-icons">{
                                    fileReady ? 'check_circle' : 'upload'

                                }</i>
                            }
                            {
                                loading ? "Packaging Files For Blockchain..." : fileReady ? 'Project Ready' : ' Project Upload (Zip File)'
                            }
                        </div>
                        {
                            fileReady ? <p><i className="material-icons ">bolt</i>Live Test: <a style={{ cursor: 'pointer' }} onClick={generatePreview}>{'https://' + app.domain + '.preview.frigid'}</a></p>
                                : null
                        }
                    </div>
                    {
                        loading ? <div className="upload-progress">
                            <Progress animated value={progress} autoContrast={true} />
                        </div> : null
                    }
                    {
                        !fileReady ?
                            <>  <p className="inline-string">
                                If you are uploading a website, make sure to have an index.html file in the root of your zip file. To see more guidelines for uploading <Link to="/docs/publishing/startguide#prepareforupload">Learn More</Link>
                            </p>
                                <div className="upload-container">

                                    <FileUploader required label={'Upload or Drag Project Zip File'} handleChange={handleChange} name="file" types={fileTypes} />
                                </div>


                            </>
                            : null
                    }

                    {
                        fileReady ? <>


                            <div className="inline-form-container">
                                <TextInput
                                    size="lg"
                                    radius="md"
                                    placeholder={"Version Number* Current: v" + app.version}
                                    required
                                    name="version"
                                    defaultValue={deployment?.appId == undefined ? '' : deployment.version}
                                    disabled={deployment?.appId != undefined}
                                />

                                <div className="textarea-group">
                                    <Textarea
                                        size="lg"
                                        radius="md"
                                        onChange={handleCharacterCount}
                                        placeholder="Description (Max 600 characters)"
                                        maxLength={600}
                                        name="description"
                                        minRows={4}
                                        maxRows={6}
                                        autosize
                                        defaultValue={deployment?.appId == undefined ? '' : deployment.description}

                                        disabled={deployment?.appId != undefined}
                                    />
                                    <p className="char-count">{characterCounter}/600</p>
                                </div>

                            </div>
                            <p className="inline-string">
                                0.0000001 Pluri and {currentSelectedChain.nativeCurrency.name} gas fees are required per a transaction when publishing your app. <br /> <Link to="/currency/apppublishing">Get Pluri & {currentSelectedChain.nativeCurrency.name}</Link>
                            </p>
                            <div className="inline-block-btn-container">
                                {deployment?.appId == undefined ?
                                    <button type="submit" className="block-btn-primary">Publish Build</button>
                                    :
                                    <button type="button" onClick={(e) => { handleContinuePublishing() }} className="block-btn-primary">Continue Publish</button>
                                }
                                <button type="button" className="block-btn" onClick={
                                    () => handleDiscard()

                                }>Discard Upload</button>
                            </div>

                        </>
                            : null
                    }
                </form>

                <div className="deploy-options">
                    <h4>Publishing Options</h4>

                    <div className="enhanced-mode">
                        <Switch
                            onChange={(event) => {

                                setChecked(event.target.checked)
                                setEncryptedKey('')
                                setKey('')
                            }}

                            checked={checked}
                            label="Increase Publishing Speed with Private Key"
                        />
                        <TextInput size="md" radius="md" placeholder="Enter Private Key" value={key} onChange={(e) => { setKey(e.target.value) }} onBlur={(e) => { handleKey(e.target.value) }} disabled={!checked} rightSection={
                            <Tooltip multiline w={220} label="
                            A private key can be found in your wallet. It's never stored by Frigid. Learn more about private keys in the Frigid Docs
                            " position="right">
                                <i style={
                                    {
                                        cursor: 'pointer',
                                        fontSize: '20px',
                                        opacity: 0.6
                                    }
                                } className="material-icons">help_outline</i>
                            </Tooltip>

                        } />

                    </div>
                    {
                        checked ? <div style={{
                            marginBottom: '20px',

                        }} class="domain-header"><i style={{ fontSize: 17 }} class="material-icons">lock</i> <span>
                                Your private key is never stored. Used to automatically sign publish transactions.
                            </span></div> : null
                    }


                    <div className="mode-container">
                        <Switch
                            onChange={(event) => {

                                setNoIndex(event.target.checked)
                            }}

                            disabled={deployment?.appId != undefined}
                            checked={deployment?.appId == undefined ? noIndex : deployment.noIndex}
                            label="Disable Frigid Search Engine Indexing (No Index)"
                        />
                        <Tooltip multiline w={220} label="This will put up a flag that you do not want your site indexed by any search engines." position="right">
                            <i style={
                                {
                                    cursor: 'default',
                                    fontSize: '20px',
                                    marginRight: '10px',
                                    opacity: 0.6
                                }
                            } className="material-icons">help_outline</i>
                        </Tooltip>

                    </div>
                </div>


            </div>

            {
                publishStatus ? <PublishStatus
                    // loading={publishState.loading}
                    // error={publishState.error}
                    // value={publishState.value}
                    // total={publishState.total}
                    getPreview={getPreview}
                    getDelete={handleDiscard}
                    encryptedKey={encryptedKey}
                    togglePublishStatus={togglePublishStatus}
                    version={deployment?.version}
                    domain={app.domain}
                    setFileReady={setFileReady}
                // errorString={publishState.errorString}
                // appDomain={'https://' + (app.domain)}
                /> : null
            }


        </>


    );
}

export default UploadForm;


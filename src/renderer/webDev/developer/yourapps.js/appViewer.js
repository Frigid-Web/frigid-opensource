import React from "react";
import { Link, Outlet, Route, useParams } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useDisclosure } from '@mantine/hooks';
import { Modal, Button } from '@mantine/core';
import NewAppForm from "./a_newAppForm";
import { useNavigate } from "react-router-dom";
import { FileUploader } from "react-drag-drop-files";
import { TextInput, Textarea } from "@mantine/core";
import UploadForm from "./a_uploadForm";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../home";
import HashHistory from "./a_hashHistory";


function AppViewer() {
    const dispatch = useDispatch()
    const { id } = useParams()
    const app = useLiveQuery(() => db.apps.get(parseInt(id)), [id], {});
    const navigate = useNavigate()

    const [opened, { open, close }] = useDisclosure(false);
    const toggleModal = () => opened ? close() : open();

    const [openedHashHistory, { open: openHashHistory, close: closeHashHistory }] = useDisclosure(false);
    const toggleHashHistory = () => openedHashHistory ? closeHashHistory() : openHashHistory();

    const [loading, setLoading] = useState(false)
    return (
        <>



            <div className="app-viewer">
                <button className="back-btn" onClick={
                    () => navigate('/')

                }>
                    <i className="material-icons">arrow_back_ios</i> My Apps
                </button>


                {/*  <div className="viewer-header">
                  <div className="viewer-icon">
                        {app.icon ? <img src={app.icon} alt="icon" /> : <i className="material-icons">apps</i>}
                    </div> 
                    <div className="viewer-title">

                        <h1>{
                            app.domain
                        }</h1>
                         <div className="viewer-strip">
                            <a href={'https://' + app.domain} target="_blank" rel="noreferrer">https://{app.domain}</a> <span>· {app.version}</span> <span>· {app.category}</span>
                        </div> 
                    </div>
                </div> */}
                <div className="viewer-activity-body vivify fadeIn duration-300 delay-100">

                    <div className="activity-notice">
                        <i className="material-icons">info</i>
                        <p>
                            To improve your uploading experience try using a local or purchased blockchain RPC. Click to learn more about speeding up your publishing process. <Link to="/docs/publishing/speedup#changerpc">Learn How To Switch Your RPC</Link>
                        </p>
                    </div>

                    <div className="button-spanners">
                        {/*
                        <div className="horizontal-line"></div>
                            <button className="spanner-btn">
                            <i className="material-icons">data_object</i>
                            Deployment Options
                        </button> */}
                        <button onClick={
                            toggleModal

                        } className="spanner-btn" style={{
                            padding: '23px 33px',
                            justifyContent: 'space-between'
                        }}>
                            <div className="spanner-btn-left">  <div className="inline-icon">
                                {app.icon ? <img src={app.icon} alt="icon" /> : <i className="material-icons">apps</i>}
                            </div>
                                <div className="viewer-title">
                                    <h3>{app.name}</h3>
                                    <div className="viewer-strip">
                                        <span>{app.version}</span> <span>· {app.category}</span>
                                    </div>
                                </div></div>

                            <div className="spanner-btn-right">
                                <i className="material-icons">edit</i>

                            </div>

                        </button>
                        <div className="horizontal-line"></div>
                        <button className="spanner-btn" onClick={
                            () => window.open('https://' + app.domain, '_blank')
                        }>
                            <i className="material-icons">bolt</i> View Live Site
                        </button>
                        <div className="horizontal-line"></div>
                        <button onClick={
                            () => toggleHashHistory()
                        } className="spanner-btn">
                            <i className="material-icons">restore</i>
                            Version History
                        </button>






                    </div>




                    <UploadForm />
                </div>

            </div>

            <Modal opened={opened} size={450} radius={25} onClose={close} title="Edit App" centered overlayProps={{
                backgroundOpacity: 0.55,
                blur: 20,
            }}>
                <NewAppForm mode={'edit'} appId={app.id} toggleModal={toggleModal} />
            </Modal>

            <Modal opened={openedHashHistory} size={1000} radius={25} onClose={closeHashHistory} title="Version History" centered overlayProps={{
                backgroundOpacity: 0.55,
                blur: 20,
            }}>
                <HashHistory appId={app.id} toggleModal={
                    toggleHashHistory
                } />
            </Modal>
            {/*    <div className="floating-footer">
                <h3>
                    Frigid Publishing
                </h3>
                <button onClick={
                    () => navigate('/docs/publishing/startguide')

                } >
                    Quick Start Guide
                </button>
                <button onClick={
                    () => navigate('/docs/publishing/speedup')
                }>
                    Speed Up Publishing
                </button>
                <button onClick={
                    () => navigate('/currency/apppublishing')
                }>
                    Get Currency
                </button>

            </div> */}
        </>


    );
}

export default AppViewer;


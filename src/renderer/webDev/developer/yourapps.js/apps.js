import React, { useEffect } from "react";
import { Link, Outlet, Route } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useDisclosure } from '@mantine/hooks';
import { Modal, Button } from '@mantine/core';
import NewAppForm from "./a_newAppForm";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../home";
import { Select } from "@mantine/core";



function YourApps() {
    const dispatch = useDispatch()
    const accountId = useSelector(state => state.mainapp.authSlice.metamask.accountId)

    const appList = useLiveQuery(async () => {
        if (accountId === null) return []
        let apps = await db.apps.where('ownerAddress').equals(accountId).toArray()
        let domains = await db.domains.where('ownerAddress').equals(accountId).toArray()
        for (let app of apps) {
            const targetDomain = domains.find(domain => domain.name === app.domain)
            if (targetDomain) {
                if (targetDomain.sold) {
                    app.domainFlag = 'Dead Domain'
                }
            }
            else {
                app.domainFlag = 'Dead Domain'
            }
        }
        return apps
    }, [accountId], []);

    const [opened, { open, close }] = useDisclosure(false);
    const toggleModal = () => {
        opened ? close() : open()
    }


    const [openedEdit, { open: openEdit, close: closeEdit }] = useDisclosure(false);
    const toggleEditModal = () => {
        openedEdit ? closeEdit() : openEdit()
    }
    const navigate = useNavigate()

    const handleRowClick = (app) => {
        let { id, domainFlag } = app
        if (domainFlag === 'Dead Domain') {
            handleDeadDomain(id)
        }
        else {
            navigate(`/apps/${id}`)
        }
    }

    const [activeDeadDomain, setActiveDeadDomain] = useState(null)

    const handleDeadDomain = (appId) => {
        setActiveDeadDomain(appId)
        toggleEditModal()

    }



    return (
        <>

            {
                appList.length === 0 ?
                    <div className="new-start vivify fadeIn duration-400">
                        <div className="new-start-body">
                            <button className='focused-btn ' onClick={open}>New App</button>
                            <p className='focused-text'>An all New Internet Awaits. Build and Host Apps Entirely on the Blockchain</p>
                        </div>
                    </div> :
                    <div className="app-table">
                        <table>
                            <thead style={{ position: 'static' }}>
                                <tr>
                                    <th>My Apps</th>
                                    <th>Domain</th>
                                    <th>Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    appList.map(app => (
                                        <tr className="click-table" key={app.name} onClick={() => handleRowClick(app)}>
                                            <td>
                                                <div className="table-app">
                                                    {app.icon ? <img src={app.icon} alt="icon" className="table-icon" /> : <i className="material-icons">apps</i>}
                                                    {app.name}
                                                </div>
                                            </td>
                                            <td >
                                                <div className="iconed-table-item">

                                                    {app.domainFlag == 'Dead Domain' ? <i className="material-icons" style={{ color: 'yellow', fontSize: 20.5 }}>warning</i> : null}
                                                    {app.domain}
                                                </div>
                                            </td>
                                            <td>{app.created}</td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
            }

            <Modal opened={opened} size={450} radius={25} onClose={close} title="New App" centered overlayProps={{
                backgroundOpacity: 0.55,
                blur: 20,
            }}>
                <NewAppForm mode={'add'} toggleModal={toggleModal} />
            </Modal>

            <Modal opened={openedEdit} size={450} radius={25} onClose={closeEdit} title="Change Domain" centered overlayProps={{
                backgroundOpacity: 0.55,
                blur: 20,
            }}>
                <NewAppForm mode={'edit'} appId={
                    activeDeadDomain
                }
                    domainChange={true}
                    toggleModal={toggleEditModal} />
            </Modal>
            {/*   <p>cold98</p> */}
            <div className="floating-footer">
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

            </div>

        </>


    );
}

export default YourApps;


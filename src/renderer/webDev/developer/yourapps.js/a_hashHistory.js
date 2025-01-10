import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { TextInput, Select, FileInput, Button } from "@mantine/core";
import { db } from "../../home";
import { useLiveQuery } from "dexie-react-hooks";
import { Link, useParams } from "react-router-dom";
import HashModal from "./hashModal";
import { Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";


function HashHistory({ appId, mode, toggleModal, domainChange }) {
    const dispatch = useDispatch();
    const accountId = useSelector(state => state.mainapp.authSlice.metamask.accountId)
    const {id} = useParams()
    const [currentHash, setCurrentHash] = useState([]);
    const [opened, { open, close }] = useDisclosure(false);
    const toggleVersionModal = () => opened ? close() : open();


    
    const hashList =  useLiveQuery(async () => {
        let array = await db.deployments.where('status').equals('completed').and(item => item.appId == id).toArray()
        return array.sort((a, b) => b.id-a.id )
    
    }, [id], []);


    const handleRowClick = (hash) => {
        setCurrentHash(hash)
        toggleVersionModal()
    }

    return (
        <>

            {
                hashList.length > 0 ? <div className="modal-table">
                    <div className="app-table">
                        <table>
                            <thead style={{ position: 'static' }}>
                                <tr>
                                    <th>Id</th>
                                    <th>Version</th>
                                    <th>Description</th>
                                    <th>Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    hashList.map(hash => (
                                        <tr className="click-table" key={hash.name} onClick={() => handleRowClick(hash)}>
                                            <td>
                                            <div style={
                                                    {
                                                        maxWidth: '210px',

                                                    }
                                                }>
                                                    {hash.id}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={
                                                    {
                                                        maxWidth: '210px',

                                                    }
                                                }>
                                                    {hash.version}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={
                                                    {
                                                        maxWidth: '210px',

                                                    }
                                                } className="max-width">
                                                    {hash.description}
                                                </div>
                                            </td>
                                            <td>{hash.created}</td>

                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                </div> : <div className="no-data">
                    <h3>No Versions Available</h3>
                    <p>There are no versions of this app to restore</p>
                </div>
            }
            <Modal opened={
                opened
            } size={450} radius={25} onClose={
                toggleVersionModal
            } title={
                "Restore Version"

            } centered overlayProps={{
                backgroundOpacity: 0.55,
                blur: 20,
            }}>
                <HashModal
                 currentHash={currentHash} toggleModal={
                    toggleVersionModal
                } />
            </Modal>
        </>

    );
}

export default HashHistory;

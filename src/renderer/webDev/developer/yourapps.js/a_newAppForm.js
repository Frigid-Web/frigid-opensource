import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { TextInput, Select, FileInput, Button } from "@mantine/core";
import { db } from "../../home";
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";

function NewAppForm({ appId, mode, toggleModal, domainChange }) {
    const dispatch = useDispatch();
    const accountId = useSelector(state => state.mainapp.authSlice.metamask.accountId)

    const [appData, setAppData] = useState({
        name: '',
        category: '',
        domain: '',
        keywords: [],
        description: '',
        icon: null,
    });
    const [imagePreview, setImagePreview] = useState('');
    const [isLoading, setIsLoading] = useState(mode === "edit");  // Set loading state based on mode

    const availableDomains = useLiveQuery(async () => {
        if (accountId === null) return []

        const unsoldDomains = await db.domains.where('ownerAddress').equals(accountId).filter(domain => domain.sold === false).toArray();
        const usedDomains = await db.apps.where('ownerAddress').equals(accountId).toArray().then(apps => new Set(apps.map(app => app.domain)));
        const resultDomains = unsoldDomains.filter(domain => !usedDomains.has(domain.name));
        if (resultDomains.length > 0) {
            return resultDomains;
        }
        return ['No Domains Available']
    }, [accountId], ['No Domains Available']);



    useEffect(() => {
        if (mode === "edit") {
            const loadAppData = async () => {
                console.log(appId)
                const data = await db.apps.get(appId);
                if (data) {
                    setAppData(data);
                    setImagePreview(data.icon);
                    setIsLoading(false);  // Set loading to false once data is fully loaded
                }
            };
            loadAppData();
        }
    }, [appId, mode]);

    const handleFileChange = (file) => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreview('');
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        let newAppData = {}


        if (appData.domain.length > 0 && appData.name.length > 0 && appData.category.length > 0) {
            if (mode === "add") {
                newAppData = {
                    name: formData.get('frigid_name'),
                    category: formData.get('category'),
                    domain: formData.get('domain'),
                    keywords: formData.get('keywords')?.split(','),
                    description: formData.get('description'),
                    version: '0.0.0',
                    created: new Date().toUTCString(),
                    icon: formData.get('icon') ? imagePreview : null,
                    ownerAddress: accountId,
                };
                await db.apps.add(newAppData);
            }
            else if (mode === "edit" && domainChange) {
                console.log(e.target.checkValidity());
                if (formData.get('domain') == '') {
                    alert('Please select a domain')
                    return
                }
                newAppData = {
                    domain: formData.get('domain')
                }
                await db.apps.update(appId, newAppData);
            }
            else if (mode === "edit") {
                newAppData = {
                    name: formData.get('frigid_name'),
                    category: formData.get('category'),
                    icon: formData.get('icon') ? imagePreview : null,
                }
                await db.apps.update(appId, newAppData);
            }

            toggleModal();
        } else {
            alert('Please fill in all fields')
        }

        // Assuming you want to close the modal on submit
    };

    if (isLoading) return <div>Loading...</div>; // Render loading screen while data is not yet loaded



    return (
        <>

            <form onSubmit={handleFormSubmit}>
                <div className="form-container">
                    {
                        domainChange ? null : <>
                            {imagePreview && <img for="icon" className="preview-img" src={imagePreview} alt="App Icon" />}
                        </>
                    }

                    {
                        domainChange ? <div className="faucet-charm">
                            <div className="faucet-charm-left">
                                <i className="material-icons" style={{ fontSize: 25 }}>error</i>
                                <div className="faucet-charm-text">
                                    <h3>
                                        Your Domain Has Become Unavailable
                                    </h3>
                                    <p style={{ marginTop: 0 }}>
                                        Please select a new domain to use for your app. Your domain may have been transferred or sold.
                                    </p>
                                </div>
                            </div>

                        </div> : null
                    }


                    {
                        domainChange && <h3>
                            {domainChange ? appData.name : null}
                        </h3>
                    }

                    <TextInput
                        style={{
                            display: domainChange ? 'none' : 'block',
                        }}
                        size="lg"
                        radius="md"
                        placeholder="App Name*"
                        onChange={(e) => setAppData({ ...appData, name: e.target.value })}
                        name="frigid_name"
                        defaultValue={appData.name}

                    />
                    <Select
                        style={{
                            display: domainChange ? 'none' : 'block',
                        }}
                        size="lg"
                        radius="md"
                        placeholder="Select Category*"
                        data={[
                            'Social', 'Info', 'News', 'Games', 'Crypto', 'Fun', 'Tools', 'Developer', 'Other'
                        ]}
                        onChange={(value) => {
                            setAppData({ ...appData, category: value })
                        }}
                        name="category"
                        defaultValue={appData.category}

                    />

                    <Select
                        style={{
                            display: mode === "edit" ? domainChange ? 'block' : 'none' : "block",
                        }}
                        size="lg"
                        radius="md"
                        placeholder="Select Owned Domain*"
                        /*   data={[
                              { value: 'foodscout.frigid', label: 'foodscout.frigid' },
                              { value: 'pluri.tundra', label: 'pluri.tundra' },
                              { value: 'demo.' + currentSelectedChain.slug, label: 'explorer.' + currentSelectedChain.slug },
      
                              { value: 'food.cool', label: 'food.cool' },
                              { value: 'appstore.iceburg', label: 'appstore.iceburg (In Use)', disabled: true },
                              { value: 'food.polygon', label: 'food.polygon (In Use)', disabled: true },
                          ]} */
                        data={availableDomains.map(domain => {
                            if (domain === 'No Domains Available') return {
                                value: 'No Domains Available',
                                label: 'No Domains Available (Please Register a Domain)',
                                disabled: true,
                            }

                            return {
                                value: `${domain.name}`,
                                label: `${domain.name}`,
                            }
                        })}
                        onChange={(value) => {
                            setAppData({ ...appData, domain: value })
                        }}

                        name="domain"
                    />

                    <Link style={{
                        display: mode === "edit" ? domainChange ? 'block' : 'none' : "block",
                    }} onClick={
                        () => {
                            toggleModal()
                        }
                    } to="/buydomains" > Need a Domain Name? Register a Domain</Link>


                    <FileInput
                        style={{
                            display: domainChange ? 'none' : 'block',
                        }}
                        size="lg"
                        leftSection={<i className="material-icons input-icon">file_upload</i>}
                        radius="md"
                        accept="image/png,image/jpeg"
                        placeholder="Upload Icon (256x256px Recommended)"
                        onChange={handleFileChange}
                        name="icon"
                        id="icon"

                    />
                    <p style={{ fontSize: '13px', textAlign: "center", color: "var(--text-gray)", margin: '0px 23px' }}>
                        All data is stored on the blockchain or on your device. We do not store any data on any servers.
                    </p>
                    <div className="focused-btn-container">
                        <button className="focused-btn" type="submit">{mode === "add" ? "Create App" : "Save Changes"}</button>
                    </div>
                </div>
            </form></>

    );
}

export default NewAppForm;

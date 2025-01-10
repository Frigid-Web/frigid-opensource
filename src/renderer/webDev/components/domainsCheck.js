import { useLiveQuery } from 'dexie-react-hooks';
import React, { useState, useEffect } from 'react';
import { db } from '../home';
import { getNetworkTokens } from '../../helpers/helper';
import { useSelector } from 'react-redux';

const DomainsCheck = ({children}) => {
    const [isLoaded, setIsLoaded] = useState(false)
    const accountId = useSelector(state => state.mainapp.authSlice.metamask.accountId)
    const domainList = useLiveQuery(async () => {
        if(accountId === null) return []
        const domains = await db.domains.where('ownerAddress').equals(accountId).toArray();

        const domainsWithAppNames = await Promise.all(domains.map(async (domain) => {
            const app = await db.apps.where('domain').equals(domain.name).and(app => app.ownerAddress === accountId).first();   
                     return {
                ...domain,
                appName: app ? app.name : 'None'
            };
        }));
        

        if(isLoaded == false){
            setIsLoaded(true)
        }
        return domainsWithAppNames

    }, [accountId], [])


    useEffect(() => {
        (async () => {
            if(!isLoaded) return
            let blockchainCheckDomains =  [] 
            
            for(let domain of domainList){ 
                const {dns} = getNetworkTokens[domain.networkSlug]
    
                const results = await dns.rpcContract.domains(domain.name)
                if(results.owner.toLowerCase() === accountId.toLowerCase()){
                    blockchainCheckDomains.push(domain)
                    if(domainList.some(domainListDomain => domainListDomain.name == domain.name && domainListDomain.id > domain.id)){
                        await db.domains.delete(domain.id)
                    }
                    else if(domain.sold === true){
                        await db.domains.update(domain.id, {sold: false})
                    }
                }
                else{
                    await db.domains.update(domain.id, {sold: true, forSale: false})
                }
            }
            setIsLoaded(null)
        })()
       
    }, [isLoaded])


    return (
        isLoaded === null ?
        <>

            {children}
        </>
        :
        null
    )

}

export default DomainsCheck;
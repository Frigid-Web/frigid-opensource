import { useDispatch, useSelector } from "react-redux";
import { alterLoading } from "../../../store/schemas/loadingSlice";
import { db } from "../../home";
import { getNetworkTokens } from "../../../helpers/helper";
import { useNavigate } from "react-router-dom";
import { ZeroAddress } from "ethers";
import { determineOnNetwork } from "../../httpCalls/frigidApi";
function BuyForm(props) {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const accountId = useSelector(state => state.mainapp.authSlice.metamask.accountId)
    const hanldeFormSubmit = async (e) => {
        e.preventDefault()
        dispatch(determineOnNetwork({domain:props.data.title})).then(async (r) => {
            if(r.payload == false){
                return
            }

            const { stableToken, provider, dns } = getNetworkTokens[props.data.networkSlug]
            let results = await stableToken.contract.allowance(accountId, dns.token.address)
            try {
                while (results < props.data.priceBigInt) {
                    dispatch(alterLoading(
                        {
                            loading: true,
                            statusText: 'Processing Allowance...',
                            origin: "Domain Purchase"
                        }
                    ))
                    const tx = await stableToken.contract.approve(dns.token.address, props.data.priceBigInt)
                    await tx.wait()
    
                    results = await stableToken.contract.allowance(accountId, dns.token.address)
    
                    dispatch(alterLoading(
                        {
                            loading: false,
                            statusText: 'Transaction Complete!',
                            origin: "Domain Purchase"
                        }
                    ))
                }
    
                dispatch(alterLoading(
                    {
                        loading: true,
                        statusText: 'Processing Domain Purchase Transaction...',
                        origin: "Domain Purchase"
                    }
                ))
    
                if (props.data.owner == ZeroAddress) {
                    const tx = await dns.contract.buyDomain(props.data.name, props.data.suffix)
                    await tx.wait()
                    await db.domains.add({
                        name: props.data.title,
                        forSale: false,
                        price: 0,
                        networkName: props.data.network,
                        networkSlug: props.data.networkSlug,
                        suffix: props.data.suffix,
                        ownerAddress: accountId,
                        sold: false
                    })
                }
                else {
                    const tx = await dns.contract.buyListedDomain(props.data.title)
                    await tx.wait()
                    await db.domains.add({
                        name: props.data.title,
                        forSale: false,
                        price: 0,
                        networkName: props.data.network,
                        networkSlug: props.data.networkSlug,
                        suffix: props.data.suffix,
                        ownerAddress: accountId,
                        sold: false
                    })
                }
    
                dispatch(alterLoading(
                    {
                        loading: false,
                        statusText: 'Transaction Complete!',
                        origin: "Domain Purchase"
                    }
                ))
                navigate('/mydomains')
                props.toggleModal()
            } catch (error) {
                console.log(error)
                dispatch(alterLoading(
                    {
                        loading: false,
                        statusText: 'Transaction Failed!',
                        origin: "Domain Purchase"
                    }
                ))
                props.toggleModal()
            }
        })
       





    }

    const giveFakeDomain = async () => {
        dispatch(alterLoading(
            {
                loading: true,
                statusText: 'Giving a Fake Domain...',
                origin: "Domain Purchase"
            }
        ))
        await db.domains.add({
            name: props.data.title,
            forSale: false,
            price: 0,
            networkName: props.data.network,
            networkSlug: props.data.networkSlug,
            suffix: props.data.suffix,
            ownerAddress: accountId,
            sold: false
        })
        dispatch(alterLoading(
            {
                loading: false,
                statusText: 'Transaction Complete!',
                origin: "Domain Purchase"
            }
        ))
        navigate('/mydomains')
        props.toggleModal()

    }


    return (
        <>
            <form onSubmit={
                (e) => {
                    e.preventDefault()
                    hanldeFormSubmit(e)
                }
            }>

                <div className="domain-container">
                    <div className="domain-block">
                        <div className="domain-header">
                            <i className="material-icons">public</i> <span>{props.data.title}</span>
                        </div>
                        <div className="domain-notice-wrapper">
                            <div className="domain-notice">
                                <h4>One-Time Payment</h4>
                                <p>You will have access to this domain forever.</p>
                            </div>
                        </div>
                        <div className="domain-price">
                            <p><span>{props.data.price} USDT</span> paid today using MetaMask</p>
                        </div>
                    </div>
                    <div className="focused-btn-container" style={{ marginBottom: 10 }}>
                        <button type="submit" className="focused-btn">Purchase Now</button>
                    </div>
                    {/*    <div className="domain-overview">

                        <h4>
                            {props.data.title}
                        </h4>
                        <span>

                            {props.data.price} USDT
                        </span>


                    </div> */}



                </div>

            </form>
        </>


    );
}

export default BuyForm;


import { useEffect, useState } from "react"




const New_Block = () => {




    return (
        <>
            <div className="classic-block">
                <div className="classic-content">
                    <div className="classic-left">
                        <h2>
                            <span>New</span> Bug Fixes & Features
                        </h2>
                        <p>Release Beta 0.0.2</p>
                    </div>
                    <div className="classic-right">
                        <div className="flow-text">
                            <div className="flow-text-block">
                                <h3>Redesigned Onboarding </h3>
                                <p>
                                    We redesigned the first time onboarding and the RPC setup process to make it more user friendly.
                                </p>
                            </div>

                            <div className="flow-text-block">
                                <h3>Improved Web3 Content Viewing</h3>
                                <p>
                                    Videos, images, and other web3 content are now more reliable and feature rich.
                                </p>
                            </div>


                        </div>
                    </div>
                </div>
                <div className="classic-footer">
                    <p>Published Jan 10, 2025</p>
                </div>

            </div>
        </>
    )
}

export default New_Block
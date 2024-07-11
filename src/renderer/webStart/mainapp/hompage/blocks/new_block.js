import { useEffect, useState } from "react"




const New_Block = () => {




    return (
        <>
            <div className="classic-block">
                <div className="classic-content">
                    <div className="classic-left">
                        <h2>
                            Welcome To Frigid <span>Start</span>
                        </h2>
                        <p>Release Beta 0.0.1</p>
                    </div>
                    <div className="classic-right">
                        <div className="flow-text">
                            <div className="flow-text-block">
                                <h3>Introducing Frigid Start </h3>
                                <p>Spotlighting new and upcoming apps, keeping you up to date on changes and featuring the latest developer tools and resources.</p>
                            </div>

                            <div className="flow-text-block">
                                <h3>Improved DNS Config Cleanup</h3>
                                <p>Frigid modifies your dns config to allow you to access Frigid web apps. We improved the cleanup process when Frigid is powered off.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="classic-footer">
                    <p>Published June 14, 2024</p>
                </div>

            </div>
        </>
    )
}

export default New_Block
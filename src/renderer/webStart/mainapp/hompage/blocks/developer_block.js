import { useEffect, useState } from "react"
import { Link } from "react-router-dom"




const Dev_Block = () => {




    return (
        <>
            <div className="classic-block" style={{ margin: '18px 30px' }}>
                <div className="classic-content">
                    <div style={{ width: 250 }} className="classic-left">
                        <h2>
                            Ready to Build the <span>Future?</span>
                        </h2>
                        <p>Host your app entirely on the blockchain with Frigid Developer.</p>
                    </div>
                    <div className="classic-right">
                        <div className="flow-btn">
                            <button onClick={
                                () => {
                                    window.open('https://dev.frigid', '_blank')
                                }

                            }>Launch Developer</button>
                        </div>
                    </div>
                </div>
                <div className="classic-footer">
                    <div className="flow-links">
                        <Link to="https://dev.frigid/buydomains" target="_blank" className="flow-link">Buy a Domain</Link>
                        <Link to="https://dev.frigid/docs/publishing/startguide" target="_blank" className="flow-link">Upload an App</Link>
                        <Link to="https://dev.frigid/docs" target="_blank" className="flow-link">Documentation</Link>
                    </div>
                </div>

            </div>
        </>
    )
}

export default Dev_Block
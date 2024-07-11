import { useEffect, useState } from "react"
import { Link } from "react-router-dom"




const Spotlight_Block = () => {




    return (
        <>
            <div className="classic-block" style={{ margin: '33px 30px' }}>
                <div className="classic-content">
                    <div style={{ width: 250 }} className="classic-left">
                        <h2>
                            Decentralized  <span>Tic-Tac-Toe</span>
                        </h2>
                        <p>A perfect example of how an app can be hosted entirely on the blockchain and allow for Peer-To-Peer Gameplay.</p>
                    </div>
                    <div className="classic-right">
                        <div style={{
                            marginRight: 25
                        }} className="flow-btn">
                            <button onClick={
                                () => {
                                    window.open('https://x.poly', '_blank')
                                }

                            }>Play Now</button>
                            <p>https://x.poly</p>
                        </div>
                    </div>
                </div>


            </div>
        </>
    )
}

export default Spotlight_Block
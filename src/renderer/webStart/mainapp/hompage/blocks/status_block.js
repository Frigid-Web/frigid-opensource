import { useEffect, useState } from "react"




const Status_Block = () => {

    const coldEmojis = ['🥶', '🧊', '❄️']
    const [coldEmoji, setColdEmoji] = useState('🥶')


    useEffect(() => {
        setColdEmoji(coldEmojis[Math.floor(Math.random() * coldEmojis.length)])
    }, [])



    return (
        <>
            <div className='centered-block'>
                <div className='centered-content'>
                    <i className='material-icons'>
                        verified_user
                    </i>
                    <h2>Connected</h2>
                    <p>
                        Anonymous and Secure
                    </p>
                </div>
                <div className='centered-footer'>
                    <i className='material-icons'>
                        lock
                    </i>
                    <p>Connected to the Blockchain</p>
                </div>
            </div>
        </>
    )
}

export default Status_Block
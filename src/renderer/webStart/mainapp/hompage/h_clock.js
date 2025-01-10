import { useState, useEffect } from 'react';
import logo from '../../../../../assets/logoWhite.svg';


const H_Clock = () => {
    const [currentTime, setCurrentTime] = useState('');
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            let hours = now.getHours();
            const minutes = String(now.getMinutes()).padStart(2, '0');
            hours = hours % 12 || 12;
            setCurrentTime(`${hours}:${minutes}`);

            updateGreeting(now.getHours());
        };

        const updateGreeting = (hour) => {
            if (hour < 12) {
                setGreeting('Good Morning');
            } else if (hour >= 12 && hour < 18) {
                setGreeting('Good Afternoon');
            } else if (hour >= 18 && hour < 22) {
                setGreeting('Good Evening');
            } else {
                setGreeting('Good Night');
            }
        };

        updateClock();
        const intervalId = setInterval(updateClock, 1000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <>


            <div className='start-hero vivify fadeIn duration-300 delay-200'>
                <img src={logo} alt='logo' className='logo' />
            </div>
            {/*    <div className='start-clock'>
                <p>{greeting}</p>
                <div className='start-clock-text'>
                    <h1>{currentTime}</h1>
                </div>
            </div> */}
        </>
    );
}

export default H_Clock;

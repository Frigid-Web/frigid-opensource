import logo from '../../../../../assets/logoWhite.svg'
import { useEffect, useState } from 'react';

const H_Navbar = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 100) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);


    return (
        <>

            {/*   <div className={
                scrolled ? "start-navbar scrolled-start" : "start-navbar"
            }>

                <div></div>

                <div className='split-logo'>
                    <img src={logo} alt='logo' className='logo' />
                    <div className='vertical-line'></div>
                    <h1>Start</h1>
                    <span className="version-status-string">
                        <i className="material-icons">science</i>
                        <p>Release Beta: 0.0.4</p>
                    </span> 

                </div>

                <div className='app-bloom'>
                      <button>
                        <i className='material-icons'>
                            apps
                        </i>
                    </button> 
                </div>
            </div> */}
            <style>
                {
                    scrolled ? `
                    .start-background-overlay {
                    opacity: 1}

                    .start-hero >img {
                    opacity: 0;}

                    ` : null
                }
            </style>
        </>
    )
}

export default H_Navbar;
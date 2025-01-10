import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useSearchParams } from 'react-router-dom';
import Lottie from 'lottie-react';
import confettiJson from '../../../../../assets/confetti.json'
const O_BoardController = (props) => {
    const navigate = useNavigate();
    const animation = props.animation

    const [animationComplete, setAnimationComplete] = React.useState(false)

    const [searchParams, setSearchParams] = useSearchParams();

    const backgroundMode = searchParams.get('background') === 'false' ? false : true;

    useEffect(() => {
        setTimeout(() => {
            setAnimationComplete(true)
        }, 1500)
    }
        , [])



    return (
        <>
            {
                animation ? <>
                    {
                        animationComplete ? null : <div className='animation-container'>
                            <Lottie animationData={confettiJson} loop={false} />
                        </div>
                    }
                </> : null
            }
            <div className="board-controller" style={
                {
                    background: backgroundMode ? 'linear-gradient(110deg, #00699D 23.08%, #00224A 93.64%)' : 'transparent',
                }
            }>

                <div className={
                    animation ? "board-inlet vivify fadeIn duration-600 delay-1000" : "board-inlet vivify fadeIn duration-600"
                }>
                    <div className='board-close-wrapper'>
                        {
                            props.close && <button className='board-close' onClick={
                                () => navigate(props.close)
                            }>
                                <i className='material-icons'>close</i>
                            </button>
                        }
                    </div>
                    <div className='vivify fadeIn duration-500' style={{ height: '100%' }}>   {props.children}</div>
                </div>
            </div >
            <style>
                {
                    `
                .side-panel-dragger {
                    -webkit-app-region: no-drag
                }
                .drag-zone {
                 height: 50px;
                }
                `
                }
            </style>
        </>
    );
};

export default O_BoardController;

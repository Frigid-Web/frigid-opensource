import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// UPDATED IMPORTS: 
// You can rename them if you’d like, or just split them onto separate lines as shown:
import {
    CarouselProvider,
    Slider,
    Slide,
    ButtonBack,
    ButtonNext
} from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';

// Assets
import boltcheck from '../../../../../assets/powerfill.svg';
import networksmall from '../../../../../assets/networksmall.svg';
import hammer from '../../../../../assets/hammer.svg';
import wifi from '../../../../../assets/wifi.svg';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentHue } from '../../../store/schemas/hueSlice.js';

// Component
import Dev_BoardController from './dev_boardController.js';

const B_StartHue = (props) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const hueList = useSelector((state) => state.mainapp.hueSlice.hueList);
    const currentHue = useSelector((state) => state.mainapp.hueSlice.currentHue);


    // 2) Whenever a hue is clicked, update Redux & localStorage
    const handleHueClick = (hue) => {
        dispatch(setCurrentHue(hue));
        localStorage.setItem('selectedHue', JSON.stringify(hue));
    };

    return (
        <>
            <Dev_BoardController>
                <div className='board-content'>
                    <div>
                        <div className='board-header'>
                            <h1>Let's Pick Your Frigid Hue</h1>
                            <p>
                                Let's personalize your Frigid start page. Choose a hue that fits your style.
                            </p>
                        </div>

                        <div className='board-hue'>
                            <CarouselProvider
                                naturalSlideWidth={200}
                                naturalSlideHeight={260}
                                totalSlides={hueList.length}
                                step={3}
                                visibleSlides={3}
                            >
                                <div className='board-hue-nav'>
                                    <ButtonBack>
                                        <i className='material-icons'>arrow_back</i>
                                    </ButtonBack>
                                    <ButtonNext>
                                        <i className='material-icons'>arrow_forward</i>
                                    </ButtonNext>
                                </div>
                                <Slider>
                                    {hueList.map((hue, index) => {
                                        return (
                                            <Slide index={index} key={hue.title}>
                                                <div
                                                    onClick={() => handleHueClick(hue)}
                                                    className={
                                                        'board-hue-item' +
                                                        (currentHue.title === hue.title ? ' active' : '')
                                                    }
                                                >
                                                    <div
                                                        className='hue-item-color'
                                                        style={{
                                                            background: `linear-gradient(90deg, ${hue.primaryColor} 0%, ${hue.backgroundColor} 100%)`,
                                                        }}
                                                    ></div>
                                                    <div className='hue-item-text'>
                                                        <h4>{hue.title}</h4>
                                                    </div>
                                                </div>
                                            </Slide>
                                        );
                                    })}
                                </Slider>
                            </CarouselProvider>
                        </div>
                    </div>

                    <div className='board-cta'>
                        <button
                            className='board-cta-button'
                            onClick={() => {
                                navigate('/');
                            }}
                        >
                            Complete Customize
                        </button>
                        <p>Let's Make Frigid Just For You.</p>
                    </div>
                </div>
            </Dev_BoardController>
        </>
    );
};

export default B_StartHue;

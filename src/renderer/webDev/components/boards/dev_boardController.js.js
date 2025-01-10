import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dev_BoardController = (props) => {
    const navigate = useNavigate();
    return (
        <>

            <div className="board-controller">

                <div className='board-inlet'>
                    <div className='board-close-wrapper'>
                        {
                            props.close && <button className='board-close' onClick={
                                () => navigate(props.close)
                            }>
                                <i className='material-icons'>close</i>
                            </button>
                        }
                    </div>
                    <div className='vivify fadeIn duration-500 delay-300' style={{ height: '100%' }}>   {props.children}</div>
                </div>
            </div>
            <style>
                {
                    `
                .side-panel-dragger {
                    -webkit-app-region: no-drag
                }
                .drag-zone {
                 height: 50px;
                }
                 body {
                 overflow: hidden !important;
                 }
                `
                }
            </style>
        </>
    );
};

export default Dev_BoardController;

import React, { useEffect } from 'react';

const PermissionItem = (props) => {

    useEffect(() => {
        if (props.disable) {
            setTimeout(() => {
                
                props.setDisable(false)

            },500)
        }
    }, [props.disable])
    return (
        <div className='permission-page'>
            <div className='permission-modal'>
                <div className='permission-header'>
                    <i className='material-icons'>{props.icon}</i>
                    <h1>{props.title}</h1>
                    <p>{props.desc}</p>
                </div>
                <button style={props.disable ? {pointerEvents:'none'} : {pointerEvents:'all'}} onClick={
                    (e) => {
                        props.setDisable(true)
                        props.permissionFunc(true)
                       

                        
                    }

                } className='permission-button'>Allow Access</button>
            </div>
        </div>
    );
};

export default PermissionItem
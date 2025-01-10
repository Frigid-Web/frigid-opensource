import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";

import loading from '../../../../assets/loadingIcon.gif'

export function Loading() {
    const [loadingVisible, setLoadingVisible] = useState(false)

    const loadingData = useSelector(state => state.mainapp.loadingSlice.loadingData)
    const [complete, setComplete] = useState(false)

    useEffect(() => {
        if (loadingData.loading) {
            setLoadingVisible(true)
        } else if (loadingData.loading === false) {
            setComplete(true)
            setTimeout(() => {
                setLoadingVisible(false)
                setComplete(false)
            }, 2000)
        }

    }, [loadingData])

    return (

        loadingVisible ? <div className="loading-container">
            <div className="loading-cell">
                <div className="cell-header">
                    <h4>{loadingData.origin}</h4>
                </div>
                <div className="cell-body">
                    <div className="loading-spinner">
                        {
                            complete ? <i className="material-icons">check_circle</i> : <img src={loading} alt="loading" />
                        }
                    </div>
                    <h2>{
                        loadingData.statusText
                    }</h2>
                </div>
            </div>
        </div> : null

    );
}

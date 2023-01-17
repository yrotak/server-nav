import axios from 'axios';
import React, { useRef, useState } from 'react';
import styles from '../styles/FloatingWindow.module.scss'
import Draggable from 'react-draggable';
const FloatingWindow = ({ width, height, title, onClose, children, id, focusid, setfocusid }) => {

    const windoww = useRef();

    return <Draggable handle="strong" onMouseDown={() => setfocusid(id)} bounds={{left: 300, top: 0, right: window.innerWidth-(width+10), bottom: window.innerHeight-(height+10)}} defaultPosition={{x: 300, y: 0}}>
        <div className={styles.window + (id == focusid ? (" " +styles.focused) : "")} ref={windoww} style={{ width: width + "px", height: height + "px" }}>
            <strong>
                <div className={styles.header}>
                    <p className={styles.title}>{title}</p>

                    <button className={styles.close} onClick={() => onClose()}>&times;</button>
                </div>
            </strong>

            <div className={styles.content}>
                {React.cloneElement(children)}
            </div>
        </div>
    </Draggable>;
};

export default FloatingWindow;
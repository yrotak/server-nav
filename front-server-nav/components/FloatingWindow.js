import axios from 'axios';
import React, { useRef, useState } from 'react';
import styles from '../styles/FloatingWindow.module.scss'
import Draggable from 'react-draggable';
const FloatingWindow = ({ width, height, title, onClose, children }) => {

    const windoww = useRef();

    return <Draggable handle="strong">
        <div className={styles.window} ref={windoww} style={{ width: width + "px", height: height + "px" }}>
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
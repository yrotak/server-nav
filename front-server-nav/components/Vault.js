import axios from 'axios';
import React, { useEffect, useState } from 'react';
import styles from '../styles/Vault.module.scss'

const Vault = ({ }) => {

    const [pin, setPin] = useState("")

    const [showed, setShowed] = useState(false)

    const [layout, setLayout] = useState([])

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    useEffect(() => {
        const array = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 99, 99, 99, 99, 99];
        shuffle(array)
        setLayout(array)
    }, [])

    return <>
        <div className={styles.pin}>
            <div className={styles.display}>
                <input type={showed ? "text" : "password"} className={styles.input} placeholder="Enter your PIN" value={pin} readOnly={true}></input>
                <button className={styles.showbtn + " " + (showed && styles.showed)} onClick={() => setShowed(showed => !showed)}>&#128065;</button>
            </div>
            <div className={styles.nums}>
                {
                    layout.map(i =>
                    (
                        i == 99 ? (
                            <button className={styles.disabledbtn}></button>
                        ) : (
                            <button className={styles.btn} onClick={(e) => setPin(pin => pin+i.toString())}>{i}</button>
                        )
                    ))
                }
                <button className={styles.btn} onClick={() => setPin(pin => pin.slice(0, -1))}>&#9003;</button>
            </div>
            <button className={styles.button}>Decrypt vault</button>
        </div>
    </>;
};

export default Vault;
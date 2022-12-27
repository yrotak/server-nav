import axios from 'axios';
import React, { useState } from 'react';
import styles from '../styles/TotpForm.module.scss'

const TotpForm = ({setCurrentChallenge, setToken, Token }) => {

    const [code, setcode] = useState("");

    return <form className={styles.form} onSubmit={(e) => {
        e.preventDefault()
        axios.post(`${window.location.origin}/api/v1/Users/totp`, {
            code: code,
        }, {
            'headers': {
                'Authorization': Token
            }
        }).then(res => {
            setToken(res.data.token)
            setCurrentChallenge(2)
        })
    }}>
        <input type="text" placeholder="2FA Code" alt="2FA Code" className={styles.input} value={code} onChange={(e) => setcode(e.target.value)} />
        <button className={styles.button}>
            Verify
        </button>
    </form>;
};

export default TotpForm;
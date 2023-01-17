import axios from 'axios';
import React, { useState } from 'react';
import styles from '../styles/TotpForm.module.scss'

const TotpForm = ({setCurrentChallenge, setToken, Token }) => {

    const [code, setcode] = useState("");

    const [error, seterror] = useState("");

    return <form className={styles.form} onSubmit={(e) => {
        e.preventDefault()
        seterror("")
        axios.post(`${window.location.origin}/api/v1/Users/totp`, {
            code: code,
        }, {
            'headers': {
                'Authorization': Token
            }
        }).then(res => {
            setToken(res.data.token)
            setCurrentChallenge(2)
        }).catch(e => {
            if(e.response.data)
                seterror(e.response.data.error)
        })
    }}>
        <input required={true} type="text" placeholder="2FA Code" alt="2FA Code" className={styles.input} value={code} onChange={(e) => setcode(e.target.value)} />
        <button className={styles.button}>
            Verify
        </button>
        <p className={styles.error}>{error}</p>
    </form>;
};

export default TotpForm;
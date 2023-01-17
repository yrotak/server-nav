import axios from 'axios';
import React, { useState } from 'react';
import styles from '../styles/LoginForm.module.scss'

const LoginForm = ({setCurrentChallenge, setToken }) => {

    const [username, setusername] = useState("");
    const [password, setpassword] = useState("");

    const [error, seterror] = useState("");

    return <form className={styles.form} onSubmit={(e) => {
        e.preventDefault()
        seterror("")
        axios.post(`${window.location.origin}/api/v1/Users/login`, {
            username: username,
            password: password,
        }).then(res => {
            setToken(res.data.token)
            setCurrentChallenge(1)
        }).catch(e => {
            if(e.response.data)
                seterror(e.response.data.error)
        })
    }}>
        <input required={true} type="text" placeholder="Username" alt="Username" className={styles.input} value={username} onChange={(e) => setusername(e.target.value)} />
        <input required={true} type="password" placeholder="Password" alt="Password" className={styles.input} value={password} onChange={(e) => setpassword(e.target.value)} />
        <button className={styles.button}>
            Login
        </button>
        <p className={styles.error}>{error}</p>
    </form>;
};

export default LoginForm;
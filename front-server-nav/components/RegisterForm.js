import React, { useEffect, useState } from 'react';
import QRCode from "react-qr-code";
import axios from 'axios';
import { useRouter } from 'next/router'

import styles from '../styles/RegisterForm.module.scss'
import u2fApi from 'u2f-api';

const RegisterForm = () => {

    const [totpurl, settotpurl] = useState("");
    const [totpsecret, settotpsecret] = useState("");

    const [username, setusername] = useState("");
    const [password, setpassword] = useState("");
    const [confirmpassword, setconfirmpassword] = useState("");
    const [Unsupported, setUnsupported] = useState(false);
    const [registerrequest, setregisterrequest] = useState({});

    const [responseu2f, setresponseu2f] = useState({});

    const [challenge_str, setchallenge_str] = useState("");

    const [error, seterror] = useState("");

    const router = useRouter();

    useEffect(() => {
        u2fApi.isSupported().then((supported) => {
            setUnsupported(!supported)
        })
        axios.get(`${window.location.origin}/api/v1/Users/initRegister`).then(res => {
            settotpsecret(res.data.secret)
            setregisterrequest(res.data.u2f_request)
            setchallenge_str(res.data.challenge_str)
        })
    }, []);

    useEffect(() => {
        settotpurl(`otpauth://totp/server-nav%3A${username}?secret=${totpsecret}&issuer=server-nav`)
    }, [username, totpsecret]);

    return <form className={styles.form} onSubmit={(e) => {
        e.preventDefault()
        seterror("")
        axios.post(`${window.location.origin}/api/v1/Users`, {
            regpayload: router.query.p,
            username: username,
            password: password,
            totp: totpsecret,
            u2f_device: JSON.stringify(responseu2f),
            challenge_str: challenge_str
        }).then(res => {
            window.location.href=window.location.origin
        }).catch(e => {
            if(e.response.data)
                seterror(e.response.data.error)
        })
    }}>
        <h3 className={styles.title}>Creditentials</h3>
        <input className={styles.input} type="text" placeholder="Username" alt="Username" value={username} onChange={(e) => setusername(e.target.value)} required></input>
        <input className={styles.input} type="password" placeholder="Password" alt="Password" value={password} onChange={(e) => setpassword(e.target.value)} required></input>
        <input className={styles.input} type="password" placeholder="Confirm password" alt="Confirm password" value={confirmpassword} onChange={(e) => setconfirmpassword(e.target.value)} required></input>
        <hr></hr>
        <h3 className={styles.title}>TOTP</h3>
        <QRCode value={totpurl} />
        <hr></hr>
        <h3 className={styles.title}>U2F</h3>
        {Unsupported ? <p>This browser is not compatible with U2F</p> : <button className={styles.button} type='button' onClick={() => {
            window.u2f.register(registerrequest.appId, registerrequest.registerRequests, registerrequest.registeredKeys, (resp) => {
                if(resp.errorCode == 0) {
                    setresponseu2f(resp)
                }
            })
        }}>
            Register U2F
        </button>}
        <hr></hr>
        <button className={styles.button}>
            Continue
        </button>
        
        <p className={styles.error}>{error}</p>
    </form>;

};

export default RegisterForm;
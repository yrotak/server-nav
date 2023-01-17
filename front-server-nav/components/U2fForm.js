import axios from 'axios';
import React, { useEffect, useState } from 'react';
import u2fApi from 'u2f-api';
import styles from '../styles/U2fForm.module.scss'
import { setCookie } from '../utils/cookies';

const U2fForm = ({ setLoggedIn, setToken, Token, updateUserData }) => {

    const [Unsupported, setUnsupported] = useState(false);

    const [signRequest, setsignRequest] = useState({});
    const [challenge_str, setchallenge_str] = useState("");

    const [error, seterror] = useState("");

    useEffect(() => {
        u2fApi.isSupported().then((supported) => {
            setUnsupported(!supported)
            if(supported) {
                axios.post(`${window.location.origin}/api/v1/Users/signRequest`, {} , {
                    'headers': {
                        'Authorization': Token
                    }
                }).then(res => {
                    setsignRequest(res.data.signed_request)
                    setchallenge_str(res.data.challenge_str)
                })
            }
        })
    }, []);
    if(Unsupported)
        return <p>U2F is not supported on this browser.</p>;
    return <form className={styles.form} onSubmit={(e) => {
        e.preventDefault()
        seterror("")
        window.u2f.sign(signRequest.appId, signRequest.challenge, signRequest.registeredKeys, (resp) => {
            console.log(resp);
            if(resp.errorCode == 0) {
                axios.post(`${window.location.origin}/api/v1/Users/signResponse`, {
                    challenge_str: challenge_str,
                    sign_data: JSON.stringify(resp)
                } , {
                    'headers': {
                        'Authorization': Token
                    }
                }).then(res => {
                    setToken(res.data.token)
                    setCookie("token", res.data.token, 2)
                    setLoggedIn(true)
                    updateUserData()
                }).catch(e => {
                    if(e.response.data)
                        seterror(e.response.data.error)
                })
            } else if(resp.errorCode == 4) {
                seterror("Invalid U2F key")
            }
        })
    }}>
        <p>Insert and Tap your U2F security key</p>
        <button className={styles.button}>
            Authentify
        </button>
        <p className={styles.error}>{error}</p>
    </form>;
};

export default U2fForm;
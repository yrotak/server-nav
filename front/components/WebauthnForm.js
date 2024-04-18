import axios from 'axios';
import React, { useEffect, useState } from 'react';
import styles from '../styles/WebauthnForm.module.scss'
import { setCookie } from '../utils/cookies';

const WebauthnForm = ({ setLoggedIn, setToken, Token, updateUserData }) => {

    const [Unsupported, setUnsupported] = useState(false);

    const [signRequest, setsignRequest] = useState({});
    const [rcr, setrcr] = useState("");

    const [error, seterror] = useState("");

    var decodeUrlSafe = function (input) {
        // Replace non-url compatible chars with base64 standard chars
        input = input
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        // Pad out with standard base64 required padding characters
        var pad = input.length % 4;
        if (pad) {
            if (pad === 1) {
                throw new Error('InvalidLengthError: Input base64url string is the wrong length to determine padding');
            }
            input += new Array(5 - pad).join('=');
        }

        return input;
    }

    function base64UrlToArrayBuffer(base64) {
        var binaryString = atob(decodeUrlSafe(base64));
        var bytes = new Uint8Array(binaryString.length);
        for (var i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    useEffect(() => {
        if (!window.navigator.credentials) {
            setUnsupported(!supported)
        }else {
            axios.post(`${window.location.origin}/api/v1/Users/signRequest`, {}, {
                'headers': {
                    'Authorization': Token
                }
            }).then(res => {
                console.log(res.data)
                setrcr(res.data.rcr)
            }).catch(e => {
                if(e.response.data)
                    seterror(e.response.data.error)
            })
        }
    }, []);
    if (Unsupported)
        return <p>webauthn is not supported on this browser.</p>;
    return <form className={styles.form} onSubmit={(e) => {
        e.preventDefault()
        seterror("")
        let publicKey = {
            allowCredentials: rcr.publicKey.allowCredentials.map(cred => {
                return {id: base64UrlToArrayBuffer(cred.id), type: cred.type}
            }),
            challenge: base64UrlToArrayBuffer(rcr.publicKey.challenge),
            rpId:rcr.publicKey.rpId,
            timeout:rcr.publicKey.timeout,
            userVerification:rcr.publicKey.userVerification,
        }
        navigator.credentials.get({publicKey}).then(resp => {
            axios.post(`${window.location.origin}/api/v1/Users/signResponse`, {
                public_key_credential: JSON.stringify(resp),
            }, {
                'headers': {
                    'Authorization': Token
                }
            }).then(res => {
                setToken(res.data.token)
                setCookie("token", res.data.token, 2)
                setLoggedIn(true)
                updateUserData()
            }).catch(e => {
                if (e.response.data)
                    seterror(e.response.data.error)
            })
        }).catch(e => {
            seterror("An error has occured")
            console.log(e)
        })
    }}>
        <p>Insert and Tap your security key</p>
        <button className={styles.button}>
            Authentify
        </button>
        <p className={styles.error}>{error}</p>
    </form>;
};

export default WebauthnForm;
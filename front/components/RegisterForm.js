import React, { useEffect, useState } from 'react';
import QRCode from "react-qr-code";
import axios from 'axios';
import { useRouter } from 'next/router'

import styles from '../styles/RegisterForm.module.scss'

const RegisterForm = () => {

    const [totpurl, settotpurl] = useState("");
    const [totpsecret, settotpsecret] = useState("");

    const [username, setusername] = useState("");
    const [password, setpassword] = useState("");
    const [confirmpassword, setconfirmpassword] = useState("");
    const [Unsupported, setUnsupported] = useState(false);

    const [ccr, setCCr] = useState({});
    const [unique_id, setunique_id] = useState("");

    const [isEnteringTOTP, setisEnteringTOTP] = useState(false);
    const [registered, setregistered] = useState(false);
    const [publicKeyCredential, setpublicKeyCredential] = useState({});


    const [error, seterror] = useState("");

    const router = useRouter();



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
        }
    }, []);

    useEffect(() => {
        settotpurl(`otpauth://totp/server-nav%3A${username}?secret=${totpsecret}&issuer=server-nav`)
    }, [username, totpsecret]);

    return <form className={styles.form} onSubmit={(e) => {
        e.preventDefault()
        if (isEnteringTOTP) {
            seterror("")
            axios.post(`${window.location.origin}/api/v1/Users`, {
                regpayload: router.query.p,
                username: username,
                password: password,
                totp: totpsecret,
                public_key_credential: JSON.stringify(publicKeyCredential),
                unique_id: unique_id
            }).then(res => {
                window.location.href = window.location.origin
            }).catch(e => {
                if (e.response.data)
                    seterror(e.response.data.error)
            })
        } else {
            axios.post(`${window.location.origin}/api/v1/Users/initRegister`, {
                username: username
            }).then(res => {
                console.log(res);
                settotpsecret(res.data.secret)
                setCCr(res.data.ccr)
                setunique_id(res.data.unique_id)

                setisEnteringTOTP(true)
            })
        }
    }}>
        <h3 className={styles.title}>Creditentials</h3>
        <input className={styles.input} type="text" placeholder="Username" alt="Username" value={username} onChange={(e) => setusername(e.target.value)} required></input>
        <input className={styles.input} type="password" placeholder="Password" alt="Password" value={password} onChange={(e) => setpassword(e.target.value)} required></input>
        <input className={styles.input} type="password" placeholder="Confirm password" alt="Confirm password" value={confirmpassword} onChange={(e) => setconfirmpassword(e.target.value)} required></input>
        <hr></hr>

        {
            isEnteringTOTP ? (
                <>
                    <h3 className={styles.title}>TOTP</h3>
                    <QRCode value={totpurl} />
                    <hr></hr>
                    <h3 className={styles.title}>Security key</h3>
                    {Unsupported ? <p>This browser is not compatible with webauthn</p> : <button disabled={registered} className={styles.button} type='button' onClick={() => {

                        let credData = {
                            publicKey: {
                                challenge: base64UrlToArrayBuffer(ccr.publicKey.challenge),
                                rp: ccr.publicKey.rp,
                                user: {
                                    id: base64UrlToArrayBuffer(ccr.publicKey.user.id),
                                    name: ccr.publicKey.user.name,
                                    displayName: ccr.publicKey.user.displayName
                                },
                                pubKeyCredParams: ccr.publicKey.pubKeyCredParams,
                                attestation: ccr.publicKey.attestation,
                                authenticatorSelection: ccr.publicKey.authenticatorSelection,
                                extensions: ccr.publicKey.extensions,
                                timeout: ccr.publicKey.timeout
                            }
                        }


                        navigator.credentials.create(credData).then(resp => {

                            console.log(resp);
                            setregistered(true)
                            setpublicKeyCredential(resp)
                        }).catch(e => {
                            console.log(e)
                            seterror("An error has occured")
                        })

                    }}>
                        {registered ? "Key registered !" : "Register key"}
                    </button>}
                    <hr></hr>
                    <button className={styles.button}>
                        Continue
                    </button>
                </>
            ) : (
                <button className={styles.button}>
                    Continue
                </button>
            )
        }

        <p className={styles.error}>{error}</p>
    </form>;

};

export default RegisterForm;
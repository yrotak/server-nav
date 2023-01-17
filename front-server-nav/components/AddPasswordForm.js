import axios from 'axios';
import React, { useState } from 'react';
import { NotificationManager } from 'react-notifications';
import withReactContent from 'sweetalert2-react-content'
import Swal from 'sweetalert2';
import CryptoJS from 'crypto-js'

import styles from '../styles/AddPasswordForm.module.scss'

const AddPasswordForm = ({Token, update, pin}) => {

    const [password, setpassword] = useState("");
    const [name, setname] = useState("");

    const RSwal = withReactContent(Swal)

    function encrypt(pass) {
        const key = CryptoJS.SHA256(pin).toString().substring(0, 32)
        const iv = key.substring(0, 16)

        const cipher = CryptoJS.AES.encrypt(pass, CryptoJS.enc.Utf8.parse(key), {
            iv: CryptoJS.enc.Utf8.parse(iv), // parse the IV 
            padding: CryptoJS.pad.Pkcs7,
            mode: CryptoJS.mode.CBC
        })

        return cipher.toString()
    }

    return (
        <form className={styles.addpassword} onSubmit={(e) => {
            e.preventDefault()
            axios.post(`${window.location.origin}/api/v1/Passwords`, {
                name: name,
                password: encrypt(password),
            }, {
                'headers': {
                    'Authorization': Token
                }
            }).then(res => {
                RSwal.close()
                NotificationManager.success("Password has been added")
                update()
            }).catch(e => {
                if(e.response.data)
                    NotificationManager.error(e.response.data.error)
            })
        }}>
            <input type="text" placeholder="Name of website" alt="Name of website" required={true} className={styles.input} value={name} onChange={(e) => setname(e.target.value)} />
            <input type="password" placeholder="Password" alt="Password" required={true} className={styles.input} value={password} onChange={(e) => setpassword(e.target.value)} />

            <button className={styles.button}>Add</button>
        </form>
    );
};

export default AddPasswordForm;
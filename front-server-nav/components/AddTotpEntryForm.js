import axios from 'axios';
import React, { useState } from 'react';
import { NotificationManager } from 'react-notifications';
import withReactContent from 'sweetalert2-react-content'
import Swal from 'sweetalert2';

import styles from '../styles/AddTotpEntryForm.module.scss'

const AddTotpEntryForm = ({Token, update}) => {

    const [issuer, setissuer] = useState("");
    const [name, setname] = useState("");
    const [secret, setsecret] = useState("");

    const RSwal = withReactContent(Swal)

    return (
        <form className={styles.addtotp} onSubmit={(e) => {
            e.preventDefault()
            axios.post(`${window.location.origin}/api/v1/Totps`, {
                issuer: issuer,
                name: name,
                secret: secret,
            }, {
                'headers': {
                    'Authorization': Token
                }
            }).then(res => {
                RSwal.close()
                NotificationManager.success("Totp has been added")
                update()
            }).catch(e => {
                if(e.response.data)
                    NotificationManager.error(e.response.data.error)
            })
        }}>
            <input type="text" placeholder="Name of website" alt="Name of website" required={true} className={styles.input} value={name} onChange={(e) => setname(e.target.value)} />
            <input type="text" placeholder="Username" alt="Username" required={true} className={styles.input} value={issuer} onChange={(e) => setissuer(e.target.value)} />
            <input type="text" placeholder="Secret" alt="Secret" required={true} className={styles.input} value={secret} onChange={(e) => setsecret(e.target.value)} />

            <button className={styles.button}>Add</button>
        </form>
    );
};

export default AddTotpEntryForm;
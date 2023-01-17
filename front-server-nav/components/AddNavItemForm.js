import axios from 'axios';
import React, { useState } from 'react';
import { NotificationManager } from 'react-notifications';
import withReactContent from 'sweetalert2-react-content'
import Swal from 'sweetalert2';

import styles from '../styles/AddNavItemForm.module.scss'

const AddNavItemForm = ({Token, update}) => {

    const [name, setname] = useState("");
    const [url, seturl] = useState("");
    const [image, setimage] = useState("");

    const RSwal = withReactContent(Swal)

    return (
        <form className={styles.additem} onSubmit={(e) => {
            e.preventDefault()
            axios.post(`${window.location.origin}/api/v1/Navigation`, {
                name: name,
                url: url,
                image: image,
            }, {
                'headers': {
                    'Authorization': Token
                }
            }).then(res => {
                RSwal.close()
                NotificationManager.success("Item has been added")
                update()
            }).catch(e => {
                if(e.response.data)
                    NotificationManager.error(e.response.data.error)
            })
        }}>
            <input type="text" placeholder="Name of website" alt="Name of website" required={true} className={styles.input} value={name} onChange={(e) => setname(e.target.value)} />
            <input type="text" placeholder="URL" alt="URL" required={true} className={styles.input} value={url} onChange={(e) => seturl(e.target.value)} />

            <button className={styles.button}>Add</button>
        </form>
    );
};

export default AddNavItemForm;
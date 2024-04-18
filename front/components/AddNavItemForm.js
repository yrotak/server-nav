import axios from 'axios';
import React, { useState } from 'react';
import { NotificationManager } from 'react-notifications';
import withReactContent from 'sweetalert2-react-content'
import Swal from 'sweetalert2';

import styles from '../styles/AddNavItemForm.module.scss'

const AddNavItemForm = ({ Token, update }) => {

    const [name, setname] = useState("");
    const [url, seturl] = useState("");
    const [image, setimage] = useState("");

    const [filename, setfilename] = useState("No image selected");
    const [fileActive, setfileActive] = useState(false);

    const [percent, setpercent] = useState(0);

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
                if (e.response.data)
                    NotificationManager.error(e.response.data.error)
            })
        }}>
            <input type="text" placeholder="Name of website" alt="Name of website" required={true} className={styles.input} value={name} onChange={(e) => setname(e.target.value)} />
            <input type="text" placeholder="URL" alt="URL" required={true} className={styles.input} value={url} onChange={(e) => seturl(e.target.value)} />
            <div className={styles["file-upload"] + (fileActive ? " " + styles.active : "")}>
                <div className={styles["file-select"]}>
                    <div className={styles["file-select-button"]} id="fileName">Select an image</div>
                    <div className={styles["file-select-name"]} id="noFile">{filename}</div>
                    <input type="file" name="chooseFile" id="chooseFile" required onChange={(e) => {
                        let filename = e.target.value;
                        if (/^s*$/.test(filename)) {
                            setfilename("No image selected")
                            setfileActive(false)
                        }
                        else {
                            setfilename(filename.replace("C:\\fakepath\\", ""))
                            setfileActive(true)

                            let formData = new FormData();
                            formData.append("file", e.target.files[0]);
                            axios.post('/upload', formData, {
                                headers: {
                                    "Content-Type": "multipart/form-data",
                                    "authorization": Token
                                },
                                onUploadProgress: (event) => {
                                    setpercent(Math.round((100 * event.loaded) / event.total))
                                },
                            }).then(res => {
                                setimage(res.data.filenames[0])
                            }).catch(e => {
                                if (e.response.data)
                                    NotificationManager.error(e.response.data.error)
                            })
                        }
                    }} />
                </div>
                <div className={styles.progressbar}>
                    <div className={styles.percent} style={{ width: percent.toString() + "%" }}></div>
                </div>
            </div>
            <button className={styles.button} disabled={!fileActive}>Add</button>
        </form>
    );
};

export default AddNavItemForm;
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import styles from '../styles/Vault.module.scss'
import CryptoJS from 'crypto-js'
import { NotificationManager } from 'react-notifications';
import FeatherIcon from 'feather-icons-react';
import withReactContent from 'sweetalert2-react-content'
import Swal from 'sweetalert2';
import AddPasswordForm from './AddPasswordForm';


const Vault = ({ Token }) => {

    const [pin, setPin] = useState("")

    const [showed, setShowed] = useState(false)

    const [unlocked, setunlocked] = useState(false);
    const [passwords, setpasswords] = useState([]);
    const [search, setsearch] = useState("");

    const [layout, setLayout] = useState([])

    const RSwal = withReactContent(Swal)

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function fallbackCopyTextToClipboard(text) {
        var textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            console.log('Fallback: Copying text command was ' + msg);
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
        }

        document.body.removeChild(textArea);
    }
    function copyTextToClipboard(text) {
        if (!navigator.clipboard) {
            fallbackCopyTextToClipboard(text);
            return;
        }
        navigator.clipboard.writeText(text).then(function () {
            console.log('Async: Copying to clipboard was successful!');
        }, function (err) {
            console.error('Async: Could not copy text: ', err);
        });
    }

    function decrypt(pass) {
        const key = CryptoJS.SHA256(pin).toString().substring(0, 32)
        const iv = key.substring(0, 16)

        const cipher = CryptoJS.AES.decrypt(pass, CryptoJS.enc.Utf8.parse(key), {
            iv: CryptoJS.enc.Utf8.parse(iv), // parse the IV 
            padding: CryptoJS.pad.Pkcs7,
            mode: CryptoJS.mode.CBC
        })

        return {
            isencrypted: cipher.sigBytes <= 0,
            pass: cipher.toString(CryptoJS.enc.Utf8)
        }
    }

    function updatePasswords() {
        axios.get(`${window.location.origin}/api/v1/Passwords`, {
            'headers': {
                'Authorization': Token
            }
        }).then(res => {
            setpasswords(res.data)
        }).catch(e => {
            if (e.response.data)
                NotificationManager.error(e.response.data.error)
        })
    }

    useEffect(() => {
        const array = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 99, 99, 99, 99, 99];
        shuffle(array)
        setLayout(array)

        updatePasswords();
    }, [])


    if (unlocked) {
        return <div className={styles.passwords}>
            <input type="text" placeholder="Search" alt="Search" className={styles.input} value={search} onChange={(e) => setsearch(e.target.value)} />
            {
                passwords.map(password => {
                    let encryption = decrypt(password.password)
                    if (password.name.toLowerCase().includes(search.toLowerCase()))
                        return <div className={styles.password} key={password.id}>
                            <p>{password.name}</p>
                            <div className={styles.btns}>
                                <button className={styles.delete} onClick={() => {
                                    RSwal.fire({
                                        title: 'Are you sure to delete ?',
                                        showDenyButton: true,
                                        showCancelButton: false,
                                        confirmButtonText: 'Delete',
                                        denyButtonText: "Cancel",
                                        confirmButtonColor: "#eb2f06",
                                        denyButtonColor: "#ccc"
                                    }).then((result) => {
                                        if (result.isConfirmed) {
                                            axios.delete(`${window.location.origin}/api/v1/Passwords/${password.id}`, {
                                                'headers': {
                                                    'Authorization': Token
                                                }
                                            }).then(res => {
                                                NotificationManager.success("Password has been deleted")
                                                updatePasswords()
                                            }).catch(e => {
                                                if (e.response.data)
                                                    NotificationManager.error(e.response.data.error)
                                            })
                                        } else if (result.isDenied) {
                                            RSwal.close()
                                        }
                                    })
                                }}>
                                    <FeatherIcon icon="x-circle" />
                                </button>
                                {
                                    encryption.isencrypted ?
                                        <p className={styles.error}>Wrong pin</p>
                                        :
                                        <button className={styles.copy} onClick={() => {
                                            NotificationManager.success("Copied to clipboard.")
                                            copyTextToClipboard(encryption.pass)
                                        }}>
                                            <FeatherIcon icon="copy" />
                                        </button>
                                }
                            </div>
                        </div>
                })
            }

            <button className={styles.add} onClick={() => {
                RSwal.fire({
                    title: 'Add a new encrypted password',
                    icon: 'question',
                    html: <AddPasswordForm Token={Token} update={updatePasswords} pin={pin} />,
                    showCloseButton: true,
                    showCancelButton: false,
                    showConfirmButton: false,
                    focusConfirm: false,
                })
            }}>
                <FeatherIcon icon="plus-circle" />
            </button>
        </div>
    } else {
        return <div className={styles.pin}>
            <div className={styles.display}>
                <input type={showed ? "text" : "password"} className={styles.input} placeholder="Enter your PIN" value={pin} readOnly={true}></input>
                <button className={styles.showbtn + " " + (showed && styles.showed)} onClick={() => setShowed(showed => !showed)}>&#128065;</button>
            </div>
            <div className={styles.nums}>
                {
                    layout.map(i =>
                    (
                        i == 99 ? (
                            <button key={i} className={styles.disabledbtn}></button>
                        ) : (
                            <button key={i} className={styles.btn} onClick={(e) => setPin(pin => pin + i.toString())}>{i}</button>
                        )
                    ))
                }
                <button className={styles.btn} onClick={() => setPin(pin => pin.slice(0, -1))}>&#9003;</button>
            </div>
            <button className={styles.button} onClick={() => {
                setunlocked(true)
            }}>Decrypt vault</button>
        </div>;
    }
};

export default Vault;
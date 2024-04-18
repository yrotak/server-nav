import FeatherIcon from 'feather-icons-react';
import React, { useEffect, useState } from 'react';
import { NotificationManager } from 'react-notifications';
import styles from '../styles/TotpEntry.module.scss'
import withReactContent from 'sweetalert2-react-content'
import Swal from 'sweetalert2';
import axios from 'axios';
const TotpEntry = ({ totp, id, updateEntries, Token }) => {
    function getCurrentSeconds() {
        return Math.round(new Date().getTime() / 1000.0);
    }

    const [code, setcode] = useState("");
    const [percent, setpercent] = useState(0);


    const RSwal = withReactContent(Swal)
    function update() {
        setcode(totp.generate())
        setpercent(totp.period - (getCurrentSeconds() % totp.period))
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
    useEffect(() => {
        update()
        let inter = setInterval(() => {
            update()
        }, 500)
        return () => clearInterval(inter);
    }, []);
    return (
        <div className={styles.totpentry + (percent < 5 ? " " + styles.almost : "")}>
            <div className={styles.header}>
                <div className={styles.texts}>
                    <p className={styles.title}>{totp.label} ({totp.issuer})</p>
                    <p className={styles.code}>{code}</p>
                </div>
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
                                axios.delete(`${window.location.origin}/api/v1/Totps/${id}`, {
                                    'headers': {
                                        'Authorization': Token
                                    }
                                }).then(res => {
                                    NotificationManager.success("Totp has been deleted")
                                    updateEntries()
                                }).catch(e => {
                                    if (e.response.data)
                                        NotificationManager.error(e.response.data.error)
                                })
                            } else if (result.isDenied) {
                                RSwal.close()
                            }
                        })
                    }}>
                        <FeatherIcon  icon="x-circle" />
                    </button>
                    <button className={styles.copy} onClick={() => {
                        NotificationManager.success("Copied to clipboard.")
                        copyTextToClipboard(code)
                    }}>
                        <FeatherIcon icon="copy" />
                    </button>
                </div>
            </div>
            <div className={styles.progressbar}>
                <div className={styles.progress} style={{ width: ((percent / 30) * 100).toString() + "%" }}></div>
            </div>
        </div>
    );
};

export default TotpEntry;
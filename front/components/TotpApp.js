import React, { useEffect, useRef, useState } from 'react';
import * as OTPAuth from "otpauth";
import TotpEntry from './TotpEntry';
import styles from '../styles/TotpApp.module.scss'
import FeatherIcon from 'feather-icons-react';
import axios from 'axios';
import withReactContent from 'sweetalert2-react-content'
import Swal from 'sweetalert2';
import AddTotpEntryForm from './AddTotpEntryForm';

const TotpApp = ({ Token }) => {

    const [totps, settotps] = useState([]);

    const RSwal = withReactContent(Swal)

    function updateEntries() {
        axios.get(`${window.location.origin}/api/v1/Totps`, {
            'headers': {
                'Authorization': Token
            }
        }).then(res => {
            settotps(res.data)
        }).catch(e => {
            if (e.response.data)
                NotificationManager.error(e.response.data.error)
        })
    }

    useEffect(() => {
        updateEntries()
    }, []);

    return (
        <div className={styles.totpapp}>
            {
                totps.map(totp => (
                    <TotpEntry key={totp.id} totp={new OTPAuth.TOTP({
                        issuer: totp.issuer,
                        label: totp.name,
                        algorithm: "SHA1",
                        digits: 6,
                        period: 30,
                        secret: totp.secret,
                    })} id={totp.id} Token={Token} updateEntries={updateEntries} />
                ))
            }
            <button className={styles.add} onClick={() => {
                RSwal.fire({
                    title: 'Add a totp entry',
                    icon: 'question',
                    html: <AddTotpEntryForm Token={Token} update={updateEntries} />,
                    showCloseButton: true,
                    showCancelButton: false,
                    showConfirmButton: false,
                    focusConfirm: false,
                })
            }}>
                <FeatherIcon icon="plus-circle" />
            </button>
        </div>
    );
};

export default TotpApp;
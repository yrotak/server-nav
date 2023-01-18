import axios from 'axios';
import React, { useState } from 'react';
import { NotificationManager } from 'react-notifications';
import styles from '../styles/UserInfos.module.scss'
const UserInfos = ({ User, Token }) => {

    const [curpass, setcurpass] = useState("");
    const [newpass, setnewpass] = useState("");
    const [confirmnewpass, setconfirmnewpass] = useState("");

    return (
        <div className={styles.userinfos}>
            <p>
                Username:{" "}
                <span className={styles.info}>{User.username}</span>
            </p>
            <p>
                Account creation:{" "}
                <span className={styles.info}>{new Date(User.date * 1000).toLocaleString()}</span>
            </p>
            <p>
                Rank:{" "}
                <span className={styles.info}>{User.rank}</span>
            </p>
            <p>
                Security key:{" "}
                <span className={styles.info}>{JSON.parse(User.u2f_device).deviceName}</span>
            </p>

            <div className={styles.forms}>
                <form className={styles.form} onSubmit={(e) => {
                    e.preventDefault()
                    axios.post(`${window.location.origin}/api/v1/Users/changePass`, {
                        curpass: curpass,
                        newpass: newpass,
                        confirmnewpass: confirmnewpass
                    }, {
                        'headers': {
                            'Authorization': Token
                        }
                    }).then(res => {
                        NotificationManager.success("Password has been added")
                        window.location.reload()
                    }).catch(e => {
                        if(e.response.data)
                            NotificationManager.error(e.response.data.error)
                    })
                }}>
                    <input required={true} type="password" placeholder="Current password" alt="Current password" className={styles.input} value={curpass} onChange={(e) => setcurpass(e.target.value)} />
                    <input required={true} type="password" placeholder="New password" alt="New password" className={styles.input} value={newpass} onChange={(e) => setnewpass(e.target.value)} />
                    <input required={true} type="password" placeholder="Confirm new password" alt="Confirm new password" className={styles.input} value={confirmnewpass} onChange={(e) => setconfirmnewpass(e.target.value)} />
                    <button className={styles.button}>
                        Change password
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UserInfos;
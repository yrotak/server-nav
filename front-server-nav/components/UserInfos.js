import React from 'react';
import styles from '../styles/UserInfos.module.scss'
const UserInfos = ({User}) => {
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
        </div>
    );
};

export default UserInfos;
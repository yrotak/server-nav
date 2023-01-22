import axios from 'axios';
import React, { useState } from 'react';
import styles from '../styles/AdminUserSettings.module.scss'
import withReactContent from 'sweetalert2-react-content'
import Swal from 'sweetalert2';
import { NotificationManager } from 'react-notifications';

const AdminUserSettings = ({ id, Token, update }) => {

    const [rank, setrank] = useState("");

    const RSwal = withReactContent(Swal)

    return (
        <div className={styles.adminuser}>
            <button className={styles.delete} onClick={() => {
                axios.delete(`${window.location.origin}/api/v1/Users/${id}`, {
                    'headers': {
                        'Authorization': Token
                    }
                }).then(res => {
                    update()
                    RSwal.close()
                }).catch(e => {
                    if (e.response.data)
                        NotificationManager.error(e.response.data.error)
                })
            }}>
                Delete user
            </button>

            <form className={styles.changerankform} onSubmit={(e) => {
                e.preventDefault()

                axios.post(`${window.location.origin}/api/v1/Users/changeRank`,{
                    id,
                    rank
                }, {
                    'headers': {
                        'Authorization': Token
                    }
                }).then(res => {
                    update()
                    RSwal.close()
                }).catch(e => {
                    if (e.response.data)
                        NotificationManager.error(e.response.data.error)
                })
            }}>

                <select onChange={(e) => setrank(e.target.value)} value={rank}>
                    <option value="unaccepted">Unaccepted</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
                <button className={styles.button}>
                    Change rank
                </button>
            </form>
        </div>
    );
};

export default AdminUserSettings;
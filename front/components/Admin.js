import axios from 'axios';
import FeatherIcon from 'feather-icons-react';
import React, { useEffect, useState } from 'react';
import { NotificationManager } from 'react-notifications';
import styles from '../styles/Admin.module.scss'
import withReactContent from 'sweetalert2-react-content'
import Swal from 'sweetalert2';
import AdminUserSettings from './AdminUserSettings';

const Admin = ({ Token }) => {
    const [currentpage, setcurrentpage] = useState(0);

    const [users, setusers] = useState([]);

    const RSwal = withReactContent(Swal)

    function updateUsers() {
        axios.get(`${window.location.origin}/api/v1/Users`, {
            'headers': {
                'Authorization': Token
            }
        }).then(res => {
            setusers(res.data)
        }).catch(e => {
            if (e.response.data)
                NotificationManager.error(e.response.data.error)
        })
    }

    useEffect(() => {
        updateUsers()
    }, []);

    return (
        <div className={styles.admin}>
            <div className={styles.nav}>
                <button className={styles.item} onClick={() => setcurrentpage(0)}>
                    <FeatherIcon icon="home" />{" "}
                    Dashboard
                </button>
                <button className={styles.item} onClick={() => setcurrentpage(1)}>
                    <FeatherIcon icon="user" />{" "}
                    Users
                </button>
            </div>
            <div className={styles.content}>
                {[
                    <div key={0}>
                        <p>There is {users.length} users.</p>
                    </div>,
                    <div key={1}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <td>ID</td>
                                    <td>Username</td>
                                    <td>Creation date</td>
                                    <td>Rank</td>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    users.map(user => (
                                        <tr key={user.id} onClick={() => {
                                            RSwal.fire({
                                                title: 'User panel',
                                                html: <AdminUserSettings id={user.id} Token={Token} update={updateUsers} />,
                                                showCloseButton: true,
                                                showCancelButton: false,
                                                showConfirmButton: false,
                                                focusConfirm: false,
                                            })
                                        }}>
                                            <td title="ID">{user.id}</td>
                                            <td title="Username">{user.username}</td>
                                            <td title="Creation date">{new Date(user.date*1000).toLocaleString()}</td>
                                            <td title="Rank">{user.rank}</td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>,
                ][currentpage]}
            </div>
        </div>
    );
};

export default Admin;
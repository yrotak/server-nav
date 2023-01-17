import axios from 'axios';
import FeatherIcon from 'feather-icons-react';
import React, { useEffect, useState } from 'react';
import { NotificationManager } from 'react-notifications';
import styles from '../styles/Navigation.module.scss'
import withReactContent from 'sweetalert2-react-content'
import Swal from 'sweetalert2';
import AddNavItemForm from './AddNavItemForm';

const Navigation = ({ Token }) => {

    const [Items, setItems] = useState([]);

    const RSwal = withReactContent(Swal)

    function updateItems() {
        axios.get(`${window.location.origin}/api/v1/Navigation`, {
            'headers': {
                'Authorization': Token
            }
        }).then(res => {
            setItems(res.data)
        }).catch(e => {
            if (e.response.data)
                NotificationManager.error(e.response.data.error)
        })
    }

    useEffect(() => {
        updateItems()
    }, []);
    return (
        <div className={styles.navigation}>
            {
                Items.length == 0 ? <p>Feels a little empty ?</p> :
                    Items.map(item => (
                        <div key={item.id} className={styles.element}>
                            <a href={item.url} target="about:blank" className={styles.link}>
                                <img src={item.image} className={styles.img}></img>
                                <p className={styles.name}>{item.name}</p>
                            </a>
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
                                        axios.delete(`${window.location.origin}/api/v1/Navigation/${item.id}`, {
                                            'headers': {
                                                'Authorization': Token
                                            }
                                        }).then(res => {
                                            NotificationManager.success("Item has been deleted")
                                            updateItems()
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
                        </div>
                    ))
            }

            <button className={styles.add} onClick={() => {
                RSwal.fire({
                    title: 'Add a navigation item',
                    icon: 'question',
                    html: <AddNavItemForm Token={Token} update={updateItems} />,
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

export default Navigation;
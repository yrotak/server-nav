import axios from 'axios';
import React, { useEffect, useState } from 'react';
import styles from '../styles/Navbar.module.scss'
import FloatingWindow from './FloatingWindow';
import dynamic from 'next/dynamic'
import Vault from './Vault';

const TerminalDynamic = dynamic(() => import('./TerminalImpl'), {
  ssr: false,
})

const Navbar = ({ }) => {

    const [selectedIds, setSelectedIds] = useState([]);

    function getCurrentHourIn24Format() {
        const currentTime = new Date();
        const hours = currentTime.getHours();
        const hoursString = hours < 10 ? `0${hours}` : `${hours}`;
        const timeString = `${hoursString}:${currentTime.toLocaleTimeString().slice(2).slice(0, -3)}`;
        return timeString
    }

    const [hour, sethour] = useState("")

    const handleClick = (event, index) => {
        if (selectedIds.includes(index)) {
            setSelectedIds(selectedIds.filter((i) => i !== index));
        } else {
            setSelectedIds([...selectedIds, index]);
        }
    };

    useEffect(() => {
        sethour(getCurrentHourIn24Format());
        const interval = setInterval(() => {
            sethour(getCurrentHourIn24Format());
        }, 1000);

        return () => clearInterval(interval);
    }, []);


    return <>
        <nav className={styles.navbar}>
            <p className={styles.time}>{new Date().toLocaleDateString()}<br />{hour}</p>
            <ul className={styles.item} onClick={(event) => handleClick(event, 0)}>Nav</ul>
            <ul className={styles.item} onClick={(event) => handleClick(event, 1)}>Vault</ul>
            <ul className={styles.item} onClick={(event) => handleClick(event, 2)}>SSH</ul>
            <ul className={styles.item} onClick={(event) => handleClick(event, 3)}>Your account</ul>
            <ul className={styles.item} onClick={(event) => handleClick(event, 4)}>Admin</ul>
        </nav>

        {
            selectedIds.map(id => (
                [
                    <FloatingWindow
                        key={0}
                        width={600}
                        height={400}
                        title="Nav"
                        onClose={(event) => handleClick(event, 0)}
                    >
                        <p>test</p>
                    </FloatingWindow>,
                    <FloatingWindow
                        key={1}
                        width={600}
                        height={500}
                        title="Vault"
                        onClose={(event) => handleClick(event, 1)}
                    >
                        <Vault />
                    </FloatingWindow>,
                    <FloatingWindow
                        key={2}
                        width={600}
                        height={600}
                        title="SSH"
                        onClose={(event) => handleClick(event, 2)}
                    >
                        <TerminalDynamic />
                    </FloatingWindow>,
                    <FloatingWindow
                        key={3}
                        width={600}
                        height={400}
                        title="Your account"
                        onClose={(event) => handleClick(event, 3)}
                    >
                        <p>test</p>
                    </FloatingWindow>,
                    <FloatingWindow
                        key={4}
                        width={600}
                        height={400}
                        title="Admin"
                        onClose={(event) => handleClick(event, 4)}
                    >
                        <p>test</p>
                    </FloatingWindow>
                ][id]
            ))
        }
    </>;
};

export default Navbar;
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import styles from '../styles/Navbar.module.scss'
import FloatingWindow from './FloatingWindow';
import Vault from './Vault';
import FeatherIcon from 'feather-icons-react';
import TotpApp from './TotpApp';
import UserInfos from './UserInfos';
import Navigation from './Navigation';

const Navbar = ({ User, Token }) => {

    const [selectedIds, setSelectedIds] = useState([]);

    const [focusid, setfocusid] = useState(0);

    const select = (index) => {
        if (selectedIds.includes(index)) {
            setSelectedIds(selectedIds.filter((i) => i !== index));
        } else {
            setSelectedIds([...selectedIds, index]);
        }
    };

    return <>
        <nav className={styles.navbar}>
            <div className={styles.watermark}>
                <img src="/logo.png" className={styles.img}></img>
                <h2 className={styles.title}>Drayneur</h2>
            </div>
            <ul className={styles.item} onClick={() => select(0)}><FeatherIcon icon="navigation" /> Nav</ul>
            <ul className={styles.item} onClick={() => select(1)}><FeatherIcon icon="lock" /> Vault</ul>
            <ul className={styles.item} onClick={() => select(2)}><FeatherIcon icon="key" /> 2FA</ul>
            <ul className={styles.item} onClick={() => select(3)}><FeatherIcon icon="user" /> Your account</ul>
            <ul className={styles.item} onClick={() => select(4)}><FeatherIcon icon="box" /> Admin</ul>
        </nav>

        {
            selectedIds.map(id => (
                [
                    <FloatingWindow
                        key={0}
                        id={0}
                        width={750}
                        height={600}
                        title="Nav"
                        onClose={() => select(0)}

                        focusid={focusid}
                        setfocusid={setfocusid}
                    >
                        <Navigation Token={Token} />
                    </FloatingWindow>,
                    <FloatingWindow
                        key={1}
                        id={1}
                        width={400}
                        height={500}
                        title="Vault"
                        onClose={() => select(1)}

                        focusid={focusid}
                        setfocusid={setfocusid}
                    >
                        <Vault Token={Token} />
                    </FloatingWindow>,
                    <FloatingWindow
                        key={2}
                        id={2}
                        width={300}
                        height={450}
                        title="2FA"
                        onClose={() => select(2)}

                        focusid={focusid}
                        setfocusid={setfocusid}
                    >
                        <TotpApp Token={Token} />
                    </FloatingWindow>,
                    <FloatingWindow
                        key={3}
                        id={3}
                        width={600}
                        height={400}
                        title="Your account"
                        onClose={() => select(3)}

                        focusid={focusid}
                        setfocusid={setfocusid}
                    >
                        <UserInfos User={User} Token={Token} />
                    </FloatingWindow>,
                    <FloatingWindow
                        key={4}
                        id={4}
                        width={600}
                        height={400}
                        title="Admin"
                        onClose={() => select(4)}

                        focusid={focusid}
                        setfocusid={setfocusid}
                    >
                        <p>test</p>
                    </FloatingWindow>
                ][id]
            ))
        }
    </>;
};

export default Navbar;
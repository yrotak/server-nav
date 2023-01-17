import Head from 'next/head'
import { useEffect, useState } from 'react';
import styles from '../styles/Home.module.scss'
import LoginForm from '../components/LoginForm';
import TotpForm from '../components/TotpForm';
import U2fForm from '../components/U2fForm';
import { getCookie } from '../utils/cookies';
import axios from 'axios';
import { NotificationManager } from 'react-notifications';
import Navbar from '../components/Navbar';
import FloatingWindow from '../components/FloatingWindow';

export default function Home() {

    const [CurrentChallenge, setCurrentChallenge] = useState(0);

    const [Token, setToken] = useState("");

    const [LoggedIn, setLoggedIn] = useState(false);

    const [User, setUser] = useState({});

    function updateUserData() {
        let cook = getCookie("token")
        if (cook) {
            axios.post(`${window.location.origin}/api/v1/Users/checkToken`, {}, {
                'headers': {
                    'Authorization': cook
                }
            }).then(res => {
                setToken(cook)
                setUser(res.data)
                console.log(res.data);
                setLoggedIn(true)
                NotificationManager.success('Welcome back captain !', 'Logged In !');
            })
        }
    }

    useEffect(() => {
        updateUserData()
    }, []);
    return (
        <div className={styles.container}>
            <Head>
                <title>Server portal</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                {
                    !LoggedIn ? (function () {
                        return [
                            <LoginForm key={0} setCurrentChallenge={setCurrentChallenge} setToken={setToken} />,
                            <TotpForm key={1} setCurrentChallenge={setCurrentChallenge} setToken={setToken} Token={Token} />,
                            <U2fForm key={2} setLoggedIn={setLoggedIn} setToken={setToken} Token={Token} updateUserData={updateUserData} />
                        ][CurrentChallenge]
                    }).call(this) : <>
                        <Navbar User={User} Token={Token} />
                        <img className={styles.logo} src="/logo.png"></img>
                    </>
                }
            </main>
        </div>
    )
}

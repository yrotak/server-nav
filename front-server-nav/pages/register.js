import Head from 'next/head'
import { useState } from 'react';
import styles from '../styles/Register.module.scss'
import RegisterForm from '../components/RegisterForm';

export default function Register() {

    return (
        <div className={styles.container}>
            <Head>
                <title>Server portal</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>
                    Server portal
                </h1>

                <p className={styles.description}>
                    Register here
                </p>
                <RegisterForm />
            </main>
        </div>
    )
}

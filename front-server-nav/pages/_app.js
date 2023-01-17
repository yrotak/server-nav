import '../styles/globals.scss'
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  return <>
    <Component {...pageProps} />
    <NotificationContainer />
  </>
}

export default MyApp

import '../styles/globals.scss'
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';

function MyApp({ Component, pageProps }) {
  return <> <Component {...pageProps} /><NotificationContainer /></>
}

export default MyApp

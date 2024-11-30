import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/editor-style.css'
import './styles/viewer-style.css'
import './styles/home-style.css'

createRoot(document.getElementById('root')!).render(
  <App />
)

//export const server_ip = "https://port-0-notice-backend-m3lin2251ce3a47e.sel4.cloudtype.app";
export const server_ip = "http://192.168.219.103:5000";
export const adminEmail = "yoonuooh@naver.com";
export const wikiEmail = ["yoonuooh@naver.com"];
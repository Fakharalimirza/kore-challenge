import type {Metadata} from 'next';
import './globals.css';
import PwaBoot from '../components/pwa';
export const metadata:Metadata={title:'Kore fitness challenge — Event Desk',description:'Registration, coach stations, result approval and live leaderboards for Kore fitness challenge.',manifest:'/manifest.webmanifest',themeColor:'#ffce00',appleWebApp:{capable:true,statusBarStyle:'default',title:'Kore fitness challenge'},icons:{icon:'/favicon.svg',apple:'/icons/apple-touch-icon.png'}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><head><link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/><link href="https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&display=swap" rel="stylesheet"/></head><body><PwaBoot/>{children}</body></html>}

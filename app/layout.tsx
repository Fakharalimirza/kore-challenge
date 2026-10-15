import type {Metadata} from 'next';
import './globals.css';
import PwaBoot from '../components/pwa';
export const metadata:Metadata={title:'Kore challenge — Event Desk',description:'Registration, coach stations, result approval and live leaderboards for Kore challenge.',manifest:'/manifest.webmanifest',themeColor:'#087f70',appleWebApp:{capable:true,statusBarStyle:'default',title:'Kore challenge'},icons:{icon:'/favicon.svg',apple:'/icons/apple-touch-icon.png'}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body><PwaBoot/>{children}</body></html>}

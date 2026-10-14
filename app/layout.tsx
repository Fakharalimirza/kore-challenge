import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Kore challenge — Event Desk',description:'Registration, coach stations, result approval and live leaderboards for Kore challenge.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}

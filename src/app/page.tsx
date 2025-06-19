import StartNavbar from './start-components/startnavbar';
import StartBody from './start-components/startbody';
import StartFooter from './start-components/startfooter';

export default function Home() {
    return (
        <>
            <StartNavbar />
            <div className="pt-24">{/* Add top padding to push content below navbar */}
                <StartBody />
                <StartFooter/>
                
                <h1>welcome</h1>
            </div>
        </>
    );
}
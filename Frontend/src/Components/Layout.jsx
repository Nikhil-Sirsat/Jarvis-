import { Outlet } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "../Context/ThemeContext.jsx";

export default function Layout() {
    const { mode } = useContext(ThemeContext);

    return (
        <>
            {/* navbar */}
            <main className="hero-cont" style={{ backgroundColor: mode == 'dark' ? "#212121" : 'white', height: '91vh', overflow: 'scroll', paddingBottom: 0 }}>
                <Outlet />
            </main>
            {/* footer */}
        </>
    );
}
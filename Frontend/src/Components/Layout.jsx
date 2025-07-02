import { Outlet } from "react-router-dom";

export default function Layout() {
    return (
        <>
            {/* navbar */}
            <main className="hero-cont">
                <Outlet />
            </main>
            {/* footer */}
        </>
    );
}
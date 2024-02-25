import Link from 'next/link';

const Navbar: React.FC = () => {
    return (
        <nav>
            <ul>
                <li>
                    <Link href="/">Navbar</Link>
                </li>
                <li>
                    <Link href="/">a ser</Link>
                </li>
                <li>
                    <Link href="/">definida</Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;

import Link from 'next/link';

const Navbar: React.FC = () => {
    return (
        <nav className="flex items-center justify-between flex-wrap bg-gray-500 p-6">
                    <Link href="/">Navbar</Link>
                    <Link href="/">a ser</Link>
                    <Link href="/">definida</Link>
        </nav>
    );
};

export default Navbar;

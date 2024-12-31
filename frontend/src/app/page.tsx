import Image from "next/image";
export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: "#FFFCEC" }}>
      <Image
      src="./logo-svg-27.svg"
      alt="Bemte.li"
      width={500}
      height={500}
      className="w-1/2 h-1/2 md:w-1/3 md:h-1/3"
      />
    </div>
  );
}

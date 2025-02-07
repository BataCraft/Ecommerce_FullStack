import Link from "next/link"

const Slider = () => {
  return (
    <div className="border-r border-gray-200 hidden md:flex justify-center pt-16 h-svh w-[10rem] ">
        <ul>
            <li><Link href={'/dashboard'}>Dashboard</Link></li>
        </ul>
    </div>
  )
}
export default Slider
import { Button } from "@/components/ui/button"

const Signin = () => {
  return (
    <div className="w-full h-svh normalflex">
        <div className="w-full sm:w-1/2 md:w-1/3 bg-white shadow-md p-8 text-center">
            <h1 className="text-3xl font-bold">Admin Panel Sign In!</h1>
            <form>
                <div className="flex items-center flex-col gap-4 mt-8">
                    <input type="email" name="email" id="email"  placeholder="Email Address" className="border border-gray-300 w-full px-4 rounded-md py-3 outline-none"/>
                    <input type="password" name="password" id="password" placeholder="Password" className="border border-gray-300 w-full px-4 rounded-md py-3 outline-none" />
                </div>
                <div className="mt-10">
                    <Button className="w-2/5 bg-primaryColor text-white">Sign In</Button>
                </div>
            </form>
        </div>
    </div>
  )
}
export default Signin
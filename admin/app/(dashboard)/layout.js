import Slider from "@/components/ui/custom/Slider"


const DashboardLayout = ({children})=>{
    return(
        <div className="flex min-h-screen">
           <aside className="fixed inset-y-0 left-0 w-64 z-30"> <Slider /></aside>
<main className="flex-1">
    
                <div className=" p-8 ml-64">
                    
                    {children}
    

    
                </div>
</main>
        </div>
    )

};


export default DashboardLayout;
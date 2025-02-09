import Slider from "@/components/ui/custom/Slider"


const DashboardLayout = ({children})=>{
    return(
        <div className="flex">
            <Slider/>

            <div className="flex-1 p-8">
                
                {children}

            </div>
        </div>
    )

};


export default DashboardLayout;
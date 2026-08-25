import { Outlet } from 'react-router-dom'

export default function AppLayout(){
    return(
        <div className="w-full h-full">  
            <Outlet></Outlet>
        </div>
    )
}
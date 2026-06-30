import React from 'react'
import { LayoutDashboardIcon , ListCollapseIcon,ListIcon,PlusSquareIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { assets } from '../../assets/assets'


const AdminSidebar = () => {


    const user={
        firstName: 'Admin',
        lastName : 'User',
        imageUrl : assets.profile
    }

    const adminNavlinks = [
      { name: 'Dashboard' , path: '/admin', icon : LayoutDashboardIcon},
      {name: 'Add Shows', path: '/admin/add-shows', icon:PlusSquareIcon },
      { name: 'List Shows', path: '/admin/list-shows', icon: ListIcon},
      { name: 'List Bookings', path: '/admin/list-bookings', icon:ListCollapseIcon},
    ]
    

  return (
    <div className='flex flex-col items-center pt-8 max-w-13 md:max-w-60 w-full border-r border-gray-300/20 text-sm'>
       <img className='h-9 md:h-14 w-9 md:w-14 rounded-full mx-auto ' src={user.imageUrl} alt="sidebar" />
       <p className='mt-2 mb-4 text-base'>{user.firstName}  {user.lastName}</p>
       <div className='w-full'>
        {adminNavlinks.map((link,index)=>{
          const IconComponent = link.icon;
          
            return(
            <div className='flex items-center justify-center gap-1 px-12'>
            <NavLink key={index} to={link.path} className={'relative flex items-center gap-2 w-full py-2.5 text-gray-400 hover:bg-[#f84565]/15 hover:text-[#f84565] group'}>
              
                <IconComponent className='w-5 h-5 ' />
                <p className='max-md:hidden'>{link.name}</p>
             
            </NavLink>
             </div>
            );
        
        })}

       </div>
    </div>
  )
}

export default AdminSidebar
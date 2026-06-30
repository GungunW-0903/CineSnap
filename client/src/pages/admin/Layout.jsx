import React from 'react'
import AdminSidebar from '../../components/Admin/AdminSidebar'
import AdminNavbar from '../../components/Admin/AdminNavbar'
import { Outlet } from 'react-router-dom'

const Layout = () => {
  return (
   <>
   <AdminNavbar />
   <div className='flex'>
<AdminSidebar />
  <div className='flex-1 px-4 py-10 md:px-10 overflow-y-auto'>
    <Outlet />
  </div>
   </div>
   </>
  )
}

export default Layout
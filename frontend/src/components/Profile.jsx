import React from 'react'

export default function Profile({user}) {
  return (
    <div className='col-md-1'>
        Logged in as {user?.user?.username}<br />
        <span>{new Date().toLocaleString()}</span>
        {/* <img src="avatar.png" alt="Avatar" className="avatar"></img> */}
        {/* <div class="p-5"> 

    <div class="rounded-circle border d-flex justify-content-center align-items-center"
         style={{width: '100px', height: '100px'}}
      alt="Avatar">
    <i class="fas fa-user-alt fa-3x text-info"></i>
    </div>
  
  </div> */}
   {/* <div class="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary text-white" style={{width: '48px', height: '48px'}}>
        <i class="bi bi-person-fill fs-4"></i>
    </div> */}
    </div>
  )
}

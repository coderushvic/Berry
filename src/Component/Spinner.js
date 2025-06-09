import React from 'react'

const Spinner = () => {
  return (
  
<div className="flex justify-center items-center h-full fixed w-full z-[100] bg-white top-0 left-0 right-0 bottom-0">
    <div className="w-[50px] h-[50px] border-[6px] border-[#6c6c6c] mt-[-20%] border-dashed rounded-full animate-spin marco"></div>
  </div>
  )
}

export default Spinner
import React from 'react'
import TasksMenu from './TasksMenu'

function Task() {
  return (
    <div className='w-full'>
      <p className="mb-5 text-2xl font-semibold text-black ">Tasks</p>

        <TasksMenu/>

    </div>
  )
}

export default Task
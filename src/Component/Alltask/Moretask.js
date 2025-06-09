import { useState } from 'react';
import ManualTasks from './ManualTasks';
import { BsCheck2Circle } from 'react-icons/bs';
import { useUser } from '../../context/userContext';
import YoutubeTasks from './YoutubeTasks';


const Moretask = () => {
  const [showTasks, setShowTasks] = useState(false);
  const { completedDailyTasks, completedYoutubeTasks, tasks, dailyTasks, youtubeTasks, completedTasks } = useUser(); // Assuming 'id' is the user's document ID in Firestore

  const completedTaskList = tasks.filter(task => completedTasks.includes(task.id));
  const completedDailyTaskList = dailyTasks.filter(taskd => completedDailyTasks.includes(taskd.id));
  const completedYoutubeTaskList = youtubeTasks.filter(taskd => completedYoutubeTasks.includes(taskd.id));


  const toggleTasks = () => {
    setShowTasks(!showTasks);
  };

  const formatNumber = (number) => {
    if (number === undefined || number === null || isNaN(number)) {
      return '';
    }
  
    if (number >= 1000000) {
      return (number / 1000000).toFixed() + 'M';
    } else if (number >= 100000) {
      return (number / 1000).toFixed(0) + 'K';
    } else {
      return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }
  };


  return (
    <div>
      {/* Show "Show more tasks" button when the list is not visible */}
      {!showTasks && (
        
        <button
          onClick={toggleTasks}
          className="mx-auto mb-8 flex items-center gap-1 font-medium hover:underline text-black"
        >
          Show more tasks < img src='/chevrondownIcon.svg' alt="chevrondownIcon" className="h-5 w-5" />
        </button>
      )}

      {/* Task List - visible only when 'showTasks' is true */}
      {showTasks && (
        <div className='w-full'>
          <ManualTasks/>
          <YoutubeTasks/>


          <div className={`w-full flex items-end justify-center flex-col space-y-4 pb-4`}>

          {completedTaskList.map(task => (
        <div key={task.id} className="w-full relative flex items-center gap-4 rounded-lg border-dashed border-[2px] p-3">
          <div className="grid grow gap-1.5">
            <span className="font-medium leading-tight text-black">
              {task.title}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-black">
                +{formatNumber(task.bonus)} NEWCATS
              </span>
              <span className="h-5 w-px bg-border bg-slate-200"></span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center justify-center whitespace-nowrap font-medium bg-[#f5faf4] py-[6px] w-fit px-[20px] rounded-[50px]">
              <BsCheck2Circle size={24} className='text-[#43b86a]'/>
            </button>
          </div>
        </div>
      ))}
          {completedDailyTaskList.map(taskd => (
        <div key={taskd.id} className="w-full relative flex items-center gap-4 rounded-lg border-dashed border-[2px] p-3">
          <div className="grid grow gap-1.5">
            <span className="font-medium leading-tight text-black">
              {taskd.title}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-black">
                +{formatNumber(taskd.bonus)} NEWCATS
              </span>
              <span className="h-5 w-px bg-border bg-slate-200"></span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center justify-center whitespace-nowrap font-medium bg-[#f5faf4] py-[6px] w-fit px-[20px] rounded-[50px]">
              <BsCheck2Circle size={24} className='text-[#43b86a]'/>
            </button>
          </div>
        </div>
      ))}

{completedYoutubeTaskList.map(taskd => (
        <div key={taskd.id} className="w-full relative flex items-center gap-4 rounded-lg border-dashed border-[2px] p-3">
          <div className="grid grow gap-1.5">
            <span className="font-medium leading-tight text-black">
              {taskd.title}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-black">
                +{formatNumber(taskd.bonus)} NEWCATS
              </span>
              <span className="h-5 w-px bg-border bg-slate-200"></span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center justify-center whitespace-nowrap font-medium bg-[#f5faf4] py-[6px] w-fit px-[20px] rounded-[50px]">
              <BsCheck2Circle size={24} className='text-[#43b86a]'/>
            </button>
          </div>
        </div>
      ))}

</div>


          {/* "Show less tasks" button at the bottom of the task list */}
          <button
            onClick={toggleTasks}
            className="mx-auto flex items-center gap-1 font-medium hover:underline text-black"
          >
            Show less tasks <img src='/chevronupIcon.svg' alt="chevronupIcon" className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Moretask;

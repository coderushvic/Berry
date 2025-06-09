import React, { useCallback } from 'react';
import { PiYoutubeLogoBold } from "react-icons/pi";
import { BsCheck2Circle } from 'react-icons/bs';
import { IoCheckmarkCircleSharp } from 'react-icons/io5';
import { useAdsgram } from './useAdsgram';

export function ShowAdButton() {
  const onReward = useCallback(() => {
    alert('Reward granted!');
  }, []);

  const onError = useCallback((result) => {
    alert(`Ad error: ${JSON.stringify(result, null, 4)}`);
  }, []);

  const showAd = useAdsgram({ blockId: 'your-block-id', onReward, onError });
  const [adCompleted, setAdCompleted] = React.useState(false);

  return (
    <div className="mb-4 grid gap-3">
      {/* Ads Task Button Styled Like YouTube Task */}
      <div className={`${adCompleted ? 'hidden invisible' : 'flex visible'} relative items-center gap-4 rounded-lg border p-3`}>
        <div className="grid grow gap-1.5">
          <span className="font-medium leading-tight text-black">
            Watch Ad for Rewards
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-black">
              +500 NEWCATS
            </span>
            <span className="h-5 w-px bg-slate-200"></span>

            <button
              onClick={() => {
                showAd();
                setAdCompleted(true);
              }}
              className={`inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground px-3 text-sm h-7 w-16 rounded-full text-black hover:bg-slate-100`}
            >
              Check
            </button>
          </div>
        </div>
        
        {/* Icon Button to Perform the Ad Task */}
        <button
          className={`${adCompleted ? 'hidden' : 'grid'} items-center justify-center whitespace-nowrap font-medium text-primary-foreground px-4 py-2 h-8 w-16 place-content-center rounded-full bg-gradient-to-tr from-red-400 to-red-700 hover:bg-white`}
        >
          <PiYoutubeLogoBold className='text-white size-6'/>
        </button>

        {/* Task Completion Checkmark */}
        {adCompleted && (
          <div className="flex items-center gap-2">
            <button
              className="flex items-center justify-center bg-[#f5faf4] py-[6px] w-fit px-[20px] rounded-[50px]"
              onClick={() => {}}
              disabled
            >
              <BsCheck2Circle size={24} className='text-[#43b86a]' />
            </button>
          </div>
        )}
      </div>

      {/* Completion Notification */}
      {adCompleted && (
        <div className="fixed left-0 right-0 top-4 z-[60] items-center justify-center px-4 flex ease-linear duration-150">
          <span className="text-accent text-[13px] w-full bg-[#e1f2e8] font-medium text-[#227b3f] flex items-center space-x-1 shadow-md rounded-[8px] py-4 px-4">
            <IoCheckmarkCircleSharp size={20} className='text-[#0c883a]' />
            <span>Meow! Task is Completed 🐈‍⬛</span>
          </span>
        </div>
      )}
    </div>
  );
}
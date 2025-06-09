import React, { useState } from 'react';
import { IoClose } from "react-icons/io5";
import { updateDoc, doc, arrayUnion, increment } from 'firebase/firestore';
import { db } from '../../firebase/firestore';
import { useUser } from '../../context/userContext';
import { BsCheck2Circle } from 'react-icons/bs';

const platforms = [
  {
    name: 'OKX',
    logo: '/okx-logo.png',
    buttonText: 'Complete',
    modalTitle: 'More NewCats with OKX',
    modalDescription: 'Complete tasks with OKX to earn NEWCATS',
    tasks: [
      { id: 'okx1', name: 'Join OKX & Verify', reward: 250, link: 'https://www.okx.com/join' },
      { id: 'okx2', name: 'Follow OKX X', reward: 10, link: 'https://twitter.com/okx' },
      { id: 'okx3', name: 'Follow OKX Telegram', reward: 10, link: 'https://t.me/okx' },
    ],
  },
  {
    name: 'Bitget',
    logo: '/bitget-logo.png',
    buttonText: 'Complete',
    modalTitle: 'More NewCats with Bitget',
    modalDescription: 'Complete tasks with Bitget to earn NEWCATS',
    tasks: [
      { id: 'bitget1', name: 'Join Bitget & Verify', reward: 100, link: 'https://www.bitget.com/register' },
      { id: 'bitget2', name: 'Follow Bitget X', reward: 50, link: 'https://twitter.com/bitgetglobal' },
      { id: 'bitget3', name: 'Join Bitget Discord', reward: 50, link: 'https://discord.gg/bitget' },
    ],
  },
  {
    name: 'Nomis Score',
    logo: '/nomis.svg',
    buttonText: 'Get Score',
    isSpecial: true,
    modalTitle: 'Nomis Score',
    modalDescription: 'Coming soon - check back later for rewards!',
  },
];

function Catsandfrens() {
  const [activeModal, setActiveModal] = useState(null);
  const { id, completedCatTasks, setTaskPoints, setBalance, setCompletedCatTasks } = useUser();

  const handleModalToggle = (platformName) => {
    setActiveModal(activeModal === platformName ? null : platformName);
  };

  const handleClickOutside = (e) => {
    if (e.target.id === 'modal-background') {
      setActiveModal(null);
    }
  };

  const performTask = async (taskId, reward) => {
    try {
      const userDocRef = doc(db, 'telegramUsers', id);
      await updateDoc(userDocRef, {
        balance: increment(reward),
        catsAndFriends: arrayUnion(taskId),
        taskPoints: increment(reward)
      });
      setCompletedCatTasks(prev => [...prev, taskId]);
      setBalance(prevBalance => prevBalance + reward);
      setTaskPoints(prevTaskPoints => prevTaskPoints + reward);
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  return (
    <div className='w-full pb-14'>
      <h2 className="mb-6 text-2xl font-bold text-gray-800">
        NewCats <span className="text-gray-600">&amp;</span> Friends
      </h2>
      
      <div className="grid gap-4">
        {platforms.map((platform) => (
          <div key={platform.name} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  platform.isSpecial 
                    ? 'bg-gradient-to-tr from-indigo-100 to-purple-100' 
                    : 'bg-gradient-to-tr from-blue-50 to-cyan-50'
                }`}>
                  <img src={platform.logo} alt={platform.name} className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-gray-800">{platform.name}</h3>
              </div>
              <button
                onClick={() => handleModalToggle(platform.name)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  platform.isSpecial
                    ? 'bg-gradient-to-tr from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } transition-colors`}
              >
                {platform.buttonText}
              </button>
            </div>
          </div>
        ))}
      </div>

      {platforms.map((platform) => (
        <Modal
          key={platform.name}
          isOpen={activeModal === platform.name}
          onClose={() => setActiveModal(null)}
          onClickOutside={handleClickOutside}
          title={platform.modalTitle}
          description={platform.modalDescription}
          tasks={platform.tasks}
          performTask={performTask}
          completedCatTasks={completedCatTasks}
          isSpecial={platform.isSpecial}
        />
      ))}
    </div>
  );
}

function Modal({ isOpen, onClose, onClickOutside, title, description, tasks, performTask, completedCatTasks, isSpecial }) {
  return (
    <div
      id="modal-background"
      className={`${isOpen ? 'flex' : 'hidden'} fixed inset-0 bg-black bg-opacity-50 justify-center items-center z-50 transition-opacity`}
      onClick={onClickOutside}
    >
      <div className={`bg-white rounded-2xl w-full max-w-lg mx-4 transform transition-all ${
        isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
      style={{
        maxHeight: 'calc(100vh - 120px)',
        marginBottom: '80px', // Extra space to avoid footer overlap
        overflowY: 'auto'
      }}>
        <div className="p-4 sticky top-0 bg-white z-10 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-800">{title}</h3>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <IoClose size={24} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-4">
          {isSpecial ? (
            <div className="py-8 text-center">
              <div className="bg-indigo-50 rounded-full p-4 w-20 h-20 mx-auto flex items-center justify-center mb-4">
                <img src="/nomis.svg" alt="Nomis" className="w-12 h-12" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800">Coming Soon</h4>
              <p className="text-gray-600 mt-2">We're working on bringing you Nomis Score rewards!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800">{task.name}</h4>
                    <p className="text-sm text-blue-600 font-medium mt-1">
                      +{task.reward} NEWCATS
                    </p>
                  </div>
                  {completedCatTasks.includes(task.id) ? (
                    <div className="bg-green-100 p-2 rounded-full">
                      <BsCheck2Circle className="text-green-600" size={18} />
                    </div>
                  ) : (
                    <a
                      href={task.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => performTask(task.id, task.reward)}
                      className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                      Open
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Catsandfrens;

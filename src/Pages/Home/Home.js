// src/pages/Home.js
import React from 'react';
import Header1 from '../../Component/Header/Header1';
import CatsCounter from '../../Component/Alltask/CatsCounter';
import Dailytask from '../../Component/Alltask/Dailytask';
import Task from '../../Component/Alltask/Task';
import Moretask from '../../Component/Alltask/Moretask';
import Catsandfrens from '../../Component/Alltask/Catsandfrens';
import { useUser } from '../../context/userContext';
import RewardPage from '../../Component/Checking/RewardPage';
import Footer from '../../Component/Footer/Footer';
import Spinner from '../../Component/Spinner';

const Home = () => {

  const {checker, loading} = useUser();

  return (
    <>
    {loading ? (
      <Spinner/>
    ) : (
      <>
   {/* Blue header with subtle gradient */}
<div className="App w-full min-h-[400] bg-gradient-to-r from-[#3A59D1] to-[#4A69E1] text-white pb-6">
    <Header1 />
</div>

      

      {/* White background for the rest of the page */}
      <div className="bg-white min-h-screen p-5 rounded-t-[20px] -mt-6 z-10">
        <CatsCounter />
        <Dailytask />
        <Task />
        <Moretask />
        <Catsandfrens />
        <Footer/>
      </div>

    {/* welcome modal */}

{/* {balance > 0 ? (
<>

</>
) : (
  <> */}

  {checker && (
    <RewardPage/>
  )}
  {/* </>
)} */}

    </>
    )}


    </>
  );
};

export default Home;

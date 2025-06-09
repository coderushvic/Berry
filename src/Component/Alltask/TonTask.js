  import React, { useEffect, useState } from 'react';
  import { doc, increment, updateDoc } from 'firebase/firestore';
  import { db } from '../../firebase/firestore';
  import { TonConnectButton, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
  import { useUser } from '../../context/userContext';
  import { IoCheckmarkCircleSharp, IoClose } from 'react-icons/io5';
  
  const TonTask = () => {
    const { id, balance, setBalance, tonTasks, setTaskPoints, setTonTasks, tonTransactions, setTonTransactions } = useUser();
    // eslint-disable-next-line
    const [isLoading, setIsLoading] = useState(true);
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [openUpgrade, setOpenUpgrade] = useState(false);
    const [showCongratsModal, setShowCongratsModal] = useState(false);
    const [congratsMessage, setCongratsMessage] = useState("");
    const [buttonText, setButtonText] = useState("Make Purchase");
    const [message, setMessage] = useState("");
    const [messageColor, setMessageColor] = useState("");
    const wallets = useTonWallet();
    const [tonConnectUI] = useTonConnectUI();
    const [congrats, setCongrats] = useState(false);
    const bonusAward = 2000;
    const cost = '100000000';
    const price = 0.1;
  
    useEffect(() => {
      const initializeTonConnect = async () => {
        try {
          await tonConnectUI.connectionRestored;
          setIsLoading(false);
        } catch (err) {
          console.error('TonConnect initialization error:', err);
          setMessage(`TonConnect error: ${err.message}`);
          setMessageColor("text-red-500");
          setIsLoading(false);
        }
      };
      initializeTonConnect();
    }, [tonConnectUI]);
  
    const transaction = (cost) => ({
      validUntil: Math.floor(Date.now() / 1000) + 300,
      messages: [
        {
          address: process.env.REACT_APP_TON_WALLET_ADDRESS,
          amount: cost,
        },
      ],
    });
  
    const handleClick = async () => {
      setButtonText("Processing...");
      setButtonDisabled(true);
  
      try {
        const response = await tonConnectUI.sendTransaction(transaction(cost));
        console.log('Transaction sent successfully', response);
  
        const newBalance = balance + bonusAward;
        const userRef = doc(db, 'telegramUsers', id.toString());
        await updateDoc(userRef, {
          balance: newBalance,
          tonTransactions: tonTransactions + 1,
          tonTasks: true,
          taskPoints: increment(bonusAward),
        });
        
        setBalance(newBalance);
        setTonTransactions(tonTransactions + 1);
        setTonTasks(true);
        setTaskPoints(prev => prev + bonusAward);
  
        setCongratsMessage(
          <div className="text-center space-y-4">
            <IoCheckmarkCircleSharp size={48} className="mx-auto text-green-500" />
            <h3 className="text-xl font-bold">Congratulations!</h3>
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-lg p-3 mx-auto max-w-xs">
              <p className="text-lg font-semibold">+2,000 NEWCATS CLAIMED</p>
            </div>
            <p className="text-gray-600">Task Completed Successfully</p>
            <p className="text-gray-500">
              Perform more activities to stay ahead and claim listing giveaway bonuses!
            </p>
          </div>
        );
  
        setShowCongratsModal(true);
        setOpenUpgrade(false);
        setCongrats(true);
        setTimeout(() => setCongrats(false), 3000);
        setMessage("");
        setMessageColor("text-green-500");
      } catch (err) {
        console.error('Transaction error:', err);
        setMessage("Transaction failed or canceled, please try again later.");
        setMessageColor("text-red-500");
      } finally {
        setButtonText("Make Purchase");
        setButtonDisabled(false);
      }
    };
  
    const closeUpgrader = () => {
      setOpenUpgrade(false);
      setMessage("");
    };
  
    const formatNumber = (num) => {
      return new Intl.NumberFormat().format(num).replace(/,/g, " ");
    };
  
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Daily Tasks</h2>
        
        {/* Task Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg text-gray-800">Make TON Great Again</h3>
              <p className="text-gray-600 flex items-center space-x-1">
                <span>+{formatNumber(bonusAward)}</span>
                <span className="font-medium text-gray-800">NEWCATS</span>
              </p>
            </div>
            
            {tonTasks ? (
              <div className="p-2 bg-green-100 rounded-full">
                <IoCheckmarkCircleSharp size={24} className="text-green-600" />
              </div>
            ) : (
              <button 
                onClick={() => setOpenUpgrade(true)}
                className="p-2 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
              >
                <img src="/ton-logo.png" alt="TON" className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
  
        {/* Purchase Modal */}
        {openUpgrade && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4">
            <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md shadow-xl animate-slide-up">
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-800">Make a TON Transaction</h3>
                  <button 
                    onClick={closeUpgrader}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <IoClose size={24} className="text-gray-500" />
                  </button>
                </div>
                
                <div className="flex flex-col items-center space-y-4">
                  <img src="/ton-logo.png" alt="TON" className="w-16 h-16" />
                  <p className="text-gray-600 text-center">
                    Making a TON transaction is a criteria for airdrop qualification!
                  </p>
                  
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <p className="text-sm font-medium">
                      Price: <span className="text-blue-600">{price} TON</span>
                    </p>
                  </div>
                </div>
  
                {wallets ? (
                  <div className="space-y-3">
                    <button
                      onClick={handleClick}
                      disabled={buttonDisabled}
                      className={`w-full py-3 rounded-xl font-medium ${
                        buttonDisabled 
                          ? 'bg-gray-300 text-gray-500' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      } transition-colors`}
                    >
                      {buttonText}
                    </button>
                    
                    {message && (
                      <p className={`text-center text-sm ${messageColor}`}>
                        {message}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="w-full">
                    <TonConnectButton className="w-full" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
  
        {/* Congrats Animation */}
        {congrats && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <img 
              src="/congrats.gif" 
              alt="Congratulations" 
              className="w-64 h-64 object-contain" 
            />
          </div>
        )}
  
        {/* Congrats Modal */}
        {showCongratsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-lg animate-fade-in">
              {congratsMessage}
              <button
                onClick={() => setShowCongratsModal(false)}
                className="w-full mt-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  export default TonTask;

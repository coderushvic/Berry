import { useState } from "react";
import Footer from "../../Component/Footer/Footer";
import { useUser } from "../../context/userContext";
import { FaLink, FaFacebook, FaWhatsapp, FaTelegram, FaTwitter, FaTimes } from "react-icons/fa";

const InviteFrens = () => {
  const { id, referrals = [], loading, processedReferrals = [] } = useUser();
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const totalReferralBonus = processedReferrals.reduce((total, referral) => {
    return total + (referral.refBonus || 0);
  }, 0);

  const copyToClipboard = () => {
    const reflink = `https://t.me/democatx_bot?start=r${id}\nDemoCatx game is live! Two is better than one! Join my squad, and let's double the fun (and earnings 🤑)! NewCatsX! 🚀`;

    navigator.clipboard
      .writeText(reflink)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      })
      .catch((err) => console.error("Failed to copy text: ", err));
  };

  const getInitials = (fullName = "") => {
    const nameParts = fullName.split(" ");
    return nameParts[0]?.charAt(0).toUpperCase() + (nameParts[1] ? nameParts[1].charAt(0).toUpperCase() : "");
  };

  const getRandomColor = () => {
    const colors = ["bg-red-400", "bg-blue-400", "bg-green-400", "bg-yellow-400", "bg-purple-400"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleShare = async () => {
    const shareData = {
      title: "NewCats!",
      url: `https://t.me/NewCats_Bot?start=r${id}\n`,
      text: "NewCats game is live! Two is better than one! Join my squad, and let's double the fun (and earnings 🤑)! NewCats! 🚀",
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        setShowShareModal(true);
      }
    } catch (error) {
      console.error("Error sharing content:", error);
    }
  };

  const formatNumber = (num) => {
    if (num < 100000) {
      return new Intl.NumberFormat().format(num).replace(/,/g, " ");
    } else if (num < 1000000) {
      return new Intl.NumberFormat().format(num).replace(/,/g, " ");
    } else {
      return (num / 1000000).toFixed(3).replace(".", ".") + " M";
    }
  };

  const shareOnSocialMedia = (platform) => {
    const shareUrl = `https://t.me/NewCats_Bot?start=r${id}`;
    const shareText = "NewCats game is live! Two is better than one! Join my squad, and let's double the fun (and earnings 🤑)! NewCatsX! 🚀";

    let url = "";
    switch (platform) {
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case "whatsapp":
        url = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
        break;
      case "telegram":
        url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
        break;
      default:
        break;
    }

    if (url) {
      window.open(url, "_blank");
      setShowShareModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-20 relative">
      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Invite Friends <br /> 
            <span className="text-blue-600">Earn More NEWCATS</span>
          </h1>
          <p className="text-gray-500">Share your link and get bonuses for every friend who joins</p>
        </div>

        {/* Cat Illustration */}
        <div className="relative flex justify-center items-center my-10 h-40">
          <img 
            src="/cat3.svg" 
            alt="main cat" 
            className="relative z-10 w-32 h-32 animate-float"
          />
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 text-center">
          <div className="text-lg font-medium text-gray-600 mb-1">Your Referral Bonus</div>
          <div className="text-2xl font-bold text-blue-600">
            {formatNumber(totalReferralBonus || 0)} <span className="text-gray-800">NEWCATS</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 mb-8">
          <button
            onClick={handleShare}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            Invite Friends
          </button>

          <button
            onClick={copyToClipboard}
            className={`w-full flex items-center justify-center space-x-2 font-semibold py-3 px-6 rounded-xl shadow-md transition-all duration-300 ${
              copied ? "bg-green-500 text-white" : "bg-gray-800 text-white hover:bg-gray-700"
            }`}
          >
            <FaLink className="text-lg" />
            <span>{copied ? "Link Copied!" : "Copy Referral Link"}</span>
          </button>
        </div>

        {/* Friends List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-lg text-gray-800">
              {referrals.length} {referrals.length === 1 ? "Friend" : "Friends"} Joined
            </h3>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading friends list...</div>
          ) : referrals.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-2">No friends joined yet</div>
              <p className="text-gray-500 text-sm">Invite friends to start earning bonuses</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {referrals.map((user, index) => (
                <div key={index} className="p-4 flex items-center hover:bg-gray-50 transition-colors">
                  <div className={`${getRandomColor()} w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold mr-3`}>
                    {getInitials(user.fullName || user.username || "N/A")}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{user.username || "Anonymous"}</div>
                  </div>
                  <div className="font-semibold text-blue-600">
                    +{formatNumber(user.refBonus || 0)} NEWCATS
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Share via</h2>
              <button 
                onClick={() => setShowShareModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 p-4">
              <ShareButton 
                platform="facebook" 
                icon={<FaFacebook size={24} />} 
                color="bg-blue-600" 
                onClick={() => shareOnSocialMedia("facebook")} 
              />
              <ShareButton 
                platform="whatsapp" 
                icon={<FaWhatsapp size={24} />} 
                color="bg-green-500" 
                onClick={() => shareOnSocialMedia("whatsapp")} 
              />
              <ShareButton 
                platform="telegram" 
                icon={<FaTelegram size={24} />} 
                color="bg-blue-400" 
                onClick={() => shareOnSocialMedia("telegram")} 
              />
              <ShareButton 
                platform="twitter" 
                icon={<FaTwitter size={24} />} 
                color="bg-blue-300" 
                onClick={() => shareOnSocialMedia("twitter")} 
              />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

const ShareButton = ({ platform, icon, color, onClick }) => (
  <button
    onClick={onClick}
    className={`${color} text-white rounded-xl p-4 flex flex-col items-center justify-center space-y-2 transition-transform hover:scale-105`}
  >
    <div className="text-2xl">{icon}</div>
    <span className="capitalize font-medium">{platform}</span>
  </button>
);

export default InviteFrens;

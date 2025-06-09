// AdminAdsSettings.js
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firestore";
import { useState, useEffect } from "react";

const AdminAdsSettings = () => {
  const [config, setConfig] = useState({
    bonus: 1000,
    dailyLimit: 50,
    cooldownSeconds: 5,
    ads: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      const docRef = doc(db, "adminConfig", "adsSettings");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setConfig(docSnap.data());
      }
      setLoading(false);
    };
    loadConfig();
  }, []);

  const handleSave = async () => {
    try {
      const docRef = doc(db, "adminConfig", "adsSettings");
      await updateDoc(docRef, config);
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings");
    }
  };

  const addNewAd = () => {
    setConfig(prev => ({
      ...prev,
      ads: [
        ...prev.ads,
        {
          id: `ad_${Date.now()}`,
          name: "",
          scriptSrc: "",
          zoneId: "",
          sdkVar: "",
          active: true,
          weight: 1
        }
      ]
    }));
  };

  const removeAd = (index) => {
    setConfig(prev => ({
      ...prev,
      ads: prev.ads.filter((_, i) => i !== index)
    }));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Ads Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block mb-2 font-medium">Reward Amount</label>
          <input
            type="number"
            value={config.bonus}
            onChange={(e) => setConfig({...config, bonus: parseInt(e.target.value) || 0})}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Daily Ad Limit</label>
          <input
            type="number"
            value={config.dailyLimit}
            onChange={(e) => setConfig({...config, dailyLimit: parseInt(e.target.value) || 0})}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Cooldown (seconds)</label>
          <input
            type="number"
            value={config.cooldownSeconds}
            onChange={(e) => setConfig({...config, cooldownSeconds: parseInt(e.target.value) || 0})}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Ad Providers</h2>
          <button
            onClick={addNewAd}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add New Ad
          </button>
        </div>

        {config.ads.map((ad, index) => (
          <div key={ad.id} className="border p-4 rounded-lg mb-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block mb-1 font-medium">Name</label>
                <input
                  type="text"
                  value={ad.name}
                  onChange={(e) => {
                    const newAds = [...config.ads];
                    newAds[index].name = e.target.value;
                    setConfig({...config, ads: newAds});
                  }}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Script Source</label>
                <input
                  type="text"
                  value={ad.scriptSrc}
                  onChange={(e) => {
                    const newAds = [...config.ads];
                    newAds[index].scriptSrc = e.target.value;
                    setConfig({...config, ads: newAds});
                  }}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
              <div>
                <label className="block mb-1 font-medium">Zone ID</label>
                <input
                  type="text"
                  value={ad.zoneId}
                  onChange={(e) => {
                    const newAds = [...config.ads];
                    newAds[index].zoneId = e.target.value;
                    setConfig({...config, ads: newAds});
                  }}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">SDK Variable</label>
                <input
                  type="text"
                  value={ad.sdkVar}
                  onChange={(e) => {
                    const newAds = [...config.ads];
                    newAds[index].sdkVar = e.target.value;
                    setConfig({...config, ads: newAds});
                  }}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Weight</label>
                <input
                  type="number"
                  value={ad.weight}
                  onChange={(e) => {
                    const newAds = [...config.ads];
                    newAds[index].weight = parseInt(e.target.value) || 1;
                    setConfig({...config, ads: newAds});
                  }}
                  className="w-full p-2 border rounded"
                  min="1"
                />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={ad.active}
                  onChange={(e) => {
                    const newAds = [...config.ads];
                    newAds[index].active = e.target.checked;
                    setConfig({...config, ads: newAds});
                  }}
                  className="mr-2"
                />
                Active
              </label>
              <button
                onClick={() => removeAd(index)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
      >
        Save Settings
      </button>
    </div>
  );
};

export default AdminAdsSettings;
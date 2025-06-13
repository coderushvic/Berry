import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firestore';
import { Button, Input, Switch, Card, message } from 'antd';
import { berryTheme } from '../../Theme';

const AdminAdManager = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newAd, setNewAd] = useState({
    id: '',
    scriptSrc: '',
    zoneId: '',
    sdkVar: '',
    active: false
  });

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const docRef = doc(db, 'adminConfig', 'adsSettings');
        const docSnap = await getDoc(docRef);
        setConfig(docSnap.exists() ? docSnap.data() : null);
      } catch (error) {
        console.error("Error loading config:", error);
        message.error("Failed to load ads configuration");
      } finally {
        setLoading(false);
      }
    };
    
    loadConfig();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateDoc(doc(db, 'adminConfig', 'adsSettings'), config);
      message.success("Ads configuration saved successfully!");
    } catch (error) {
      console.error("Error saving config:", error);
      message.error("Failed to save ads configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleAddAd = () => {
    if (!newAd.id || !newAd.scriptSrc || !newAd.zoneId || !newAd.sdkVar) {
      message.warning("Please fill all fields for the new ad provider");
      return;
    }
    
    setConfig(prev => ({
      ...prev,
      ads: [...(prev.ads || []), newAd]
    }));
    
    setNewAd({
      id: '',
      scriptSrc: '',
      zoneId: '',
      sdkVar: '',
      active: false
    });
    
    message.success("New ad provider added (remember to save)");
  };

  const toggleAdActive = (adId) => {
    setConfig(prev => ({
      ...prev,
      ads: prev.ads.map(ad => 
        ad.id === adId ? { ...ad, active: !ad.active } : ad
      )
    }));
  };

  if (loading) return <div>Loading ads configuration...</div>;
  if (!config) return <div>No ads configuration found</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Card 
        title="Advertisements Configuration" 
        style={{ marginBottom: '20px' }}
        headStyle={{ background: berryTheme.colors.primary, color: 'white' }}
      >
        <div style={{ marginBottom: '16px' }}>
          <h3>Global Settings</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label>Points Reward</label>
              <Input
                type="number"
                value={config.pointsBonus}
                onChange={e => setConfig({...config, pointsBonus: Number(e.target.value)})}
              />
            </div>
            <div>
              <label>Dollar Reward</label>
              <Input
                type="number"
                step="0.001"
                value={config.dollarBonus}
                onChange={e => setConfig({...config, dollarBonus: Number(e.target.value)})}
              />
            </div>
            <div>
              <label>Daily Limit (Regular)</label>
              <Input
                type="number"
                value={config.dailyLimit}
                onChange={e => setConfig({...config, dailyLimit: Number(e.target.value)})}
              />
            </div>
            <div>
              <label>Daily Limit (Premium)</label>
              <Input
                type="number"
                value={config.premiumDailyLimit}
                onChange={e => setConfig({...config, premiumDailyLimit: Number(e.target.value)})}
              />
            </div>
            <div>
              <label>Cooldown (minutes)</label>
              <Input
                type="number"
                value={config.cooldown / 60000}
                onChange={e => setConfig({...config, cooldown: Number(e.target.value) * 60000})}
              />
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <h3>Ad Providers</h3>
          {config.ads?.map(ad => (
            <Card 
              key={ad.id} 
              style={{ marginBottom: '10px' }}
              title={ad.id}
              extra={
                <Switch
                  checked={ad.active}
                  onChange={() => toggleAdActive(ad.id)}
                />
              }
            >
              <p><strong>Script Source:</strong> {ad.scriptSrc}</p>
              <p><strong>Zone ID:</strong> {ad.zoneId}</p>
              <p><strong>SDK Variable:</strong> {ad.sdkVar}</p>
            </Card>
          ))}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <h3>Add New Ad Provider</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input
              placeholder="Ad ID"
              value={newAd.id}
              onChange={e => setNewAd({...newAd, id: e.target.value})}
            />
            <Input
              placeholder="Script Source"
              value={newAd.scriptSrc}
              onChange={e => setNewAd({...newAd, scriptSrc: e.target.value})}
            />
            <Input
              placeholder="Zone ID"
              value={newAd.zoneId}
              onChange={e => setNewAd({...newAd, zoneId: e.target.value})}
            />
            <Input
              placeholder="SDK Variable"
              value={newAd.sdkVar}
              onChange={e => setNewAd({...newAd, sdkVar: e.target.value})}
            />
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Switch
                checked={newAd.active}
                onChange={checked => setNewAd({...newAd, active: checked})}
              />
              <span style={{ marginLeft: '8px' }}>Active</span>
            </div>
            <Button 
              type="primary" 
              onClick={handleAddAd}
              style={{ background: berryTheme.colors.primary }}
            >
              Add Provider
            </Button>
          </div>
        </div>

        <Button 
          type="primary" 
          onClick={handleSave}
          loading={saving}
          style={{ background: berryTheme.colors.success, borderColor: berryTheme.colors.success }}
        >
          Save Configuration
        </Button>
      </Card>
    </div>
  );
};

export default AdminAdManager;

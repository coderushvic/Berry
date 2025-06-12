import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/firestore';
import { berryTheme } from '../../Theme';
import styled from 'styled-components';
import { FaSave, FaSync, FaCoins, FaAd } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: ${berryTheme.fonts.main};
`;

const Header = styled.h1`
  color: ${berryTheme.colors.primaryDark};
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Section = styled.section`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: ${berryTheme.shadows.small};
`;

const SectionTitle = styled.h2`
  color: ${berryTheme.colors.primary};
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: ${berryTheme.colors.textDark};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${berryTheme.colors.grey300};
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;

  &:focus {
    border-color: ${berryTheme.colors.primary};
    outline: none;
    box-shadow: 0 0 0 3px ${berryTheme.colors.primaryLight};
  }
`;

const Button = styled.button`
  background: ${berryTheme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    background: ${berryTheme.colors.primaryDark};
    transform: translateY(-2px);
  }

  &:disabled {
    background: ${berryTheme.colors.grey300};
    cursor: not-allowed;
    transform: none;
  }
`;

const AdProviderCard = styled.div`
  background: ${berryTheme.colors.grey100};
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const AdProviderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;

  input {
    opacity: 0;
    width: 0;
    height: 0;

    &:checked + span {
      background-color: ${berryTheme.colors.primary};
    }

    &:checked + span:before {
      transform: translateX(26px);
    }
  }
`;

const Slider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${berryTheme.colors.grey300};
  transition: .4s;
  border-radius: 34px;

  &:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: ${berryTheme.shadows.small};
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${berryTheme.colors.primaryDark};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 1rem;
  color: ${berryTheme.colors.textSecondary};
`;

const AdminAdsSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Configuration state
  const [config, setConfig] = useState({
    pointsBonus: 1000,
    dollarBonus: 10.001,
    dailyLimit: 100,
    cooldown: 20,
    ads: [
      {
        id: "default_ad",
        scriptSrc: "//whephiwums.com/sdk.js",
        zoneId: "8693006",
        sdkVar: "show_8693006",
        active: true
      }
    ]
  });

  // Stats state
  const [stats, setStats] = useState({
    totalAdsWatched: 0,
    totalRewardsPaid: 0,
    todayAds: 0,
    activeUsers: 0
  });

  // Load configuration from Firestore
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const docRef = doc(db, "adminConfig", "adsSettings");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setConfig(docSnap.data());
        }
        
        // TODO: Load stats from your database
        // This is just placeholder data
        setStats({
          totalAdsWatched: 12453,
          totalRewardsPaid: 124530,
          todayAds: 342,
          activeUsers: 876
        });
        
      } catch (error) {
        console.error("Error loading config:", error);
        toast.error("Failed to load configuration");
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: name === 'cooldown' ? parseInt(value) : parseFloat(value)
    }));
  };

  const handleAdProviderChange = (index, field, value) => {
    const updatedAds = [...config.ads];
    updatedAds[index] = {
      ...updatedAds[index],
      [field]: field === 'active' ? !updatedAds[index].active : value
    };
    setConfig(prev => ({ ...prev, ads: updatedAds }));
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "adminConfig", "adsSettings"), config);
      toast.success("Configuration saved successfully!");
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminContainer>
        <Header>Loading AdTask Configuration...</Header>
      </AdminContainer>
    );
  }

  return (
    <AdminContainer>
      <ToastContainer position="bottom-right" />
      
      <Header>
        <FaAd /> AdTask Management
      </Header>
      
      {/* Rewards Configuration */}
      <Section>
        <SectionTitle>
          <FaCoins /> Rewards Configuration
        </SectionTitle>
        
        <FormGroup>
          <Label>Points Bonus per Ad</Label>
          <Input
            type="number"
            name="pointsBonus"
            value={config.pointsBonus}
            onChange={handleConfigChange}
          />
        </FormGroup>
        
        <FormGroup>
          <Label>Dollar Bonus per Ad</Label>
          <Input
            type="number"
            step="0.001"
            name="dollarBonus"
            value={config.dollarBonus}
            onChange={handleConfigChange}
          />
        </FormGroup>
        
        <FormGroup>
          <Label>Daily Ad Limit per User</Label>
          <Input
            type="number"
            name="dailyLimit"
            value={config.dailyLimit}
            onChange={handleConfigChange}
          />
        </FormGroup>
        
        <FormGroup>
          <Label>Cooldown Between Ads (minutes)</Label>
          <Input
            type="number"
            name="cooldown"
            value={config.cooldown}
            onChange={handleConfigChange}
          />
        </FormGroup>
      </Section>
      
      {/* Ad Providers */}
      <Section>
        <SectionTitle>
          <FaAd /> Ad Providers
        </SectionTitle>
        
        {config.ads.map((ad, index) => (
          <AdProviderCard key={ad.id}>
            <AdProviderHeader>
              <h3>Ad Provider #{index + 1}</h3>
              <ToggleSwitch>
                <input 
                  type="checkbox" 
                  checked={ad.active}
                  onChange={() => handleAdProviderChange(index, 'active')}
                />
                <Slider />
              </ToggleSwitch>
            </AdProviderHeader>
            
            <FormGroup>
              <Label>Script Source URL</Label>
              <Input
                type="text"
                value={ad.scriptSrc}
                onChange={(e) => handleAdProviderChange(index, 'scriptSrc', e.target.value)}
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Zone ID</Label>
              <Input
                type="text"
                value={ad.zoneId}
                onChange={(e) => handleAdProviderChange(index, 'zoneId', e.target.value)}
              />
            </FormGroup>
            
            <FormGroup>
              <Label>SDK Variable Name</Label>
              <Input
                type="text"
                value={ad.sdkVar}
                onChange={(e) => handleAdProviderChange(index, 'sdkVar', e.target.value)}
              />
            </FormGroup>
          </AdProviderCard>
        ))}
      </Section>
      
      {/* Statistics */}
      <Section>
        <SectionTitle>
          <FaSync /> Statistics
        </SectionTitle>
        
        <StatsContainer>
          <StatCard>
            <StatValue>{stats.totalAdsWatched.toLocaleString()}</StatValue>
            <StatLabel>Total Ads Watched</StatLabel>
          </StatCard>
          
          <StatCard>
            <StatValue>${stats.totalRewardsPaid.toLocaleString()}</StatValue>
            <StatLabel>Total Rewards Paid</StatLabel>
          </StatCard>
          
          <StatCard>
            <StatValue>{stats.todayAds.toLocaleString()}</StatValue>
            <StatLabel>Ads Today</StatLabel>
          </StatCard>
          
          <StatCard>
            <StatValue>{stats.activeUsers.toLocaleString()}</StatValue>
            <StatLabel>Active Users</StatLabel>
          </StatCard>
        </StatsContainer>
      </Section>
      
      {/* Save Button */}
      <Button onClick={saveConfig} disabled={saving}>
        <FaSave /> {saving ? 'Saving...' : 'Save Configuration'}
      </Button>
    </AdminContainer>
  );
};

export default AdminAdsSettings;
import { useUser } from '../../context/userContext';
import { useNavigate } from 'react-router-dom';
import { FiDollarSign,FiArrowLeft, FiCheckCircle, FiAlertCircle, FiX, FiInfo } from 'react-icons/fi';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { berryTheme } from '../../Theme';
import { db } from '../../firebase/firestore';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';

// Animation for shimmer effect

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${berryTheme.colors.backgroundGradient};
  padding-bottom: 80px;
`;

const PageHeader = styled.header`
  padding: ${berryTheme.spacing.large} ${berryTheme.spacing.medium} ${berryTheme.spacing.medium};
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${berryTheme.spacing.small};
  position: relative;
`;

const LogoImage = styled.img`
  height: 36px;
  width: auto;
`;

const LogoText = styled.span`
  font-size: 1.5rem;
  font-weight: ${berryTheme.fonts.bold};
  color: ${berryTheme.colors.primary};
`;

const MainContent = styled.div`
  flex: 1;
  padding: 24px;
  max-width: auto;
  margin: 0 auto;
  width: 100%;
`;

const BackButton = styled(motion.button)`
  position: absolute;
  left: 24px;
  padding: 8px;
  background: white;
  border-radius: 12px;
  border: 1px solid ${berryTheme.colors.grey200};
  box-shadow: ${berryTheme.shadows.small};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${berryTheme.colors.grey100};
  }
`;

const FormCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: ${berryTheme.shadows.small};
  border: 1px solid ${berryTheme.colors.grey200};
  margin-bottom: 24px;
`;

const BalanceCard = styled(motion.div)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: ${berryTheme.colors.primaryLight}15;
  border-radius: 12px;
  border: 1px solid ${berryTheme.colors.primaryLight}50;
`;

const BalanceLabel = styled.p`
  font-size: 0.875rem;
  color: ${berryTheme.colors.primary};
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BalanceAmount = styled.p`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${berryTheme.colors.primaryDark};
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${berryTheme.colors.textDark};
  margin-bottom: 8px;
`;

const InputGroup = styled.div`
  display: flex;
  border: 1px solid ${berryTheme.colors.grey300};
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s ease;
  &:focus-within {
    border-color: ${berryTheme.colors.primary};
    box-shadow: 0 0 0 2px ${berryTheme.colors.primaryLight}50;
  }
`;

const Input = styled.input`
  flex: 1;
  padding: 12px 16px;
  font-size: 1rem;
  border: none;
  outline: none;
`;

const MaxButton = styled(motion.button)`
  padding: 0 16px;
  background: transparent;
  border: none;
  border-left: 1px solid ${berryTheme.colors.grey200};
  font-weight: 600;
  color: ${berryTheme.colors.primary};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${berryTheme.colors.grey100};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const FeeBreakdown = styled(motion.div)`
  background: ${berryTheme.colors.grey50};
  padding: 16px;
  border-radius: 12px;
  border: 1px solid ${berryTheme.colors.grey200};
  margin-bottom: 20px;
`;

const FeeRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid ${berryTheme.colors.grey200};
  
  &:last-child {
    border-bottom: none;
    font-weight: 600;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  font-size: 1rem;
  border: 1px solid ${berryTheme.colors.grey300};
  border-radius: 12px;
  appearance: none;
  background: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e") no-repeat;
  background-position: right 16px center;
  background-size: 16px;
  transition: all 0.2s ease;
  
  &:focus {
    border-color: ${berryTheme.colors.primary};
    box-shadow: 0 0 0 2px ${berryTheme.colors.primaryLight}50;
    outline: none;
  }
`;

const Alert = styled(motion.div)`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  font-size: 0.875rem;
  
  &.error {
    background: ${berryTheme.colors.errorLight}20;
    border: 1px solid ${berryTheme.colors.errorLight};
    color: ${berryTheme.colors.error};
  }
  
  &.success {
    background: ${berryTheme.colors.successLight}20;
    border: 1px solid ${berryTheme.colors.successLight};
    color: ${berryTheme.colors.success};
  }
`;

const SubmitButton = styled(motion.button)`
  width: 100%;
  padding: 16px;
  background: ${berryTheme.colors.primary};
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    background: ${berryTheme.colors.primaryDark};
  }
  
  &:disabled {
    background: ${berryTheme.colors.grey400};
    cursor: not-allowed;
  }
`;

const Spinner = styled.span`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid white;
  border-radius: 50%;
  border-top-color: transparent;
  animation: ${spin} 0.8s linear infinite;
  margin-right: 8px;
`;

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
`;

const ReceiptCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 450px;
  overflow: hidden;
  box-shadow: ${berryTheme.shadows.large};
  border: 1px solid ${berryTheme.colors.grey200};
`;

const ReceiptHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid ${berryTheme.colors.grey200};
`;

const ReceiptTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${berryTheme.colors.textDark};
`;

const ReceiptContent = styled.div`
  padding: 16px;
`;

const ReceiptRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid ${berryTheme.colors.grey100};
  
  &:last-child {
    border-bottom: none;
  }
`;

const ReceiptLabel = styled.span`
  color: ${berryTheme.colors.textMuted};
`;

const ReceiptValue = styled.span`
  font-weight: 500;
  color: ${berryTheme.colors.textDark};
  text-align: right;
  max-width: 60%;
  word-break: break-word;
`;

const ReceiptFooter = styled.div`
  padding: 16px;
  border-top: 1px solid ${berryTheme.colors.grey200};
  display: flex;
  justify-content: center;
`;

const DoneButton = styled(motion.button)`
  padding: 12px 24px;
  background: ${berryTheme.colors.primary};
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${berryTheme.colors.primaryDark};
  }
`;

export default function WithdrawForm() {
  const { 
    balance = 0,
    adsBalance = 0,
    dollarBalance2 = 0,
    checkinRewards = 0,
    refBonus = 0,
    processedReferrals = [],
    id,
    username,
    fullName,
    loading,
    setBalance,
    setAdsBalance,
    setDollarBalance2,
    setCheckinRewards,
    setRefBonus
  } = useUser();

  // Calculate total referral earnings
  const referralEarningsFromProcessed = processedReferrals.reduce((total, referral) => {
    const bonus = parseFloat(referral.refBonus) || 0;
    return total + bonus;
  }, 0);
  
  const totalReferralEarnings = (parseFloat(refBonus) || 0) + referralEarningsFromProcessed;
  
  // Calculate total available balance (converting points to dollars)
  const totalAvailableBalance = (parseFloat(balance) / 1000) + 
                               parseFloat(adsBalance) + 
                               parseFloat(dollarBalance2) + 
                               parseFloat(checkinRewards) + 
                               totalReferralEarnings;

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amount: '',
    walletAddress: '',
    network: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [withdrawalFee, setWithdrawalFee] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [showSuccessReceipt, setShowSuccessReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  
  const MIN_WITHDRAWAL = 5;
  const FEE_PERCENTAGE = 1;

  const networks = [
    { id: 'LTC', name: 'Litecoin (LTC)' },
    { id: 'DGB', name: 'DigiByte (DGB)' },
    { id: 'DASH', name: 'Dash (DASH)' },
  ];

  useEffect(() => {
    if (formData.amount && !isNaN(parseFloat(formData.amount))) {
      const amountNum = parseFloat(formData.amount);
      const fee = (amountNum * FEE_PERCENTAGE) / 100;
      setWithdrawalFee(fee);
      setTotalAmount(amountNum + fee);
    } else {
      setWithdrawalFee(0);
      setTotalAmount(0);
    }
  }, [formData.amount]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.amount) return setError('Please enter an amount');
    
    const amountNum = parseFloat(formData.amount);
    if (isNaN(amountNum)) return setError('Please enter a valid amount');
    if (amountNum < MIN_WITHDRAWAL) return setError(`Minimum withdrawal is $${MIN_WITHDRAWAL}`);
    if (totalAmount > totalAvailableBalance) return setError(`Insufficient balance ($${totalAvailableBalance.toFixed(2)} available)`);
    if (!formData.walletAddress) return setError('Please enter your wallet address');
    if (!formData.network) return setError('Please select a network');

    try {
      const userRef = doc(db, 'telegramUsers', id);
      
      // Calculate how much to deduct from each balance source
      let remainingAmount = totalAmount;
      const updates = {};
      const balanceDeductions = {
        adsBalance: 0,
        dollarBalance2: 0,
        checkinRewards: 0,
        refBonus: 0,
        balance: 0
      };

      // Deduct from ads balance first
      if (adsBalance > 0 && remainingAmount > 0) {
        const deductFromAds = Math.min(adsBalance, remainingAmount);
        updates.adsBalance = increment(-deductFromAds);
        balanceDeductions.adsBalance = deductFromAds;
        remainingAmount -= deductFromAds;
      }
      
      // Then deduct from dollar balance
      if (dollarBalance2 > 0 && remainingAmount > 0) {
        const deductFromDollar = Math.min(dollarBalance2, remainingAmount);
        updates.dollarBalance2 = increment(-deductFromDollar);
        balanceDeductions.dollarBalance2 = deductFromDollar;
        remainingAmount -= deductFromDollar;
      }
      
      // Then deduct from checkin rewards
      if (checkinRewards > 0 && remainingAmount > 0) {
        const deductFromCheckin = Math.min(checkinRewards, remainingAmount);
        updates.checkinRewards = increment(-deductFromCheckin);
        balanceDeductions.checkinRewards = deductFromCheckin;
        remainingAmount -= deductFromCheckin;
      }
      
      // Then deduct from referral earnings
      if (totalReferralEarnings > 0 && remainingAmount > 0) {
        const deductFromReferrals = Math.min(totalReferralEarnings, remainingAmount);
        updates.refBonus = increment(-deductFromReferrals);
        balanceDeductions.refBonus = deductFromReferrals;
        remainingAmount -= deductFromReferrals;
      }
      
      // Finally deduct from main balance (converted to points)
      if (remainingAmount > 0) {
        const pointsToDeduct = remainingAmount * 1000;
        updates.balance = increment(-pointsToDeduct);
        balanceDeductions.balance = pointsToDeduct;
      }

      // Update all balances in a single transaction
      await updateDoc(userRef, updates);

      // Create withdrawal record
      const withdrawalRef = collection(db, 'withdrawalRequests');
      const withdrawalData = {
        userId: id,
        username: username || '',
        fullName: fullName || '',
        amount: amountNum,
        fee: withdrawalFee,
        totalDeducted: totalAmount,
        walletAddress: formData.walletAddress.trim(),
        network: formData.network,
        status: 'pending',
        createdAt: serverTimestamp(),
        balanceType: 'combined',
        balanceDeductions // Store how much was deducted from each balance
      };
      
      const docRef = await addDoc(withdrawalRef, withdrawalData);

      // Update local state to reflect the deductions
      setAdsBalance(prev => Math.max(0, prev - balanceDeductions.adsBalance));
      setDollarBalance2(prev => Math.max(0, prev - balanceDeductions.dollarBalance2));
      setCheckinRewards(prev => Math.max(0, prev - balanceDeductions.checkinRewards));
      setRefBonus(prev => Math.max(0, prev - balanceDeductions.refBonus));
      setBalance(prev => Math.max(0, prev - balanceDeductions.balance));

      setSuccess('Withdrawal request submitted!');
      
      setReceiptData({
        id: docRef.id,
        amount: amountNum.toFixed(3),
        fee: withdrawalFee.toFixed(3),
        total: totalAmount.toFixed(3),
        wallet: formData.walletAddress.trim(),
        network: networks.find(n => n.id === formData.network)?.name || formData.network,
        date: new Date().toLocaleString(),
        deductions: balanceDeductions
      });
      setShowSuccessReceipt(true);
      setFormData({ amount: '', walletAddress: '', network: '' });
      
    } catch (err) {
      console.error('Withdrawal error:', err);
      setError(err.message || 'Failed to process withdrawal');
    }
  };

  const handleMaxClick = () => {
    const maxAmount = Math.max(0, (totalAvailableBalance / (1 + (FEE_PERCENTAGE / 100))) - 0.001);
    setFormData(prev => ({
      ...prev,
      amount: Math.max(MIN_WITHDRAWAL, maxAmount).toFixed(3)
    }));
  };

  const isSubmitDisabled = loading || !formData.amount || 
                         parseFloat(formData.amount) < MIN_WITHDRAWAL || 
                         totalAmount > totalAvailableBalance ||
                         !formData.walletAddress || 
                         !formData.network;

  return (
    <Container>
      <PageHeader>
        <BackButton 
          onClick={() => navigate(-1)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiArrowLeft size={20} color={berryTheme.colors.textDark} />
        </BackButton>
        <LogoImage src='/Berry.png' alt="Berry Logo" />
        <LogoText>berry</LogoText>
      </PageHeader>

      <MainContent>
        <FormCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <BalanceCard
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div>
              <BalanceLabel>
                <FiDollarSign size={16} />
                Available for Withdrawal
              </BalanceLabel>
              <BalanceAmount>
                <CountUp
                  end={totalAvailableBalance || 0}
                  decimals={totalAvailableBalance < 1 ? 3 : 2}
                  prefix="$"
                  duration={0.8}
                  separator=","
                />
              </BalanceAmount>
            </div>
            <FiInfo 
              size={20} 
              color={berryTheme.colors.primary} 
              title="Combined balance from all earnings sources"
            />
          </BalanceCard>

          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Amount (USD)</Label>
              <InputGroup>
                <Input
                  type="number"
                  name="amount"
                  placeholder="0.000"
                  value={formData.amount}
                  onChange={handleChange}
                  step="0.001"
                  min={MIN_WITHDRAWAL}
                  max={totalAvailableBalance}
                />
                <MaxButton 
                  onClick={handleMaxClick}
                  disabled={!totalAvailableBalance || totalAvailableBalance < MIN_WITHDRAWAL}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  MAX
                </MaxButton>
              </InputGroup>
              {formData.amount && parseFloat(formData.amount) < MIN_WITHDRAWAL && (
                <p style={{ color: berryTheme.colors.error, fontSize: '0.75rem', marginTop: '4px' }}>
                  Minimum withdrawal is ${MIN_WITHDRAWAL}
                </p>
              )}
              {formData.amount && totalAmount > totalAvailableBalance && (
                <p style={{ color: berryTheme.colors.error, fontSize: '0.75rem', marginTop: '4px' }}>
                  Insufficient balance (${totalAvailableBalance.toFixed(2)} available)
                </p>
              )}
            </FormGroup>

            <FeeBreakdown
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <FeeRow>
                <span>Amount:</span>
                <span>${formData.amount ? parseFloat(formData.amount).toFixed(3) : '0.000'}</span>
              </FeeRow>
              <FeeRow>
                <span>Fee ({FEE_PERCENTAGE}%):</span>
                <span>${withdrawalFee.toFixed(3)}</span>
              </FeeRow>
              <FeeRow>
                <span style={{ fontWeight: '600' }}>Total:</span>
                <span style={{ fontWeight: '700' }}>${totalAmount.toFixed(3)}</span>
              </FeeRow>
            </FeeBreakdown>

            <FormGroup>
              <Label>Wallet Address</Label>
              <Input
                type="text"
                name="walletAddress"
                placeholder="Enter wallet address"
                value={formData.walletAddress}
                onChange={handleChange}
              />
            </FormGroup>

            <FormGroup>
              <Label>Network</Label>
              <Select
                name="network"
                value={formData.network}
                onChange={handleChange}
              >
                <option value="">Select network</option>
                {networks.map(network => (
                  <option key={network.id} value={network.id}>
                    {network.name}
                  </option>
                ))}
              </Select>
            </FormGroup>

            {error && (
              <Alert
                className="error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <FiAlertCircle style={{ marginRight: '8px' }} />
                {error}
              </Alert>
            )}

            {success && (
              <Alert
                className="success"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <FiCheckCircle style={{ marginRight: '8px' }} />
                {success}
              </Alert>
            )}

            <SubmitButton
              type="submit"
              disabled={isSubmitDisabled}
              whileHover={!isSubmitDisabled ? { scale: 1.02 } : {}}
              whileTap={!isSubmitDisabled ? { scale: 0.98 } : {}}
            >
              {loading ? (
                <>
                  <Spinner />
                  Processing...
                </>
              ) : (
                'Request Withdrawal'
              )}
            </SubmitButton>
          </form>
        </FormCard>
      </MainContent>

      {showSuccessReceipt && receiptData && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <ReceiptCard
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            <ReceiptHeader>
              <ReceiptTitle>Withdrawal Receipt</ReceiptTitle>
              <button 
                onClick={() => setShowSuccessReceipt(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <FiX size={24} color={berryTheme.colors.textMuted} />
              </button>
            </ReceiptHeader>
            <ReceiptContent>
              <ReceiptRow>
                <ReceiptLabel>Transaction ID:</ReceiptLabel>
                <ReceiptValue>{receiptData.id}</ReceiptValue>
              </ReceiptRow>
              <ReceiptRow>
                <ReceiptLabel>Status:</ReceiptLabel>
                <ReceiptValue style={{ color: berryTheme.colors.success }}>
                  <FiCheckCircle style={{ marginRight: '4px' }} />
                  Success
                </ReceiptValue>
              </ReceiptRow>
              <ReceiptRow>
                <ReceiptLabel>Amount:</ReceiptLabel>
                <ReceiptValue>${receiptData.amount}</ReceiptValue>
              </ReceiptRow>
              <ReceiptRow>
                <ReceiptLabel>Fee:</ReceiptLabel>
                <ReceiptValue>${receiptData.fee}</ReceiptValue>
              </ReceiptRow>
              <ReceiptRow>
                <ReceiptLabel>Total Deducted:</ReceiptLabel>
                <ReceiptValue>${receiptData.total}</ReceiptValue>
              </ReceiptRow>
              <ReceiptRow>
                <ReceiptLabel>Network:</ReceiptLabel>
                <ReceiptValue>{receiptData.network}</ReceiptValue>
              </ReceiptRow>
              <ReceiptRow>
                <ReceiptLabel>Wallet:</ReceiptLabel>
                <ReceiptValue>{receiptData.wallet}</ReceiptValue>
              </ReceiptRow>
              <ReceiptRow>
                <ReceiptLabel>Date:</ReceiptLabel>
                <ReceiptValue>{receiptData.date}</ReceiptValue>
              </ReceiptRow>
              <ReceiptRow>
                <ReceiptLabel>Deductions:</ReceiptLabel>
                <ReceiptValue>
                  {Object.entries(receiptData.deductions)
                    .filter(([_, value]) => value > 0)
                    .map(([key, value]) => (
                      <div key={key}>
                        {key}: ${key === 'balance' ? (value / 1000).toFixed(3) : value.toFixed(3)}
                      </div>
                    ))}
                </ReceiptValue>
              </ReceiptRow>
            </ReceiptContent>
            <ReceiptFooter>
              <DoneButton
                onClick={() => setShowSuccessReceipt(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Done
              </DoneButton>
            </ReceiptFooter>
          </ReceiptCard>
        </ModalOverlay>
      )}
    </Container>
  );
}

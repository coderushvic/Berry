import axios from "axios";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "../../firebase/firestore";

// Create invoice link by calling Telegram API
export async function createInvoice(product, price, userId, botToken) {
  if (price < 100) {
    throw new Error("Minimum payment is 100 XTR.");
  }

  const providerToken = process.env.PROVIDER_TOKEN;  // Access provider token from the environment

  const invoiceData = {
    title: product,
    description: `Purchase of ${product}`,
    payload: JSON.stringify({ product, price, userId }),
    provider_token: providerToken || "",  // Use provider token from .env
    currency: "XTR",
    prices: [{ label: product, amount: price }],
  };

  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${botToken}/createInvoiceLink`,
      invoiceData
    );
    return response.data.result;
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw new Error("Failed to create invoice. Please try again.");
  }
}

// Handle payment notification and reward processing
export async function handlePaymentNotification(paymentData) {
  const { telegram_payment_charge_id, invoice_payload } = paymentData;
  const payload = JSON.parse(invoice_payload);
  const { userId, price } = payload;

  const userDocRef = doc(db, "telegramUsers", userId);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    throw new Error("User data not found. Please complete your payment first.");
  }

  const existingPayments = userDoc.data().payments || [];

  if (existingPayments.includes(telegram_payment_charge_id)) {
    throw new Error("This payment has already been processed.");
  }

  const newcatsReward = price * 100;

  await updateDoc(userDocRef, {
    balance: increment(newcatsReward),
    payments: [...existingPayments, telegram_payment_charge_id],
  });

  return {
    message: `Payment confirmed. You have received ${newcatsReward} NEWCATS!`,
    redirectTo: "/payment-success",
  };
}
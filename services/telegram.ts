
const BOT_TOKEN = "8236254617:AAFFTI9j4pl6U-8-pdJgZigWb2M75oBmyzg";
const CHAT_ID = "5494141897";

export const sendOrderToTelegram = async (orderData: any) => {
  try {
    const itemsList = orderData.items
      .map((item: any) => `• ${item.name}\n  [Qty: ${item.quantity} | Price: ৳${item.priceAtPurchase}]`)
      .join("\n\n");

    const paymentDetails = `
<b>💳 PAYMENT CONFIGURATION</b>
<b>Method:</b> ${orderData.paymentMethod}
<b>Type:</b> ${orderData.paymentOption || 'N/A (COD)'}
<b>TrxID:</b> <code>${orderData.transactionId || 'None'}</code>
`;

    const message = `
<b>🚀 NEW VIBEGADGET ORDER</b>
━━━━━━━━━━━━━━━━━━
<b>👤 CUSTOMER DETAILS</b>
<b>Name:</b> ${orderData.customerName}
<b>Phone:</b> <code>${orderData.contactNumber}</code>
<b>Address:</b> <i>${orderData.shippingAddress}</i>

<b>📦 PRODUCT MANIFEST (A-Z)</b>
${itemsList}

━━━━━━━━━━━━━━━━━━
${paymentDetails}
<b>💰 FINANCIAL SUMMARY</b>
<b>Grand Total:</b> ৳${orderData.total}

<b>📅 SYSTEM LOG</b>
<b>Logistics:</b> Steadfast Courier
<b>Status:</b> ${orderData.status}
<b>Time:</b> ${new Date(orderData.createdAt).toLocaleString('en-BD')}
━━━━━━━━━━━━━━━━━━
<b>🆔 ORDER REF:</b>
<code>${orderData.id ? orderData.id.toUpperCase() : 'NEW_ENTRY'}</code>
`;

    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: "HTML",
      }),
    });

    return await response.json();
  } catch (error) {
    console.error("Telegram Notification Gateway Error:", error);
    return null;
  }
};

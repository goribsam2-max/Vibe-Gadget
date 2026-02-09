
// Provided API Credentials
const API_KEY = "joitjujewr5bxm27jcd6maeqrmwtmbld";
const SECRET_KEY = "qhxzuwgzdmo3qa3shamzuskd";
const BASE_URL = "https://portal.packzy.com/api/v1";

// Using a CORS proxy to bypass browser security restrictions
const proxyUrl = (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

export const sendOrderToSteadfast = async (order: any) => {
  try {
    const targetUrl = `${BASE_URL}/create_order`;
    const response = await fetch(proxyUrl(targetUrl), {
      method: 'POST',
      headers: {
        'Api-Key': API_KEY,
        'Secret-Key': SECRET_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        invoice: order.id,
        recipient_name: order.customerName,
        recipient_phone: order.contactNumber,
        recipient_address: order.shippingAddress,
        cod_amount: Math.round(order.total),
        note: order.note || `Order #${order.id.slice(0,8)}`
      })
    });
    
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Packzy API Error:", error);
    throw error;
  }
};

export const getSteadfastStatus = async (trackingCode: string) => {
  try {
    const targetUrl = `${BASE_URL}/status_by_trackingcode/${trackingCode}`;
    const response = await fetch(proxyUrl(targetUrl), {
      method: 'GET',
      headers: {
        'Api-Key': API_KEY,
        'Secret-Key': SECRET_KEY,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Packzy Status Error:", error);
    return null;
  }
};

import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Ardeno Studio <onboarding@resend.dev>',
        to: [process.env.ADMIN_EMAIL || 'ardenostudio@gmail.com'],
        subject: `New FAQ Enquiry from ${name}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #111;">
            <h2>New Message from FAQ</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <div style="background: #f4f4f4; padding: 15px; border-radius: 8px;">
              ${message.replace(/\n/g, '<br/>')}
            </div>
          </div>
        `,
        reply_to: email,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return res.status(200).json({ success: true, id: data.id });
    } else {
      console.error('Resend Error:', data);
      return res.status(500).json({ error: data.message || 'Failed to send email' });
    }
  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const response = await fetch('http://127.0.0.1:8000/schedule_strength')
    .then(res => {
      console.log('Raw response:', res);
      return res.json();
    })
    .then(data => {
      console.log('Parsed data:', data);
      return data;
    })
    .catch(err => {
      console.error('Fetch error:', err);
      throw err;
    })
    res.status(200).json(data)
  } catch (error) {
    console.error('Error fetching schedule strength data:', error)
    res.status(500).json({ error: 'Failed to fetch schedule strength data' })
  }
} 
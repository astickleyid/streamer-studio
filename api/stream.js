export default function handler(req, res) {
  res.status(200).json({ 
    error: 'WebSocket not supported',
    message: 'Use local server: cd server && npm start'
  });
}

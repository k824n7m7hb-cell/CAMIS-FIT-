// api/index.js
// Camis FIT - API Root
module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    app: 'Camis FIT API',
    version: '1.0.0',
    status: 'online',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth/*',
      instrutor: '/api/instrutor/*',
      aluno: '/api/aluno/*',
      ia: '/api/ia/*',
      notificacoes: '/api/notificacoes/*'
    }
  });
};

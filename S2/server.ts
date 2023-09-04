import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/up', (req, res) => {
  res.send('Server is up');
});

app.post('.meetings', (req, res) => {
  console.log(req.body);
  res.send('Meeting created');
});

app.listen(3000, () => {
  console.log('Server is up on port 3000');
});
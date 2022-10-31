import express from 'express';
import { getData as getEarnings, getDaily} from './getData.js';
import cors from 'cors';

const app = express();
app.use(cors());

app.get('/', (req, res) => {
    res.json({
        message: 'testbot launched'
    })
})


app.get('/search/:stock', (req, res) => {
    getEarnings(req.params.stock)
        .then(data => {
            res.json(data);
        })
});

app.get('/earnings/:stock', (req, res) => {
    getDaily(req.params.stock)
        .then(data => {
            res.json(data);
        })
})


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('Server is running on port',port);
});



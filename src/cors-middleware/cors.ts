import cors from 'cors';

const corsOptions = {
    origin: `http://localhost:8080`,
    optionsSuccessStatus: 200,
    credentials: true,
};

export default cors(corsOptions);
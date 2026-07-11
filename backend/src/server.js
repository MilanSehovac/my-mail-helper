import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import sequelize from "./config/db.js";
import agencyRoutes from './Routes/agencyRoutes.js';
import templateRoutes from './Routes/templateRoutes.js';
import contactRoutes from "./routes/contactRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
  } catch (err) {
    console.error(err);
  }
})();

const STATUS = process.env.STATUS || 'development';
const PORT = STATUS === 'development' ? process.env.DEV_PORT : process.env.PROD_PORT;

app.use('/api/agency', agencyRoutes);
app.use('/api/template', templateRoutes);
app.use('/api/contact', contactRoutes)
app.listen(PORT, () => {
  console.log(`Server is in ${STATUS} mode, running on port ${PORT}`);
})
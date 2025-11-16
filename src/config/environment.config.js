import dotenv from 'dotenv'

dotenv.config()

const ENVIRONMENT = {
    MONGO_DB_CONNECTION_STRING: process.env.MONGO_DB_CONNECTION_STRING,
    JWT_SECRET: process.env.JWT_SECRET,
    URL_FRONTEND: process.env.URL_FRONTEND,
    URL_API_WHATSAPP_MESSENGER: process.env.URL_API_WHATSAPP_MESSENGER || 'http://localhost:5000',
}

export default ENVIRONMENT
import dotenv from 'dotenv'

dotenv.config()

const ENVIRONMENT = {
    MONGO_DB_CONNECTION_STRING: process.env.MONGO_DB_CONNECTION_STRING,
    GMAIL_USERNAME: process.env.GMAIL_USERNAME,
    GMAIL_PASSWORD: process.env.GMAIL_PASSWORD,
    JWT_SECRET: process.env.JWT_SECRET,
    URL_API_BACKEND: process.env.URL_API_WHATSAPP_MESSENGER || 'http://localhost:5000',
}

export default ENVIRONMENT
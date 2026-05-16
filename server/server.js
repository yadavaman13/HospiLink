require('dotenv').config();
const app = require('./src/app')
const connectDB = require('./src/config/db');
const bootstrapSuperAdmin = require('./src/scripts/bootstrapSuperAdmin');

async function startServer() {
    await connectDB();
    await bootstrapSuperAdmin();

    app.listen(3000,()=>{
        console.log('Server is running')
    })
}

startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
const mongoose = require('mongoose');

/*
mongoose.connect('mongodb://localhost:27017', { dbName : "node-auth",
{ useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
.then(()=>{
    console.log('MongoDB connected');
})
.catch(err =>{
    console.log(err.message);
});
*/

// Atlas
mongoose.connect(process.env.MONGODB_URI, 
{ useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
.then(()=>{
    console.log('MongoDB connected');
})
.catch(err =>{
    console.log(err.message);
});

mongoose.connection.on('connected', ()=>{
    console.log('MongoDB on connected.');
});

mongoose.connection.on('error', (err)=>{
    console.log(err.message);
});


mongoose.connection.on('disconnected', (err)=>{
    console.log('MongoDB disconnected');
});

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    process.exit(0);
});
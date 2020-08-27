const redis = require('redis');

//default port 6379
const client = redis.createClient({
    port : 6379,
    host : "127.0.0.1"
});

client.on('connect', () => {
    console.log('Connected to redis....');
});

client.on('ready', () => {
    console.log('redis state -> Ready');
});

client.on('error', (err) =>{
    console.log(err.message);
});


client.on('end', () =>{
    console.log("redis disconnected.");
});

process.on('SIGINT', () =>{
    client.quit(0);
})


module.exports = client;
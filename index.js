const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b3njf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        const database = client.db('oculusGlasswareDB');
        const reviewsCollection = database.collection('reviews');
        const usersCollection = database.collection('users');

        // POST API to add review
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            console.log('first post API hitted', review);
            const result = await reviewsCollection.insertOne(review);
            console.log(result);
            res.json(result);
        });

        // GET API to add review
        app.get('/reviews', async (req, res) => {
            const review = reviewsCollection.find({});
            const reviews = await review.toArray();
            res.send(reviews);
        });

        // POST API to add user to database
        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log('first post API hitted', user);
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });

        // UPSERT API 
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        // GET API to get and ensure admin
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        // PUT API to make admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log('put', user);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);

        })



    }

    finally {
        // await client.close()
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Oculus Glassware server is running');
})

app.listen(port, () => {
    console.log(`listening at http://localhost:${port}`);
})
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectID;
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
        const productsCollection = database.collection('products');
        const ordersCollection = database.collection('orders');

        // POST API to add review
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.json(result);
        });

        // GET API to get review
        app.get('/reviews', async (req, res) => {
            const review = reviewsCollection.find({});
            const reviews = await review.toArray();
            res.send(reviews);
        });

        // POST API to add products
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.json(result);
        });

        // GET API to get product
        app.get('/products', async (req, res) => {
            const product = productsCollection.find({});
            const products = await product.toArray();
            res.send(products);
        });

        // DELETE API from packages
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.json(result);
        })

        // POST API to book
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.json(result);
        });

        //GET API
        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        });

        //GET API for specific user
        app.get('/orders/:email', async (req, res) => {
            const cursor = ordersCollection.find({ email: req.params.email });
            const orders = await cursor.toArray();
            res.send(orders);
        });

        //Update booking status
        app.patch('/orders/update/:id', (req, res) => {
            ordersCollection.updateOne({ _id: ObjectId(req.params.id) },
                {
                    $set: { status: req.body.status }
                })
                .then(result => {
                    res.send(result.modifiedCount > 0)
                })
        })

        // DELETE API from bookings
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        })

        // POST API to add user to database
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
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
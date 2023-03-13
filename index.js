const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();

const port = process.env.PORT || 5000;
require('dotenv').config();


// middleware
app.use(cors());
app.use(express.json());

// portfolioDB
// ca5cukvCSsHTSqZm






const uri = "mongodb+srv://expenseTrackerDB:shyjGcvbrJcfotOM@cluster0.jqheb6c.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });





async function run() {

    try {
        const categoriesCollection = client.db("ExpenseTrackerDB").collection("categories");



        app.get('/blogs', async (req, res) => {
            const query = {};
            const cursor = blogsCollection.find(query);
            const blogs = await cursor.toArray();
            res.send(blogs);

        })
        app.get('/home-blogs', async (req, res) => {
            const query = {};
            const cursor = blogsCollection.find(query).limit(3);
            const blogs = await cursor.toArray();
            res.send(blogs);

        })

        app.get('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const blog = await blogsCollection.findOne(query);
            res.send(blog);
        })


        app.get('/categories', async (req, res) => {
            const query = {};
            const result = await categoriesCollection.find(query).toArray();
            res.send(result);

        })


        app.get('/categories/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const category = await categoriesCollection.findOne(query);
            res.send(category);

        })


        // post categories



        app.post('/categories', async (req, res) => {
            const category = req.body;
            const result = await categoriesCollection.insertOne(category);
            res.send(result);
        })

        // delete category

        app.delete('/categories/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const result = await categoriesCollection.deleteOne(filter);
            res.send(result);
        })


        // update value



        /*       app.put('/categories/:name', async (req, res) => {
                  const name = req.params.email;
                  const user = req.body;
                  const filter = { name: name };
                  const options = { upsert: true }
                  const updateDoc = {
                      $set: user,
                  }
                  const result = await usersCollection.updateOne(filter, updateDoc, options);
      
                  console.log(result)
      
                  const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
                      expiresIn: '7d'
                  })
                  console.log(token)
                  res.send({ result, token })
              }) */





    }
    finally {

    }


}
run().catch(err => console.log(err));






app.get('/', (req, res) => {
    res.send('Expense Tracker Application Server Api Running')
})


app.listen(port, () => {
    console.log(`Expense Tracker Application Server is running on: ${port}`)
})
// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const express = require('express');
// const cors = require('cors');
// const app = express();
// const port = process.env.PORT || 5000;
// require('dotenv').config();


// // middleware
// app.use(cors());
// app.use(express.json());



// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jqheb6c.mongodb.net/?retryWrites=true&w=majority`;
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {

    try {
        const categoriesCollection = client.db("ExpenseTrackerDB").collection("categories");
        const fundsCollection = client.db("ExpenseTrackerDB").collection("funds");
        const costsCollection = client.db("ExpenseTrackerDB").collection("costs");


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
            const id = req.params;
            const query = { _id: new ObjectId(id) };
            const blog = await blogsCollection.findOne(query);
            res.send(blog);
        })


        // app.get('/categories', async (req, res) => {
        //     const query = {};
        //     const result = await categoriesCollection.find(query).sort({name: 1}).toArray();
        //     res.send(result);

        // })


        // app.get('/categories/:id', async (req, res) => {
        //     const id = req.params;
        //     const query = { _id: new ObjectId(id) };
        //     const category = await categoriesCollection.findOne(query);
        //     res.send(category);

        // })



        // post categories



        // app.post('/categories', async (req, res) => {
        //     const category = req.body;
        //     const result = await categoriesCollection.insertOne(category);
        //     res.send(result);
        // })

        // delete category

        // app.delete('/categories/:id', async (req, res) => {
        //     const id = req.params;
        //     const filter = { _id: new ObjectId(id) }
        //     const result = await categoriesCollection.deleteOne(filter);
        //     res.send(result);
        // })

        // app.delete('/funds/:id', async (req, res) => {
        //     const id = req.params;
        //     const filter = { _id: new ObjectId(id) }
        //     const result = await fundsCollection.deleteOne(filter);
        //     res.send(result);
        // })




        app.delete('/costs/:id', async (req, res) => {
            const id = req.params;
            const filter = { _id: new ObjectId(id) }
            const result = await costsCollection.deleteOne(filter);
            res.send(result);
        })

        // get category name data


        // app.get('/funds/:category', async (req, res) => {
        //     const category = req.params.category;
        //     const filter = { category: category }
        //     const result = await fundsCollection.find(filter).toArray();
        //     res.send(result);
        // })

        // get categories from email

        // app.get('/fundss/:user', async (req, res) => {
        //     const user = req.params.user;
        //     const filter = { user: user }
        //     const result = (await fundsCollection.find(filter).sort({ "_id": -1 }).toArray());
        //     res.send(result);
        // })

        // get current year all months funds
        
        app.get('/funds/month/:user/:year', async (req, res) => {
            try {
              const user = req.params.user;
              const year = parseInt(req.params.year);
              const filter = { user: user };
              const funds = await fundsCollection.find(filter).sort({ "date": -1 }).toArray();
          
              // Calculate total money for each month
              const monthlyTotals = {};
          
              // Initialize an object with the months of the specified year
              const yearMonths = new Array(12).fill(0).map((_, index) => {
                return `${year}-${(index + 1).toString().padStart(2, '0')}`;
              });
          
              yearMonths.forEach(monthYear => {
                monthlyTotals[monthYear] = 0;
              });
          
              funds.forEach(entry => {
                const monthYear = entry.date.substring(0, 7); 
                if (yearMonths.includes(monthYear)) {
                  monthlyTotals[monthYear] += entry.money;
                }
              });
          
              // Convert object to array and sort by month
              const sortedMonthlyTotals = Object.entries(monthlyTotals)
                .sort(([a], [b]) => a.localeCompare(b))
                .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
          
              res.json(sortedMonthlyTotals);
            } catch (error) {
              console.error('Error fetching funds:', error);
              res.status(500).send('Internal Server Error');
            }
          });
          
        // get current year all months costs

        app.get('/costs/month/:user/:year', async (req, res) => {
            try {
              const user = req.params.user;
              const filter = { user: user };
              const year = parseInt(req.params.year);
              const funds = await costsCollection.find(filter).sort({ "date": -1 }).toArray();
          
       
              // Calculate total money for each month
              const monthlyTotals = {};
          
              // Initialize an object with the months of the current year
              const currentYearMonths = new Array(12).fill(0).map((_, index) => {
                return `${year}-${(index + 1).toString().padStart(2, '0')}`;
              });
          
              currentYearMonths.forEach(monthYear => {
                monthlyTotals[monthYear] = 0;
              });
          
              funds.forEach(entry => {
                const monthYear = entry.date.substring(0, 7); // Extracting "YYYY-MM"
                if (currentYearMonths.includes(monthYear)) {
                  monthlyTotals[monthYear] += entry.money;
                }
              });
          
              // Convert object to array and sort by month
              const sortedMonthlyTotals = Object.entries(monthlyTotals)
                .sort(([a], [b]) => a.localeCompare(b))
                .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
          
              res.json(sortedMonthlyTotals);
            } catch (error) {
              console.error('Error fetching funds:', error);
              res.status(500).send('Internal Server Error');
            }
          });
          
          
          


        // get categories from email

        app.get('/costss/:user', async (req, res) => {
            const user = req.params.user;
            const filter = { user: user }
            const result = (await costsCollection.find(filter).sort({ "_id": -1 }).toArray());
            res.send(result);
        })


        // delete category all data


        // app.get('/fund/:category/:user', async (req, res) => {
        //     const category = req.params.category; // fixed
        //     const user = req.params.user;
        //     console.log(user);
        //     const filter = { category: category, user: user };
        //     const result = await fundsCollection.find(filter).toArray();
        //     res.send(result);
        // });


        app.delete('/fund/:category/:user', async (req, res) => {
            const category = req.params.category; // fixed
            const user = req.params.user;
            console.log(user);
            const filter = { category: category, user: user };
            const result = await fundsCollection.deleteMany(filter);
            res.send(result);
        });



        app.get('/cost/:category/:user', async (req, res) => {
            const category = req.params.category; // fixed
            const user = req.params.user;
            console.log(user);
            const filter = { category: category, user: user };
            const result = await costsCollection.find(filter).toArray();
            res.send(result);
        });



        app.delete('/cost/:category/:user', async (req, res) => {
            const category = req.params.category; // fixed
            const user = req.params.user;
            console.log(user);
            const filter = { category: category, user: user };
            const result = await costsCollection.deleteMany(filter);
            res.send(result);
        });



        app.get('/costs/:category', async (req, res) => {
            const category = req.params.category;
            const filter = { category: category }
            const result = await costsCollection.find(filter).toArray();
            res.send(result);
        })


        // update value



        app.put('/categories/:name/:user', async (req, res) => {
            const name = req.params.name;
            const user = req.params.user;
            const value = req.body;
            const filter = { name: name, user: user };
            const options = { upsert: true }
            const updateDoc = {
                $set: value,
            }
            const result = await categoriesCollection.updateOne(filter, updateDoc, options);

            // console.log(result)

            res.send(result);
        })


        // post new funds

        app.post('/funds', async (req, res) => {
            const category = req.body;
            const result = await fundsCollection.insertOne(category);
            res.send(result);
        })

        // get all funds


        // app.get('/funds', async (req, res) => {
        //     const query = {};
        //     const result = await fundsCollection.find(query).toArray();
        //     res.send(result);
        // })


        // post new costs

        app.post('/costs', async (req, res) => {
            const category = req.body;
            const result = await costsCollection.insertOne(category);
            res.send(result);
        })

        // get all costs


        app.get('/costs', async (req, res) => {
            const query = {};
            const result = await costsCollection.find(query).toArray();
            res.send(result);
        })




    }
    finally {

    }


}
run().catch(err => console.log(err));



// app.get('/', (req, res) => {
//     res.send('Expense Tracker Application Server Api Running')
// })


// app.listen(port, () => {
//     console.log(`Expense Tracker Application Server is running on: ${port}`)
// })
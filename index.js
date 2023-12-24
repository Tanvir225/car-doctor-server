const express = require("express");
const jwt = require('jsonwebtoken');
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

//middleware
app.use(cors());
app.use(express.json());

//dot env
require('dotenv').config()

//test api
app.get("/", (req, res) => {
  res.send("Welcome to the car-doctor");
});

const uri =`mongodb+srv://${process.env.user_DB}:${process.env.pass_DB}@cluster0.ljq2tzl.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});



async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    //connect to databse
    const services = client.db("carDoctor").collection("services")
    //new collection
    const myservices = client.db('carDoctor').collection("myservices")


    //auth related api
    app.post("/jwt",(req,res)=>{
      const user= req.body;
      console.log(user);
      const token = jwt.sign(user,process.env.ACCESS_TOKEN,{expiresIn:'1h'})
      res.send(token)

    })


    //services endpoints
    app.get("/services",async(req,res)=>{
        const cursor = await services.find().toArray()
        res.send(cursor)
    })

    //signle service endpoints
    app.get('/services/:id', async (req, res) =>{
        const serviceID = req.params.id
        const query = {_id : new ObjectId(serviceID)}
        const result = await services.findOne(query)
        res.send(result)
    })


 
    

    //myservices endpoints
    app.get("/myservices",async(req,res)=>{
      let email = req.query.email
      console.log(email)
      let result

      if (email) {
        result = await myservices.find({email : email}).toArray()
      }
      else{
        result = await myservices.find().toArray()
      }
      res.send(result)
    })



    //myservices post endpoints
    app.post("/myservices",async(req,res)=>{
        const orderInfo = req.body
        //console.log(orderInfo);
        const result =await myservices.insertOne(orderInfo)
        res.send(result)
    })

    //myservices patch endpoints
    app.patch("/myservices/:id",async(req,res)=>{
      const serviceID = req.params.id
      const service = req.body
      console.log(serviceID)
      const filter = {_id : new ObjectId(serviceID)}
      const updateDoc = {
        $set:{
          status:service.status
        }
      }
      const options = { upsert:true};

      const result = await myservices.updateOne(filter,updateDoc,options);
      res.send(result)
    }) 

    //delete myservice endpoints
    app.delete("/myservices/:id",async(req,res)=>{
      const serviceId = req.params.id
      console.log(serviceId)
      const query = {_id : new ObjectId(serviceId)}
      const result = await myservices.deleteOne(query)
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

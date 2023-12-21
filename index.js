const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const app = express();
require("dotenv").config();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

//  MONGODB DATABASE USER PASSWORD
const uri = "mongodb://127.0.0.1:27017";
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ydmxw3q.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();
    // const taskDatabase = client.db("taskDatabaseDB").collection("task");
    const taskDatabase = client.db("taskDatabaseDB").collection("task");

    // api
    app.post("/tasks", async (req, res) => {
      try {
        const newTask = {
          title: req.body.title,
          description: req.body.description,
          deadline: req.body.deadline,
          email: req.body.email,
          priority: req.body.priority,
          status: "To-Do", // Set initial status to "To-Do"
        };

        const result = await taskDatabase.insertOne(newTask);

        // console.log(result);
        res.send(result);
      } catch (error) {
        console.error("Error adding task:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });
    app.get("/api/allTask", async (req, res) => {
      const email = req.query.email;
      console.log(email);

      try {
        const filter = email ? { email: email } : {};
        const tasks = await taskDatabase.find(filter).toArray();

        res.send(tasks);
      } catch (error) {
        console.error("Error fetching all tasks:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.delete("/api/deleteTask/:id", async (req, res) => {
      const taskId = req.params.id;
      console.log(taskId);

      try {
        const filter = { _id: new ObjectId(taskId) };
        const result = await taskDatabase.deleteOne(filter);
        res.send(result);
      } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.patch("/api/updateTaskStatus/:id", async (req, res) => {
      const { id } = req.params;
      const { status } = req.body;

      try {
        // Validate input
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ error: "Invalid task ID" });
        }

        // Update task status in the database
        const updatedTask = await taskDatabase.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: { status } },
          { returnDocument: "after" }
        );

        if (!updatedTask) {
          return res.status(404).json({ error: "Task not found" });
        }

        res.send(updatedTask);
      } catch (error) {
        console.error("Error updating task status:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client  will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Crud is running...");
});

app.listen(port, () => {
  console.log(`Simple Crud is Running on port ${port}`);
});

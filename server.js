import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import Pusher from 'pusher'

import dataKey from './APIKey.js'
import Messages from './dbMessages.js'
import data from './APIKey.js'

const app = express()
const port = process.env.PORT || 9000

const pusher = new Pusher({
  appId: data.pusher_appId,
  key: data.pusher_key,
  secret: data.pusher_secret,
  cluster: data.pusher_cluster,
  useTLS: true
});

const c = false

app.use(cors())
app.use(express.json())
app.use((req,res,next) => {
  res.setHeader('Access-Contorl-Allow-Origin', '*')
  res.setHeader('Access-Contorl-Allow-Headers', '*')
  next()
})

const connect_url = `mongodb+srv://${dataKey.user_db}:${dataKey.password}@cluster0.pdbkk.mongodb.net/${dataKey.name_db}?retryWrites=true&w=majority`
mongoose.connect(connect_url, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const db = mongoose.connection

db.once("open", () => {
  console.log("DB connected")

  const msgCollection = db.collection('messagecontents')
  const changeStream = msgCollection.watch()

  changeStream.on('change', (change) => {
    console.log(change)

    if(change.operationType === 'insert'){
      const messageDetails = change.fullDocument
      pusher.trigger('messages', 'inserted', {
        name: messageDetails.name,
        message: messageDetails.message
      })
    }else {
      console.log('Error Trigger Pusher')
    }
  })
})

app.get('/',(req,res) => res.status(200).send("Hello word"))
app.get('/message/sync', (req, res) => {
  Messages.find((err, data) => {
    if(err) {
      res.status(500).send(err)
    }else {
      res.status(200).send(data)
    }
  })
})
app.post('/api/v1/messages/new', (req, res) => {
  const dbMessage = req.body

  Messages.create(dbMessage, (err, data) => {
    if(err) {
      res.status(500).send(err)
    }else {
      res.status(201).send(data)
    }
  })
})

app.listen(port, () => console.log(`listening on localhost: ${port}`))
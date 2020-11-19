import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'

import dataKey from './APIKey.js'
import Messages from './dbMessages.js'

const app = express()
const port = process.env.PORT || 9000

app.use(cors())
app.use(express.json())

const connect_url = `mongodb+srv://${dataKey.user_db}:${dataKey.password}@cluster0.pdbkk.mongodb.net/${dataKey.name_db}?retryWrites=true&w=majority`
mongoose.connect(connect_url, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
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
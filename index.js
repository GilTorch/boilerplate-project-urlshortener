require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
// Basic Configuration
const port = process.env.PORT || 3000;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded())

// parse application/json
app.use(bodyParser.json())

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});



const MONGO_URI = process.env.MONGO_URI;

const connection = mongoose.createConnection(MONGO_URI);


const shortUrlSchema = mongoose.Schema({
  url: {
    type: String, 
    required: true
  }, 
  prefix: {
    type: Number, 
    required: true
  }
})

const ShortUrl = connection.model("ShortUrl", shortUrlSchema);



app.post('/api/shorturl', async (req, res) => {

  const url = req.body.url; 

  try {
    
    const data = await ShortUrl.findOne({ url });
    if(!data){
      let shortUrlCount = 0;
          
          try {
            const count = await ShortUrl.countDocuments();
            shortUrlCount = count;

          } catch(err){
            return res.status(500).json({ message: err })
          }

          const data = {
            url,
            prefix: shortUrlCount + 1
          }

          const shortUrl = new ShortUrl(data)

           await shortUrl.save(data);
           return res.status(200).json({url: data.url, shortId: data.prefix});

    } else {
      return res.status(200).json({url: data.url, shortId: data.prefix});
    }

  } catch(err){
    return res.status(500).json({ message: "Something unexpected happened"});
  }

})

app.get("/api/shortUrl/:shortId", async (req, res) => {
  const shortId = req.params.shortId; 

  try {
    const data = await ShortUrl.findOne({ prefix: shortId });
    res.redirect(data.url);
  } catch(err){
     return res.json(500).status({ message: "Something unexpected happened" })
  }

})


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

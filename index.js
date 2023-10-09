const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3005;

const livestreamingFolder = path.join(__dirname, 'livestreaming');

if (!fs.existsSync(livestreamingFolder)) {
  fs.mkdirSync(livestreamingFolder);
  console.log('Livestreaming folder created successfully.');
}

app.use(cors()); // Enable CORS for all routes
app.use(express.json());

app.post('/', async (req, res) => {
  try {
    console.log('Received request:', req.method, req.url);

    const { channelName, email, title, tags, visibility, name } = req.body;
    const copiedChannelName = name;
    console.log('Received channel name:', channelName);
    console.log('Received title', title);
    console.log('Received tags', tags);
    console.log('Received visibility', visibility);
    console.log('Received email:', email);
    
    const userlive = {
      channelName: copiedChannelName,
      email,
      timestamp: new Date().toISOString(),
      title,
      tags,
      visibility,
    };

    const logData = {
      userlive,
    };

    const filePath = path.join(livestreamingFolder, `${email}.json`);

    if (fs.existsSync(filePath)) {
      const existingData = JSON.parse(fs.readFileSync(filePath));
      const newData = existingData.map(item => {
        if (item.userlive.email === email) {
          return logData;
        }
        return item;
      });

      fs.writeFileSync(filePath, JSON.stringify(newData, null, 2));
      res.status(200).json({ message: 'Channel name and email updated successfully' });
    } else {
      fs.writeFileSync(filePath, JSON.stringify([logData], null, 2));
      res.status(200).json({ message: 'Channel name and email logged successfully' });
    }
  } catch (error) {
    console.error('An error occurred while processing the request:', error);
    res.status(500).json({ message: 'An error occurred while processing the request.' });
  }
});

app.get('/', (req, res) => {
  try {
    const files = fs.readdirSync(livestreamingFolder);
    const responseData = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(livestreamingFolder, file);
        const jsonData = JSON.parse(fs.readFileSync(filePath));
        responseData.push(jsonData);
      }
    }

    res.status(200).json({ data: responseData });
  } catch (error) {
    console.error('An error occurred while processing the request:', error);
    res.status(500).json({ message: 'An error occurred while processing the request.' });
  }
});

app.all('*', (req, res) => {
  const notAllowedResponse = {
    message: 'Method not allowed.',
  };
  res.status(405).json(notAllowedResponse);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

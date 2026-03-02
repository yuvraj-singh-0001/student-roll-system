const mongoose = require('mongoose');
require('dotenv').config();

const ExamConfig = require('./src/models/ExamConfig');

async function checkDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const configs = await ExamConfig.find().lean();
    console.log('Total ExamConfigs:', configs.length);
    
    configs.forEach((config, index) => {
      console.log(`${index + 1}. ${config.examCode} - ${config.title || 'No title'} - ₹${config.registrationPrice || 0}`);
    });
    
    if (configs.length === 0) {
      console.log('No exam configs found. You need to create exam configs first.');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkDB();

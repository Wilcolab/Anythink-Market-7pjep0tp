//TODO: seeds script should come here, so we'll be able to put some data in our local env
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');

// Import all models
require('../models'); // This will load User, Item, Comment

const User = mongoose.model('User');
const Item = mongoose.model('Item');
const Comment = mongoose.model('Comment');

// Connect to MongoDB
mongoose.connect('mongodb://mongodb-node:27017/anythink-market', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');

  try {
    // Clear existing data
    await User.deleteMany({});
    await Item.deleteMany({});
    await Comment.deleteMany({});

    // Function to generate a valid alphanumeric username
    const generateValidUsername = () => {
      return faker.string.alphanumeric({ length: 8 });
    };

    // Create Users
    const users = Array.from({ length: 100 }).map(() => {
      const password = faker.internet.password();
      const user = new User({
        username: generateValidUsername(),
        email: faker.internet.email(),
      });
      user.setPassword(password); // Ensure password hashing
      return user;
    });
    const createdUsers = await User.insertMany(users);

    // Create Items
    const items = Array.from({ length: 100 }).map(() => ({
      title: faker.commerce.productName(),
      description: faker.lorem.sentences(),
      image: faker.image.url(), // Updated method
      tagList: faker.helpers.arrayElements(['electronics', 'books', 'clothing', 'sports'], 2),
      seller: faker.helpers.arrayElement(createdUsers)._id,
    }));
    const createdItems = await Item.insertMany(items);

    // Create Comments
    const comments = Array.from({ length: 100 }).map(() => ({
      body: faker.lorem.sentences(),
      seller: faker.helpers.arrayElement(createdUsers)._id,
      item: faker.helpers.arrayElement(createdItems)._id,
    }));
    await Comment.insertMany(comments);

    console.log('Mock data inserted successfully');
  } catch (error) {
    console.error('Error inserting mock data:', error);
  } finally {
    mongoose.connection.close();
  }
});
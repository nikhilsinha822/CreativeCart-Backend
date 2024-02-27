const mongoose = require('mongoose');
const {faker} = require('@faker-js/faker');
require('dotenv').config()

const { Schema, Types } = mongoose;

const MONGO_URI = process.env.DATABASE_URI;

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB!'))
.catch((error) => console.error('Error connecting to MongoDB:', error));

const Product = require('../models/product')

async function createFakeProducts() {
  try {
    await Product.deleteMany({}); 
    console.log("Old products removed");

    const numProducts = 500; 
    const fakeProducts = [];

    for (let i = 0; i < numProducts; i++) {
      const fakeProduct = {
        category: new Types.ObjectId(), 
        title: faker.commerce.productName(),
        images: [
          {
            publicId: faker.string.uuid(), 
            url: faker.image.url(),
          },
          {
            publicId: faker.string.uuid(), 
            url: faker.image.url(),
          },
          {
            publicId: faker.string.uuid(), 
            url: faker.image.url(),
          },
          {
            publicId: faker.string.uuid(), 
            url: faker.image.url(),
          },
        ],
        summary: faker.commerce.productAdjective(),
        desc: faker.commerce.productDescription(),
        price: faker.commerce.price({ min: 500, max: 150000 }),
        stock: faker.number.int({ min: 1, max: 10000 }),
        createdBy: new Types.ObjectId(), 
        discountType: faker.helpers.arrayElement(['none', 'percent', 'amount']),
        discountValue: faker.number.int({ min: 0, max: 50 }),
      };
      fakeProducts.push(fakeProduct);
    }

    await Product.insertMany(fakeProducts);
    console.log('Created', numProducts, 'fake products successfully!');
  } catch (error) {
    console.error('Error creating fake products:', error);
  }
}


mongoose.connection.once('open', createFakeProducts);

module.exports = Product; 
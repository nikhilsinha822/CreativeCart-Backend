const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
require('dotenv').config()

const { Schema, Types } = mongoose;

const MONGO_URI = process.env.DATABASE_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB!'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

const Product = require('../models/product')

const productCategories = [
  "Clothing", "Shoes", "Electronics", "Books", "Beauty & Personal Care", "Home & Kitchen", "Toys & Games", "Sports & Outdoors", "Automotive", "Jewelry", "Baby Products", "Health & Household", "Luggage & Travel Gear", "Furniture", "Office Products", "Pet Supplies", "Tools & Home Improvement", "Grocery & Gourmet Food", "Patio, Lawn & Garden", "Musical Instruments", "Camera & Photo", "Software", "Video Games", "Movies & TV", "Music", "Cell Phones & Accessories", "Computers & Tablets", "Office Supplies", "Industrial & Scientific", "Arts, Crafts & Sewing", "Women's Clothing", "Men's Clothing", "Kids' Clothing", "Women's Shoes", "Men's Shoes", "Kids' Shoes", "Women's Handbags", "Men's Accessories", "Women's Accessories", "Women's Jewelry", "Men's Jewelry", "Watches", "Sunglasses", "Eyewear", "Makeup", "Skin Care", "Hair Care", "Fragrance", "Bath & Body", "Vitamins & Dietary Supplements", "Baby Clothing", "Baby Gear", "Baby Toys", "Baby Food", "Baby Safety", "Kitchen & Dining", "Bedding & Bath", "Home Decor", "Home Appliances", "Home Storage & Organization", "Outdoor Furniture", "Indoor Furniture", "Living Room Furniture", "Bedroom Furniture", "Dining Room Furniture", "Office Furniture", "Outdoor Living", "Patio Furniture", "Gardening Tools", "Lawn Mowers & Outdoor Power Tools", "Outdoor Heating & Cooling", "Outdoor Lighting", "Outdoor Play Equipment", "Outdoor Recreation", "Camping & Hiking", "Cycling", "Fishing", "Hunting & Shooting", "Team Sports", "Water Sports", "Winter Sports", "Outdoor Games", "Exercise & Fitness", "Boxing & MMA", "Yoga & Pilates", "Gym Equipment", "Strength Training Equipment", "Optics", "Sports Nutrition", "Automotive Parts & Accessories", "Automotive Tools & Equipment", "Motorcycle & Powersports", "Tires & Wheels", "Car Electronics", "Automotive Appearance", "RVs & Campers", "Bridal Jewelry", "Fashion Jewelry", "Fine Jewelry", "Gemstone Jewelry", "Children's Jewelry", "Men's Clothing Accessories", "Women's Clothing Accessories", "Plus Size Clothing", "Maternity Clothing", "Lingerie & Sleepwear", "Swimwear", "Costumes & Accessories", "Luggage", "Travel Accessories", "Business & Laptop Bags", "Backpacks", "Briefcases", "Handbags", "Wallets", "Laptop Bags", "School Supplies", "Office Electronics", "Office Furniture", "Office Decor", "Industrial Supplies", "Lab Supplies", "Industrial Power Tools", "Janitorial & Sanitation Supplies", "Material Handling Products", "Occupational Health & Safety Products", "Fasteners", "Arts & Crafts", "Beading & Jewelry Making", "Knitting & Crochet", "Needlework", "Painting, Drawing & Art Supplies", "Scrapbooking & Stamping", "Sewing", "Party Supplies", "Seasonal Decorations", "Greeting Cards & Party Supply", "Costumes & Accessories", "Cake Decorating", "Video Games & Consoles", "PC Games", "Gaming Accessories", "Board Games", "Puzzles", "Blu-ray Movies", "DVDs", "Streaming Media Players", "Digital Music", "CDs & Vinyl", "Musical Instruments", "DJ Equipment", "Stage Equipment", "Microphones", "Headphones", "Instrument Accessories", "Binoculars & Optics", "Telescopes", "Microscopes", "Drones", "Security & Surveillance", "Action Cameras", "Camera Lenses", "Camera Accessories", "Projectors", "Printers", "Scanners", "Computer Components", "Networking Products", "Tablets", "Laptops", "Desktops", "Monitors", "Computer Accessories", "Data Storage", "External Hard Drives", "USB Flash Drives", "Memory Cards", "Blank Media", "Software", "Antivirus & Security Software", "Business & Office Software", "Design & Illustration Software", "Educational Software", "Entertainment Software", "Operating Systems", "Utilities Software", "Cell Phones & Smartphones", "Smartwatches", "Bluetooth Devices", "Mobile Broadband Devices", "VR Headsets", "Prepaid Phones", "Unlocked Phones", "Men's Grooming", "Men's Shaving", "Men's Hair Care", "Men's Skin Care", "Women's Grooming", "Women's Shaving", "Women's Hair Care", "Women's Skin Care", "Subscription Boxes", "Gift Cards", "Magazine Subscriptions", "Textbooks", "Educational Resources", "Test Preparation", "Ebooks", "Audiobooks", "Sheet Music", "Magazines", "Comic Books & Graphic Novels", "Adult Products", "Collectible Coins", "Sports Collectibles", "Entertainment Collectibles", "Historical Memorabilia", "Hobby Products", "Model Kits", "Outdoor Play", "Kids' Furniture", "Kids' Arts & Crafts", "Kids' Bikes", "Kids' Vehicles", "Kids' Sports", "Kids' Costumes", "Kids' Games", "Kids' Puzzles", "Kids' Books", "Kids' Music", "Kids' Movies", "Kids' Software", "Baby Nursery", "Baby Clothing", "Baby Toys", "Baby Care", "Baby Safety", "Baby Feeding", "Baby Health & Grooming", "Cribs & Nursery Furniture", "Strollers", "Baby Carriers", "Diapering", "Baby Proofing", "Baby Monitors", "Maternity Clothing", "Maternity Accessories", "Fertility Products", "Pregnancy Tests", "Nursing Supplies", "Pumps & Accessories", "Feminine Care", "Men's Wellness", "Women's Wellness", "Sexual Wellness", "Sleep Solutions", "Nutritional Supplements", "Sports Nutrition", "Meal Replacements", "Weight Management", "Herbal Remedies", "Homeopathic Remedies", "Aromatherapy", "Massage Products", "Medical Supplies & Equipment", "Mobility & Daily Living Aids", "Vision Care", "Household Batteries", "Light Bulbs", "Household Cleaning Supplies", "Laundry Supplies", "Paper & Plastic", "Air Fresheners", "Pest Control", "Home Security", "Kitchen Utensils & Gadgets", "Small Appliances", "Large Appliances", "Bakeware", "Cookware", "Dinnerware & Flatware", "Kitchen Linens", "Bar & Wine Tools", "Coffee, Tea & Espresso", "Food Storage", "Water Purification", "Furniture Covers", "Towels & Bathroom Accessories", "Shower Curtains", "Vacuums & Floor Care", "Heating & Cooling", "Air Treatment", "Safes & Security Boxes", "Lighting & Ceiling Fans", "Hardware", "Power & Hand Tools", "Painting Supplies", "Electrical", "Plumbing", "Building Materials", "Automotive Care", "Automotive Tools", "Motorcycle Accessories", "ATV & UTV Accessories", "Boating & Marine", "Powersports Protective Gear", "Tire & Wheel Services", "Vehicle Security & Convenience", "Vehicle Repair Manuals", "Vehicle Electronics", "Vehicle Lighting & Light Bars", "Towing & Hitches", "Semi Truck Accessories", "Motorcycle Lifts & Stands", "Automotive Decor", "Automotive Gifts", "RV Parts & Accessories", "RV Appliances", "RV Furniture", "RV Plumbing & Venting", "RV Sanitation & Water Systems", "RV Covers & Accessories", "RV Electronics & Electrical", "RV Leveling & Stabilization", "Cleaning & Detailing", "Car Covers", "Floor Mats & Cargo Liners", "Vehicle Wraps & Graphics", "Trailer Parts & Accessories", "Powersports Maintenance & Repair", "Heavy Equipment Parts & Accessories", "Vintage Car & Truck Parts", "Farm Equipment Parts", "Marine Electrical Systems", "Boating Safety Equipment", "Marine Hardware", "Pool & Spa Equipment", "Ski & Snowboard Equipment", "Golf Equipment & Accessories", "Skateboarding Equipment", "Fishing Reels & Line"
 ]

function generateProductName() {
  const adjective = faker.commerce.productAdjective();
  const noun = faker.commerce.productName();
  const category = faker.helpers.arrayElement(productCategories);
  return `${adjective} ${noun} ${category}`;
}

async function createFakeProducts() {
  try {
    await Product.deleteMany({});
    console.log("Old products removed");

    const numProducts = 10000;
    const fakeProducts = [];

    for (let i = 0; i < numProducts; i++) {
      const numReviews = faker.number.int({ min: 1, max: 10000 });
      const totalStars = numReviews * faker.number.int({ min: 1, max: 5 });
      const fakeProduct = {
        category: new Types.ObjectId(),
        title: generateProductName(),
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
        rating: {
          numReviews,
          stars: totalStars,
        },
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
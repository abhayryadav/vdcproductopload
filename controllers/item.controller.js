const itemModel = require('../models/item.Model');
const amqp = require('amqplib');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');



module.exports.adminauthentication = async(req, res) => {
  const { securityKey } = req.body;
  const SECURE_KEY = process.env.SECURE_KEY || 'llp';

  if (securityKey === SECURE_KEY) {
      return res.json({ success: true, token: 'access-granted' });
  }
  return res.status(403).json({ error: 'Unauthorized' });
};



// Admin Login for later
module.exports.AdminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Hard-coded admin details for now
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'securepassword';

        // Check email and password
        if (email !== adminEmail || !(await bcrypt.compare(password, await bcrypt.hash(adminPassword, 10)))) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign({ email, role: 'admin' }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to login' });
    }
};






// Add Item
module.exports.AddItem = async (req, res) => {
  console.log("AddItem called");
  console.log("req.body:", req.body);
  console.log("req.files:", req.files);
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productName, description, price, availableQuantity, category } = req.body;

    // Validate required fields
    if (!productName || !description || !price || !availableQuantity || !category) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if cover image is uploaded
    if (!req.files || !req.files.image || req.files.image.length === 0) {
      console.log("No cover image uploaded");
      return res.status(400).json({ error: 'Cover image is required' });
    }

    // Get cover image URL
    const imageLink = req.files.image[0].path;

    // Get additional images URLs (optional)
    const images = req.files.images && req.files.images.length > 0
      ? req.files.images.map(file => file.path)
      : [];

    console.log('imageLink:', imageLink);
    console.log('images:', images);

    const newItem = new itemModel({
      productName,
      description,
      price: parseFloat(price),
      availableQuantity: parseInt(availableQuantity),
      imageLink,
      images,
      category,
    });

    await newItem.save();
    res.status(201).json({ message: 'Item added successfully', item: newItem });
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).json({ error: 'Failed to add item', details: error.message });
  }
};
  

// Delete Item

module.exports.DeleteItem = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { itemId } = req.body;

        const deletedItem = await itemModel.findByIdAndDelete(itemId);

        if (!deletedItem) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.status(200).json({ message: 'Item deleted successfully', item: deletedItem });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete item' });
    }
};

// Update Item
// module.exports.UpdateItem = async (req, res) => {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//       }
  
//       var { itemId, productName, description, price, availableQuantity, imageLink, category } = req.body;
//       // console.log("Request Body:", req.body);
//       // console.log("Uploaded File:", req.file);

//       let imageLinknew = imageLink;

//       // if (!req.file) {
//       //   return res.status(200).json({ error: 'Image is required' });
//       // }
//       if (req.file) {
//         imageLinknew = req.file.path;
//       }
      
//       console.log(imageLinknew,"[][][][][][][]][-------][][][[][][][][]")
//       imageLink = imageLinknew
//       const updatedItem = await itemModel.findByIdAndUpdate(
//         itemId,
//         { productName, description, price, availableQuantity, imageLink, category },
//         { new: true }
//       );
  
//       if (!updatedItem) {
//         return res.status(404).json({ error: 'Item not found' });
//       }
  
//       res.status(200).json({ message: 'Item updated successfully', item: updatedItem });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: 'Failed to update item' });
//     }
//   };
  
  

module.exports.UpdateItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    console.log("1")
    const { itemId, productName, description, price, availableQuantity, category } = req.body;
    let image = req.body.image; // May be a string (existing path) or undefined
    let images = req.body.images || [];
    console.log("2")

    // Handle cover image
    if (req.files && req.files.image && req.files.image.length > 0) {
      image = req.files.image[0].path; // New file uploaded
    }
    console.log("3")

    // Handle additional images
    if (req.files && req.files.images && req.files.images.length > 0) {
      images = req.files.images.map(file => file.path);
    }
    console.log("4")

    const updateData = {
      productName,
      description,
      price: parseFloat(price) || 0, // Fallback to 0 if price is invalid
      availableQuantity: parseInt(availableQuantity) || 0,
      category,
    };
    console.log("5")

    // Only update image if provided
    if (image) updateData.imageLink = image;
    if (images.length > 0) updateData.images = images;
    console.log("6")

    const updatedItem = await itemModel.findByIdAndUpdate(
      itemId,
      updateData,
      { new: true }
    );
    console.log("7")

    if (!updatedItem) {
      return res.status(404).json({ error: 'Item not found' });
    }
    console.log("8")

    res.status(200).json({ message: 'Item updated successfully', item: updatedItem });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item', details: error.message });
  }
};


  // module.exports.GetAllAvailableItems = async (req, res) => {
  //   try {
  //     const availableItems = await itemModel.find({ availableQuantity: { $gt: 0 } });
  
  //     if (availableItems.length === 0) {
  //       return res.status(404).json({ message: 'No items are currently available.' });
  //     }
  
  //     res.status(200).json({
  //       message: 'Available items retrieved successfully',
  //       items: availableItems,
  //     });
  //   } catch (error) {
  //     console.error('Error fetching available items:', error);
  //     res.status(500).json({ error: 'Failed to retrieve available items' });
  //   }
  // };
  



  module.exports. GetAllAvailableItems = async (req, res) => {
    try {
      const search = req.query.search || ''; // Get the search query from the request
  
      // Create a case-insensitive search filter
      const filter = search
        ? {
            $or: [
              { productName: { $regex: search, $options: 'i' } }, // Match product name
              { description: { $regex: search, $options: 'i' } }, // Match description
              { category: { $regex: search, $options: 'i' } },    // Match category
            ],
          }
        : {}; // No filter if search query is empty
  
      // Find items that match the filter
      const items = await itemModel.find(filter);
  
      res.status(200).json({ items });
    } catch (error) {
      console.error('Error fetching items:', error);
      res.status(500).json({ error: 'Failed to fetch items' });
    }
  };





  // module.exports. GetAllAvailableItemstemp = async (req, res) => {
  //   try {
  //     const search = req.query.search || ''; // Get the search query from the request
  
  //     // Create a case-insensitive search filter
  //     const filter = search
  //       ? {
  //           $or: [
  //             { productName: { $regex: search, $options: 'i' } }, // Match product name
  //             { description: { $regex: search, $options: 'i' } }, // Match description
  //             { category: { $regex: search, $options: 'i' } },    // Match category
  //           ],
  //         }
  //       : {}; // No filter if search query is empty
  
  //     // Find items that match the filter
  //     const items = await itemModel.find(filter);
  
  //     res.status(200).json({ items });
  //   } catch (error) {
  //     console.error('Error fetching items:', error);
  //     res.status(500).json({ error: 'Failed to fetch items' });
  //   }
  // };












module.exports.GetItemsByCategory = async (req, res) => {
    try {
      const { category } = req.params;
  
      const items = await itemModel.find({ category, availableQuantity: { $gt: 0 } });
  
      if (items.length === 0) {
        return res.status(404).json({ message: 'No items found in this category.' });
      }
  
      res.status(200).json({ message: 'Items retrieved successfully', items });
    } catch (error) {
      console.error('Error fetching items by category:', error);
      res.status(500).json({ error: 'Failed to retrieve items by category' });
    }
  };
  module.exports.getAllItemsByPrice = async (req, res) => {
    try {
        const { minPrice, maxPrice } = req.query;

        if (!minPrice || !maxPrice) {
            return res.status(400).json({ error: "Both minPrice and maxPrice are required" });
        }

        // Query the database for items within the price range
        const items = await itemModel.find({
            price: { $gte: minPrice, $lte: maxPrice },
        });

        res.status(200).json(items);
    } catch (error) {
        console.error("Error fetching items by price:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


//////////xx/////////// this is to communicate with the user service to return the items details for the user's cart without any 3rd party amqp
// module.exports.itemsDetailsForUser = async (req, res) => {
//   console.log("itemsDetailsForUser")
//   try {
//       const { itemIds } = req.body; // Array of item IDs
//       console.log(itemIds,"========================================================================")
//       if (!itemIds || !itemIds.length) {
//           return res.status(400).json({ error: 'Item IDs are required' });
//       }

//       const items = await itemModel.find({ _id: { $in: itemIds } });
//       res.status(200).json({ items });
//   } catch (error) {
//       console.error('Error fetching item details:', error);
//       res.status(500).json({ error: 'Failed to fetch item details' });
//   }
// };



// module.exports.itemsDetailsForUser = async () => {
//   try {
//     // Connect to RabbitMQ and listen on the 'item-request' queue
//     const connection = await amqp.connect('amqps://uwvfhigi:6FkSJbsjpHmoiwz0vq1u54GpG4vwLXN9@vulture.rmq.cloudamqp.com/uwvfhigi');
//     const channel = await connection.createChannel();
//     console.log("Connected to RabbitMQ-----",channel);
//     const requestQueue = 'item-request';
//     const replyQueue = 'item-response'; // The reply queue for responses

//     await channel.assertQueue(requestQueue, { durable: true });
//     await channel.assertQueue(replyQueue, { durable: true });

//     console.log("Waiting for messages in queue:", requestQueue);

//     // When a message is received, process the item IDs
//     channel.consume(requestQueue, async (msg) => {
//       console.log("Received item request for user:", userId, "Item IDs:", itemIds);
//       const { itemIds, userId } = JSON.parse(msg.content.toString());
//       console.log("Received item request for user:", userId, "Item IDs:", itemIds,"============================================================================");

//       if (!itemIds || !itemIds.length) {
//         console.error('Item IDs are missing');
//         channel.ack(msg); // Acknowledge the message even if it's not processed
//         return;
//       }

//       // Fetch items from the database
//       const items = await itemModel.find({ _id: { $in: itemIds } });

//       // Create the response payload, merging the item details with cart items
//       const cartWithDetails = items.map((item) => ({
//         itemId: item._id,
//         quantity: 1, // Assume quantity is 1 for simplicity, modify as needed
//         itemDetail: {
//           _id: item._id,
//           productName: item.productName,
//           description: item.description,
//           price: item.price,
//           availableQuantity: item.availableQuantity,
//           imageLink: item.imageLink,
//           category: item.category
//         }
//       }));

//       // Send the response back to the Cart Service via the reply queue
//       channel.sendToQueue(msg.properties.replyTo,
//         Buffer.from(JSON.stringify(cartWithDetails)),
//         {
//           correlationId: String(msg.properties.correlationId) // Ensure it's a string
//         });
      

//       channel.ack(msg); // Acknowledge the received message from the 'item-request' queue
//     }, { noAck: false });

//   } catch (error) {
//     console.error('Error in item service:', error);
//   }
// };


//amqp ------ listening to users show cart service and sending the items details to the user service
async function cart() {
  try {
    // Connect to RabbitMQ and listen on the 'item-request' queue
    const connection = await amqp.connect('amqps://spogxdre:xsftHXmfeGSJlWsfCYVAnF1g6AXSlmuI@kebnekaise.lmq.cloudamqp.com/spogxdre', {
      heartbeat: 60
    });
    const channel = await connection.createChannel();
    console.log("Connected to RabbitMQ-----",channel);
    const requestQueue = 'item-request';
    const replyQueue = 'item-response'; // The reply queue for responses

    await channel.assertQueue(requestQueue, { durable: true });
    await channel.assertQueue(replyQueue, { durable: true });

    console.log("Waiting for messages in queue:", requestQueue);

    // When a message is received, process the item IDs
    channel.consume(requestQueue, async (msg) => {
      
      const { cartItems, userId } = JSON.parse(msg.content.toString());
      console.log("Received item request for user:", userId, "Item IDs:", cartItems,"============================================================================");

      if (!cartItems || !cartItems.length) {
        console.warn('Cart is empty, returning an empty response.');
        channel.sendToQueue(msg.properties.replyTo,
          Buffer.from(JSON.stringify([])),
          {
            correlationId: String(msg.properties.correlationId) // Ensure it's a string
          });
        channel.ack(msg); 
        return;
      }

      // Fetch items from the database
      const items = await itemModel.find({ _id: { $in: cartItems.map(item => item.itemId) } });

      // Create the response payload, merging the item details with cart items
      const cartWithDetails = cartItems.map((cartItem) => {
        const item = items.find(i => i._id.toString() === cartItem.itemId.toString());
        if (!item) {
          console.warn(`Item with ID ${cartItem.itemId} not found in database`);
          return {
            itemId: cartItem.itemId,
            quantity: cartItem.quantity,
            itemDetail: null // Or handle as needed (e.g., skip or return an error object)
          };
        }
        return {
          itemId: item._id,
          quantity: cartItem.quantity,
          itemDetail: {
            _id: item._id,
            productName: item.productName,
            description: item.description,
            price: item.price,
            availableQuantity: item.availableQuantity,
            imageLink: item.imageLink,
            category: item.category
          }
        };
      });

      // Send the response back to the Cart Service via the reply queue
      channel.sendToQueue(msg.properties.replyTo,
        Buffer.from(JSON.stringify(cartWithDetails)),
        {
          correlationId: String(msg.properties.correlationId) // Ensure it's a string
        });
      

      channel.ack(msg); // Acknowledge the received message from the 'item-request' queue
    }, { noAck: false });

  } catch (error) {
    console.error('Error in item service:', error);
  }
}








async function handleWishlistRequests() {
  try {
      // Connect to RabbitMQ
      const connection = await amqp.connect('amqps://spogxdre:xsftHXmfeGSJlWsfCYVAnF1g6AXSlmuI@kebnekaise.lmq.cloudamqp.com/spogxdre', {
        heartbeat: 60
      });
      const channel = await connection.createChannel();
      const requestQueue = 'item-request-wishlist';
      const replyQueue = 'item-response-wishlist';

      await channel.assertQueue(requestQueue, { durable: true });
      await channel.assertQueue(replyQueue, { durable: true });

      console.log("Waiting for wishlist messages in queue:", requestQueue);

      // Process incoming messages
      channel.consume(requestQueue, async (msg) => {
          const { wishlistItems, userId } = JSON.parse(msg.content.toString());
          console.log("Received wishlist request for user:", userId, "Wishlist Items:", wishlistItems,"[]][][][][][][][][][][][][][][][][][][][][][][][]");

          if (!wishlistItems || !wishlistItems.length) {
              console.warn('Wishlist empty');
              channel.sendToQueue(
                msg.properties.replyTo,
                Buffer.from(JSON.stringify([])),
                { correlationId: String(msg.properties.correlationId) }
            );
              channel.ack(msg); // Acknowledge the message even if it's not processed
              return;
          }

          // Fetch item details from the database
          const items = await itemModel.find({ _id: { $in: wishlistItems.map(item => item.itemId) } });

          // Create response payload
          const wishlistWithDetails = wishlistItems.map((wishlistItem) => {
              const item = items.find(i => i._id.toString() === wishlistItem.itemId.toString());
              return {
                  itemId: item._id,
                  itemDetail: {
                      _id: item._id,
                      productName: item.productName,
                      description: item.description,
                      price: item.price,
                      availableQuantity: item.availableQuantity,
                      imageLink: item.imageLink,
                      category: item.category
                  }
              };
          });

          // Send response back to the User Service
          channel.sendToQueue(
              msg.properties.replyTo,
              Buffer.from(JSON.stringify(wishlistWithDetails)),
              { correlationId: String(msg.properties.correlationId) }
          );

          channel.ack(msg); // Acknowledge the message from the 'wishlist-request' queue
      }, { noAck: false });

  } catch (error) {
      console.error('Error in Item Service:', error);
  }
}



cart()
handleWishlistRequests();

// Get Item By ID
module.exports.getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid item ID format' });
    }

    // Find item by ID
    const item = await itemModel.findById(id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.status(200).json({ message: 'Item retrieved successfully', item });
  } catch (error) {
    console.error('Error fetching item by ID:', error);
    res.status(500).json({ error: 'Failed to fetch item', details: error.message });
  }
};
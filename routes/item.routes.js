const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../cloudinaryConfig/cloudinaryConfig');



const express = require('express');
const router = express.Router();
const itemController = require('../controllers/item.controller');
const { validateAddItem, validateItemId } = require('../validationMiddleware/validation.Middleware');
const { body } = require('express-validator');
const {tokenVerification} = require('../tokenVerificationService/tokenVerification.service');
const adminauth = require('../adminauth/adminauth')




const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      format: async (req, file) => {
        const allowedFormats = ["png", "jpg", "jpeg"];
        const fileExtension = file.mimetype.split("/")[1].toLowerCase();
        return allowedFormats.includes(fileExtension) ? fileExtension : "png"; // Default to PNG if unsupported
      },
      public_id: (req, file) => file.originalname.split('.')[0], 
    },
  });
  
  const upload = multer({ storage }).fields([
    { name: 'image', maxCount: 1 }, // Single file for cover image
    { name: 'images', maxCount: 10 }, // Multiple files for additional images
  ]);



// Admin login
router.post('/AdminLogin', itemController.AdminLogin);


// Route to add an item
router.post('/AddItem', upload, validateAddItem, itemController.AddItem);

// Route to delete an item
router.delete('/DeleteItem', validateItemId, itemController.DeleteItem);

// Route to update an item
router.put('/UpdateItem',upload, validateAddItem.concat(validateItemId), itemController.UpdateItem);

router.post('/adminauthentication', adminauth ,  itemController.adminauthentication)
// Route to get all available items
// router.get('/GetAllAvailableItems',tokenVerification, itemController.GetAllAvailableItems);
router.get('/GetAllAvailableItems', itemController.GetAllAvailableItems);




//temporary to serve at homepage - no auth
// router.get('/GetAllAvailableItemstemp', itemController.GetAllAvailableItemstemp);



router.get("/GetAllAvailableItemsByPrice",tokenVerification,itemController.getAllItemsByPrice);
// router.post("/itemsDetailsForUser",itemController.itemsDetailsForUser);

router.get('/GetItemById/:id', itemController.getItemById);

module.exports = router;
const { body } = require('express-validator');

// Validation for adding a new item
exports.validateAddItem = [
    body('productName')
        .notEmpty()
        .withMessage('Product name is required'),
    body('description')
        .notEmpty()
        .withMessage('Description is required'),
    body('price')
        .isNumeric()
        .withMessage('Price must be a numeric value')
        .notEmpty()
        .withMessage('Price is required'),
    body('availableQuantity')
        .isNumeric()
        .isInt({ min: 0 })
        .withMessage('Available quantity must be a non-negative integer')
        .notEmpty()
        .withMessage('Available quantity is required')
];

// Validation for updating or deleting items
exports.validateItemId = [
    body('itemId')
        .notEmpty()
        .withMessage('Item ID is required')
        .isMongoId()
        .withMessage('Invalid Item ID format'),
];

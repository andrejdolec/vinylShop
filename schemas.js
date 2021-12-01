const BaseJoi = require('joi');
const { number } = require('joi');
const sanitizeHtml = require('sanitize-html')

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required()
})

module.exports.vinylSchema = Joi.object({
    vinyl: Joi.object({
        album: Joi.string().required().escapeHTML(),
        artist: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(10).max(150),
        available: Joi.number().min(0),
        description: Joi.string().required(),
        released: Joi.number().min(1940),
        genre: Joi.string().escapeHTML(),
        image: Joi.string().required()
    })
})

module.exports.orderSchema = Joi.object({
    user: Joi.object({}),
    cart: Joi.object({
        totalQty: Joi.number().required().min(0),
        totalPrice: Joi.number().required().min(0),
        items: Joi.object({
            _id: Joi.object({
                item: Joi.object({}),
                qty: Joi.number().required().min(0),
            })
        })
    }),
    fullname: Joi.string().required().escapeHTML(),
    address: Joi.string().required().escapeHTML(),
    phone: Joi.string().required().escapeHTML(),
    city: Joi.string().required().escapeHTML()
})
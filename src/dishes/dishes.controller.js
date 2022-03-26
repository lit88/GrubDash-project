const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

// handlers

function list(req, res, next) {
    res.json({ data: dishes })
}

function create(req, res, next) {
    const { data: { name, description, price, image_url } = {}} = req.body
    const newDish = {
        id: nextId(),
        name,
        description,
        price,
        image_url
    }
    dishes.push(newDish)
    res.status(201).json({ data: newDish })
}


// validations

function bodyDataHas(propertyName) {
    return function (req, res, next) {
      const { data = {} } = req.body;
      if (data[propertyName]) {
        return next();
      }
      next({ status: 400, message: `Dish must include a ${propertyName}` });
    };
}

function bodyIsNotEmpty(propertyName){
    return function (req, res, next) {
        const { data = {} } = req.body;
      if (data[propertyName] !== "") {
        return next();
      }
      next({ status: 400, message: `Dish must include a ${propertyName}` });
    }
}

function priceIsValidNumber(req, res, next){
    const { data: { price }  = {} } = req.body;
    if (price <= 0 || !Number.isInteger(price)){
        return next({
            status: 400,
            message: `Dish must have a price that is an integer greater than 0`
        });
    }
    next();
}


module.exports = {
    list,
    create: [
        bodyDataHas("name"),
        bodyDataHas("description"),
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        bodyIsNotEmpty("name"),
        bodyIsNotEmpty("description"),
        bodyIsNotEmpty("image_url"),
        priceIsValidNumber,
        create],
}
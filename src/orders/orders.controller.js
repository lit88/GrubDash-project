const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

// handlers

function list(req, res, next){
    res.json({ data: orders })
}

function create(req, res, next) {
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body
    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber,
        status,
        dishes
    }
    orders.push(newOrder)
    res.status(201).json({ data: newOrder })
}

// verifications

function bodyDataHas(propertyName) {
    return function (req, res, next) {
      const { data = {} } = req.body
      if (data[propertyName] && data[propertyName] !== "") {
        return next();
      }
      next({ status: 400, message: `Order must include a ${propertyName}` })
    }
}

function dishesVerify(req, res, next) {
    const { data = { dishes } } = req.body
}


module.exports = {
    list,
    create: [
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
        bodyDataHas("dishes"),
        create
    ],
}
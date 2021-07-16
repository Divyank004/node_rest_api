const express = require("express");
const router = express.Router();
const { getOpenPositions, createOrder } = require("../db/orderqueries");
const { getRevenue } = require("../db/revenuequery");
const { getArticles } = require("../db/articlequery");

router.get("/:organizationId/order/open", getOpenPositions);

router.post("/:organizationId/order", createOrder);

router.get("/:organizationId/revenue/monthly", getRevenue);

router.get("/:organizationId/article", getArticles);

module.exports = router;

const Joi = require("joi");
const { debug, db } = require("./setup");

const getRevenue = async (request, response) => {
  const organizationId = request.params.organizationId;
  //input validation - organizationId
  const schema = Joi.object({
    organizationId: Joi.number().integer().min(1).max(10000),
  });
  const schemaresult = schema.validate({ organizationId: organizationId });
  if (schemaresult.error)
    return response.status(400).send(schemaresult.error.details[0].message);
  try {
    let data = await db.any(
      "select extract(month from delivery) as month, extract(year from delivery) as year, (ceil(quantity/100) * baseprice)::decimal as revenue from position p right join ordering o on p.ordering=o.id right join supplycontract s on s.id=o.supplycontract right join articlecontract ac on ac.id=articlecontract where supplier=$1 and delivery is not null;",
      [organizationId]
    );
    let monthlyrevenue = revenueItems(data);
    debug(`Monthly revenue data retireved successfully!!`);
    debug(`Monthly revenue data sent to client successfully!!`);
    return response.status(200).json(monthlyrevenue);
  } catch (error) {
    debug(`Error in retrieving the revenue data ${JSON.stringify(error)}`);
    return response.status(500).json(error);
  }
};

// sum the revenues of same month by reducing the array
const revenueItems = (arr = []) => {
  const resp = arr.reduce((accumulator, obj) => {
    let found = false;
    for (let i = 0; i < accumulator.length; i++) {
      if (accumulator[i].month === obj.month) {
        found = true;
        accumulator[i].numberOfPositions++;
        accumulator[i].revenue = (
          parseFloat(accumulator[i].revenue) + parseFloat(obj.revenue)
        ).toFixed(2);
      }
    }
    if (!found) {
      obj.numberOfPositions = 1;
      accumulator.push(obj);
    }
    return accumulator;
  }, []);
  return resp;
};

module.exports = { getRevenue };

const Joi = require("joi");
const { debug, db } = require("./setup");

const getOpenPositions = async (request, response) => {
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
      "select p.ordering as order, p.id as position, article.id as articleId, article.label as articleLabel, article.name as articleName, cast(quantity as integer),  cast(round(quantity/100,2)*baseprice as double precision) as price, to_char(created, 'DD Mon YYYY,  HH12:MI:SS') as date , supplycontract.supplier as supplierId, (select org.name as supplierName from organization org where org.id=supplycontract.supplier) from position p inner join ordering o on o.id=p.ordering inner join articlecontract on articlecontract.id= p.articlecontract inner join article on article.id= articlecontract.articlecustomer inner join organization on organization.id=article.organization inner join supplycontract on supplycontract.id=articlecontract.supplycontract where article.organization=$1 and delivery is null;",
      [organizationId]
    );
    debug(`List of OpenPositions retrieved`);
    debug(`List of OpenPositions sent to client successfully!!`);
    return response.status(200).json(data);
  } catch (error) {
    debug(`Error in retrieving the open positions ${JSON.stringify(error)}`);
    return response.status(500).json(error);
  }
};

const createOrder = (request, response) => {
  const organizationId = request.params.organizationId;
  //input validation - organizationId
  const schema = Joi.object({
    organizationId: Joi.number().integer().min(1).max(10000),
  });
  const schemaresult = schema.validate({ organizationId: organizationId });
  if (schemaresult.error)
    return response.status(400).send(schemaresult.error.details[0].message);

  // Todo validating inputs articleId, supplierId, quantity for potential sql injections
  request.body.forEach(async (element) => {
    const { articleId, supplierId, quantity } = element;

    try {
      // fetch supplycontract id
      const supplycontract = await db.one(
        "select supplycontract.id from supplycontract where supplycontract.supplier=$1;",
        [supplierId]
      );
      debug(`supplycontract id retrieved with value ${supplycontract.id}`);

      // fetch articlecontract id
      const articlecontract = await db.one(
        "select articlecontract.id, cast(packagingquantity as integer) from articlecontract where articlesupplier=$1;",
        [articleId]
      );
      debug(`articlecontract:  id retrieved with value ${articlecontract.id}`);

      const packagingquantity = articlecontract.packagingquantity;
      if (quantity % packagingquantity !== 0) {
        debug("Wrong quantity supplied");
        return response.status(406).send("Wrong quantity supplied");
      }

      // insert into order table
      const order = await db.one(
        "insert into ordering (created, supplycontract) values (now(),$1) RETURNING id;",
        [supplycontract.id]
      );

      // insert into position table
      db.none(
        "insert into position (quantity,delivery, ordering, positioninorder, articlecontract) values ($1,null,$2,1,$3);",
        [quantity, order.id, articlecontract.id]
      );

      debug(`Created a new order Successfully!!`);
      return response.status(201).send("Created a new order Successfully!!");
    } catch (error) {
      debug(`Server error in inserting a new position ${error}`);
      return response
        .status(500)
        .send(`Server error in inserting a new position ${error}`);
    }
  });
};

module.exports = { getOpenPositions, createOrder };

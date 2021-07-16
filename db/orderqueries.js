const Joi = require("joi");
const { debug, pool } = require("./setup");

const getOpenPositions = (request, response) => {
  const organizationId = request.params.organizationId;
  //input validation - organizationId
  const schema = Joi.object({
    organizationId: Joi.number().integer().min(1).max(10000),
  });
  const schemaresult = schema.validate({ organizationId: organizationId });
  if (schemaresult.error)
    return response.status(400).send(schemaresult.error.details[0].message);
  pool.query(
    "select p.ordering as order, p.id as position, article.id as articleId, article.label as articleLabel, article.name as articleName, cast(quantity as integer),  cast(round(quantity/100,2)*baseprice as double precision) as price, to_char(created, 'DD Mon YYYY,  HH12:MI:SS') as date , supplycontract.supplier as supplierId, (select org.name as supplierName from organization org where org.id=supplycontract.supplier) from position p inner join ordering o on o.id=p.ordering inner join articlecontract on articlecontract.id= p.articlecontract inner join article on article.id= articlecontract.articlecustomer inner join organization on organization.id=article.organization inner join supplycontract on supplycontract.id=articlecontract.supplycontract where article.organization=$1 and delivery is null;",
    [organizationId],
    (error, results) => {
      if (error) {
        return response.status(500).json(JSON.stringify(error));
      }
      response.status(200).json(results.rows);
      debug(`List of OpenPositions retrieved`);
      debug(`List of OpenPositions sent to client successfully!!`);
    }
  );
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
  // if (request.body.length === 0) {
  const { articleId, supplierId, quantity } = request.body;

  // fetch supplycontract id
  pool.query(
    "select supplycontract.id from supplycontract where supplycontract.supplier=$1;",
    [supplierId],
    (error, results) => {
      if (error) {
        return response.status(500).json(error);
      }
      const supplycontract = JSON.parse(JSON.stringify(results.rows))[0].id;
      debug(`supplycontract id retrieved with value ${supplycontract}`);

      // fetch articlecontract id
      pool.query(
        "select articlecontract.id, cast(packagingquantity as integer) from articlecontract where articlesupplier=$1;",
        [articleId],
        (error, results) => {
          if (error) {
            return response.status(500).json(error);
          }

          const articlecontract = JSON.parse(JSON.stringify(results.rows))[0]
            .id;
          debug(`articlecontract:  id retrieved with value ${articlecontract}`);
          const packagingquantity = JSON.parse(JSON.stringify(results.rows))[0]
            .packagingquantity;

          if (quantity / packagingquantity !== 0) {
            debug("Wrong quantity supplied");
            return response.status(406).send("Wrong quantity supplied");
          }

          // insert into order table
          pool.query(
            "insert into ordering (created, supplycontract) values (now(),$1) RETURNING id;",
            [supplycontract],
            (error, results) => {
              // todo:: error handling
              if (error) {
                return response.status(500).json(error);
              }
              const orderingId = JSON.parse(JSON.stringify(results.rows))[0].id;
              debug(`inserted a new order into ordering table`);

              // insert into position table
              pool.query(
                "insert into position (quantity,delivery, ordering, positioninorder, articlecontract) values ($1,null,$2,1,$3) RETURNING id;",
                [quantity, orderingId, articlecontract],
                (error, results) => {
                  if (error) {
                    return response.status(500).json(error);
                  }
                  debug(`inserted a new position into ordering table`);
                }
              );
              return response.status(201).send("Successful");
            }
          );
        }
      );
    }
  );
  // } else {
  //   debug(`Request body is mandatory`);
  //   return response.status(400).send("Request body is mandatory");
  // }
};

module.exports = { getOpenPositions, createOrder };

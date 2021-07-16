const Joi = require("joi");
const { debug, pool } = require("./setup");

const getArticles = (request, response) => {
  const organizationId = request.params.organizationId;
  //input validation - organizationId
  const schema = Joi.object({
    organizationId: Joi.number().integer().min(1).max(10000),
  });
  const schemaresult = schema.validate({ organizationId: organizationId });
  if (schemaresult.error)
    return response.status(400).send(schemaresult.error.details[0].message);
  pool.query(
    "select a.id as articleid, a.label as articlelabel, a.name as articlename, coalesce((select array_to_json(array_agg(row_to_json(x))) from (select organization as supplierid, o.name as suppliername, packagingquantity, baseprice from article inner join articlecontract on articlecustomer=a.id inner join organization o on o.id=organization where article.id=articlesupplier) x),'[]') as supplyoptions from article a where a.organization=$1;",
    [organizationId],
    (error, results) => {
      if (error) {
        return response.status(500).json(error);
      }
      response.status(200).json(results.rows);
      debug(`List of articles retrieved`);
    }
  );
};

module.exports = { getArticles };

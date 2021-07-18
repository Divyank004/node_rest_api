const Joi = require("joi");
const { debug, db } = require("./setup");

const getArticles = async (request, response) => {
  const organizationId = request.params.organizationId;
  //input validation - organizationId
  const organizationIdschema = Joi.object({
    organizationId: Joi.number().integer().min(1).max(10000),
  });
  const schemaresult = organizationIdschema.validate({
    organizationId: organizationId,
  });
  if (schemaresult.error)
    return response.status(400).send(schemaresult.error.details[0].message);
  try {
    let data = await db.any(
      "select a.id as articleid, a.label as articlelabel, a.name as articlename, coalesce((select array_to_json(array_agg(row_to_json(x))) from (select organization as supplierid, o.name as suppliername, packagingquantity, baseprice from article inner join articlecontract on articlecustomer=a.id inner join organization o on o.id=organization where article.id=articlesupplier) x),'[]') as supplyoptions from article a where a.organization=$1;",
      [organizationId]
    );
    debug(`List of articles retrieved successfully!!`);
    debug(`List of articles sent to client successfully!!`);
    return response.status(200).json(data);
  } catch (error) {
    debug(`Error in retrieving the article data ${JSON.stringify(error)}`);
    return response.status(500).json(error);
  }
};

module.exports = { getArticles };

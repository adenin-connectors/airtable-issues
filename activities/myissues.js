'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    var pagination = Activity.pagination();
    let pageSize = parseInt(pagination.pageSize);
    let offset = 0;

    if (activity.Request.Data && activity.Request.Data.args && activity.Request.Data.args.atAgentAction === 'nextpage') {
      offset = activity.Request.Data.args.providedOffset;
    }
    const response = await api(`/Bugs & Issues?offset=${offset}&pageSize=${pageSize}`);

    if (Activity.isErrorResponse(response)) return;

    // convert response to items[]
    activity.Response.Data = convertResponse(response);
    activity.Response.Data.providedOffset = response.body.offset;
  } catch (error) {
    Activity.handleError(error);
  }
};
/**maps response data to items */
function convertResponse(response) {
  let items = [];
  let records = response.body.records;

  for (let i = 0; i < records.length; i++) {
    let raw = records[i];
    let item = { id: raw.id, title: raw.fields.Name, description: raw.fields.Description, link: 'https://airtable.com', raw: raw };
    items.push(item);
  }

  return { items: items };
}
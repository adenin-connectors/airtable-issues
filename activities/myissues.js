'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    let allEvents = [];
    api.initialize(activity);
    const dateRange = $.dateRange(activity);
    const response = await api(`?filterByFormula=AND(IF(Closed="",TRUE(),FALSE()),AND(IS_AFTER(CREATED_TIME(),'${dateRange.startDate}'),
    IS_BEFORE(CREATED_TIME(),'${dateRange.endDate}')))&pageSize=100`);

    if ($.isErrorResponse(activity, response)) return;
    allEvents.push(...response.body.records);

    let nextPageToken = response.body.offset;

    while (nextPageToken) {
      const nextPage = await api(`?filterByFormula=AND(IF(Closed="",TRUE(),FALSE()),AND(IS_AFTER(CREATED_TIME(),'${dateRange.startDate}'),
      IS_BEFORE(CREATED_TIME(),'${dateRange.endDate}'))))&offset=${nextPageToken}&pageSize=100`);
      if ($.isErrorResponse(activity, nextPage)) return;
      allEvents.push(...nextPage.body.records);
      nextPageToken = nextPage.body.offset;
    }

    let value = allEvents.length;
    let pagination = $.pagination(activity);
    let pagiantedItems = paginateItems(allEvents, pagination);

    activity.Response.Data.items = api.convertResponse(pagiantedItems);
    activity.Response.Data.title = T(activity, 'My Issues');
    activity.Response.Data.link = `https://airtable.com/${activity.Context.connector.custom2}`;
    activity.Response.Data.linkLabel = T(activity, 'Go to Airtable Issues');
    activity.Response.Data.actionable = value > 0;
    activity.Response.Data.value = value;

    if (value > 0) {
      activity.Response.Data.color = 'blue';
      activity.Response.Data.description = value > 1 ? T(activity, "You have {0} issues.", value)
        : T(activity, "You have 1 issue.");
    } else {
      activity.Response.Data.description = T(activity, 'You have no issues.');
    }
  } catch (error) {
    $.handleError(activity, error);
  }
};

//** paginate items[] based on provided pagination */
function paginateItems(items, pagination) {
  let pagiantedItems = [];
  const pageSize = parseInt(pagination.pageSize);
  const offset = (parseInt(pagination.page) - 1) * pageSize;

  if (offset > items.length) return pagiantedItems;

  for (let i = offset; i < offset + pageSize; i++) {
    if (i >= items.length) {
      break;
    }
    pagiantedItems.push(items[i]);
  }
  return pagiantedItems;
}
'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);
    const response = await api(`?filterByFormula=IF(Closed="",TRUE(),FALSE())`);

    if ($.isErrorResponse(activity, response)) return;

    activity.Response.Data = mapResponseToChartData(activity, response);
  } catch (error) {
    $.handleError(activity, error);
  }
};
//** maps response data to data format usable by chart */
function mapResponseToChartData(activity, response) {
  let tickets = response.body.records;
  let priorities = [];
  let datasets = [];
  let data = [];

  for (let i = 0; i < tickets.length; i++) {
    let priority = tickets[i].fields.Priority ? tickets[i].fields.Priority : "No Priority";
    if (!priorities.includes(priority)) {
      priorities.push(priority);
    }
  }

  for (let x = 0; x < priorities.length; x++) {
    let counter = 0;
    for (let y = 0; y < tickets.length; y++) {
      let status = tickets[y].fields.Priority ? tickets[y].fields.Priority : "No Priority";
      if (priorities[x] == status) {
        counter++;
      }
    }
    data.push(counter);
  }
  datasets.push({ label: T(activity, 'Number Of Issues'), data });

  let chartData = {
    title: T(activity, 'Open Issues by Priority'),
    link: `https://airtable.com/${activity.Context.connector.custom3}`,
    linkLabel: T(activity, 'Go to Airtable Issues'),
    chart: {
      configuration: {
        data: {},
        options: {
          title: {
            display: true,
            text: T(activity, 'Issue Metrics By Priority')
          }
        }
      },
      template: 'pie'
    },
    _settings: {}
  };
  chartData.chart.configuration.data.labels = priorities;
  chartData.chart.configuration.data.datasets = datasets;

  return chartData;
}
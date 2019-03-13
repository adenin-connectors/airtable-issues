'use strict';

const cfActivity = require('@adenin/cf-activity');
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);

    const response = await api(`/Bugs & Issues`);

    if (!cfActivity.isResponseOk(activity, response)) {
      return;
    }

    let issuesStatus = {
      title: 'Open Bugs And Issues',
      url: 'https://airtable.com',
      urlLabel: 'All Bugs And Issues',
    };

    let issueCount = response.body.records.length;

    if (issueCount != 0) {
      issuesStatus = {
        ...issuesStatus,
        description: `You have ${issueCount > 1 ? issueCount + " issues" : issueCount + " issue"}.`,
        color: 'blue',
        value: response.body.length,
        actionable: true
      };
    } else {
      issuesStatus = {
        ...issuesStatus,
        description: `You have no issues.`,
        actionable: false
      };
    }

    activity.Response.Data = issuesStatus;
  } catch (error) {
    cfActivity.handleError(activity, error);
  }
};

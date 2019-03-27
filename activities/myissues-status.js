'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    const response = await api(`/Bugs & Issues`);

    if (Activity.isErrorResponse(response)) return;

    let issuesStatus = {
      title: T('Open Bugs And Issues'),
      link: 'https://airtable.com',
      linkLabel: T('All Bugs And Issues'),
    };

    let issueCount = response.body.records.length;

    if (issueCount != 0) {
      issuesStatus = {
        ...issuesStatus,
        description: issueCount > 1 ? T("You have {0} issues.", issueCount) : T("You have 1 issue."),
        color: 'blue',
        value: response.body.length,
        actionable: true
      };
    } else {
      issuesStatus = {
        ...issuesStatus,
        description: T('You have no issues.'),
        actionable: false
      };
    }

    activity.Response.Data = issuesStatus;
  } catch (error) {
    Activity.handleError(error);
  }
};

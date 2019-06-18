'use strict';
const got = require('got');
const HttpAgent = require('agentkeepalive');
const HttpsAgent = HttpAgent.HttpsAgent;

let _activity = null;

function api(path, opts) {
  if (typeof path !== 'string') {
    return Promise.reject(new TypeError(`Expected \`path\` to be a string, got ${typeof path}`));
  }

  let customEndpoint = _activity.Context.connector.custom3 || "Bugs & Issues";
  opts = Object.assign({
    json: true,
    token: _activity.Context.connector.apikey,
    endpoint: `https://api.airtable.com/v0/${_activity.Context.connector.custom1}/${customEndpoint}`,
    agent: {
      http: new HttpAgent(),
      https: new HttpsAgent()
    }
  }, opts);

  opts.headers = Object.assign({
    accept: 'application/json',
    'user-agent': 'adenin Now Assistant Connector, https://www.adenin.com/now-assistant'
  }, opts.headers);

  if (opts.token) opts.headers.Authorization = `Bearer ${opts.token}`;

  const url = /^http(s)\:\/\/?/.test(path) && opts.endpoint ? path : opts.endpoint + path;

  if (opts.stream) return got.stream(url, opts);

  return got(url, opts).catch((err) => {
    throw err;
  });
}

const helpers = [
  'get',
  'post',
  'put',
  'patch',
  'head',
  'delete'
];

api.initialize = (activity) => {
  _activity = activity;
};

api.stream = (url, opts) => got(url, Object.assign({}, opts, {
  json: false,
  stream: true
}));

for (const x of helpers) {
  const method = x.toUpperCase();
  api[x] = (url, opts) => api(url, Object.assign({}, opts, { method }));
  api.stream[x] = (url, opts) => api.stream(url, Object.assign({}, opts, { method }));
}

/**maps response data to items */
api.convertResponse = function (records) {
  let items = [];

  for (let i = 0; i < records.length; i++) {
    let raw = records[i];
    let item = {
      id: raw.id,
      title: raw.fields.Name,
      description: raw.fields.Description,
      date: raw.fields["Opened Date & Time (GMT)"],
      link: `https://airtable.com/${_activity.Context.connector.custom2}/${raw.id}`,
      raw: raw
    };
    items.push(item);
  }

  return items;
};

//** paginate items[] based on provided pagination */
api.paginateItems = function (items, pagination) {
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
};

module.exports = api;

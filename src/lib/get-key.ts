import _ from 'lodash';

export default (url: string): string | null => {
  const decoded = decodeURIComponent(url);

  if (_.includes(url, '/image/fetch/')) {
    const origin = _.replace(decoded.substr(decoded.lastIndexOf('http')), /^https?:\/\//i, '');
    const tmp = _.split(origin, '/');
    const site = tmp[0];
    const path = _.join(_.slice(tmp, 1), '/');

    const transform = _.trimEnd(
      decoded.substring(decoded.lastIndexOf('/image/fetch/') + _.size('/image/fetch/'), decoded.lastIndexOf('http')),
      '/'
    );

    return transform ? `fetch/${site}/${transform}/${path}` : `fetch/${site}/${path}`;
  }

  if (_.includes(url, '/image/upload/')) {
    const path = _.trimEnd(decoded.substring(decoded.lastIndexOf('/image/upload/') + _.size('/image/upload/')), '/');
    return `upload/${path}`;
  }

  return null;
};

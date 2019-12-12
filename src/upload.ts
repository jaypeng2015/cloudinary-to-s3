import _ from 'lodash';
import AWS from 'aws-sdk';
import axios from 'axios';

import getKey from './lib/get-key';

const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

const getBase64 = async (url: string): Promise<string> => {
  const { data } = await axios.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(data, 'binary').toString('base64');
};

const handler = async ({ Records: [record] }) => {
  const { body } = record;
  const urls = JSON.parse(body);
  console.log(`Handling ${_.size(urls)} images`);

  const promises = _.map(urls, async url => {
    const base64 = await getBase64(url);
    const key = getKey(url);
    if (key) {
      await s3
        .upload({
          Body: base64,
          Bucket: process.env.S3_BUCKET_NAME || '',
          Key: key,
        })
        .promise();
    } else {
      console.log('Unable to handle file', url);
    }
  });

  await Promise.all(promises);
};

export { handler };

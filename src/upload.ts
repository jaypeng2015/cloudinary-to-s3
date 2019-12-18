import _ from 'lodash';
import AWS from 'aws-sdk';
import axios from 'axios';

import getKey from './lib/get-key';

const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

interface Image {
  contentType: string;
  data: Buffer;
}

const getImage = async (url: string): Promise<Image> => {
  const { data, headers } = await axios.get(url, { responseType: 'arraybuffer' });
  return {
    contentType: headers['content-type'],
    data: Buffer.from(data, 'binary'),
  };
};

const handler = async ({ Records: [record] }) => {
  const { body } = record;
  const urls = JSON.parse(body);
  console.log(`Handling ${_.size(urls)} images`);

  const promises = _.map(urls, async url => {
    const image = await getImage(url);
    const key = getKey(url);
    if (key) {
      await s3
        .upload({
          Body: image.data,
          Bucket: process.env.S3_BUCKET_NAME!,
          ContentType: image.contentType,
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

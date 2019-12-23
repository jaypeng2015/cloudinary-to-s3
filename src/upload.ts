import _ from 'lodash';
import AWS from 'aws-sdk';
import axios from 'axios';

import getKey from './lib/get-key';

const db = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10', convertEmptyValues: true });
const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
const META_DATA_TABLE = process.env.META_DATA_TABLE_NAME!;
const FAILED_RECORDS_TABLE_NAME = process.env.FAILED_RECORDS_TABLE_NAME!;

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
    let item = {
      cloudinary_url: url,
    };
    try {
      const image = await getImage(url);
      const key = getKey(url);
      item['s3_file_key'] = key;
      if (key) {
        await s3
          .upload({
            Body: image.data,
            Bucket: process.env.S3_BUCKET_NAME!,
            ContentType: image.contentType,
            Key: key,
          })
          .promise();
        await db
          .put({
            TableName: META_DATA_TABLE,
            Item: { ...item, succeed: true },
          })
          .promise();
      } else {
        console.log('Unable to handle file', url);
        await db
          .put({
            TableName: META_DATA_TABLE,
            Item: { ...item, succeed: false },
          })
          .promise();
        await db
          .put({
            TableName: FAILED_RECORDS_TABLE_NAME,
            Item: { ...item, reason: 'Could not generate file key for this url' },
          })
          .promise();
      }
    } catch (error) {
      await db
        .put({
          TableName: META_DATA_TABLE,
          Item: { ...item, succeed: false, reason: _.get(error, 'message') },
        })
        .promise();
      await db
        .put({
          TableName: FAILED_RECORDS_TABLE_NAME,
          Item: { ...item, reason: _.get(error, 'message') },
        })
        .promise();
    }
  });

  await Promise.all(promises);
};

export { handler };

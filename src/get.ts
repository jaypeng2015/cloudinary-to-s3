import _ from 'lodash';
import axios from 'axios';
import AWS from 'aws-sdk';

interface State {
  hasNext?: boolean;
  imageMoved?: number;
  nextCursor: string | null;
  sqsMessageSent?: number;
  attempt: number;
}

interface FetchResult {
  moved: number;
  nextCursor: string | null;
}

// const maxAttempt = Number.MAX_SAFE_INTEGER;
const maxAttempt = 3;
const max_results = 500;
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
const url = `https://${process.env.CLOUDINARY_API_KEY}:${process.env.CLOUDINARY_API_SECRET}@api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_ID}/resources/image`;

const fetchList = async (nextCursor: string | null): Promise<FetchResult> => {
  const params = nextCursor ? { max_results, next_cursor: nextCursor } : { max_results: 500 };
  const {
    data: { resources, next_cursor: newNextCursor },
  } = await axios.get(url, { params });
  const urls = _.map(resources, 'secure_url');
  await sqs
    .sendMessage({
      MessageBody: JSON.stringify(urls),
      QueueUrl: process.env.QUEUE || '',
    })
    .promise();
  return {
    moved: _.size(urls),
    nextCursor: newNextCursor || null,
  };
};

const handler = async ({
  attempt = 0,
  imageMoved = 0,
  nextCursor = null,
  sqsMessageSent = 0,
}: State): Promise<State> => {
  let { moved, nextCursor: next } = await fetchList(nextCursor);

  if (_.isNull(next)) {
    return {
      attempt: attempt + 1,
      hasNext: false,
      nextCursor: next,
      imageMoved: imageMoved + moved,
      sqsMessageSent: sqsMessageSent + 1,
    };
  }

  // The default api rate limit is 5000 per day.
  // However it is possible to ask Cloudinary support to bump the limit to 10,000 per hour
  // Because we put 1s wait in step functions to control the rate limit, so here we do it again to make 7,200 requests per hour
  let { moved: movedAgain, nextCursor: newCursor } = await fetchList(next);
  return {
    attempt: attempt + 1,
    hasNext: attempt + 1 === maxAttempt ? false : !!newCursor,
    nextCursor: newCursor,
    imageMoved: imageMoved + moved + movedAgain,
    sqsMessageSent: sqsMessageSent + 2,
  };
};

export { handler };

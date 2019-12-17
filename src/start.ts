import AWS from 'aws-sdk';
import uuid from 'uuid';

const stepFunctions = new AWS.StepFunctions({ apiVersion: '2016-11-23' });

const handler = async ({ nextCursor, imageMoved, sqsMessageSent }) => {
  const initialState = { nextCursor, imageMoved, sqsMessageSent };
  const params = {
    input: JSON.stringify(initialState), // Step Functions takes input as a string
    name: uuid.v4(),
    stateMachineArn: process.env.STATE_MACHINE_ARN || '',
  };

  await stepFunctions.startExecution(params).promise();
};

export { handler };

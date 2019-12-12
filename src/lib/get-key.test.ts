import _ from 'lodash';
import assert from 'assert';

import getKey from './get-key';

test('should get s3 file key', () => {
  const urls = [
    {
      expected: 'fetch/img06.kaspersky.site/a61770a2722efd9b9ecad84737fbcb36.jpg',
      input:
        'https://res.cloudinary.com/dhn6iym7c/image/fetch/https://img06.kaspersky.site/a61770a2722efd9b9ecad84737fbcb36.jpg',
    },
    {
      expected: 'fetch/img06.kaspersky.site/v1574130638/e9c28405b973fc7d6929a9b7c96910b0.jpg',
      input:
        'https://res.cloudinary.com/dhn6iym7c/image/fetch/v1574130638/https://img06.kaspersky.site/e9c28405b973fc7d6929a9b7c96910b0.jpg',
    },
    {
      expected:
        'fetch/d294nyrht8hdze.cloudfront.net/s--jMnjMIuJ--/f_webp,fl_awebp,fl_preserve_transparency,o_100,q_auto:best/media/967381/25023-chad-xmas18-santahours-a4-v2.jpg',
      input:
        'https://res.cloudinary.com/dhn6iym7c/image/fetch/https://res.cloudinary.com/dhn6iym7c/image/fetch/s--jMnjMIuJ--/f_webp%2Cfl_awebp%2Cfl_preserve_transparency%2Co_100%2Cq_auto:best/https://d294nyrht8hdze.cloudfront.net/media/967381/25023-chad-xmas18-santahours-a4-v2.jpg',
    },
    {
      expected: 'upload/v1538440259/digital-passport/tourism/sealife-logo.png',
      input: 'https://res.cloudinary.com/dhn6iym7c/image/upload/v1538440259/digital-passport/tourism/sealife-logo.png',
    },
    {
      expected: null,
      input:
        'https://res.cloudinary.com/dhn6iym7c/something-else/v1538440259/digital-passport/tourism/sealife-logo.png',
    },
  ];
  _.forEach(urls, ({ input, expected }) => {
    expect(getKey(input)).toBe(expected);
  });
});

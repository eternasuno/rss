import vikeSolid from 'vike-solid/config';

export default {
  description: 'Self-hosted RSS feed management',
  extends: [vikeSolid],
  passToClient: ['user'],
  stream: false,
  title: 'RSS Feed Manager',
};

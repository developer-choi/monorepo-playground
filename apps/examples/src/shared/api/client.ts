import ky from 'ky';

export const api = ky.create({
  prefixUrl: 'http://localhost:3000',
  retry: {
    limit: 1,
    methods: ['get', 'post', 'put', 'patch', 'delete', 'head'],
  },
});

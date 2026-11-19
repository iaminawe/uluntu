import { storedFilePaths } from '../storagePaths';

describe('storedFilePaths', () => {
  it('returns every stored size of each photo', () => {
    expect(
      storedFilePaths([
        {
          storage_path: 'users/u/galleries/g/originals/a.jpg',
          medium_path: 'users/u/galleries/g/medium/a.jpg',
          thumbnail_path: 'users/u/galleries/g/thumbs/a.jpg'
        },
        { storage_path: 'users/u/galleries/g/originals/b.jpg', medium_path: null }
      ])
    ).toEqual([
      'users/u/galleries/g/originals/a.jpg',
      'users/u/galleries/g/medium/a.jpg',
      'users/u/galleries/g/thumbs/a.jpg',
      'users/u/galleries/g/originals/b.jpg'
    ]);
  });

  it('skips external URLs and empty paths', () => {
    expect(
      storedFilePaths([
        {
          storage_path: 'https://images.unsplash.com/photo-1?w=800',
          medium_path: 'http://example.com/m.jpg',
          thumbnail_path: ''
        },
        { storage_path: null }
      ])
    ).toEqual([]);
  });
});

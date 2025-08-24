import { adaptCompanyFromDatabase } from './companyAdapter';

describe('adaptCompanyFromDatabase', () => {
  it('should fail if cover_image is null but coverImage is expected to be a string', () => {
    const dbCompany = {
      id: '1',
      name: 'Test Company',
      description: 'Test Description',
      logo: 'test-logo.png',
      cover_image: null,
      industry: [],
      size: '1-10',
      founded: '2020',
      location: 'Test Location',
      website: 'test.com',
      status: 'active',
      featured: false,
      created_at: '2020-01-01',
      comment_count: null,
      like_count: null,
      slug: 'test-company',
      social: null,
      updated_at: '2020-01-01',
      user_id: 'test-user-id',
      view_count: null,
    };

    expect(() => adaptCompanyFromDatabase(dbCompany)).toThrowError();
  });
});
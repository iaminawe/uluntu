import { adaptCompanyFromDatabase } from './companyAdapter';

describe('adaptCompanyFromDatabase', () => {
  it('should fail if cover_image is null but coverImage is expected to be a string', () => {
    const dbCompany = {
      id: '1',
      name: 'Test Company',
      description: 'Test Description',
      logo: 'test-logo.png',
      cover_image: null,
      cover_image_url: null,
      industry: [],
      size: '1-10',
      founded: '2020',
      location: 'Test Location',
      website: 'test.com',
      status: 'active',
      featured: false,
      created_at: '2020-01-01',
    };

    expect(() => adaptCompanyFromDatabase(dbCompany)).toThrowError();
  });
});
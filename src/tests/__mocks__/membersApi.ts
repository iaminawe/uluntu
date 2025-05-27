import { Member } from '../../types';

export const membersApi = {
  create: jest.fn().mockResolvedValue({ id: 'test-member-id' } as Member),
  getAll: jest.fn().mockResolvedValue([]),
  getById: jest.fn().mockResolvedValue(null),
  update: jest.fn().mockResolvedValue(null),
  delete: jest.fn().mockResolvedValue(true),
};
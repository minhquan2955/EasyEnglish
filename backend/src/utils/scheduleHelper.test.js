import { jest } from '@jest/globals';

// Setup ESM mock for the Class model
const mockFindOne = jest.fn();
jest.unstable_mockModule('../models/Class.js', () => {
  return {
    default: {
      findOne: mockFindOne,
    },
  };
});

// Import the module AFTER mocking in ESM
const { checkScheduleConflict } = await import('./scheduleHelper.js');

describe('checkScheduleConflict', () => {
  beforeEach(() => {
    mockFindOne.mockClear();
  });

  it('should return no conflict if schedule is missing daysOfWeek', async () => {
    const result = await checkScheduleConflict({
      schedule: { startTime: '08:00', endTime: '09:00' },
      startDate: '2026-01-01',
      endDate: '2026-03-01'
    });
    expect(result.hasConflict).toBe(false);
    expect(mockFindOne).not.toHaveBeenCalled();
  });

  it('should return no conflict if dates are missing', async () => {
    const result = await checkScheduleConflict({
      schedule: { daysOfWeek: [1], startTime: '08:00', endTime: '09:00' },
      startDate: null,
      endDate: '2026-03-01'
    });
    expect(result.hasConflict).toBe(false);
    expect(mockFindOne).not.toHaveBeenCalled();
  });

  it('should detect teacher conflict', async () => {
    // Setup mock to return a conflicting class
    mockFindOne.mockResolvedValueOnce({ classCode: 'CLASS_A' });

    const result = await checkScheduleConflict({
      teacherId: 'teacher123',
      schedule: { daysOfWeek: [1, 3], startTime: '08:00', endTime: '09:30' },
      startDate: '2026-01-01',
      endDate: '2026-03-01'
    });

    expect(mockFindOne).toHaveBeenCalledTimes(1);
    expect(result.hasConflict).toBe(true);
    expect(result.message).toContain('CLASS_A');
  });

  it('should detect room conflict if no teacher conflict', async () => {
    // First call (teacher) returns null, second call (room) returns conflict
    mockFindOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ classCode: 'CLASS_B' });

    const result = await checkScheduleConflict({
      teacherId: 'teacher123',
      room: 'Room1',
      schedule: { daysOfWeek: [1, 3], startTime: '08:00', endTime: '09:30' },
      startDate: '2026-01-01',
      endDate: '2026-03-01'
    });

    expect(mockFindOne).toHaveBeenCalledTimes(2);
    expect(result.hasConflict).toBe(true);
    expect(result.message).toContain('Room1');
    expect(result.message).toContain('CLASS_B');
  });

  it('should return no conflict if queries return null', async () => {
    mockFindOne.mockResolvedValue(null);

    const result = await checkScheduleConflict({
      teacherId: 'teacher123',
      room: 'Room1',
      schedule: { daysOfWeek: [1, 3], startTime: '08:00', endTime: '09:30' },
      startDate: '2026-01-01',
      endDate: '2026-03-01',
      excludeClassId: 'class123'
    });

    expect(mockFindOne).toHaveBeenCalledTimes(2);
    expect(result.hasConflict).toBe(false);

    // Verify the query payload format for the first call
    const queryArg = mockFindOne.mock.calls[0][0];
    expect(queryArg).toHaveProperty('status', 'active');
    expect(queryArg).toHaveProperty('_id', { $ne: 'class123' });
    expect(queryArg).toHaveProperty('teacherId', 'teacher123');
    
    // Check that dates are converted to Date objects in the query
    expect(queryArg.startDate.$lte).toBeInstanceOf(Date);
    expect(queryArg.endDate.$gte).toBeInstanceOf(Date);
  });
});

import { render, screen, fireEvent } from '@testing-library/react';
import { WeeklyAvailabilityEditor } from './WeeklyAvailabilityEditor';
import '@testing-library/jest-dom';

const MOCK_SCHEDULE = [
  { day: 'Monday', isEnabled: true, slots: [{ start: '09:00', end: '17:00' }] },
  { day: 'Tuesday', isEnabled: false, slots: [] },
  // ... (other days not strictly needed for basic test)
];

describe('WeeklyAvailabilityEditor', () => {
  test('renders days correctly', () => {
    render(
      <WeeklyAvailabilityEditor
        initialSchedule={MOCK_SCHEDULE as any}
        onSave={() => {}}
        readOnly={false}
      />
    );

    expect(screen.getByText('Monday')).toBeInTheDocument();
    expect(screen.getByText('Tuesday')).toBeInTheDocument();
  });

  test('shows add/copy buttons when not readOnly', () => {
    render(
      <WeeklyAvailabilityEditor
        initialSchedule={MOCK_SCHEDULE as any}
        onSave={() => {}}
        readOnly={false}
      />
    );

    // Monday is enabled, should show buttons
    // We look for the SVG titles or the button roles
    const addButtons = screen.getAllByTitle('Add time slot');
    expect(addButtons.length).toBeGreaterThan(0);
  });

  test('hides buttons when readOnly', () => {
    render(
      <WeeklyAvailabilityEditor
        initialSchedule={MOCK_SCHEDULE as any}
        onSave={() => {}}
        readOnly={true}
      />
    );

    const addButtons = screen.queryAllByTitle('Add time slot');
    expect(addButtons.length).toBe(0);
  });

  test('can toggle a day', () => {
    render(
      <WeeklyAvailabilityEditor
        initialSchedule={MOCK_SCHEDULE as any}
        onSave={() => {}}
        readOnly={false}
      />
    );

    // Tuesday is disabled initially
    const tuesdayToggle = screen.getAllByRole('checkbox')[1]; // Assuming order
    fireEvent.click(tuesdayToggle);
    
    // Check if the toggle state changed visually (via class or checked attribute)
    expect(tuesdayToggle).toBeChecked();
  });
});

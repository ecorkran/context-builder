import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ComboBox, ComboBoxOption } from '../../lib/ui-core/components/form/combobox';

// Simple test component that demonstrates rename functionality
function TestRenameComboBox() {
  const [items, setItems] = useState([
    { id: '1', name: 'Project A' },
    { id: '2', name: 'Project B' },
  ]);
  const [selectedId, setSelectedId] = useState('1');

  const options: ComboBoxOption[] = items.map(item => ({
    value: item.id,
    label: item.name,
  }));

  const handleValueChange = (value: string | null) => {
    if (value) {
      setSelectedId(value);
    }
  };

  const handleInputValueChange = (inputValue: string) => {
    const selectedItem = items.find(item => item.id === selectedId);
    if (selectedItem && inputValue !== selectedItem.name && inputValue.trim()) {
      // Rename the item
      setItems(prev => prev.map(item => 
        item.id === selectedId 
          ? { ...item, name: inputValue.trim() }
          : item
      ));
    }
  };

  return (
    <div>
      <ComboBox
        options={options}
        value={selectedId}
        onValueChange={handleValueChange}
        onInputValueChange={handleInputValueChange}
        searchable={true}
        placeholder="Select or rename project..."
      />
      <div data-testid="items">
        {items.map(item => (
          <div key={item.id} data-testid={`item-${item.id}`}>
            {item.name}
          </div>
        ))}
      </div>
    </div>
  );
}

describe('ComboBox Rename Functionality', () => {
  test('should rename item when typing new name', async () => {
    render(<TestRenameComboBox />);
    
    // Initial state - Project A should be visible
    expect(screen.getByTestId('item-1')).toHaveTextContent('Project A');
    
    // Find the ComboBox input
    const input = screen.getByRole('combobox');
    
    // Clear and type new name
    fireEvent.change(input, { target: { value: 'Renamed Project' } });
    
    // Trigger input value change
    fireEvent.blur(input);
    
    // Check that the item was renamed
    expect(screen.getByTestId('item-1')).toHaveTextContent('Renamed Project');
  });
});
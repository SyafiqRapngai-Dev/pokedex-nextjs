import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { createEvent } from '@testing-library/react';
import SearchInput from './SearchInput';

describe('SearchInput', () => {
  describe('input value changes', () => {
    it('should render with default currentId', () => {
      render(<SearchInput currentId={25} />);
      const input = screen.getByLabelText(/search #/i);
      expect(input).toHaveValue(25);
    });

    it('should update input value on change', () => {
      render(<SearchInput currentId={1} />);
      const input = screen.getByLabelText(/search #/i);
      
      fireEvent.change(input, { target: { value: '50' } });
      expect(input).toHaveValue(50);
    });

    it('should have correct input attributes', () => {
      render(<SearchInput />);
      const input = screen.getByLabelText(/search #/i);
      
      expect(input).toHaveAttribute('type', 'number');
      expect(input).toHaveAttribute('min', '1');
      expect(input).toHaveAttribute('max', '151');
      expect(input).toHaveAttribute('placeholder', '1-151');
    });
  });

  describe('validation', () => {
    it('should show error for empty input on submit', () => {
      render(<SearchInput />);
      const input = screen.getByLabelText(/search #/i);
      const button = screen.getByRole('button', { name: /go/i });

      fireEvent.change(input, { target: { value: '' } });
      fireEvent.click(button);

      expect(screen.getByText(/please enter a pokemon number/i)).toBeInTheDocument();
    });

    it('should show error for non-integer input on submit', () => {
      const { container } = render(<SearchInput />);
      const input = screen.getByLabelText(/search #/i);
      const form = input.closest('form');

      // Create a properly formatted change event with invalid value
      const changeEvent = createEvent.change(input, { target: { value: '5.5' } });
      fireEvent(input, changeEvent);
      
      fireEvent.submit(form);

      expect(screen.getByText(/pokemon number must be a whole number/i)).toBeInTheDocument();
    });

    it('should show error for number below minimum on submit', () => {
      const { container } = render(<SearchInput />);
      const input = screen.getByLabelText(/search #/i);
      const form = input.closest('form');

      // Create a properly formatted change event with invalid value
      const changeEvent = createEvent.change(input, { target: { value: '0' } });
      fireEvent(input, changeEvent);
      
      fireEvent.submit(form);

      expect(screen.getByText(/pokemon number must be between 1 and 151/i)).toBeInTheDocument();
    });

    it('should show error for number above maximum on submit', () => {
      const { container } = render(<SearchInput />);
      const input = screen.getByLabelText(/search #/i);
      const form = input.closest('form');

      // Create a properly formatted change event with invalid value
      const changeEvent = createEvent.change(input, { target: { value: '152' } });
      fireEvent(input, changeEvent);
      
      fireEvent.submit(form);

      expect(screen.getByText(/pokemon number must be between 1 and 151/i)).toBeInTheDocument();
    });

    it('should update error message on input change after validation error', () => {
      render(<SearchInput />);
      const input = screen.getByLabelText(/search #/i);
      const button = screen.getByRole('button', { name: /go/i });

      fireEvent.change(input, { target: { value: '' } });
      fireEvent.click(button);
      expect(screen.getByText(/please enter a pokemon number/i)).toBeInTheDocument();

      fireEvent.change(input, { target: { value: '50' } });
      expect(screen.queryByText(/please enter a pokemon number/i)).not.toBeInTheDocument();
    });

    it('should set aria-invalid to true when there is an error', () => {
      render(<SearchInput />);
      const input = screen.getByLabelText(/search #/i);
      const button = screen.getByRole('button', { name: /go/i });

      expect(input).toHaveAttribute('aria-invalid', 'false');

      fireEvent.change(input, { target: { value: '' } });
      fireEvent.click(button);

      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('search submission', () => {
    it('should call onSearch with valid number on submit', () => {
      const mockOnSearch = jest.fn();
      render(<SearchInput onSearch={mockOnSearch} />);
      const input = screen.getByLabelText(/search #/i);
      const button = screen.getByRole('button', { name: /go/i });

      fireEvent.change(input, { target: { value: '25' } });
      fireEvent.click(button);

      expect(mockOnSearch).toHaveBeenCalledWith(25);
      expect(mockOnSearch).toHaveBeenCalledTimes(1);
    });

    it('should call onSearch with minimum valid number', () => {
      const mockOnSearch = jest.fn();
      render(<SearchInput onSearch={mockOnSearch} />);
      const input = screen.getByLabelText(/search #/i);
      const button = screen.getByRole('button', { name: /go/i });

      fireEvent.change(input, { target: { value: '1' } });
      fireEvent.click(button);

      expect(mockOnSearch).toHaveBeenCalledWith(1);
    });

    it('should call onSearch with maximum valid number', () => {
      const mockOnSearch = jest.fn();
      render(<SearchInput onSearch={mockOnSearch} />);
      const input = screen.getByLabelText(/search #/i);
      const button = screen.getByRole('button', { name: /go/i });

      fireEvent.change(input, { target: { value: '151' } });
      fireEvent.click(button);

      expect(mockOnSearch).toHaveBeenCalledWith(151);
    });

    it('should not call onSearch with invalid number (empty)', () => {
      const mockOnSearch = jest.fn();
      render(<SearchInput onSearch={mockOnSearch} />);
      const input = screen.getByLabelText(/search #/i);
      const button = screen.getByRole('button', { name: /go/i });

      fireEvent.change(input, { target: { value: '' } });
      fireEvent.click(button);

      expect(mockOnSearch).not.toHaveBeenCalled();
    });

    it('should not call onSearch with invalid number (below minimum)', () => {
      const mockOnSearch = jest.fn();
      const { container } = render(<SearchInput onSearch={mockOnSearch} />);
      const input = screen.getByLabelText(/search #/i);
      const button = screen.getByRole('button', { name: /go/i });

      // Create a properly formatted change event with invalid value
      const changeEvent = createEvent.change(input, { target: { value: '0' } });
      fireEvent(input, changeEvent);
      
      fireEvent.click(button);

      expect(mockOnSearch).not.toHaveBeenCalled();
    });

    it('should not call onSearch with invalid number (above maximum)', () => {
      const mockOnSearch = jest.fn();
      const { container } = render(<SearchInput onSearch={mockOnSearch} />);
      const input = screen.getByLabelText(/search #/i);
      const button = screen.getByRole('button', { name: /go/i });

      // Create a properly formatted change event with invalid value
      const changeEvent = createEvent.change(input, { target: { value: '200' } });
      fireEvent(input, changeEvent);
      
      fireEvent.click(button);

      expect(mockOnSearch).not.toHaveBeenCalled();
    });

    it('should not call onSearch with non-integer', () => {
      const mockOnSearch = jest.fn();
      const { container } = render(<SearchInput onSearch={mockOnSearch} />);
      const input = screen.getByLabelText(/search #/i);
      const button = screen.getByRole('button', { name: /go/i });

      // Create a properly formatted change event with invalid value
      const changeEvent = createEvent.change(input, { target: { value: '10.5' } });
      fireEvent(input, changeEvent);
      
      fireEvent.click(button);

      expect(mockOnSearch).not.toHaveBeenCalled();
    });

    it('should clear error on successful submit', () => {
      const mockOnSearch = jest.fn();
      render(<SearchInput onSearch={mockOnSearch} />);
      const input = screen.getByLabelText(/search #/i);
      const button = screen.getByRole('button', { name: /go/i });

      fireEvent.change(input, { target: { value: '' } });
      fireEvent.click(button);
      expect(screen.getByText(/please enter a pokemon number/i)).toBeInTheDocument();

      fireEvent.change(input, { target: { value: '50' } });
      fireEvent.click(button);

      expect(screen.queryByText(/please enter a pokemon number/i)).not.toBeInTheDocument();
      expect(mockOnSearch).toHaveBeenCalledWith(50);
    });

    it('should submit via form submission (pressing Enter)', () => {
      const mockOnSearch = jest.fn();
      render(<SearchInput onSearch={mockOnSearch} />);
      const form = screen.getByRole('button', { name: /go/i }).closest('form');
      const input = screen.getByLabelText(/search #/i);

      fireEvent.change(input, { target: { value: '42' } });
      fireEvent.submit(form);

      expect(mockOnSearch).toHaveBeenCalledWith(42);
    });
  });
});

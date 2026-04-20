import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Navigation from './Navigation';

describe('Navigation', () => {
  it('renders previous and next buttons', () => {
    const mockOnIdChange = jest.fn();
    render(<Navigation currentId={1} onIdChange={mockOnIdChange} />);
    
    expect(screen.getByLabelText('Previous Pokemon')).toBeInTheDocument();
    expect(screen.getByLabelText('Next Pokemon')).toBeInTheDocument();
  });

  it('calls onIdChange with decremented id when previous button is clicked', () => {
    const mockOnIdChange = jest.fn();
    render(<Navigation currentId={25} onIdChange={mockOnIdChange} />);
    
    const prevButton = screen.getByLabelText('Previous Pokemon');
    fireEvent.click(prevButton);
    
    expect(mockOnIdChange).toHaveBeenCalledWith(24);
  });

  it('calls onIdChange with incremented id when next button is clicked', () => {
    const mockOnIdChange = jest.fn();
    render(<Navigation currentId={25} onIdChange={mockOnIdChange} />);
    
    const nextButton = screen.getByLabelText('Next Pokemon');
    fireEvent.click(nextButton);
    
    expect(mockOnIdChange).toHaveBeenCalledWith(26);
  });

  describe('boundary wrapping', () => {
    it('wraps to 151 when previous is clicked at id 1', () => {
      const mockOnIdChange = jest.fn();
      render(<Navigation currentId={1} onIdChange={mockOnIdChange} />);
      
      const prevButton = screen.getByLabelText('Previous Pokemon');
      fireEvent.click(prevButton);
      
      expect(mockOnIdChange).toHaveBeenCalledWith(151);
    });

    it('wraps to 1 when next is clicked at id 151', () => {
      const mockOnIdChange = jest.fn();
      render(<Navigation currentId={151} onIdChange={mockOnIdChange} />);
      
      const nextButton = screen.getByLabelText('Next Pokemon');
      fireEvent.click(nextButton);
      
      expect(mockOnIdChange).toHaveBeenCalledWith(1);
    });

    it('decrements normally when not at lower boundary', () => {
      const mockOnIdChange = jest.fn();
      render(<Navigation currentId={2} onIdChange={mockOnIdChange} />);
      
      const prevButton = screen.getByLabelText('Previous Pokemon');
      fireEvent.click(prevButton);
      
      expect(mockOnIdChange).toHaveBeenCalledWith(1);
    });

    it('increments normally when not at upper boundary', () => {
      const mockOnIdChange = jest.fn();
      render(<Navigation currentId={150} onIdChange={mockOnIdChange} />);
      
      const nextButton = screen.getByLabelText('Next Pokemon');
      fireEvent.click(nextButton);
      
      expect(mockOnIdChange).toHaveBeenCalledWith(151);
    });
  });

  it('handles multiple consecutive clicks', () => {
    const mockOnIdChange = jest.fn();
    render(<Navigation currentId={50} onIdChange={mockOnIdChange} />);
    
    const nextButton = screen.getByLabelText('Next Pokemon');
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);
    
    expect(mockOnIdChange).toHaveBeenCalledTimes(2);
    expect(mockOnIdChange).toHaveBeenNthCalledWith(1, 51);
    expect(mockOnIdChange).toHaveBeenNthCalledWith(2, 51);
  });
});

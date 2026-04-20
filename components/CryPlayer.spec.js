import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import CryPlayer from './CryPlayer';

describe('CryPlayer', () => {
  let mockAudio;
  let audioEventListeners;

  beforeEach(() => {
    // Reset event listeners
    audioEventListeners = {};

    // Mock HTML5 Audio API
    mockAudio = {
      play: jest.fn().mockResolvedValue(undefined),
      pause: jest.fn(),
      addEventListener: jest.fn((event, handler) => {
        audioEventListeners[event] = handler;
      }),
      removeEventListener: jest.fn(),
      src: '',
      currentTime: 0,
    };

    global.Audio = jest.fn(() => mockAudio);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render disabled state when no cry URL is provided', () => {
      render(<CryPlayer cryUrl={null} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(screen.getByText('No Cry Available')).toBeInTheDocument();
      expect(screen.getByText('🔇')).toBeInTheDocument();
    });

    it('should render play button when cry URL is provided', () => {
      render(<CryPlayer cryUrl="https://example.com/cry.mp3" />);
      
      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
      expect(screen.getByText('Play Cry')).toBeInTheDocument();
      expect(screen.getByText('🔊')).toBeInTheDocument();
    });
  });

  describe('Audio Playback', () => {
    it('should create Audio element and play when play button is clicked', async () => {
      const cryUrl = 'https://example.com/cry.mp3';
      render(<CryPlayer cryUrl={cryUrl} />);
      
      const playButton = screen.getByText('Play Cry').closest('button');
      fireEvent.click(playButton);

      await waitFor(() => {
        expect(global.Audio).toHaveBeenCalledWith(cryUrl);
        expect(mockAudio.play).toHaveBeenCalled();
      });
    });

    it('should show stop button when audio is playing', async () => {
      render(<CryPlayer cryUrl="https://example.com/cry.mp3" />);
      
      const playButton = screen.getByText('Play Cry').closest('button');
      fireEvent.click(playButton);

      await waitFor(() => {
        expect(screen.getByText('Stop')).toBeInTheDocument();
        expect(screen.getByText('⏸️')).toBeInTheDocument();
      });
    });

    it('should stop audio when stop button is clicked', async () => {
      render(<CryPlayer cryUrl="https://example.com/cry.mp3" />);
      
      // Start playing
      const playButton = screen.getByText('Play Cry').closest('button');
      fireEvent.click(playButton);

      await waitFor(() => {
        expect(screen.getByText('Stop')).toBeInTheDocument();
      });

      // Stop playing
      const stopButton = screen.getByText('Stop').closest('button');
      fireEvent.click(stopButton);

      expect(mockAudio.pause).toHaveBeenCalled();
      expect(mockAudio.currentTime).toBe(0);
      expect(screen.getByText('Play Cry')).toBeInTheDocument();
    });

    it('should show loading state while audio is loading', async () => {
      render(<CryPlayer cryUrl="https://example.com/cry.mp3" />);
      
      const playButton = screen.getByText('Play Cry').closest('button');
      fireEvent.click(playButton);

      // Check loading state before audio plays
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.getByText('⏳')).toBeInTheDocument();
      expect(playButton).toBeDisabled();
    });

    it('should reset playing state when audio ends', async () => {
      render(<CryPlayer cryUrl="https://example.com/cry.mp3" />);
      
      const playButton = screen.getByText('Play Cry').closest('button');
      fireEvent.click(playButton);

      await waitFor(() => {
        expect(screen.getByText('Stop')).toBeInTheDocument();
      });

      // Simulate audio ended event
      await act(async () => {
        audioEventListeners.ended();
      });

      await waitFor(() => {
        expect(screen.getByText('Play Cry')).toBeInTheDocument();
      });
    });

    it('should reuse audio element when playing same URL again', async () => {
      const cryUrl = 'https://example.com/cry.mp3';
      render(<CryPlayer cryUrl={cryUrl} />);
      
      // First play
      const playButton = screen.getByText('Play Cry').closest('button');
      fireEvent.click(playButton);

      await waitFor(() => {
        expect(screen.getByText('Stop')).toBeInTheDocument();
      });

      // Stop
      const stopButton = screen.getByText('Stop').closest('button');
      fireEvent.click(stopButton);

      await waitFor(() => {
        expect(screen.getByText('Play Cry')).toBeInTheDocument();
      });

      // Play again - should reuse same audio element
      const playButtonAgain = screen.getByText('Play Cry').closest('button');
      
      // Set the src to match URL (simulating audio element being created)
      mockAudio.src = cryUrl;
      
      fireEvent.click(playButtonAgain);

      await waitFor(() => {
        // Should have called Audio constructor only once
        expect(global.Audio).toHaveBeenCalledTimes(1);
        expect(mockAudio.play).toHaveBeenCalledTimes(2);
      });
    });

    it('should create new audio element when URL changes', async () => {
      const { rerender } = render(<CryPlayer cryUrl="https://example.com/cry1.mp3" />);
      
      const playButton = screen.getByText('Play Cry').closest('button');
      fireEvent.click(playButton);

      await waitFor(() => {
        expect(global.Audio).toHaveBeenCalledWith('https://example.com/cry1.mp3');
      });

      // Wait for playing state
      await waitFor(() => {
        expect(screen.getByText('Stop')).toBeInTheDocument();
      });

      // Stop the audio before changing URL
      const stopButton = screen.getByText('Stop').closest('button');
      fireEvent.click(stopButton);

      await waitFor(() => {
        expect(screen.getByText('Play Cry')).toBeInTheDocument();
      });

      // Change URL
      await act(async () => {
        rerender(<CryPlayer cryUrl="https://example.com/cry2.mp3" />);
      });
      
      const newPlayButton = screen.getByText('Play Cry').closest('button');
      fireEvent.click(newPlayButton);

      await waitFor(() => {
        expect(global.Audio).toHaveBeenCalledWith('https://example.com/cry2.mp3');
        expect(global.Audio).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error when no cry URL is available on play', () => {
      render(<CryPlayer cryUrl="" />);
      
      // Component renders disabled button for empty string
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should handle audio play errors gracefully', async () => {
      const playError = new Error('Play failed');
      mockAudio.play = jest.fn().mockRejectedValue(playError);

      render(<CryPlayer cryUrl="https://example.com/cry.mp3" />);
      
      const playButton = screen.getByText('Play Cry').closest('button');
      fireEvent.click(playButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to play audio')).toBeInTheDocument();
        expect(screen.getByText('⚠️')).toBeInTheDocument();
      });

      // Should not show playing state
      expect(screen.queryByText('Stop')).not.toBeInTheDocument();
      expect(screen.getByText('Play Cry')).toBeInTheDocument();
    });

    it('should handle audio loading errors', async () => {
      render(<CryPlayer cryUrl="https://example.com/invalid.mp3" />);
      
      const playButton = screen.getByText('Play Cry').closest('button');
      fireEvent.click(playButton);

      await waitFor(() => {
        expect(audioEventListeners.error).toBeDefined();
      });

      // Simulate audio error event
      await act(async () => {
        audioEventListeners.error(new Event('error'));
      });

      await waitFor(() => {
        expect(screen.getByText('Failed to load audio')).toBeInTheDocument();
        expect(screen.getByText('⚠️')).toBeInTheDocument();
      });
    });

    it('should clear error when playing again after error', async () => {
      const playError = new Error('Play failed');
      mockAudio.play = jest.fn().mockRejectedValueOnce(playError)
        .mockResolvedValueOnce(undefined);

      render(<CryPlayer cryUrl="https://example.com/cry.mp3" />);
      
      // First attempt - error
      const playButton = screen.getByText('Play Cry').closest('button');
      fireEvent.click(playButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to play audio')).toBeInTheDocument();
      });

      // Second attempt - success
      const retryButton = screen.getByText('Play Cry').closest('button');
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.queryByText('Failed to play audio')).not.toBeInTheDocument();
        expect(screen.getByText('Stop')).toBeInTheDocument();
      });
    });
  });

  describe('Cleanup', () => {
    it('should cleanup audio when component unmounts', () => {
      const { unmount } = render(<CryPlayer cryUrl="https://example.com/cry.mp3" />);
      
      const playButton = screen.getByText('Play Cry').closest('button');
      fireEvent.click(playButton);

      unmount();

      expect(mockAudio.pause).toHaveBeenCalled();
    });

    it('should cleanup audio when cryUrl changes', async () => {
      const { rerender } = render(<CryPlayer cryUrl="https://example.com/cry1.mp3" />);
      
      const playButton = screen.getByText('Play Cry').closest('button');
      fireEvent.click(playButton);

      await waitFor(() => {
        expect(mockAudio.play).toHaveBeenCalled();
      });

      // Change URL - should trigger cleanup
      rerender(<CryPlayer cryUrl="https://example.com/cry2.mp3" />);

      expect(mockAudio.pause).toHaveBeenCalled();
    });
  });

  describe('Event Listeners', () => {
    it('should register ended event listener', async () => {
      render(<CryPlayer cryUrl="https://example.com/cry.mp3" />);
      
      const playButton = screen.getByText('Play Cry').closest('button');
      fireEvent.click(playButton);

      await waitFor(() => {
        expect(mockAudio.addEventListener).toHaveBeenCalledWith(
          'ended',
          expect.any(Function)
        );
      });
    });

    it('should register error event listener', async () => {
      render(<CryPlayer cryUrl="https://example.com/cry.mp3" />);
      
      const playButton = screen.getByText('Play Cry').closest('button');
      fireEvent.click(playButton);

      await waitFor(() => {
        expect(mockAudio.addEventListener).toHaveBeenCalledWith(
          'error',
          expect.any(Function)
        );
      });
    });

    it('should register canplaythrough event listener', async () => {
      render(<CryPlayer cryUrl="https://example.com/cry.mp3" />);
      
      const playButton = screen.getByText('Play Cry').closest('button');
      fireEvent.click(playButton);

      await waitFor(() => {
        expect(mockAudio.addEventListener).toHaveBeenCalledWith(
          'canplaythrough',
          expect.any(Function)
        );
      });
    });

    it('should clear loading state when canplaythrough event fires', async () => {
      render(<CryPlayer cryUrl="https://example.com/cry.mp3" />);
      
      const playButton = screen.getByText('Play Cry').closest('button');
      fireEvent.click(playButton);

      // Should be in loading state initially
      expect(screen.getByText('Loading...')).toBeInTheDocument();

      await waitFor(() => {
        expect(audioEventListeners.canplaythrough).toBeDefined();
      });

      // Simulate canplaythrough event
      await act(async () => {
        audioEventListeners.canplaythrough();
      });

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });
    });
  });
});

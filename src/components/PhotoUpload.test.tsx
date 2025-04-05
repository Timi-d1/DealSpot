import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PhotoUpload, { UploadedPhoto } from './PhotoUpload';
import '@testing-library/jest-dom';

const createMockFile = (name: string) =>
  new File(['dummy content'], name, { type: 'image/png' });

describe('PhotoUpload Component', () => {
  let onPhotosUploadMock: jest.Mock;

  beforeEach(() => {
    onPhotosUploadMock = jest.fn();
    window.alert = jest.fn();
  });

  it('renders the title and all 10 upload boxes', () => {
    render(<PhotoUpload onPhotosUpload={onPhotosUploadMock} />);
    expect(screen.getByText(/Add product photos/i)).toBeInTheDocument();
    expect(screen.getAllByText('Upload a photo')).toHaveLength(10);
  });

  it('uploads a single photo and calls onPhotosUpload', async () => {
    render(<PhotoUpload onPhotosUpload={onPhotosUploadMock} />);
    const fileInputs = screen.getAllByLabelText(/upload/i);

    const file = createMockFile('test.png');

    // Find the input element directly via DOM traversal
    const input = fileInputs[0].closest('label')?.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
// made it safer 
    await waitFor(() => {
        const calls = onPhotosUploadMock.mock.calls;
        const foundValidCall = calls.some(call =>
          call[0].some((photo: any) =>
            photo.file instanceof File &&
            typeof photo.url === 'string' &&
            typeof photo.progress === 'number'
          )
        );
        expect(foundValidCall).toBe(true);
      });
      
  });

  it('prevents upload if more than 10 photos selected', async () => {
    render(<PhotoUpload onPhotosUpload={onPhotosUploadMock} />);
    const fileInputs = screen.getAllByLabelText(/upload/i);

    const files = new Array(11).fill(null).map((_, i) => createMockFile(`img${i}.png`));
    const input = fileInputs[0].closest('label')?.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files } });

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('You can only upload up to 10 images.');
    });
  });

  it('deletes a photo and updates state', async () => {
    const photo: UploadedPhoto = {
      id: 1,
      file: createMockFile('test.png'),
      url: 'data:image/png;base64,abc123',
      progress: 100,
    };

    render(<PhotoUpload onPhotosUpload={onPhotosUploadMock} initialPhotos={[photo]} />);
    expect(screen.getByRole('button', { name: /🗑/i })).toBeInTheDocument();

    const deleteButton = screen.getByRole('button', { name: /🗑/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(onPhotosUploadMock).toHaveBeenCalledWith([]);
    });
  });

  it('renders with initial photos', () => {
    const photo: UploadedPhoto = {
      id: 1,
      file: createMockFile('test.png'),
      url: 'data:image/png;base64,abc123',
      progress: 100,
    };

    render(<PhotoUpload onPhotosUpload={onPhotosUploadMock} initialPhotos={[photo]} />);
    expect(screen.getByRole('button', { name: /🗑/i })).toBeInTheDocument();
  });
});

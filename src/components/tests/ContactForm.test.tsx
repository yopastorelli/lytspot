import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import ContactForm from '../contact/ContactForm';

describe('ContactForm', () => {
  it('submits form with correct data', async () => {
    const consoleSpy = vi.spyOn(console, 'log');
    render(<ContactForm />);
    
    await fireEvent.change(screen.getByLabelText('Nome'), {
      target: { value: 'John Doe' },
    });
    await fireEvent.change(screen.getByLabelText('E-mail'), {
      target: { value: 'john@example.com' },
    });
    await fireEvent.change(screen.getByLabelText('Telefone'), {
      target: { value: '1234567890' },
    });
    await fireEvent.change(screen.getByLabelText('Serviço de Interesse'), {
      target: { value: 'drone' },
    });
    await fireEvent.change(screen.getByLabelText('Mensagem'), {
      target: { value: 'Test message' },
    });
    
    await fireEvent.submit(screen.getByRole('button', { name: /enviar mensagem/i }));
    
    expect(consoleSpy).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      service: 'drone',
      message: 'Test message',
    });
  });
});
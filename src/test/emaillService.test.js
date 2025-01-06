const { sendEmail } = require('../server/services/emailService');
const nodemailer = require('nodemailer');

jest.mock('nodemailer');

describe('Email Service', () => {
  it('deve enviar um e-mail com sucesso', async () => {
    const mockSendMail = jest.fn().mockResolvedValue({ response: '250 Message accepted' });
    nodemailer.createTransport.mockReturnValue({ sendMail: mockSendMail });

    const emailData = {
      to: 'destinatario@example.com',
      subject: 'Teste',
      text: 'Mensagem de teste',
    };

    await expect(sendEmail(emailData)).resolves.toEqual({ response: '250 Message accepted' });
    expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining(emailData));
  });

  it('deve falhar ao enviar um e-mail', async () => {
    const mockSendMail = jest.fn().mockRejectedValue(new Error('Erro ao enviar e-mail'));
    nodemailer.createTransport.mockReturnValue({ sendMail: mockSendMail });

    const emailData = {
      to: 'destinatario@example.com',
      subject: 'Teste',
      text: 'Mensagem de teste',
    };

    await expect(sendEmail(emailData)).rejects.toThrow('Erro ao enviar e-mail');
  });
});
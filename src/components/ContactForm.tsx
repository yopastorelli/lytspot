import { MessageQueue } from '../utils/messageQueue';

export default function ContactForm() {
  const handleSubmit = async (formData: FormData) => {
    try {
      // Tenta enviar diretamente
      const response = await fetch('/api/contact', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Falha no envio');
      }
      
      // Sucesso - mostra mensagem para o usuário
      alert('Mensagem enviada com sucesso!');
      
    } catch (error) {
      // Se falhar, adiciona à fila
      MessageQueue.enqueue('contact', Object.fromEntries(formData));
      
      // Ainda mostra sucesso para o usuário
      alert('Mensagem recebida! Será processada em breve.');
    }
  };
  
  // ... resto do componente ...
} 
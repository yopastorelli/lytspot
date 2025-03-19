interface QueuedMessage {
  type: 'contact' | 'budget';
  data: any;
  timestamp: number;
}

export class MessageQueue {
  private static STORAGE_KEY = 'pending_messages';

  static enqueue(type: 'contact' | 'budget', data: any) {
    const messages = this.getQueue();
    messages.push({
      type,
      data,
      timestamp: Date.now()
    });
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(messages));
  }

  static getQueue(): QueuedMessage[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static removeMessage(index: number) {
    const messages = this.getQueue();
    messages.splice(index, 1);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(messages));
  }

  static async processQueue() {
    const messages = this.getQueue();
    
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      try {
        const endpoint = message.type === 'contact' ? '/api/contact' : '/api/budget';
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message.data)
        });
        
        if (response.ok) {
          this.removeMessage(i);
          i--; // Ajusta o índice após remover
        }
      } catch (error) {
        console.log('Falha ao processar mensagem, tentará novamente mais tarde');
      }
    }
  }
} 
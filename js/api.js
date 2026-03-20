// api.js - Эмуляция API для работы с сервером

class API {
    constructor() {
        // Имитация задержки сети
        this.delay = 500;
    }

    // Имитация асинхронного запроса
    async simulateDelay() {
        return new Promise(resolve => setTimeout(resolve, this.delay));
    }

    // Получение всех заявок
    async getRequests(filters = {}) {
        await this.simulateDelay();
        let requests = storage.getAllRequests();
        
        // Фильтрация по статусу
        if (filters.status && filters.status !== 'all') {
            requests = requests.filter(r => r.status === filters.status);
        }
        
        // Поиск по оборудованию
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            requests = requests.filter(r => 
                r.equipmentName.toLowerCase().includes(searchLower) ||
                r.problemDescription.toLowerCase().includes(searchLower)
            );
        }
        
        // Сортировка по дате создания (новые сверху)
        requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        return requests;
    }

    // Получение заявки по ID
    async getRequestById(id) {
        await this.simulateDelay();
        return storage.getRequestById(id);
    }

    // Создание заявки
    async createRequest(requestData) {
        await this.simulateDelay();
        
        // Валидация данных
        if (!requestData.equipmentName || !requestData.equipmentType || !requestData.problemDescription) {
            throw new Error('Заполните все обязательные поля');
        }
        
        return storage.createRequest(requestData);
    }

    // Обновление заявки
    async updateRequest(id, requestData) {
        await this.simulateDelay();
        
        const existingRequest = storage.getRequestById(id);
        if (!existingRequest) {
            throw new Error('Заявка не найдена');
        }
        
        return storage.updateRequest(id, requestData);
    }

    // Удаление заявки
    async deleteRequest(id) {
        await this.simulateDelay();
        
        const existingRequest = storage.getRequestById(id);
        if (!existingRequest) {
            throw new Error('Заявка не найдена');
        }
        
        return storage.deleteRequest(id);
    }

    // Получение статистики
    async getStatistics() {
        await this.simulateDelay();
        return storage.getStatistics();
    }
}

// Создаём глобальный экземпляр API
const api = new API();
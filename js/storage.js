// storage.js - Модуль для работы с localStorage

class RequestStorage {
    constructor() {
        this.storageKey = 'repair_requests';
        this.initializeData();
    }

    // Инициализация тестовых данных
    initializeData() {
        if (!localStorage.getItem(this.storageKey)) {
            const testData = [
                {
                    id: 1,
                    equipmentName: 'Трансформатор ТМ-1000',
                    equipmentType: 'Трансформатор',
                    problemDescription: 'Повышенный шум и вибрация при работе',
                    priority: 'high',
                    status: 'in_progress',
                    responsiblePerson: 'Иванов И.И.',
                    createdAt: new Date('2026-03-15').toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: 2,
                    equipmentName: 'Электродвигатель АИР132',
                    equipmentType: 'Электродвигатель',
                    problemDescription: 'Не запускается, сгорела обмотка',
                    priority: 'critical',
                    status: 'new',
                    responsiblePerson: '',
                    createdAt: new Date('2026-03-18').toISOString(),
                    updatedAt: new Date('2026-03-18').toISOString()
                },
                {
                    id: 3,
                    equipmentName: 'Распределительный щит ЩРН-12',
                    equipmentType: 'Распределительный щит',
                    problemDescription: 'Автоматический выключатель отключается при нагрузке',
                    priority: 'medium',
                    status: 'new',
                    responsiblePerson: '',
                    createdAt: new Date('2026-03-19').toISOString(),
                    updatedAt: new Date('2026-03-19').toISOString()
                },
                {
                    id: 4,
                    equipmentName: 'Кабельная линия КЛ-10кВ',
                    equipmentType: 'Кабельная линия',
                    problemDescription: 'Повреждение изоляции, требуется замена участка',
                    priority: 'high',
                    status: 'in_progress',
                    responsiblePerson: 'Петров П.П.',
                    createdAt: new Date('2026-03-14').toISOString(),
                    updatedAt: new Date('2026-03-16').toISOString()
                },
                {
                    id: 5,
                    equipmentName: 'Светильник LED-40',
                    equipmentType: 'Осветительное оборудование',
                    problemDescription: 'Мерцание света, нестабильная работа',
                    priority: 'low',
                    status: 'completed',
                    responsiblePerson: 'Сидоров С.С.',
                    createdAt: new Date('2026-03-10').toISOString(),
                    updatedAt: new Date('2026-03-12').toISOString()
                }
            ];
            localStorage.setItem(this.storageKey, JSON.stringify(testData));
        }
    }

    // Получение всех заявок
    getAllRequests() {
        const data = localStorage.getItem(this.storageKey);
        return JSON.parse(data);
    }

    // Сохранение всех заявок
    saveAllRequests(requests) {
        localStorage.setItem(this.storageKey, JSON.stringify(requests));
    }

    // Получение заявки по ID
    getRequestById(id) {
        const requests = this.getAllRequests();
        return requests.find(req => req.id === id);
    }

    // Создание новой заявки
    createRequest(requestData) {
        const requests = this.getAllRequests();
        const newId = requests.length > 0 ? Math.max(...requests.map(r => r.id)) + 1 : 1;
        
        const newRequest = {
            id: newId,
            ...requestData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        requests.push(newRequest);
        this.saveAllRequests(requests);
        return newRequest;
    }

    // Обновление заявки
    updateRequest(id, updatedData) {
        const requests = this.getAllRequests();
        const index = requests.findIndex(req => req.id === id);
        
        if (index !== -1) {
            requests[index] = {
                ...requests[index],
                ...updatedData,
                updatedAt: new Date().toISOString()
            };
            this.saveAllRequests(requests);
            return requests[index];
        }
        return null;
    }

    // Удаление заявки
    deleteRequest(id) {
        const requests = this.getAllRequests();
        const filteredRequests = requests.filter(req => req.id !== id);
        this.saveAllRequests(filteredRequests);
        return true;
    }

    // Получение статистики
    getStatistics() {
        const requests = this.getAllRequests();
        return {
            total: requests.length,
            new: requests.filter(r => r.status === 'new').length,
            inProgress: requests.filter(r => r.status === 'in_progress').length,
            completed: requests.filter(r => r.status === 'completed').length,
            cancelled: requests.filter(r => r.status === 'cancelled').length,
            critical: requests.filter(r => r.priority === 'critical').length,
            high: requests.filter(r => r.priority === 'high').length
        };
    }
}

// Создаём глобальный экземпляр хранилища
const storage = new RequestStorage();
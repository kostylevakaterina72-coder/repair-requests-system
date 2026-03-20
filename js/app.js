// app.js - Основная логика приложения

class RepairRequestsApp {
    constructor() {
        this.currentFilters = {
            status: 'all',
            search: ''
        };
        this.init();
    }

    // Инициализация приложения
    async init() {
        this.bindEvents();
        await this.loadData();
        await this.loadStatistics();
    }

    // Привязка обработчиков событий
    bindEvents() {
        // Кнопка создания заявки
        const addBtn = document.getElementById('showAddModalBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.showModal();
            });
        }

        // Фильтр по статусу
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.currentFilters.status = e.target.value;
                this.loadData();
            });
        }

        // Поиск
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentFilters.search = e.target.value;
                this.loadData();
            });
        }

        // Форма создания/редактирования
        const form = document.getElementById('requestForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveRequest();
            });
        }

        // Кнопка отмены
        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }

        // Закрытие модальных окон
        const closeBtn = document.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }

        const closeDetailsBtn = document.querySelector('.close-details');
        if (closeDetailsBtn) {
            closeDetailsBtn.addEventListener('click', () => {
                this.closeDetailsModal();
            });
        }

        // Закрытие по клику вне модального окна
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('requestModal');
            const detailsModal = document.getElementById('detailsModal');
            if (e.target === modal) {
                this.closeModal();
            }
            if (e.target === detailsModal) {
                this.closeDetailsModal();
            }
        });
    }

    // Загрузка данных в таблицу
    async loadData() {
        try {
            const requests = await api.getRequests(this.currentFilters);
            this.renderTable(requests);
        } catch (error) {
            this.showError('Ошибка загрузки данных: ' + error.message);
        }
    }

    // Загрузка статистики
    async loadStatistics() {
        try {
            const stats = await api.getStatistics();
            this.renderStatistics(stats);
        } catch (error) {
            console.error('Ошибка загрузки статистики:', error);
        }
    }

    // Отрисовка таблицы
    renderTable(requests) {
        const tbody = document.getElementById('requestsTableBody');
        
        if (!tbody) return;
        
        if (requests.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 40px;">
                        <i class="fas fa-inbox" style="font-size: 48px; color: #ccc;"></i>
                        <p style="margin-top: 10px; color: #999;">Заявок не найдено</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = requests.map(request => `
            <tr>
                <td>${request.id}</td>
                <td><strong>${this.escapeHtml(request.equipmentName)}</strong></td>
                <td>${this.escapeHtml(request.equipmentType)}</td>
                <td>${this.truncateText(this.escapeHtml(request.problemDescription), 50)}</td>
                <td>${this.getPriorityBadge(request.priority)}</td>
                <td>${this.getStatusBadge(request.status)}</td>
                <td>${this.formatDate(request.createdAt)}</td>
                <td>
                    <button class="btn btn-info btn-small" onclick="app.viewRequest(${request.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-success btn-small" onclick="app.editRequest(${request.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-small" onclick="app.deleteRequest(${request.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // Отрисовка статистики
    renderStatistics(stats) {
        const container = document.getElementById('statsContainer');
        if (!container) return;
        
        container.innerHTML = `
            <div class="stat-card">
                <h3>Всего заявок</h3>
                <div class="stat-number">${stats.total}</div>
            </div>
            <div class="stat-card">
                <h3>Новые</h3>
                <div class="stat-number">${stats.new}</div>
            </div>
            <div class="stat-card">
                <h3>В работе</h3>
                <div class="stat-number">${stats.inProgress}</div>
            </div>
            <div class="stat-card">
                <h3>Выполнено</h3>
                <div class="stat-number">${stats.completed}</div>
            </div>
            <div class="stat-card">
                <h3>Критические</h3>
                <div class="stat-number">${stats.critical}</div>
            </div>
        `;
    }

    // Получение бейджа статуса
    getStatusBadge(status) {
        const statusMap = {
            'new': { class: 'status-new', text: 'Новая' },
            'in_progress': { class: 'status-in_progress', text: 'В работе' },
            'completed': { class: 'status-completed', text: 'Выполнена' },
            'cancelled': { class: 'status-cancelled', text: 'Отменена' }
        };
        
        const s = statusMap[status] || statusMap.new;
        return `<span class="status-badge ${s.class}">${s.text}</span>`;
    }

    // Получение бейджа приоритета
    getPriorityBadge(priority) {
        const priorityMap = {
            'low': { class: 'priority-low', text: 'Низкий' },
            'medium': { class: 'priority-medium', text: 'Средний' },
            'high': { class: 'priority-high', text: 'Высокий' },
            'critical': { class: 'priority-critical', text: 'Критический' }
        };
        
        const p = priorityMap[priority] || priorityMap.medium;
        return `<span class="priority-badge ${p.class}">${p.text}</span>`;
    }

    // Форматирование даты
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Обрезка текста
    truncateText(text, length) {
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    }

    // Экранирование HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Показ модального окна для создания/редактирования
    showModal(request = null) {
        const modal = document.getElementById('requestModal');
        const modalTitle = document.getElementById('modalTitle');
        
        if (!modal) return;
        
        if (request) {
            modalTitle.textContent = 'Редактирование заявки';
            document.getElementById('requestId').value = request.id;
            document.getElementById('equipmentName').value = request.equipmentName;
            document.getElementById('equipmentType').value = request.equipmentType;
            document.getElementById('problemDescription').value = request.problemDescription;
            document.getElementById('priority').value = request.priority;
            document.getElementById('status').value = request.status;
            document.getElementById('responsiblePerson').value = request.responsiblePerson || '';
        } else {
            modalTitle.textContent = 'Создание заявки';
            document.getElementById('requestForm').reset();
            document.getElementById('requestId').value = '';
            const statusField = document.getElementById('status');
            if (statusField) statusField.value = 'new';
        }
        
        modal.style.display = 'block';
    }

    // Редактирование заявки
    async editRequest(id) {
        try {
            const request = await api.getRequestById(id);
            this.showModal(request);
        } catch (error) {
            this.showError('Ошибка загрузки заявки: ' + error.message);
        }
    }

    // Закрытие модального окна
    closeModal() {
        const modal = document.getElementById('requestModal');
        if (modal) modal.style.display = 'none';
    }

    // Закрытие модального окна деталей
    closeDetailsModal() {
        const modal = document.getElementById('detailsModal');
        if (modal) modal.style.display = 'none';
    }

    // Сохранение заявки
    async saveRequest() {
        const id = document.getElementById('requestId').value;
        const requestData = {
            equipmentName: document.getElementById('equipmentName').value,
            equipmentType: document.getElementById('equipmentType').value,
            problemDescription: document.getElementById('problemDescription').value,
            priority: document.getElementById('priority').value,
            status: document.getElementById('status').value,
            responsiblePerson: document.getElementById('responsiblePerson').value
        };
        
        try {
            if (id) {
                await api.updateRequest(parseInt(id), requestData);
                this.showSuccess('Заявка успешно обновлена');
            } else {
                await api.createRequest(requestData);
                this.showSuccess('Заявка успешно создана');
            }
            
            this.closeModal();
            await this.loadData();
            await this.loadStatistics();
        } catch (error) {
            this.showError('Ошибка сохранения: ' + error.message);
        }
    }

    // Просмотр заявки
    async viewRequest(id) {
        try {
            const request = await api.getRequestById(id);
            this.showDetails(request);
        } catch (error) {
            this.showError('Ошибка загрузки заявки: ' + error.message);
        }
    }

    // Показ деталей заявки
    showDetails(request) {
        const modal = document.getElementById('detailsModal');
        const content = document.getElementById('detailsContent');
        
        if (!modal || !content) return;
        
        content.innerHTML = `
            <div class="details-section">
                <div class="detail-row">
                    <div class="detail-label">ID:</div>
                    <div class="detail-value">${request.id}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Оборудование:</div>
                    <div class="detail-value">${this.escapeHtml(request.equipmentName)}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Тип оборудования:</div>
                    <div class="detail-value">${this.escapeHtml(request.equipmentType)}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Описание проблемы:</div>
                    <div class="detail-value">${this.escapeHtml(request.problemDescription)}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Приоритет:</div>
                    <div class="detail-value">${this.getPriorityBadge(request.priority)}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Статус:</div>
                    <div class="detail-value">${this.getStatusBadge(request.status)}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Ответственное лицо:</div>
                    <div class="detail-value">${this.escapeHtml(request.responsiblePerson) || 'Не назначено'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Дата создания:</div>
                    <div class="detail-value">${this.formatDate(request.createdAt)}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Последнее обновление:</div>
                    <div class="detail-value">${this.formatDate(request.updatedAt)}</div>
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
    }

    // Удаление заявки
    async deleteRequest(id) {
        if (confirm('Вы уверены, что хотите удалить эту заявку?')) {
            try {
                await api.deleteRequest(id);
                this.showSuccess('Заявка успешно удалена');
                await this.loadData();
                await this.loadStatistics();
            } catch (error) {
                this.showError('Ошибка удаления: ' + error.message);
            }
        }
    }

    // Показ сообщения об успехе
    showSuccess(message) {
        alert(message);
    }

    // Показ сообщения об ошибке
    showError(message) {
        alert('Ошибка: ' + message);
    }
}

// Создаём глобальный экземпляр приложения
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new RepairRequestsApp();
});

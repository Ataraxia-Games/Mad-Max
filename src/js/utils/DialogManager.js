/**
 * Класс для управления диалоговыми окнами
 */
export class DialogManager {
    constructor() {
        this.dialog = document.getElementById('message-dialog');
        this.titleElement = document.getElementById('dialog-title');
        this.messageElement = document.getElementById('dialog-message');
        this.closeButton = document.getElementById('dialog-close-btn');
        
        // Колбэк, который будет вызываться при закрытии диалога
        this.onCloseCallback = null;
        
        // Инициализация обработчика закрытия диалога
        this.closeButton.addEventListener('click', () => this.closeDialog());
    }

    /**
     * Показать диалог с сообщением
     * @param {string} title - Заголовок диалога
     * @param {string} message - Текст сообщения
     * @param {Function} callback - Функция обратного вызова после закрытия диалога
     */
    showMessage(title, message, callback = null) {
        this.titleElement.textContent = title;
        this.messageElement.textContent = message;
        this.onCloseCallback = callback;
        
        this.dialog.classList.add('active');
    }

    /**
     * Закрыть диалог
     */
    closeDialog() {
        this.dialog.classList.remove('active');
        
        // Если есть колбэк, вызываем его
        if (typeof this.onCloseCallback === 'function') {
            this.onCloseCallback();
            this.onCloseCallback = null;
        }
    }
} 
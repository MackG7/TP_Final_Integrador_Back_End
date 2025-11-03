import MessageRepository from "../repositories/messageRepository.js";

export default class MessageService {
    static async createMessage(data) {
        return await MessageRepository.create(data);
    }

    static async getAllMessages() {
        return await MessageRepository.findAll();
    }

    static async getMessageById(id) {
        return await MessageRepository.findById(id);
    }

    static async updateMessage(id, data) {
        return await MessageRepository.update(id, data);
    }

    static async deleteMessage(id) {
        return await MessageRepository.delete(id);
    }
}
import ContactRepository from "../repositories/contactRepository.js";

export default class ContactService {
    static async createContact(data) {
        return await ContactRepository.create(data);
    }

    static async getAllContacts() {
        return await ContactRepository.findAll();
    }

    static async getContactById(id) {
        return await ContactRepository.findById(id);
    }

    static async updateContact(id, data) {
        return await ContactRepository.update(id, data);
    }

    static async deleteContact(id) {
        return await ContactRepository.delete(id);
    }
}
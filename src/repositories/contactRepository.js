import Contact from "../models/contact.model.js";

export default class ContactRepository {
    static async create(data) {
        return await Contact.create(data);
    }

    static async findAll() {
        return await Contact.find().populate("user");
    }

    static async findById(id) {
        return await Contact.findById(id).populate("user");
    }

    static async update(id, data) {
        return await Contact.findByIdAndUpdate(id, data, { new: true });
    }

    static async delete(id) {
        return await Contact.findByIdAndDelete(id);
    }
}